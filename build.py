"""Genera el sitio estático en dist/. Uso: python build.py"""
import json
import shutil
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

RAIZ = Path(__file__).parent
DIST = RAIZ / "dist"
site = json.loads((RAIZ / "site.json").read_text(encoding="utf-8"))
env = Environment(loader=FileSystemLoader(RAIZ / "templates"), autoescape=True)

FAQ_CTS = [
    {"q": "¿Cuándo se deposita la CTS?",
     "a": "Dos veces al año: hasta el 15 de mayo (por noviembre a abril) y hasta el 15 de noviembre (por mayo a octubre)."},
    {"q": "¿Quién tiene derecho a CTS?",
     "a": "Los trabajadores del régimen privado con una jornada mínima de 4 horas diarias y al menos un mes de servicio. En microempresas inscritas en el REMYPE no corresponde, salvo para quienes fueron contratados antes de que la empresa se inscribiera."},
    {"q": "¿Cuánto recibo en una pequeña empresa?",
     "a": "La mitad que en el régimen general: 15 remuneraciones diarias por año de servicio."},
]

PAGINAS = [
    {"ruta": "/", "plantilla": "index.html",
     "titulo": f"Calculadoras laborales Perú {site['anio']} | {site['nombre']}",
     "descripcion": "Calcula tu CTS, gratificación y liquidación con las fórmulas de la ley peruana."},
    {"ruta": "/calculadora-cts/", "plantilla": "cts.html",
     "titulo": f"Calculadora de CTS {site['anio']}: calcula tu depósito de mayo o noviembre",
     "descripcion": "Calcula tu CTS en segundos según tu sueldo, asignación familiar y meses trabajados. Fórmula explicada con ejemplo.",
     "faq": FAQ_CTS},
]

LEGALES = {
    "/privacidad/": ("Política de privacidad", "<p>Qué datos se recogen (ninguno en las calculadoras: el cálculo se hace en tu navegador), uso de cookies de Google AdSense y Analytics, y cómo contactarnos.</p>"),
    "/cookies/": ("Política de cookies", "<p>Tipos de cookies que usan los anuncios y la analítica, y cómo desactivarlas.</p>"),
    "/contacto/": ("Contacto", f"<p>Escríbenos a {site['contacto']}.</p>"),
    "/sobre-nosotros/": ("Sobre nosotros", "<p>Quién hace el sitio y de dónde salen las fórmulas.</p>"),
}
for ruta, (h1, cuerpo) in LEGALES.items():
    PAGINAS.append({"ruta": ruta, "plantilla": "legal.html", "h1": h1, "cuerpo": cuerpo,
                    "titulo": f"{h1} | {site['nombre']}", "descripcion": f"{h1} de {site['nombre']}."})


def faq_jsonld(faq):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": p["q"],
                        "acceptedAnswer": {"@type": "Answer", "text": p["a"]}} for p in faq],
    }, ensure_ascii=False)


def main():
    shutil.rmtree(DIST, ignore_errors=True)
    shutil.copytree(RAIZ / "static", DIST / "static")
    for p in PAGINAS:
        html = env.get_template(p["plantilla"]).render(
            site=site, faq_jsonld=faq_jsonld(p.get("faq", [])), **p)
        destino = DIST / p["ruta"].strip("/") / "index.html"
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(html, encoding="utf-8")

    urls = "".join(f"<url><loc>{site['dominio']}{p['ruta']}</loc></url>" for p in PAGINAS)
    (DIST / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>',
        encoding="utf-8")
    (DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {site['dominio']}/sitemap.xml\n", encoding="utf-8")
    print(f"{len(PAGINAS)} páginas generadas en {DIST}")


if __name__ == "__main__":
    main()
