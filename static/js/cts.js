import { calcularCTS } from './calculos.js';

const form = document.querySelector('#form-cts');
const salida = document.querySelector('#resultado-cts');
const soles = (n) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

function explicarVariables({ mesesConPago, regular, promedio }) {
  if (mesesConPago === 0) return '';
  if (regular) {
    return `<p>Tus pagos variables son regulares (los recibiste en ${mesesConPago} de 6 meses).
      Se suma su promedio a tu remuneración computable: ${soles(promedio)} (la suma de los 6 meses entre 6).</p>`;
  }
  const meses = mesesConPago === 1 ? '1 mes' : `${mesesConPago} meses`;
  return `<p>Tus pagos variables <strong>no se suman</strong> a la CTS: los recibiste solo en ${meses}.
    La ley pide que sean regulares, es decir, que los recibas en al menos 3 de los 6 meses del semestre.</p>`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  try {
    const r = calcularCTS({
      sueldo: Number(d.get('sueldo')),
      asignacionFamiliar: d.get('asignacion') === 'si',
      montoAsignacion: Number(form.dataset.asignacion),
      gratificacion: Number(d.get('gratificacion') || 0),
      variables: d.getAll('variable').map((v) => Number(v || 0)),
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
      </ul>
      ${explicarVariables(r.variables)}`;
  } catch (err) {
    salida.innerHTML = `<p class="error">${err.message}</p>`;
  }
  salida.hidden = false;
});
