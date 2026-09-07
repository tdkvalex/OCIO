# Asesor académico personal (gemelo de Francisco Medina)

Skill de Claude que actúa como gemelo académico: razona con la trayectoria, los estudios y
el criterio profesional de Francisco, enseña el material nuevo que él adjunta vinculándolo
a sus objetivos de formación, y refuerza con repaso espaciado el conocimiento técnico que
el tiempo erosiona.

Es un paquete independiente. No depende de ningún otro proyecto: la carpeta completa es el
skill y puede vivir en su propio repositorio, instalarse en Claude (Cowork, Claude Code o
claude.ai) o empaquetarse como `.skill`.

## Instalación
- **Claude Code**: copiar la carpeta a `.claude/skills/asesor-academico-personal/` del
  repositorio de trabajo, o a `~/.claude/skills/` para tenerlo en todos los proyectos.
- **Cowork / claude.ai**: subir el archivo `asesor-academico-personal.skill` (o la carpeta)
  y guardarlo como skill.
- Requisito opcional para procesar PDF: `pip install pymupdf`.

## Cómo se usa
Hablarle con naturalidad. Ejemplos:
- "Adjunto el programa de Gestión de Operaciones de la USS, tengo prueba el 30."
- "Qué me toca repasar hoy."
- "Explícame Last Planner como si me lo estuviera recordando yo mismo."
- "Hazme un simulacro de 10 preguntas del módulo de riesgos del MBA."
- "Registra esto: hoy decidí ... porque ..." (calibra al gemelo).

## Estructura
```
SKILL.md          rol, modos de trabajo y protocolo (lo lee Claude al activarse)
perfil/           identidad, trayectoria, formación, competencias
biblioteca/       INDICE, fichas de fuentes, núcleos de refuerzo técnico
memoria/          objetivos, progreso, cola de repaso, decisiones
metodologia/      pedagogía, protocolo de ingesta, plantillas
entradas/         material nuevo por procesar
scripts/          extraer_pdf.py, repaso.py
```

## Mantención
- `memoria/` y `biblioteca/` cambian en cada sesión: confirmarlos con commit para no
  perder el avance.
- `python3 scripts/repaso.py hoy` muestra qué está vencido; `registrar` y `agregar`
  actualizan la cola.
- Las secciones marcadas **[por calibrar]** y **[pendiente]** en `perfil/` y `memoria/`
  son preguntas que el gemelo irá haciendo; responderlas mejora la réplica.
