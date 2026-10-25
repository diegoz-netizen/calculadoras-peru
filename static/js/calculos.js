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
 * @param {number} p.promedioVariable  Promedio de remuneraciones variables regulares (S/).
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
  promedioVariable = 0,
}) {
  const asignacion = asignacionFamiliar ? montoAsignacion : 0;
  return sueldo + asignacion + gratificacion / 6 + promedioVariable;
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
  // Si no completó al menos un mes de servicio, no corresponde CTS.
  if (meses === 0) {
    return { computable, porMeses: 0, porDias: 0, total: 0 };
  }
  const factor = REGIMENES[regimen];
  const porMeses = redondear((exacta / 12) * meses * factor);
  const porDias = redondear((exacta / 360) * dias * factor);
  return { computable, porMeses, porDias, total: redondear(porMeses + porDias) };
}
