# DoctorChart · Reel promocional

Producción del workspace principal, 28 segundos, 1080×1920 a 60 FPS. Preview con música original y captions de tiempo estimado; NO contiene voz sintética ni humana. Sólo se usa la voz real que aporte el usuario para el final.

Actualización: este reel está integrado al workspace principal `bycode-renders`. Marca, títulos, movimiento, captions y CTA se consumen desde `@bycode/video-system`; la identidad sigue **draft**. Instalación y comandos comunes desde la raíz del repositorio (`npm ci`, `npm run dev`, `npm run render:doctorchart`). No crear un segundo sistema ni instalar la biblioteca copiada dentro del reel.

## Ver la primera preview

- `out/reel_preview_bycode_integrado.mp4`: versión actualizada, H.264 yuv420p, BT.709, AAC estéreo 48 kHz.
- `out/contact-sheet-bycode-integrado.jpg`: 12 frames de control de la versión actualizada.
- `archive/pre-brand-integration/`: MP4 y contact sheet originales versionados; el original en `out/reel_preview_sin_voz.mp4` también se conserva.
- `archive/bycode-integrated/`: copia versionada del MP4 actualizado y evidencia de QA.
- `out/mobile-safe-area-*.png`: overlays de Reels ilustrativos para QA.
- `qa/validation.md`: verificación y límites de esta entrega.

## Editar y reproducir

Node 24 y npm. Desde la raíz `bycode-renders`:

```powershell
npm ci
npm run dev
```

Abrí `http://localhost:3400/DoctorChart-Reel`. La composición principal y cada escena tienen timeline propio. `Reels-Safe-Area` activa una guía visual de controles móviles; no se exporta en la preview.

```powershell
npm run prepare:preview
npm run stills
npm run render:preview
npm run qa
```

Se necesita Python con las dependencias de `requirements-voice.txt` para voz, composición musical y contact sheet. En esta máquina ya quedó un venv completo en `.local/voice-venv`, FFmpeg completo, modelo Whisper small multilingüe descargado y carga local comprobada. Para reconstruirlo en otra máquina Windows:

```powershell
python -m venv .local/voice-venv
.local/voice-venv/Scripts/python.exe -m pip install -r requirements-voice.txt
```

Las rutas de herramientas admiten `REEL_PYTHON`, `FFMPEG_PATH`, `FFPROBE_PATH`. El render base no requiere Python. La primera transcripción en otra máquina descarga Whisper; no sube la grabación a ningún servicio. El código no llama a TTS ni clona voces.

## Incorporar tu voz real

Leé `script/GUIA_PARA_GRABAR_TU_VOZ.md` y grabá `script/guion-final.md`. Una sola toma, sin música de fondo. Guardala en `voice/locucion-original.wav` o indicá WAV/MP3/M4A:

```powershell
npm run ingest-voice -- "C:\ruta\tu-toma.m4a"
```

El importador preserva el original, convierte a mono 48 kHz, recorta sólo extremos silenciosos con 220/300 ms de protección, conserva pausas interiores, normaliza en dos pasadas a −16 LUFS y transcribe localmente en español con marcas por palabra. Compara el texto con el guion, ancla los cortes a palabras reales y produce `captions/aligned.json`, `captions/voice-runtime.json`, `out/subtitulos.srt`, mezcla con música secundaria y ducking suave. Una discrepancia, confianza insuficiente, anclaje ausente o lectura larga detiene el flujo con informe en `qa/voice-alignment.json`. `--allow-longer` admite un ajuste de duración sin acelerar el audio.

Revisá los captions con tu escucha; el reconocimiento automático no garantiza sincronía fonética perfecta. Corregí si hace falta `captions/aligned.json` y los beats de `captions/voice-runtime.json`. El render lee ambos. Después de aprobar la preview:

```powershell
npm run render:final -- --approved
```

Si la preview ya fue aprobada, podés integrar y exportar con un único comando:

```powershell
npm run ingest-voice -- "C:\ruta\tu-toma.m4a" --approved
```

Salida: `out/reel_final_con_voz.mp4`. El final se niega a renderizar sin voz y QA aprobada. No existe una entrega final con voz todavía. El SRT de la preview está explícitamente separado en `captions/subtitulos-provisionales.srt`; nunca se presenta como transcripción real.

## Archivos creativos

- `creative-brief.md`, `verified-claims.md`: dirección y claims contrastados.
- `script/`: guion elegido de 48 palabras, dos variantes adicionales, guía y beats.
- `storyboard/storyboard.md`: montaje y fuentes por plano.
- `src/theme.ts`: adaptador al perfil provisional único de `shared/bycode-video-system/src/bycode-brand/products.ts`; `src/scenes/` conserva el montaje.
- `public/assets/`: capturas reales NUEVAS, logo DoctorChart y logo Bycode originales.
- `public/fonts/`: Google Sans original del proyecto y licencia OFL.
- `audio/compose.py`, `audio/music-license.md`, `public/audio/`: instrumental original reproducible y mezcla preparatoria.
- `assets/capture-manifest.json`: procedencia y hashes de las siete imágenes nuevas.
- `qa/source-versions.json`, `qa/node-versions.json`, `qa/python-versions.txt`: versiones exactas.

CTA sin URL hasta confirmar dirección pública. Cambiá `url` en el runtime de preview/final para incorporarla. Se muestra sólo Pediatría; no se promete un catálogo de todas las especialidades. IA, calculadoras y turnos excluidos.

La UI se capturó en la pila local DEMO del tutorial, con frontend copiado a esta carpeta. No se modificaron los repositorios fuente, el proyecto del tutorial ni las otras carpetas de video. Nada se publicó, desplegó o commiteó. No se reutilizó su locución ni su montaje.


Documentación técnica: [Remotion](https://www.remotion.dev/docs/renderer/render-media), [faster-whisper](https://github.com/SYSTRAN/faster-whisper). Licencia del runtime Remotion: consultar sus términos oficiales.
