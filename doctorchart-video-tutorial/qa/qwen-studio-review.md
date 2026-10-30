# Qwen y estudio IA · prueba real

Estado técnico: **PASS**. Naturalidad, acento y pronunciación: **pendientes de escucha del usuario**.

## Instalación real

Python 3.12 separado en `.local/qwen-venv/`; Qwen TTS 0.1.1, PyTorch / torchaudio 2.9.1 + CUDA 12.8. `pip check`: sin dependencias incompatibles. Se comprobó CUDA con una multiplicación de matrices bfloat16 en la RTX 4050 Laptop GPU de 6141 MiB.

Modelo oficial: Qwen3-TTS-12Hz-1.7B-VoiceDesign, revisión `5ecdb67327fd37bb2e042aab12ff7391903235d3`. Pesos y tokenizador descargados y comprobados contra sus SHA256. Procedencia y archivos: `docs/qwen-provenance.json`.

| Muestra | Audio producido | Generación en GPU | Pico de VRAM asignada | Pico reservado |
| --- | ---: | ---: | ---: | ---: |
| Masculina | 25,84 s | 62,11 s | 4492 MiB | 5172 MiB |
| Femenina | 27,44 s | 65,45 s | 4492 MiB | 5258 MiB |

WAV de salida: 48 kHz, estéreo PCM16. El texto hablado usa `baicode` y `Doctor Chart`; el texto visible conserva las marcas. No se usaron grabaciones personales como referencia ni una API de generación de voz. Los avisos de FlashAttention y SoX no impidieron estas generaciones: se utilizó SDPA de PyTorch y FFmpeg para la salida.

## Estudios independientes

- Voz personal: puerto **3310**, `.local/narration-studio/`, lanzador original.
- Voz IA: puerto **3320**, `.local/ai-narration-studio/`, **Iniciar estudio de voz IA.cmd**.
- El estudio IA rechaza usar la carpeta de las grabaciones personales como destino. Ambos conservan sus propios guiones, revisiones, tomas y selección.

Antes de comenzar se respaldó y verificó el estudio personal: **11 fragmentos, 12 tomas**. Al finalizar, todos los archivos comprobados permanecen byte por byte idénticos al respaldo. Informe: `qwen-human-preservation.json`; ubicación y manifiesto privado: `.local/qwen/human-studio-backup.json`.

## Verificación funcional

- Pruebas del estudio personal: **10 PASS**, sin usar la carpeta del usuario.
- Prueba de integración del estudio IA: **PASS**. Aislamiento, origen local, una generación a la vez, cancelación, hash de audio, procedencia de la voz, guardado y recuperación tras reinicio.
- Navegador: botón **Generar voz IA** ejecutó Qwen real; se guardó una toma masculina del primer fragmento.
- Se reinició el servidor con el lanzador y se recuperó esa toma.
- Se generó una segunda toma femenina desde la interfaz, se guardó y se recargó: se conservan ambas tomas, con la femenina seleccionada y su procedencia Qwen registrada.
- El WAV descargado coincide exactamente con el archivo físico y su SHA256.
- Consola del navegador: sin errores. Captura: `ai-narration-studio.png`.

No se generaron las 144 voces ni se sustituyó el montaje de Remotion. VoiceDesign se está evaluando; antes de la producción completa conviene fijar una referencia sintética para mantener la identidad vocal entre fragmentos. El siguiente paso es elegir la voz después de escuchar las muestras.
