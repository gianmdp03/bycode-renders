# Bycode Software · reel institucional

Pieza producida el 30/10/2026 a partir del **frontend local**, sin consultar el sitio público. 1080 × 1920, 60 FPS, MP4 H.264 / AAC estéreo 48 kHz. Se conserva la preview de 28,8 segundos sin narración. Por pedido posterior del usuario se incorpora una **variante de prueba con voz sintética Qwen masculina**, usando la referencia fija del tutorial de DoctorChart; no es la voz personal del usuario.

## Variante Qwen masculina

- MP4: `out/bycode_preview_qwen_masculina.mp4`.
- Voz sin música: `public/voice/bycode-qwen-masculina.wav`.
- Guion editable: `script/voice-beats.json`; tomas y metadatos: `public/voice/qwen-masculina/`.
- Timeline y subtítulos reales: `captions/qwen-runtime.json`, `captions/qwen-aligned.json`, `out/subtitulos-qwen.srt`.
- Procedencia y QA: `qa/qwen-generation.json`, `qa/qwen-word-alignment.json`, `qa/qwen-alignment.json`, `qa/qwen-media-report.json`.

Reproducir el pipeline desde la raíz:

```powershell
npm run voice:qwen --workspace=bycode-institucional-reel
```

Reutiliza en lectura el Python Qwen, modelo Base 0.6B y referencia sintética masculina instalados en `doctorchart-video-tutorial`. Verifica el SHA-256 fijo de la referencia, carga modelo/prompt una sola vez, guarda checkpoints por frase y continúa sin regenerar tomas válidas. No modifica el tutorial ni sus grabaciones. El alias hablado de Bycode es “báicod”; marca y subtítulos mantienen la escritura correcta. En Studio: `http://localhost:3500/Bycode-Qwen-Masculina`.

La alineación local transcribe cada toma con faster-whisper; usa tiempos de palabras reconocidas y comprueba que el texto coincide. Se recortan sólo silencios exteriores, se ajustan las escenas a las duraciones reales y se mezcla con sidechain. La voz conserva su velocidad natural. La música es `public/audio/musica-spot-provista.mp3`, entregada posteriormente por el usuario: se prepara a −34 LUFS frente a la voz a −16 LUFS, con bajada adicional durante el habla. Si la lectura no entra en 30 segundos o no coincide con el guion, se detiene para revisión. El pipeline termina con render y QA del MP4. Para renderizar de nuevo sin generar voz: `npm run render:qwen --workspace=bycode-institucional-reel`.

La pronunciación vigente es **“báicod”, acento en BAI**; reemplaza “baicoud”. Afecta presentación y cierre; las otras cuatro tomas se conservan. `script/qwen-takes.json` registra las tomas elegidas y cualquier corte entre oraciones. `qwen-splice.py` permite aplicar esas ediciones sin acelerar audio y conserva los originales y sus hashes; si cambia el texto o la toma de origen, se detiene para revisar los cortes. Las versiones anteriores permanecen archivadas.

El modelo reutilizado está documentado con licencia Apache-2.0 en `doctorchart-video-tutorial/docs/qwen-base-provenance.json`. El carácter sintético se registra aquí y en metadata, sin encabezados ni avisos superpuestos al cuadro. La naturalidad y pronunciación requieren escuchar y revisar la muestra.

## Ver y editar

- Video: `out/bycode_preview_sin_voz.mp4`.
- Guion: `script/guion.txt`.
- Guía de grabación: `script/guia-de-locucion.md`.
- Storyboard: `storyboard.md`.
- Procedencia y claims: `audit/frontend.md`, `qa/assets.json`.
- Música original, código fuente y documentación: `public/audio/menos-vueltas-original.wav`, `scripts/compose.py`, `audio/LICENCIA.md`.
- Composición: `src/Reel.tsx`; cada escena tiene su archivo y timeline en Studio.
- Validación técnica: `qa/media-report.json`; revisión visual: `qa/VALIDACION.md`.

Desde la raíz del repositorio:

```powershell
npm ci
npm run dev:bycode
```

