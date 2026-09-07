# Entradas

Deja aquí el material nuevo que quieras que el gemelo procese: PDF de programas de curso,
normas, libros, papers, presentaciones de clase, apuntes, certificados.

El gemelo lo detecta al iniciar la sesión (compara con `biblioteca/INDICE.md`), lo extrae
con `scripts/extraer_pdf.py`, escribe su ficha en `biblioteca/fuentes/`, carga los temas
en `memoria/repaso.md` y propone la ruta de estudio. Los originales procesados pueden
moverse a `procesados/`.

Los archivos `.txt` y las carpetas `_paginas/` que genera el script son temporales; se
pueden borrar después de escribir la ficha.
