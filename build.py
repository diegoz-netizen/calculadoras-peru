"""Genera el sitio estático en dist/. Uso: python build.py"""
import json
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

RAIZ = Path(__file__).parent
DIST = RAIZ / "dist"
site = json.loads((RAIZ / "site.json").read_text(encoding="utf-8"))
env = Environment(loader=FileSystemLoader(RAIZ / "templates"), autoescape=True)

FAQ_CTS = [
    {"q": "¿Cuándo se deposita la CTS?",
     "a": "Dos veces al año: hasta el 15 de mayo (por noviembre a abril) y hasta el 15 de noviembre (por mayo a octubre). Si el 15 cae sábado, domingo o feriado, el plazo vence el primer día hábil siguiente."},
    {"q": "¿Quién tiene derecho a CTS?",
     "a": "Los trabajadores del régimen privado con una jornada mínima de 4 horas diarias y al menos un mes de servicio. En microempresas inscritas en el REMYPE no corresponde, salvo para quienes fueron contratados antes de que la empresa se inscribiera."},
    {"q": "¿Cuánto recibo en una pequeña empresa?",
     "a": "La mitad que en el régimen general: 15 remuneraciones diarias por año de servicio."},
]

# Cada página: ruta, plantilla, nombre (corto, para menú y migas de pan), título y descripción.
# Opcionales: faq, seccion ("cts" agrupa las guías) y borrador (True mientras Dann no apruebe el texto:
# muestra la etiqueta, lleva noindex y queda fuera del sitemap y de los menús).
PAGINAS = [
    {"ruta": "/", "plantilla": "index.html", "nombre": "Inicio",
     "titulo": f"Calculadoras laborales Perú {site['anio']} | {site['nombre']}",
     "descripcion": "Calcula tu CTS, gratificación y liquidación con las fórmulas de la ley peruana."},
    {"ruta": "/calculadora-cts/", "plantilla": "cts.html", "nombre": "Calculadora de CTS", "seccion": "cts",
     "titulo": f"Calculadora de CTS {site['anio']}: calcula tu depósito de mayo o noviembre",
     "descripcion": "Calcula tu CTS en segundos según tu sueldo, asignación familiar y meses trabajados. Fórmula explicada con ejemplo.",
     "faq": FAQ_CTS},
]

FAQ_FECHAS = [
    {"q": "¿Hasta cuándo deben depositar la CTS de noviembre de 2026?",
     "a": "Hasta el lunes 16 de noviembre de 2026. El plazo normal vence el 15, pero ese día cae domingo, así que se corre al primer día hábil siguiente."},
    {"q": "¿Hasta cuándo deben depositar la CTS de mayo de 2027?",
     "a": "Hasta el lunes 17 de mayo de 2027, porque el 15 de mayo cae sábado."},
    {"q": "¿Qué pasa si mi empleador deposita la CTS tarde?",
     "a": "Queda obligado automáticamente a pagarte los intereses que el depósito habría generado si lo hubiera hecho a tiempo, y SUNAFIL puede multarlo. Puedes reclamarle por escrito y, si no responde, denunciarlo ante SUNAFIL."},
    {"q": "¿Cuándo me deben entregar la liquidación de la CTS?",
     "a": "Dentro de los 5 días hábiles siguientes al depósito. Debe estar firmada y mostrar el número de operación, tu remuneración computable y el periodo que se paga."},
]

PAGINAS.append(
    {"ruta": "/cts/fechas-de-deposito/", "plantilla": "cts/fechas-de-deposito.html", "seccion": "cts", "borrador": True,
     "nombre": "Fechas de depósito",
     "titulo": "Fechas de depósito de la CTS 2026 y 2027: plazos de mayo y noviembre",
     "descripcion": "La CTS de noviembre 2026 se deposita hasta el lunes 16 y la de mayo 2027 hasta el lunes 17. Qué sueldo se usa y qué hacer si tu empleador no deposita.",
     "faq": FAQ_FECHAS})

FAQ_MYPE = [
    {"q": "¿Tengo CTS si trabajo en una microempresa?",
     "a": "Si la microempresa está inscrita en el REMYPE, no corresponde CTS. La excepción son los trabajadores contratados antes de que la empresa se inscribiera: ellos sí la reciben, como en el régimen general."},
    {"q": "¿Cuánta CTS recibo en una pequeña empresa?",
     "a": "La mitad que en el régimen general: 15 remuneraciones diarias por año completo de servicios, hasta un máximo de 90. Solo se aplica si la empresa está inscrita en el REMYPE."},
    {"q": "¿Cómo sé si mi empresa está inscrita en el REMYPE?",
     "a": "Busca el RUC de tu empresa en tu boleta de pago y consúltalo en la consulta del REMYPE del Ministerio de Trabajo. Verás si está inscrita, en qué categoría y desde qué fecha."},
    {"q": "Mi empresa es pequeña pero no está en el REMYPE. ¿Qué CTS me toca?",
     "a": "La del régimen general. Las reglas de pequeña y microempresa solo se aplican a las empresas inscritas en el REMYPE."},
]

PAGINAS.append(
    {"ruta": "/cts/pequena-empresa-y-microempresa/", "plantilla": "cts/pequena-empresa-y-microempresa.html",
     "seccion": "cts", "borrador": True, "nombre": "CTS en pequeña y microempresa",
     "titulo": "CTS en pequeña empresa y microempresa (REMYPE): cuánto te corresponde",
     "descripcion": "En la pequeña empresa la CTS es la mitad y en la microempresa no corresponde, salvo excepciones. Cómo saber si tu empresa está en el REMYPE, con ejemplo.",
     "faq": FAQ_MYPE})

