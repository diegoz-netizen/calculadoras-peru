// Los ejemplos con números de las guías (templates/cts/*.html). Si cambia una fórmula,
// estos tests avisan que hay que actualizar el texto de la página.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCTS } from '../static/js/calculos.js';

test('fechas de depósito: Ana, S/ 2,000 y gratificación de S/ 2,000', () => {
  // RC = 2000 + 2000/6 = 2333.33 → /12 × 6 = 1166.67
  const r = calcularCTS({ sueldo: 2000, gratificacion: 2000, meses: 6 });
  assert.equal(r.computable, 2333.33);
  assert.equal(r.total, 1166.67);
});

test('pequeña empresa y microempresa: Luis, S/ 1,800', () => {
  // Pequeña: RC = 1800 + 900/6 = 1950 → /12 × 6 × 50 % = 487.50
  const pequena = calcularCTS({ sueldo: 1800, gratificacion: 900, meses: 6, regimen: 'pequena' });
  assert.equal(pequena.computable, 1950);
  assert.equal(pequena.total, 487.5);
  // General: RC = 1800 + 1800/6 = 2100 → /12 × 6 = 1050
  const general = calcularCTS({ sueldo: 1800, gratificacion: 1800, meses: 6 });
  assert.equal(general.computable, 2100);
  assert.equal(general.total, 1050);
  assert.equal(calcularCTS({ sueldo: 1800, meses: 6, regimen: 'micro' }).total, 0);
});

test('retiro: Carmen, depósito de noviembre de S/ 1,400', () => {
  // RC = 2400 + 2400/6 = 2800 → /12 × 6 = 1400 ; 6000 + 1400 = 7400
  const r = calcularCTS({ sueldo: 2400, gratificacion: 2400, meses: 6 });
  assert.equal(r.total, 1400);
  assert.equal(6000 + r.total, 7400);
});
