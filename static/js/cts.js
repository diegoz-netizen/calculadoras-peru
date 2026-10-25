import { SEMESTRES, calcularCTS, proximoDeposito } from './calculos.js';

const form = document.querySelector('#form-cts');
const salida = document.querySelector('#resultado-cts');
const compartir = document.querySelector('#compartir');
const botonCopiar = document.querySelector('#copiar');
const soles = (n) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
let textoResultado = '';

// Cambia los nombres de los meses y la ayuda de la gratificación según el semestre elegido.
function mostrarSemestre() {
  const semestre = SEMESTRES[form.semestre.value];
  document.querySelector('#mes-gratificacion').textContent = semestre.gratificacion;
  form.querySelectorAll('[data-mes]').forEach((el) => {
    el.textContent = semestre.meses[el.dataset.mes];
  });
}

const notaMicro = document.querySelector('#nota-micro');
const mostrarNotaMicro = () => { notaMicro.hidden = form.regimen.value !== 'micro'; };
form.regimen.addEventListener('change', mostrarNotaMicro);
mostrarNotaMicro();

form.semestre.value = proximoDeposito(new Date());
mostrarSemestre();
form.semestre.addEventListener('change', mostrarSemestre);

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

const REGIMEN_TEXTO = { pequena: 'pequeña empresa: la mitad', micro: 'microempresa: no corresponde' };

// El cálculo con los números del usuario, para que pueda revisarlo paso a paso.
function pasos(r, gratificacion, meses, dias) {
  const { partes, computable, factor } = r;
  const ajuste = factor === 1 ? '' : ` × ${factor * 100} % (${REGIMEN_TEXTO[form.regimen.value]})`;
  const computableTexto = `<li><strong>Remuneración computable:</strong>
      sueldo ${soles(partes.sueldo)}
      + asignación familiar ${soles(partes.asignacion)}
      + 1/6 de la gratificación (${soles(gratificacion)} ÷ 6 = ${soles(partes.sextoGratificacion)})
      + promedio de pagos variables ${soles(partes.promedioVariables)}
      = <strong>${soles(computable)}</strong></li>`;
  if (meses === 0) {
    return `<h3>Cómo se calculó</h3><ol class="pasos">${computableTexto}
      <li>No completaste un mes de trabajo en el semestre, así que todavía no corresponde CTS.</li></ol>`;
  }
  return `<h3>Cómo se calculó</h3>
    <ol class="pasos">
      ${computableTexto}
      <li><strong>Por meses completos:</strong> ${soles(computable)} ÷ 12 × ${meses}${ajuste} = ${soles(r.porMeses)}</li>
      <li><strong>Por días:</strong> ${soles(computable)} ÷ 360 × ${dias}${ajuste} = ${soles(r.porDias)}</li>
      <li><strong>Total:</strong> ${soles(r.porMeses)} + ${soles(r.porDias)} = <strong>${soles(r.total)}</strong></li>
    </ol>
    <p class="nota">Cada paso se muestra redondeado a 2 decimales, pero el cálculo usa todos los decimales.
      Por eso, si sumas los pasos a mano, puede salirte 1 céntimo de diferencia.</p>`;
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
      ${pasos(r, Number(d.get('gratificacion') || 0), Number(d.get('meses')), Number(d.get('dias') || 0))}
      ${explicarVariables(r.variables)}
      ${form.regimen.value === 'micro' ? `<p>En una microempresa inscrita en el REMYPE no corresponde CTS. ${notaMicro.textContent} En ese caso, elige «Régimen general» para calcularla.</p>` : ''}`;
    textoResultado = [
      `Mi CTS estimada (depósito de ${form.semestre.value}): ${soles(r.total)} (referencial)`,
      `- Remuneración computable: ${soles(r.computable)}`,
      `- Por meses completos: ${soles(r.porMeses)}`,
      `- Por días: ${soles(r.porDias)}`,
      `Calculado en ${document.querySelector('link[rel=canonical]').href}`,
    ].join('\n');
    compartir.hidden = false;
  } catch (err) {
    salida.innerHTML = `<p class="error">${err.message}</p>`;
    compartir.hidden = true;
  }
  salida.hidden = false;
});

// Respaldo para navegadores dentro de apps (Facebook, WhatsApp) que bloquean navigator.clipboard.
function copiarConTextarea(texto) {
  const t = document.createElement('textarea');
  t.value = texto;
  t.setAttribute('readonly', '');
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.append(t);
  t.select();
  const ok = document.execCommand('copy');
  t.remove();
  return ok;
}

botonCopiar.addEventListener('click', async () => {
  let ok;
  try {
    await navigator.clipboard.writeText(textoResultado);
    ok = true;
  } catch {
    ok = copiarConTextarea(textoResultado);
  }
  botonCopiar.textContent = ok ? '¡Copiado!' : 'No se pudo copiar';
  setTimeout(() => { botonCopiar.textContent = 'Copiar resultado'; }, 2000);
});
