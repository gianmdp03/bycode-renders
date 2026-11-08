# Pointly · videotutorial completo

Entrega: `output/Pointly-tutorial-completo-1080p60.mp4`, 30 capítulos, aproximadamente 16 minutos y 10 segundos. MP4 H.264, 1920×1080, 60 FPS CFR, AAC estéreo a 48 kHz, voz masculina Qwen local. `script/pointly-tutorial.srt` es el subtítulo externo y `script/capitulos-youtube.txt` contiene los tiempos de capítulos. Los reportes finales conservan el hash del MP4 revisado; la impresión del QR mantiene una limitación de validación documentada.

Producción educativa dentro del workspace audiovisual Bycode. El producto se toma del checkout local `../pointly-frontend`; no se reconstruyen pantallas ni se consultan páginas públicas para describir funciones. La identidad audiovisual continúa **draft**, con los assets auténticos y el adaptador `pointlyFrontendTheme` de la biblioteca compartida.

## Archivos de trabajo

- `script/chapters.mjs`: narración por capítulo y objetivos de aprendizaje.
- `script/guion-completo.md`, `script/storyboard.json`: guion y storyboard compilados.
- `inventory/controls.json`: inventario AST, condiciones, handlers y hashes de las fuentes auditadas.
- `inventory/matriz-cobertura.md` y `coverage-*.json`: cruce entre funciones, escenas, evidencia y limitaciones.
- `recordings/`: originales de la aplicación funcionando y derivados CFR; `manifest.json` conserva relojes, eventos de cursor, HTTP y metadatos. Las tomas previas no se eliminan.
- `audio/`: WAV por capítulo, procedencia Qwen, transcripción independiente y tiempos acústicos por palabra. Las versiones reemplazadas quedan en `.local/audio-versions`.
- `script/pointly-tutorial.srt`: subtítulos de la mezcla final; también se conserva un SRT por capítulo.
- `remotion/src/`: composición completa y composiciones individuales editables.
- `output/Pointly-tutorial-completo-1080p60.mp4`: entrega final cuando los gates de QA estén aprobados.
- `qa/`: resultados de cobertura, audio, formato, capturas y revisión de fotogramas.

Los renders, WAV, videos originales, modelos, entornos y secretos se conservan localmente, fuera de Git. Los fuentes, datos ficticios reproducibles, manifiestos y reportes se versionan. No se incluyen datos reales ni credenciales de producción.

## Entorno DEMO

El harness `demo/runtime.py` reutiliza el mecanismo de infraestructura audiovisual existente. Compila los checkouts Go originales de Pointly, API Gateway, Billing y el servicio central de imágenes/correos. Usa PostgreSQL 17 y GoTrue reales en contenedores exclusivos con etiqueta `pointly.tutorial.owner=pointly-video-tutorial-20261103`.

La única entrada de backend publicada es `127.0.0.1:25443`; el frontend está en `http://localhost:25201`. La red de bases es privada. El volumen es exclusivo de este tutorial y parte de una base vacía. No se lee ningún `.env` de producto. No se ejecutan migraciones, resets ni cambios de esquema sobre bases existentes. El envío de correo, pagos, recuperación de cuentas y todos los proveedores externos están desactivados o dirigidos a un endpoint local sin servicio.

Las claves y cuentas sintéticas se generan en `.local/`; nunca deben copiarse a un archivo versionado. El navegador bloquea toda solicitud fuera de localhost. WhatsApp se revisa y copia; no se envían mensajes. Los planes de prueba se otorgan mediante el flujo administrativo real de Billing, sin pagos.

Estado A: comerciante nuevo sin comercio, con primer perfil por completar. Estado B: Café del Puerto DEMO, clientes ficticios, compras, premios, saldos e historial. Los importes y movimientos se crean por las APIs reales. Únicamente las fechas históricas iniciales se preparan en filas identificadas y verificadas de la base DEMO; esa preparación nunca se presenta como una acción de la interfaz.

## Regeneración

Desde la raíz de `bycode-renders`, en PowerShell:

```powershell
npm ci

# Python ya existente del entorno audiovisual:
$productionPython = '.\doctorchart-video-tutorial\.local\voice-venv\Scripts\python.exe'
$qwenPython = '.\doctorchart-video-tutorial\.local\qwen-venv\Scripts\python.exe'
$alignmentPython = '.\pointly-video-tutorial\.local\align-venv\Scripts\python.exe'

& $productionPython pointly-video-tutorial/demo/runtime.py verify
& $productionPython pointly-video-tutorial/demo/runtime.py build
& $productionPython pointly-video-tutorial/demo/runtime.py start
& $productionPython pointly-video-tutorial/demo/runtime.py frontend
& $productionPython pointly-video-tutorial/demo/seed.py
& $productionPython pointly-video-tutorial/demo/history-client.py
& $productionPython pointly-video-tutorial/demo/second-company.py
& $productionPython pointly-video-tutorial/demo/expiry-history.py

node pointly-video-tutorial/automation/audit.mjs
node pointly-video-tutorial/automation/capture.mjs 10-search
# Para actualizar la guía del capítulo 26, después de su toma principal:
node pointly-video-tutorial/automation/capture-guide.mjs

# Después de editar chapters.mjs, actualizar el JSON de entrada de Qwen:
node --input-type=module -e 'import fs from "node:fs";import {chapters} from "./pointly-video-tutorial/script/chapters.mjs";fs.writeFileSync("pointly-video-tutorial/script/chapters.json",JSON.stringify(chapters,null,2));'
& $qwenPython pointly-video-tutorial/automation/narrate.py 10-search
& $alignmentPython pointly-video-tutorial/automation/align.py
node pointly-video-tutorial/automation/revise-captions.mjs
& $alignmentPython pointly-video-tutorial/automation/verify-inputs.py
node pointly-video-tutorial/automation/prepare-supplement.mjs
node pointly-video-tutorial/automation/retime.mjs
node pointly-video-tutorial/automation/compile.mjs --final
node pointly-video-tutorial/automation/coverage.mjs
npm run typecheck --workspace=pointly-video-tutorial
node pointly-video-tutorial/automation/render.mjs
& $productionPython pointly-video-tutorial/automation/verify-demo.py
& $productionPython pointly-video-tutorial/automation/verify-video.py
# Revisar los fotogramas y actualizar qa/visual-review.json con el hash actual.
# Solamente después de esa revisión:
node pointly-video-tutorial/automation/finalize-coverage.mjs
```

Los comandos de preparación no autorizan borrar la base ni perder tomas. Antes de repetir acciones con efectos, revisar el estado DEMO y usar una nueva toma o datos ficticios apropiados; una escena de alta no es idempotente por el solo hecho de volver a ejecutar Playwright.

Para repetir el onboarding, `demo/new-merchant.py --take=20261110` crea otra cuenta ficticia y conserva la anterior. Revisar en `capture.mjs` los DNI de altas, el enlace nuevo y las fechas futuras de promociones antes de repetir capítulos con escrituras. Una asociación ya existente puede devolver 409; no se debe convertir ese rechazo en un supuesto éxito. La cuenta de la segunda asociación también debe ser elegible en ese comercio. `--action-takes` recorta la espera de locución durante la grabación, conservando las acciones a velocidad normal; la pausa de lectura se agrega después con tiempos acústicos.

`freeze-frontend.py` sincroniza fuentes y recursos locales sin tocar el checkout del producto y conserva los archivos previos. Excluye la configuración generada. `runtime.py frontend` prepara exclusivamente la configuración pública DEMO y un proxy local `/api` con la CA del proyecto para que las fotos relativas funcionen como en el servidor publicado. Si desaparecieron solamente los contenedores, `demo/recover-containers.py` permite recuperarlos únicamente sobre el volumen propio, con respaldo en frío y comprobación de etiquetas; no autoriza adaptar un esquema incompatible.

La captura actual usa una superficie de pestaña Chromium a 1920×1080 y 60 FPS nominales, en segundo plano. No depende del monitor físico de 1366×768 ni abre ventanas sobre el escritorio. Conserva el WebM original, los timestamps reales y un MP4 CFR de edición. Un píxel de reloj de producción fuerza repintado durante estados estáticos y queda fuera del recorte final; el cursor y sus clics son anotaciones de grabación, sin reemplazar controles ni resultados.

La locución reutiliza **Qwen3-TTS-12Hz-0.6B-Base**, CUDA/bfloat16/SDPA y la referencia masculina sintética existente, verificada por SHA256. No se usa voz personal. La configuración y los pesos residen en `doctorchart-video-tutorial/.local/qwen*`. Los WAV finales son PCM16, 48 kHz, estéreo, normalizados a −16 LUFS y pico verdadero objetivo −1,5 dBTP.

Se puede usar `narrate.py 10-search --device=cpu --threads=2` cuando la GPU esté ocupada. Se conserva la misma referencia masculina; no se invoca ningún servicio de voz. El caché reutiliza texto sin cambios. `--force` regenera solo los IDs elegidos, archivando los audios anteriores. El cierre corregido de la sección 08 se conserva como `audio/08-client-tail.wav`, con su manifiesto en `script/fragments.json`; `splice-client-tail.py` documenta el corte acústico y la transición de 15 milisegundos. Después de una corrección siempre se alinea nuevamente el WAV completo.