FAQ_RETIRO = [
    {"q": "¿Hasta cuándo puedo retirar el 100 % de mi CTS?",
     "a": "Hasta el 31 de diciembre de 2026, según la Ley N.º 32322. Después vuelven las reglas generales, que solo permiten retirar una parte, salvo que se apruebe otra ley."},
    {"q": "¿Tengo que renunciar o justificar el retiro?",
     "a": "No. Puedes retirar aunque sigas trabajando y no tienes que explicar en qué usarás el dinero. El trámite se hace en la entidad donde está tu CTS."},
    {"q": "¿Puedo retirar mi CTS más de una vez hasta diciembre?",
     "a": "La ley dice que la autorización es por única vez, pero no aclara si permite varios retiros dentro del plazo. Algunas entidades lo permiten y otras no: pregunta a la tuya antes de retirar."},
    {"q": "¿Puedo retirar toda mi CTS si tengo cáncer o una enfermedad terminal?",
     "a": "Sí, en cualquier momento, sin fecha límite, si acreditas el diagnóstico ante tu empleador. Esta regla es permanente."},
]

PAGINAS.append(
    {"ruta": "/cts/retiro/", "plantilla": "cts/retiro.html", "seccion": "cts", "borrador": True,
     "nombre": "Retiro de CTS",
     "titulo": "Retiro de CTS 2026: cómo sacar el 100 % hasta el 31 de diciembre (Ley 32322)",
     "descripcion": "Hasta el 31 de diciembre de 2026 puedes retirar el 100 % de tu CTS sin renunciar. Qué dice la Ley 32322, cómo pedirlo y qué pasa después.",
     "faq": FAQ_RETIRO})

LEGALES = [
    ("/privacidad/", "privacidad", "Política de privacidad"),
    ("/cookies/", "cookies", "Política de cookies"),
    ("/contacto/", "contacto", "Contacto"),
    ("/sobre-nosotros/", "sobre-nosotros", "Sobre nosotros"),
    ("/terminos/", "terminos", "Términos de uso"),
]
for ruta, archivo, h1 in LEGALES:
    PAGINAS.append({"ruta": ruta, "plantilla": f"legal/{archivo}.html", "nombre": h1, "h1": h1, "borrador": True,
                    "titulo": f"{h1} | {site['nombre']}", "descripcion": f"{h1} de {site['nombre']}."})


def migas(pagina):
    """Migas de pan: Inicio › (CTS ›) página."""
    if pagina["ruta"] == "/":
        return []
    lista = [("Inicio", "/")]
    if pagina.get("seccion") == "cts" and pagina["ruta"] != "/calculadora-cts/":
        lista.append(("CTS", "/calculadora-cts/"))
    return lista + [(pagina["nombre"], pagina["ruta"])]


def migas_jsonld(lista):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{"@type": "ListItem", "position": i, "name": nombre, "item": site["dominio"] + ruta}
                            for i, (nombre, ruta) in enumerate(lista, 1)],
    }, ensure_ascii=False)


def faq_jsonld(faq):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": p["q"],
                        "acceptedAnswer": {"@type": "Answer", "text": p["a"]}} for p in faq],
    }, ensure_ascii=False)


def ultima_modificacion(pagina):
    """Fecha del último commit que tocó la plantilla de la página, site.json o build.py.
    Si git no está disponible, usa la fecha de hoy."""
    archivos = [f"templates/{pagina['plantilla']}", "site.json", "build.py"]
    try:
        fecha = subprocess.run(["git", "log", "-1", "--format=%cs", "--", *archivos],
                               cwd=RAIZ, capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        fecha = ""
    return fecha or date.today().isoformat()


def main():
    # python build.py --borradores: incluye los borradores en los menús, para revisarlos en local.
    con_borradores = "--borradores" in sys.argv
    visibles = [p for p in PAGINAS if con_borradores or not p.get("borrador")]
    guias = [p for p in visibles if p.get("seccion") == "cts" and p["ruta"] != "/calculadora-cts/"]

    shutil.rmtree(DIST, ignore_errors=True)
    shutil.copytree(RAIZ / "static", DIST / "static")
    for p in PAGINAS:
        html = env.get_template(p["plantilla"]).render(
            site=site, guias=guias, migas=migas(p), migas_jsonld=migas_jsonld(migas(p)),
            faq_jsonld=faq_jsonld(p.get("faq", [])), **p)
        destino = DIST / p["ruta"].strip("/") / "index.html"
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(html, encoding="utf-8")

    urls = "".join(f"<url><loc>{site['dominio']}{p['ruta']}</loc><lastmod>{ultima_modificacion(p)}</lastmod></url>"
                   for p in PAGINAS if not p.get("borrador"))
    (DIST / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>',
        encoding="utf-8")
    (DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {site['dominio']}/sitemap.xml\n", encoding="utf-8")
    borradores = [p["ruta"] for p in PAGINAS if p.get("borrador")]
    print(f"{len(PAGINAS)} páginas generadas en {DIST}" + (f" ({len(borradores)} en borrador)" if borradores else ""))


if __name__ == "__main__":
    main()
