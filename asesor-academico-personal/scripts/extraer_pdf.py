#!/usr/bin/env python3
"""Extrae el texto de un PDF para la ingesta de material.

- Genera <archivo>.txt con el texto por página.
- Si una página no tiene texto (escaneo), la renderiza a PNG en <archivo>_paginas/ para
  leerla como imagen.

Uso:
  python3 scripts/extraer_pdf.py entradas/material.pdf [--dpi 110] [--todas]

Requiere pymupdf (pip install pymupdf). Si no está, intenta pypdf (solo texto).
"""
import argparse
import sys
from pathlib import Path


def con_pymupdf(ruta, dpi, todas):
    import pymupdf

    doc = pymupdf.open(ruta)
    salida_txt = ruta.with_suffix(".txt")
    carpeta = ruta.with_name(ruta.stem + "_paginas")
    partes, renderizadas = [], []
    for i, pagina in enumerate(doc, start=1):
        texto = pagina.get_text().strip()
        partes.append(f"\n===== PÁGINA {i} =====\n{texto}\n")
        if todas or len(texto) < 40:
            carpeta.mkdir(exist_ok=True)
            destino = carpeta / f"p{i:03d}.png"
            pagina.get_pixmap(dpi=dpi).save(destino)
            renderizadas.append(destino)
    salida_txt.write_text("".join(partes), encoding="utf-8")
    print(f"{len(doc)} páginas -> {salida_txt}")
    if renderizadas:
        print(f"{len(renderizadas)} páginas sin texto renderizadas en {carpeta}/ (leerlas como imagen):")
        for r in renderizadas[:15]:
            print(f"  {r}")
        if len(renderizadas) > 15:
            print("  ...")


def con_pypdf(ruta):
    from pypdf import PdfReader

    lector = PdfReader(str(ruta))
    salida_txt = ruta.with_suffix(".txt")
    partes, vacias = [], 0
    for i, pagina in enumerate(lector.pages, start=1):
        texto = (pagina.extract_text() or "").strip()
        if len(texto) < 40:
            vacias += 1
        partes.append(f"\n===== PÁGINA {i} =====\n{texto}\n")
    salida_txt.write_text("".join(partes), encoding="utf-8")
    print(f"{len(lector.pages)} páginas -> {salida_txt}")
    if vacias:
        print(f"{vacias} páginas sin texto: instalar pymupdf (pip install pymupdf) para renderizarlas como imagen.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("--dpi", type=int, default=110)
    parser.add_argument("--todas", action="store_true", help="renderizar todas las páginas a PNG")
    args = parser.parse_args()
    ruta = Path(args.pdf)
    if not ruta.exists():
        sys.exit(f"No existe: {ruta}")
    try:
        con_pymupdf(ruta, args.dpi, args.todas)
    except ImportError:
        try:
            con_pypdf(ruta)
        except ImportError:
            sys.exit("Instala pymupdf o pypdf: pip install pymupdf")


if __name__ == "__main__":
    main()
