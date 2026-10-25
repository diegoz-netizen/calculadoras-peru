# Calculadoras laborales Perú

Sitio estático de calculadoras (CTS por ahora) generado con Python + Jinja2. Los cálculos se hacen en el navegador con JavaScript, así que se puede alojar gratis en Cloudflare Pages o GitHub Pages.

## Estructura

- `site.json`: nombre, dominio, RMV y asignación familiar vigentes. Actualízalo cuando cambie el sueldo mínimo.
- `static/js/calculos.js`: fórmulas puras (sin DOM), probadas en `tests/`.
- `static/js/cts.js`: conecta el formulario con las fórmulas.
- `templates/`: páginas HTML (Jinja2).
- `build.py`: genera `dist/` con páginas, `sitemap.xml` y `robots.txt`.

## Uso

```bash
pip install jinja2
python build.py              # genera dist/
npm test                     # corre los tests (Node 18+)
python -m http.server -d dist 8000   # ver en http://localhost:8000
```

## Publicar gratis (Cloudflare Pages)

1. Sube este proyecto a un repositorio de GitHub.
2. En Cloudflare Pages, conecta el repositorio.
3. Comando de build: `pip install jinja2 && python build.py`. Carpeta de salida: `dist`.
4. Conecta tu dominio del Student Pack y cambia `dominio` en `site.json`.

## Plan

Ver `PLAN.md` (tareas para Claude Code) y `CLAUDE.md` (reglas y valores legales).

## Pendiente antes de AdSense

- Completar los textos de privacidad, cookies, contacto y sobre nosotros.
- Agregar gratificación, liquidación y vacaciones truncas.
- Verificar cada fórmula con las normas oficiales (MTPE y SUNAT).
