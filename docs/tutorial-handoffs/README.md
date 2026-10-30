# Prompts para próximos videotutoriales

Estos archivos se prepararon para abrir **chats nuevos**. En este chat no se inició la auditoría, el entorno ni la grabación de Pointly o Bycode.

- `PROMPT_POINTLY.md`: videotutorial completo del frontend web de Pointly, con auditoría de sus funciones reales.
- `PROMPT_BYCODE.md`: recorrido de las opciones del frontend de Bycode para usuarios, separando la administración y el detalle interno de otras aplicaciones.
- `METODO_Y_VOZ.md`: preferencias, flujo de producción, decisiones de voz, calidad, persistencia y lecciones del proyecto DoctorChart.
- `VOZ_MASCULINA_DOCTORCHART.json`: perfil de referencia con rutas, SHA256, texto hablado y configuración del motor instalado.

## Cómo usarlos

Abrí un chat nuevo en el proyecto/workspace **bycode-renders**, con acceso al frontend y backend correspondientes. Adjuntá el prompt de la aplicación o pegá su contenido. Cada prompt ordena leer los dos documentos compartidos por su ruta completa, para que no tengas que explicar nuevamente el contexto.

Mensaje corto alternativo para ese chat:

> Leé íntegramente `C:/Users/gcast/Documents/GitHub/bycode-renders/docs/tutorial-handoffs/PROMPT_POINTLY.md` y ejecutá ese encargo. Leé también los archivos de continuidad que referencia. No modifiques los otros proyectos ni sus grabaciones.

Para Bycode, sustituí el nombre por `PROMPT_BYCODE.md`. Si el chat no tiene acceso a esas rutas, adjuntá también `METODO_Y_VOZ.md` y el perfil JSON; los modelos y el WAV deben estar disponibles en la máquina que genere la voz.

## Voz reutilizable

La referencia masculina se copió a una ubicación fija e independiente de las muestras de QA, dentro de `doctorchart-video-tutorial/.local/qwen/voice-library/doctorchart-masculina-01/`. La copia se verificó por SHA256 contra la muestra preferida por el usuario. Los archivos de la biblioteca no deben sobrescribirse ni regenerarse.

Los prompts reutilizan esa referencia y los modelos ya instalados; no usan las grabaciones personales del usuario. En otra computadora hace falta copiar la carpeta de referencia y preparar los modelos/dependencias indicados. Los caminos absolutos de este paquete corresponden al equipo actual.
