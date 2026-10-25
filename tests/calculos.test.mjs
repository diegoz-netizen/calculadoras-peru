import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizarVariables, calcularCTS, proximoDeposito, remuneracionComputable } from '../static/js/calculos.js';

test('remuneración computable suma 1/6 de la gratificación', () => {
  assert.equal(
    remuneracionComputable({ sueldo: 1800, asignacionFamiliar: true, montoAsignacion: 123, gratificacion: 1923 }),
    2243.5,
  );
});

test('semestre completo, régimen general: RC / 2', () => {
  const r = calcularCTS({ sueldo: 2400, gratificacion: 2400, meses: 6 });
  // RC = 2400 + 400 = 2800 → 2800 / 12 × 6 = 1400
  assert.equal(r.total, 1400);
});

test('meses y días', () => {
  const r = calcularCTS({ sueldo: 1230, meses: 3, dias: 15 });
  // 1230/12×3 = 307.5 ; 1230/360×15 = 51.25
  assert.equal(r.porMeses, 307.5);
  assert.equal(r.porDias, 51.25);
  assert.equal(r.total, 358.75);
});

test('pequeña empresa recibe la mitad y microempresa nada', () => {
  assert.equal(calcularCTS({ sueldo: 2400, meses: 6, regimen: 'pequena' }).total, 600);
  assert.equal(calcularCTS({ sueldo: 2400, meses: 6, regimen: 'micro' }).total, 0);
});

test('menos de un mes no genera CTS', () => {
  assert.equal(calcularCTS({ sueldo: 2000, meses: 0, dias: 20 }).total, 0);
});

test('rechaza más de 6 meses', () => {
  assert.throws(() => calcularCTS({ sueldo: 2000, meses: 7 }));
});

// Casos verificados a mano con la fórmula del TUO del D. Leg. 650 (art. 21).
test('sueldo mínimo con asignación familiar no arrastra céntimos', () => {
  // RC = 1230 + 123 + 1243/6 = 1560.1667 → /12 × 6 = 780.08
  const r = calcularCTS({ sueldo: 1230, asignacionFamiliar: true, montoAsignacion: 123, gratificacion: 1243, meses: 6 });
  assert.equal(r.total, 780.08);
});

test('ingresó el 10 de agosto: 2 meses y 22 días', () => {
  assert.equal(calcularCTS({ sueldo: 3000, meses: 2, dias: 22 }).total, 683.33);
});

test('el total no se calcula sumando meses y días ya redondeados', () => {
  // 1231/12 × 1 = 102.5833 ; 1231/360 × 10 = 34.1944 ; suma 136.7778 → 136.78
  // (sumando las partes redondeadas saldría 102.58 + 34.19 = 136.77)
  assert.equal(calcularCTS({ sueldo: 1231, meses: 1, dias: 10 }).total, 136.78);
});

test('pequeña empresa con media gratificación', () => {
  assert.equal(calcularCTS({ sueldo: 2000, gratificacion: 1000, meses: 6, regimen: 'pequena' }).total, 541.67);
});

test('horas extra regulares (4 de 6 meses)', () => {
  // Suma 490 / 6 = 81.6667 ; RC = 2500 + 2500/6 + 81.6667 = 2998.3333 → /12 × 6 = 1499.17
  const r = calcularCTS({ sueldo: 2500, gratificacion: 2500, variables: [100, 0, 120, 150, 0, 120], meses: 6 });
  assert.equal(r.total, 1499.17);
  assert.deepEqual(r.variables, { mesesConPago: 4, regular: true, promedio: 81.67 });
});

test('pagos variables en solo 2 meses no se suman', () => {
  // RC = 2500 + 2500/6 = 2916.6667 → /12 × 6 = 1458.33
  const r = calcularCTS({ sueldo: 2500, gratificacion: 2500, variables: [300, 0, 0, 250, 0, 0], meses: 6 });
  assert.equal(r.total, 1458.33);
  assert.deepEqual(r.variables, { mesesConPago: 2, regular: false, promedio: 0 });
});

test('3 meses con pago ya es regular y se divide entre 6', () => {
  // 600 / 6 = 100 ; RC = 2000 + 100 = 2100 → /12 × 6 = 1050
  assert.deepEqual(analizarVariables([200, 200, 200, 0, 0, 0]), { mesesConPago: 3, regular: true, promedio: 100 });
  assert.equal(calcularCTS({ sueldo: 2000, variables: [200, 200, 200, 0, 0, 0], meses: 6 }).total, 1050);
});

test('rechaza pagos variables negativos o más de 6 meses', () => {
  assert.throws(() => analizarVariables([100, -50, 0, 0, 0, 0]));
  assert.throws(() => analizarVariables([1, 1, 1, 1, 1, 1, 1]));
});

test('próximo depósito según la fecha', () => {
  assert.equal(proximoDeposito(new Date(2026, 9, 25)), 'noviembre'); // 25 de octubre
  assert.equal(proximoDeposito(new Date(2026, 10, 15)), 'noviembre'); // 15 de noviembre: aún toca noviembre
  assert.equal(proximoDeposito(new Date(2026, 10, 16)), 'mayo');
  assert.equal(proximoDeposito(new Date(2027, 0, 10)), 'mayo');
  assert.equal(proximoDeposito(new Date(2027, 4, 15)), 'mayo');
  assert.equal(proximoDeposito(new Date(2027, 4, 16)), 'noviembre');
});

test('devuelve las partes de la remuneración computable para mostrar el cálculo', () => {
  // 1243 / 6 = 207.1667 → se muestra 207.17
  const r = calcularCTS({ sueldo: 1230, asignacionFamiliar: true, montoAsignacion: 123, gratificacion: 1243, meses: 6, regimen: 'pequena' });
  assert.deepEqual(r.partes, { sueldo: 1230, asignacion: 123, sextoGratificacion: 207.17, promedioVariables: 0 });
  assert.equal(r.factor, 0.5);
});
