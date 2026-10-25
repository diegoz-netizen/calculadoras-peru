# Calculadoras laborales Perú

Sitio estático de calculadoras laborales para trabajadores en Perú, monetizado con Google AdSense. El dueño es Dann, estudiante; trabaja ~1 h de lunes a viernes y fines de semana completos.

## Stack

- Python 3 + Jinja2 genera HTML estático en `dist/` (`python build.py`).
- Cálculos en JavaScript del lado del navegador: lógica pura en `static/js/calculos.js`, conexión con el formulario en `static/js/<calculadora>.js`.
- Tests con el runner nativo de Node: `npm test`.
- Hosting: Cloudflare Pages (gratis). Build: `pip install jinja2 && python build.py`, salida `dist`.
- Sin frameworks de CSS ni dependencias de npm. Mantenerlo así: la velocidad de carga importa para SEO.

## Reglas

- Todo el texto visible va en español de Perú, claro y sin jerga.
- Cada fórmula cita su base legal en la página y tiene tests con casos calculados a mano.
- No redondear valores intermedios; redondear solo el resultado final a 2 decimales.
- Los valores que cambian por ley (RMV, asignación familiar, UIT) viven en `site.json`, nunca escritos en el código.
- Cada página nueva se registra en `PAGINAS` de `build.py` para que entre al sitemap.
- No recoger datos personales: los cálculos se quedan en el navegador.
- Correr `npm test` y `python build.py` antes de cada commit.

## Valores legales vigentes (verificados el 25-oct-2026)

- RMV: S/ 1,230 desde el 1-oct-2026 (D.S. N.º 015-2026-TR). Subirá a S/ 1,300 en 2027 por un decreto aún no publicado.
- Asignación familiar: 10 % de la RMV = S/ 123.
- CTS (TUO D. Leg. 650, D.S. 001-97-TR, art. 21): RC / 12 × meses + RC / 360 × días. RC = básico + asignación familiar + 1/6 de la gratificación del semestre + promedio de variables regulares (pagadas en al menos 3 de los 6 meses; promedio = suma / 6). Mínimo un mes completo y jornada de 4 h diarias.
- Depósitos: hasta el 15 de mayo (nov–abr, se usa la gratificación de diciembre) y hasta el 15 de noviembre (may–oct, gratificación de julio).
- Pequeña empresa en REMYPE: 15 remuneraciones diarias por año (la mitad), tope 90. Microempresa en REMYPE: no corresponde, salvo trabajadores contratados antes de que la empresa se inscribiera. Empresa no inscrita en REMYPE: régimen general.
- Retiro: Ley N.º 32322 permite retirar el 100 % de la CTS hasta el 31-dic-2026.