La alineación usa Faster Whisper Small local en CPU, con tiempos acústicos por palabra. La primera preparación del alineador descarga solamente el modelo abierto; la voz y el reconocimiento se ejecutan localmente. `revise-captions.mjs` conserva los tiempos y corrige límites de frases y ortografía documentada. Revisar `qa/caption-review.json`: cualquier diferencia de contenido requiere escuchar o regenerar la sección, no inventar un tiempo según su longitud.

El montaje se define en Remotion, que renderiza los layouts y la marca. El exportador optimizado compone esos layouts con los fotogramas reales y el audio mediante FFmpeg/NVENC; evita volver a capturar cada fotograma de video en Chrome. También está disponible `node pointly-video-tutorial/automation/render.mjs --full-remotion` para exportar íntegramente con el renderer de Remotion. La revisión debe comprobar equivalencia visual, subtítulos y tiempos, además de resolución y codec.

Las pausas de lectura están en `.local/retimed-manifest.json` y los zooms suaves en `remotion/src/visual-edits.json`. El retimado conserva el movimiento original a velocidad normal y agrega fotogramas de reposo auténticos; comprueba que se codifique la duración prevista. Se explicita `fps=60` antes de `tpad`, porque la propagación de la cadencia del decodificador local podía omitir esos reposos. La vuelta por login del capítulo 22 se recorta sin alterar el archivo, la consulta pública ni la reactivación.

`script/reviewed-edits.json` conserva seis ajustes de montaje comprobados sobre las tomas actuales: recorta cargas repetidas, acompaña cada explicación con su resultado y conserva los clics a velocidad normal. Los insertos de lectura de la cuenta archivada y las preguntas frecuentes se reordenan como demostraciones separadas. Cada ajuste exige el archivo y el hash de audio originales; si se graba otra toma, revisar o retirar su entrada antes de regenerar. Nunca aplicar los mismos números de fotograma a una interfaz nueva sin volver a revisar.

La guía de instalación del capítulo 26 usa otra grabación auténtica con viewport menor a 900 píxeles. `recordings/supplements.json` la vincula al tramo acústico correspondiente. No es una interfaz reconstruida. La salida es CFR a 60 FPS; la cadencia variable real del capturador se conserva en el manifiesto, incluyendo los intervalos de carga, y no se afirma que cada segundo contenga sesenta imágenes de origen diferentes.

`capture-guide.mjs` mantiene un viewport lógico de 864×486 con rasterizado nativo de Chromium a 1920×1080; verifica también las dimensiones del archivo codificado. Conserva la marca temporal mediante la captura CDP directa, que no restablece el viewport emulado. Requiere el acceso DEMO válido registrado por la toma principal del capítulo 26. Las tomas exploratorias de menor resolución quedan conservadas, pero no son la fuente de la guía en la entrega final.

El exportador conserva caché por escena. Para actualizar una sola escena: recompilar entradas, ejecutar `render.mjs 10-search` y luego `render.mjs --assemble-only`. El ensamblado rechaza renders obsoletos, reconstruye una mezcla continua a 48 kHz y actualiza capítulos sin reexportar las escenas válidas. `verify-video.py` decodifica el MP4 completo, analiza audio y pantallas negras y genera noventa fotogramas de revisión; estos deben revisarse además del resultado técnico.

La revisión del 7 de noviembre está en `inventory/actualizacion-2026-11-07.md`. La impresión del QR tiene validación parcial en `qa/print-verification.json`: se verificaron enlace, descarga y apertura de ventana, pero no se presenta una impresión física ni una vista vacía como éxito. Los proveedores de mensajes, la contratación de planes y la instalación del sistema operativo tampoco se ejecutan en la DEMO.

Abrir el editor: `npm run dev:pointly-tutorial`. No publica ni despliega. Las composiciones promocionales existentes no se modifican.

## Actualizar por nuevas funciones

1. Registrar el commit y el estado del frontend/backend usados. Actualizar la copia pública de desarrollo sin tocar el código comercial ni adoptar credenciales reales. El harness conserva la copia anterior: revisar sus hashes antes de reutilizarla.
2. Reauditar rutas, flags, permisos y controles. Actualizar la matriz y marcar funciones nuevas como pendientes.
3. Ajustar solamente capítulos y acciones afectados. Conservar los originales y las referencias de voz; no reemplazar una función real por una simulación para desbloquear la grabación.
4. Grabar una nueva toma. Comprobar respuesta y resultado visible, y verificar saldos/historial cuando cambian puntos.
5. Generar únicamente los WAV modificados, volver a transcribir esos archivos y revisar diferencias. Recompilar todos los offsets y el SRT global.
6. Renderizar, revisar fotogramas y audio de la entrega, ejecutar los gates y actualizar cobertura. Un render exitoso o un test de componentes no certifica por sí solo la función en el video.

Si el nuevo backend rechaza el baseline de la DEMO existente, detener su actualización y preparar una instancia de prueba nueva con identidad explícita. No adaptar ni vaciar bases existentes automáticamente.
