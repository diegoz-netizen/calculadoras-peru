// Lógica pura de cálculo. Sin DOM, para poder probarla con `node --test`.
// Base legal CTS: TUO del D. Leg. 650 (D.S. 001-97-TR) y su reglamento (D.S. 004-97-TR).

export const REGIMENES = {
  general: 1,      // 100 %
  pequena: 0.5,    // Pequeña empresa (REMYPE): la mitad
  micro: 0,        // Microempresa (REMYPE): no tiene CTS
};

const redondear = (n) => Math.round(n * 100) / 100;

/**
 * Remuneración computable para la CTS.
 * @param {object} p
 * @param {number} p.sueldo            Remuneración básica mensual (S/).
 * @param {boolean} p.asignacionFamiliar  Si percibe asignación familiar.
 * @param {number} p.montoAsignacion   Monto de la asignación familiar vigente (S/).
 * @param {number} p.gratificacion     Gratificación percibida en el semestre (S/). Se suma 1/6.
 * @param {number[]} p.variables     Pagos variables de cada mes del semestre (6 montos, S/).
 */
export function remuneracionComputable(datos) {
  return redondear(computableExacta(datos));
}

// Sin redondear: el redondeo se hace solo al final para no arrastrar céntimos.
function computableExacta({
  sueldo,
  asignacionFamiliar = false,
  montoAsignacion = 0,
  gratificacion = 0,
  variables = [],
}) {
  const asignacion = asignacionFamiliar ? montoAsignacion : 0;
  return sueldo + asignacion + gratificacion / 6 + analizarVariables(variables).promedio;
}

/**
 * Pagos variables del semestre (horas extra, comisiones, bonos).
 * Solo cuentan si son regulares: recibidos en al menos 3 de los 6 meses
 * (TUO del D. Leg. 650, art. 16). El promedio es la suma entre 6 (art. 17).
 * @param {number[]} montos  Hasta 6 montos, uno por mes; los meses que faltan valen 0.
 */
export function analizarVariables(montos = []) {
  if (montos.length > 6) throw new Error('Un semestre tiene como máximo 6 meses');
  if (montos.some((m) => !(m >= 0))) throw new Error('Los pagos variables no pueden ser negativos');
  const mesesConPago = montos.filter((m) => m > 0).length;
  const regular = mesesConPago >= 3;
  const suma = montos.reduce((a, m) => a + m, 0);
  return { mesesConPago, regular, promedio: regular ? suma / 6 : 0 };
}

/**
 * CTS de un semestre (máximo 6 meses).
 * Fórmula: RC / 12 × meses + RC / 360 × días.
 */
export function calcularCTS({ meses, dias = 0, regimen = 'general', ...rc }) {
  if (!(regimen in REGIMENES)) throw new Error(`Régimen desconocido: ${regimen}`);
  if (meses < 0 || dias < 0 || dias > 29) throw new Error('Meses o días fuera de rango');
  if (meses > 6 || (meses === 6 && dias > 0)) throw new Error('Un semestre tiene como máximo 6 meses');

  const exacta = computableExacta(rc);
  const computable = redondear(exacta);
  const { mesesConPago, regular, promedio } = analizarVariables(rc.variables);
  const variables = { mesesConPago, regular, promedio: redondear(promedio) };
  // Si no completó al menos un mes de servicio, no corresponde CTS.
  if (meses === 0) {
    return { computable, variables, porMeses: 0, porDias: 0, total: 0 };
  }
  const factor = REGIMENES[regimen];
  const porMeses = (exacta / 12) * meses * factor;
  const porDias = (exacta / 360) * dias * factor;
  // El total se redondea desde los valores exactos, no sumando las partes ya redondeadas.
  return {
    computable,
    variables,
    porMeses: redondear(porMeses),
    porDias: redondear(porDias),
    total: redondear(porMeses + porDias),
  };
}

// Semestres de la CTS: depósito hasta el 15 de mayo (nov–abr) y hasta el 15 de noviembre (may–oct).
export const SEMESTRES = {
  mayo: {
    meses: ['Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril'],
    gratificacion: 'diciembre',
  },
  noviembre: {
    meses: ['Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'],
    gratificacion: 'julio',
  },
};

/** Próximo depósito de CTS para una fecha: del 16 de mayo al 15 de noviembre toca el de noviembre. */
export function proximoDeposito(fecha) {
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  const despuesDe15Mayo = mes > 5 || (mes === 5 && dia > 15);
  const hasta15Noviembre = mes < 11 || (mes === 11 && dia <= 15);
  return despuesDe15Mayo && hasta15Noviembre ? 'noviembre' : 'mayo';
}