Abrí `http://localhost:3500/Bycode-Institucional`. Los cambios se hacen en los seis archivos de `src/scenes/`, el guion/timing en `script/voice-beats.json`. La identidad se consume de `@bycode/video-system/brand`, mediante `bycodeFrontendTheme`, en el registro compartido. Los componentes comerciales vienen de `/promo`. La adaptación audiovisual continúa **draft**; conservar assets auténticos no equivale a aprobar una identidad audiovisual definitiva.

Los recursos están incluidos. No hace falta reconstruirlos para editar o renderizar. `npm run assets:prepare --workspace=bycode-institucional-reel` vuelve a importar assets del frontend hermano, regenerar timings estimados y componer música. Requiere Python con NumPy y FFmpeg. **No ejecutarlo para incorporar una voz**, porque esa operación sólo prepara la preview.

## Incorporar tu voz real y exportar automáticamente

1. Grabá el texto de `script/guion.txt` siguiendo la guía. Entregá WAV o MP3 sin música; una lectura natural de 26–28 segundos deja aire al cierre.
2. Ejecutá desde la raíz, con ruta absoluta:

```powershell
npm run voice:bycode -- "C:\ruta\mi-voz.wav"
```

Ese único comando conserva la toma original en `voice/`, recorta sólo silencios exteriores, normaliza la voz, transcribe localmente en español con timestamps de palabra y verifica similitud con el guion. Usa las primeras palabras reales para mover los cortes, adapta las animaciones a cada escena, genera subtítulos de lo realmente dicho, baja automáticamente la música con sidechain, renderiza `out/bycode_final_con_voz.mp4`, exporta SRT y ejecuta QA técnico. No acelera la grabación ni inventa tiempos si falla la alineación. Los nombres propios pueden requerir revisión del ASR.

La preview y el final tienen nombres distintos. Las sucesivas exportaciones de cada modo reemplazan **su propio** archivo; guardá una copia si querés conservar una versión del mismo modo. Las tomas originales usan un hash para conservar grabaciones distintas.

Si la lectura difiere del guion, una escena dura demasiado poco o el montaje supera 30 segundos, el proceso se detiene con el motivo en `qa/voice-alignment.json`. Regrabá la toma con el texto completo y el ritmo indicado. Los tiempos reales quedan en `captions/aligned.json`; la transcripción sin procesar se conserva en `captions/transcription-raw.json`. El reconocimiento requiere escuchar y revisar la sincronía antes de publicar. Para importar sin renderizar, agregá `--no-render`; para volver a exportar después: `npm run render:final --workspace=bycode-institucional-reel`.

### Entorno de voz

En esta máquina se reutiliza el Python y el modelo local **ya instalado** en `doctorchart-promo-reel/.local/`, sin modificar sus archivos. Para otro equipo, instalá Python 3.12, un FFmpeg compatible y las dependencias de `requirements-voice.txt` en un entorno propio. Configurá:

```powershell
$env:REEL_PYTHON = 'C:\ruta\entorno\Scripts\python.exe'
$env:FFMPEG_PATH = 'C:\ruta\ffmpeg.exe'
# Opcional: modelo faster-whisper small multilingual ya descargado.
$env:REEL_ASR_MODEL = 'C:\ruta\whisper-small'
```

Sin modelo local, faster-whisper descarga `small` la primera vez. `ffprobe` viene con el compositor instalado de Remotion en Windows; se puede reemplazar con `FFPROBE_PATH`. El reconocimiento es local; la variante TTS autorizada reutiliza Qwen local y su referencia sintética, sin enviar grabaciones a servicios externos.

## Render y validación

```powershell
npm run render:bycode
npm run qa:bycode
npm run check:bycode
npm run stills --workspace=bycode-institucional-reel
```

Los PNG de `out/` muestran todas las escenas, primer/último frame, cortes y una simulación de overlays de Reels. Se reservan 84 px a izquierda, 168 a derecha, 210 arriba y unos 410 abajo para información principal. Las pantallas son capturas reales con datos de demostración; los acercamientos no simulan clics ni resultados nuevos. Los overlays reales de Instagram pueden variar.

No se modificó el montaje de DoctorChart ni se publicó o desplegó contenido. La validación con **tu** voz queda pendiente de recibir esa grabación; el pipeline está implementado y sus dependencias verificadas, pero no se puede certificar la calidad del ASR o la mezcla de una toma que todavía no existe.
