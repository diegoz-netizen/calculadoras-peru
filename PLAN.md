# Plan de trabajo para Claude Code

Ejecuta las tareas en orden. Marca cada casilla al terminarla y haz un commit por tarea. Lee `CLAUDE.md` antes de empezar. Si una tarea necesita algo que solo Dann puede hacer (crear cuentas, comprar o canjear el dominio), detente y díselo.

## Fase 0: repositorio (hoy)

- [ ] `git init`, primer commit con el código actual. Rama `main`.
- [ ] Dann crea un repositorio vacío en GitHub. Conectar el remoto y hacer `git push -u origin main`.
- [ ] Verificar que `npm test` pasa (10 tests) y que `python build.py` genera `dist/` sin errores.

## Fase 1: mejorar la calculadora de CTS (semana del 26 oct)

- [ ] Pagos variables: en vez de pedir el promedio, mostrar 6 campos (uno por mes del semestre). La lógica calcula si son regulares (al menos 3 meses con pago) y el promedio (suma / 6). Si no son regulares, no se suman y se explica por qué. Tests para ambos casos.
- [ ] Selector de semestre (depósito de mayo o de noviembre) que cambie la ayuda del campo de gratificación (diciembre o julio).
- [ ] Nota en la opción de microempresa: "Si te contrataron antes de que la empresa se inscribiera en el REMYPE, sí te corresponde CTS".
- [ ] Botón "Copiar resultado" y enlace para compartir por WhatsApp (ayuda a que la gente difunda la página).
- [ ] Metaetiquetas Open Graph (título, descripción, imagen) para que el enlace se vea bien en WhatsApp y Facebook.
- [ ] Añadir `lastmod` al sitemap y `<meta name="robots" content="index,follow">`.
- [ ] Revisar con Lighthouse (Playwright o Chrome) que Rendimiento y SEO den 95 o más en celular.

## Fase 2: contenido alrededor de la CTS (semana del 2 nov)

Cada página: al menos 600 palabras útiles, un ejemplo con números, preguntas frecuentes con datos estructurados FAQ, enlace a la calculadora y base legal. Dann revisa cada texto antes de publicar.

- [ ] `/cts/fechas-de-deposito/`: fechas 2026 y 2027 y qué pasa si el empleador no deposita.
- [ ] `/cts/pequena-empresa-y-microempresa/`: diferencias por régimen y cómo saber si tu empresa está en el REMYPE.
- [ ] `/cts/retiro/`: Ley 32322, cuánto se puede retirar hasta el 31-dic-2026 y cómo pedirlo en el banco.
- [ ] Completar privacidad, cookies, contacto y sobre nosotros con texto real (sin la etiqueta "Borrador").
- [ ] Menú y pie con enlaces a todas las páginas; migas de pan (breadcrumbs) con datos estructurados.

## Fase 3: más páginas y lanzamiento (semana del 9 nov)

- [ ] `/cts/trunca/`: CTS al terminar el contrato.
- [ ] `/cts/ejemplos/`: 5 ejemplos resueltos (los de `tests/` sirven de base).
- [ ] Añadir Cloudflare Web Analytics (gratis y sin cookies).
- [ ] Crear `ads.txt` vacío listo para cuando AdSense dé el código del editor.

## Fase 4: gratificación (semana del 16 nov, antes del pago del 15 de diciembre)

- [ ] `calcularGratificacion` en `calculos.js`: sueldo + asignación familiar, proporcional a meses completos del semestre (ene–jun para julio, jul–dic para diciembre), más bonificación extraordinaria del 9 % (6.75 % si el trabajador está en EPS). Pequeña empresa: la mitad. Microempresa: no corresponde. Verificar la base legal (Ley 27735 y Ley 30334) antes de programar.
- [ ] Tests con casos calculados a mano y página `/calculadora-gratificacion/`.

## Cuando haya 10 a 15 páginas

- [ ] Avisar a Dann para solicitar AdSense. Cuando lo aprueben, agregar el script en `templates/base.html` (donde está el comentario) y el contenido de `ads.txt`.
