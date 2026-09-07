#!/usr/bin/env python3
"""Cola de repaso espaciado del asesor académico personal.

Lee y actualiza la tabla de memoria/repaso.md. Algoritmo: variante simplificada de SM-2.

Uso:
  python3 scripts/repaso.py hoy
  python3 scripts/repaso.py registrar "<tema>" <nota 0-5>
  python3 scripts/repaso.py agregar "<tema>" "<fuente>"
  python3 scripts/repaso.py listar
"""
import re
import sys
from datetime import date, timedelta
from pathlib import Path

RUTA = Path(__file__).resolve().parent.parent / "memoria" / "repaso.md"
COLUMNAS = ["tema", "fuente", "nivel", "facilidad", "intervalo", "ultimo", "proximo"]


def leer():
    texto = RUTA.read_text(encoding="utf-8")
    lineas = texto.splitlines()
    filas, inicio, fin = [], None, None
    for i, linea in enumerate(lineas):
        if linea.startswith("| tema |"):
            inicio = i
            continue
        if inicio is not None and i > inicio + 1:
            if linea.startswith("|"):
                celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
                if len(celdas) == len(COLUMNAS):
                    filas.append(dict(zip(COLUMNAS, celdas)))
                fin = i
            else:
                break
    if inicio is None:
        sys.exit("No se encontró la tabla en memoria/repaso.md")
    if fin is None:
        fin = inicio + 1
    return lineas, filas, inicio, fin


def escribir(lineas, filas, inicio, fin):
    filas.sort(key=lambda f: (f["proximo"] or "0000-00-00", f["tema"]))
    cuerpo = ["| " + " | ".join(f[c] for c in COLUMNAS) + " |" for f in filas]
    nuevas = lineas[: inicio + 2] + cuerpo + lineas[fin + 1 :]
    RUTA.write_text("\n".join(nuevas).rstrip("\n") + "\n", encoding="utf-8")


def hoy_str():
    return date.today().isoformat()


def cmd_hoy(filas):
    hoy = hoy_str()
    vencidos = [f for f in filas if not f["proximo"] or f["proximo"] <= hoy]
    if not vencidos:
        print("Nada vencido hoy. Próximo repaso:")
        proximos = sorted(filas, key=lambda f: f["proximo"])[:3]
        for f in proximos:
            print(f"  {f['proximo']}  {f['tema']}  (nivel {f['nivel']})")
        return
    vencidos.sort(key=lambda f: (int(f["nivel"]), f["proximo"]))
    print(f"Temas vencidos o que vencen hoy ({len(vencidos)}), primero los de nivel más bajo:")
    for f in vencidos:
        atraso = ""
        if f["proximo"] and f["proximo"] < hoy:
            dias = (date.fromisoformat(hoy) - date.fromisoformat(f["proximo"])).days
            atraso = f", {dias} d de atraso"
        print(f"  [{f['nivel']}] {f['tema']}  ->  {f['fuente']}{atraso}")
    print("\nSugerencia: intercalar 2 o 3 temas por sesión de repaso; registrar con:")
    print('  python3 scripts/repaso.py registrar "<tema>" <0-5>')


def cmd_registrar(filas, tema, nota):
    nota = int(nota)
    if not 0 <= nota <= 5:
        sys.exit("La nota debe estar entre 0 y 5")
    objetivo = buscar(filas, tema)
    facilidad = float(objetivo["facilidad"])
    intervalo = int(objetivo["intervalo"])
    ultimo_nivel = int(objetivo["nivel"])
    if nota < 3:
        intervalo = 1
    else:
        if not objetivo["ultimo"] or ultimo_nivel < 3:
            intervalo = 1 if nota == 3 else 3
        elif intervalo <= 1:
            intervalo = 3
        elif intervalo <= 3:
            intervalo = 7
        else:
            intervalo = round(intervalo * facilidad)
    facilidad = max(1.3, facilidad + (0.1 - (5 - nota) * (0.08 + (5 - nota) * 0.02)))
    intervalo = min(intervalo, 120)
    objetivo.update(
        nivel=str(nota),
        facilidad=f"{facilidad:.2f}",
        intervalo=str(intervalo),
        ultimo=hoy_str(),
        proximo=(date.today() + timedelta(days=intervalo)).isoformat(),
    )
    print(f"Registrado: {objetivo['tema']} -> nota {nota}, próximo repaso {objetivo['proximo']} ({intervalo} d)")


def cmd_agregar(filas, tema, fuente):
    if any(f["tema"].lower() == tema.lower() for f in filas):
        sys.exit(f"Ya existe el tema: {tema}")
    filas.append(
        dict(tema=tema, fuente=fuente, nivel="0", facilidad="2.5", intervalo="1", ultimo="", proximo=hoy_str())
    )
    print(f"Agregado: {tema} (vence hoy, nivel 0)")


def cmd_listar(filas):
    for f in sorted(filas, key=lambda f: (f["proximo"], f["tema"])):
        print(f"{f['proximo']}  [{f['nivel']}] {f['tema']}  (cada {f['intervalo']} d, facilidad {f['facilidad']})")


def buscar(filas, tema):
    exactos = [f for f in filas if f["tema"].lower() == tema.lower()]
    if exactos:
        return exactos[0]
    parciales = [f for f in filas if tema.lower() in f["tema"].lower()]
    if len(parciales) == 1:
        return parciales[0]
    if not parciales:
        sys.exit(f"No se encontró el tema: {tema}")
    sys.exit("Tema ambiguo, coincide con:\n  " + "\n  ".join(f["tema"] for f in parciales))


def main(argv):
    if len(argv) < 2 or argv[1] not in {"hoy", "registrar", "agregar", "listar"}:
        print(__doc__)
        return 1
    lineas, filas, inicio, fin = leer()
    cmd = argv[1]
    if cmd == "hoy":
        cmd_hoy(filas)
    elif cmd == "listar":
        cmd_listar(filas)
    elif cmd == "registrar":
        if len(argv) != 4:
            sys.exit('Uso: registrar "<tema>" <nota 0-5>')
        cmd_registrar(filas, argv[2], argv[3])
        escribir(lineas, filas, inicio, fin)
    elif cmd == "agregar":
        if len(argv) != 4:
            sys.exit('Uso: agregar "<tema>" "<fuente>"')
        cmd_agregar(filas, argv[2], argv[3])
        escribir(lineas, filas, inicio, fin)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except BrokenPipeError:
        sys.exit(0)
