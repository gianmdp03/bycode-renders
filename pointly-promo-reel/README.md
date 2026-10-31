# Reel publicitario de Pointly

Proyecto editable del workspace de `bycode-renders`. Composición principal `Pointly-Qwen-Masculina`, 1080×1920, 60 FPS, 29,48 s. Voz masculina Qwen instalada, misma referencia sintética de las producciones previas, pronunciación de Bycode **baicod**, música suministrada por el usuario y subtítulos alineados por palabra.

## Uso desde la raíz del repositorio

```powershell
npm ci
npm run dev:pointly
npm run check:pointly
npm run render:pointly
npm run qa:pointly
```

Studio: `http://localhost:3600/Pointly-Qwen-Masculina`. Cada escena también tiene una composición propia. `src/scenes/` contiene las piezas; `src/Reel.tsx` organiza sus secuencias explícitas y `captions/qwen-runtime.json` contiene los tiempos y la mezcla. Marca y componentes se importan de `@bycode/video-system/brand` y `/promo`; no hay una biblioteca duplicada. La adaptación Pointly frontend es **draft**.

Salida principal: `out/pointly_preview_qwen_masculina.mp4`. Los renders anteriores se preservan en `out/history/` al repetir. Guion: `script/GUION.md`; storyboard: `storyboard.md`; funciones verificadas: `audit/frontend.md`; recursos y música: `audio/PROCEDENCIA.md`; QA: `qa/VALIDACION.md`.

La versión adicional sin narración conserva el montaje y los captions como referencia: `out/pointly_preview_sin_voz.mp4`. Se obtiene después del render principal con `npm run render:music --workspace=pointly-promo-reel`, sin recodificar el video.

## Regenerar voz y música

Requiere la instalación Qwen existente bajo `doctorchart-video-tutorial/.local/` y el entorno de alineación existente en `doctorchart-promo-reel/.local/`. Los modelos no se incluyen como copia. Cambiar sólo los beats necesarios en `script/voice-beats.json`, comprobar que no haya otro lote usando la GPU y ejecutar:

```powershell
npm run voice:qwen --workspace=pointly-promo-reel
npm run render:pointly
npm run qa:pointly
```

El generador conserva tomas anteriores por hash; no vuelve a generar las que siguen vigentes. `scripts/align-mix.py` usa Whisper local en CPU para alinear palabras, conserva velocidad natural y crea la mezcla con sidechain. Un cambio que no coincida con la transcripción detiene el pipeline para revisión. `script/qwen-takes.json` puede contener `{"seeds":{"cta":20261040}}` para solicitar otra toma conservando la previa.

## Incorporar voz humana sin rehacer el montaje

Grabar los siete fragmentos según `script/GUION.md`. Crear `voice/tomas.json` con este formato, completando todos los beats en orden (`hook`, `intro`, `points`, `rewards`, `wallet`, `value`, `cta`):

```json
{"takes":[{"id":"hook","file":"hook.wav","displayText":"¿Tus clientes compran y no vuelven?"}]}
```

```powershell
npm run ingest-voice --workspace=pointly-promo-reel -- voice/tomas.json
node pointly-promo-reel/scripts/render.mjs human
node pointly-promo-reel/scripts/qa.mjs out/pointly_final_voz_humana.mp4
```

El manifiesto anterior es un ejemplo de una entrada; se requieren siete. El pipeline realinea la voz, reubica escenas y captions y recalcula el ducking. Exporta a `out/pointly_final_voz_humana.mp4`, preservando la versión Qwen. Revisar el nuevo MP4 después de cambiar locución.

## Refilmar el frontend

Primero compilar la fuente original desde `../pointly-frontend` sin sobrescribir su dist:

```powershell
node node_modules/@angular/cli/bin/ng.js build --configuration development --output-path ../bycode-renders/pointly-promo-reel/.local/frontend
```

Después, desde `bycode-renders`:

```powershell
npm run capture --workspace=pointly-promo-reel
npm run stills --workspace=pointly-promo-reel
```

El script levanta un servidor temporal en `127.0.0.1:4361`, bloquea la red externa e intercepta las API con datos ficticios. Es la UI original en ejecución; el backend está simulado. No conecta ni escribe datos de producción. La captura finaliza y cierra ese servidor automáticamente. Hay que revisar el manifiesto y los encuadres si cambia el frontend.
