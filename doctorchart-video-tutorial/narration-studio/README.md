# Estudio de narración

Abrí **Iniciar estudio de narración.cmd** en la carpeta del tutorial o ejecutá `npm run narration-studio`. La página está en **http://localhost:3310**. El servidor escucha únicamente en este equipo; no requiere Docker, DoctorChart, OBS ni servicios de voz externos.

1. Elegí un fragmento de la lista. Tenés los 144 guiones, organizados en 23 capítulos, con su captura real correspondiente.
2. Cambiá el **título** o el **guion para leer**. Cada campo afecta solamente ese fragmento. El original sigue disponible para consultar.
3. Tocá **Grabar mi voz**, permití el micrófono del navegador y leé. Tocá **Detener** cuando termines. También podés importar WAV, MP3, M4A, WebM, OGG o FLAC grabados con otro dispositivo.
4. Escuchá y, si querés, ajustá **Desde / Hasta** para recortar silencios o repeticiones al principio y al final. Para cortar una equivocación en el medio, conviene repetir ese fragmento corto o importar una toma ya editada.
5. Tocá **Guardar fragmento** o **Guardar y seguir**. Esperá **Guardado y verificado en disco**. El servidor escribe los archivos, los vuelve a leer y verifica el hash SHA256 del WAV antes de confirmar.
6. Cerrá cuando quieras. Para continuar otro día abrí el mismo lanzador. La selección reciente se recuerda en ese navegador; el audio, el texto y el progreso se leen del disco.

El selector de ritmo cambia únicamente las imágenes entre ×1,5, ×1,75 y ×2. **Ver con esta toma** reproduce la voz a velocidad natural sobre la captura correspondiente, con cursor. Si el audio es más largo que las imágenes, mantiene la última imagen. Si es más corto, termina de mostrar las acciones. No reemplaza todavía el montaje completo de Remotion: conserva todo lo necesario para el próximo montaje y exporta las asociaciones en JSON.

## Persistencia

Datos: `doctorchart-video-tutorial/.local/narration-studio/`.

- `state.json`: guiones, títulos, velocidades, estado, revisiones y toma seleccionada por fragmento.
- `audio/`: archivo importado/original, WAV completo a 48 kHz estéreo y WAV recortado. Las tomas anteriores se conservan.
- `history/`: estados anteriores al guardado.

**Descargar guiones y progreso** exporta el manifiesto; los WAV se descargan por toma desde la página. Para respaldar todo, copiá la carpeta de datos completa con el servidor detenido. Los audios personales permanecen en esta carpeta local, ignorada por Git, y no se envían a proveedores de voz.

Un guion modificado después de grabar marca **Revisar guion**, sin borrar la toma. Un error de red o escritura conserva la toma nueva en la página para reintentar o descargar; no cierres hasta guardarla o descargarla. Las revisiones impiden que una pestaña pise cambios guardados por otra.

## Comprobación

`npm run test:narration-studio` usa una carpeta aislada, audio sintético real y FFmpeg. Verifica edición localizada, hashes de audio descargado/disco, recortes, múltiples tomas, reinicio del servidor, conflictos entre pestañas y un fallo real de escritura. Los resultados quedan en `qa/narration-studio-report.json`. No utiliza grabaciones del usuario ni marca fragmentos de su estudio como terminados.

`node automation/narration-studio-browser-qa.mjs` abre un ensayo separado en el puerto 3312 con una entrada sintética explícitamente identificada. Ejercita el MediaRecorder real del navegador, Detener, recortar, Guardar y seguir y recargar, sin usar el micrófono personal. Esa entrada no existe en el servidor del usuario (3310).
