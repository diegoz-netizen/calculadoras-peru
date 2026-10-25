import { calcularCTS } from './calculos.js';

const form = document.querySelector('#form-cts');
const salida = document.querySelector('#resultado-cts');
const soles = (n) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  try {
    const r = calcularCTS({
      sueldo: Number(d.get('sueldo')),
      asignacionFamiliar: d.get('asignacion') === 'si',
      montoAsignacion: Number(form.dataset.asignacion),
      gratificacion: Number(d.get('gratificacion') || 0),
      promedioVariable: Number(d.get('variable') || 0),
      meses: Number(d.get('meses')),
      dias: Number(d.get('dias') || 0),
      regimen: d.get('regimen'),
    });
    salida.innerHTML = `
      <p class="total">Tu CTS estimada: <strong>${soles(r.total)}</strong></p>
      <ul>
        <li>Remuneración computable: ${soles(r.computable)}</li>
        <li>Por meses completos: ${soles(r.porMeses)}</li>
        <li>Por días: ${soles(r.porDias)}</li>
      </ul>`;
  } catch (err) {
    salida.innerHTML = `<p class="error">${err.message}</p>`;
  }
  salida.hidden = false;
});
