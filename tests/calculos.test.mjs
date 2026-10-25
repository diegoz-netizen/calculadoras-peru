import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCTS, remuneracionComputable } from '../static/js/calculos.js';

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
  assert.equal(calcularCTS({ sueldo: 2500, gratificacion: 2500, promedioVariable: 490 / 6, meses: 6 }).total, 1499.17);
});
