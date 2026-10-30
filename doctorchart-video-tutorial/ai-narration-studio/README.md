# Estudio de voz IA · Qwen

Este estudio tiene **sus propios guiones, tomas y progreso**, separados del estudio de la voz personal.

| Versión | Dirección | Lanzador | Carpeta de datos |
| --- | --- | --- | --- |
| Voz personal | http://localhost:3310 | Iniciar estudio de narración.cmd | `.local/narration-studio/` |
| Voz IA | http://localhost:3320 | Iniciar estudio de voz IA.cmd | `.local/ai-narration-studio/` |

1. Abrí **Iniciar estudio de voz IA.cmd**.
2. Elegí un fragmento; podés editar su título o guion, independientemente de la versión personal.
3. Elegí **Masculina** o **Femenina**, y tocá **Generar voz IA**. Se usa Qwen local en la RTX; no se activa el micrófono ni se utiliza tu voz como referencia.
4. Esperá la toma, escuchala y probá **Ver con esta toma**. Podés recortar el principio y el final, o generar otra.
5. Tocá **Guardar fragmento** o **Guardar y seguir** y esperá la confirmación de escritura verificada. Las tomas anteriores se conservan.

Las voces están en evaluación. Las referencias se diseñaron con VoiceDesign y el generador residente reutiliza la misma referencia sintética por voz para mantener su identidad entre fragmentos. La naturalidad y la pronunciación se revisan escuchando los resultados. Generar una toma no modifica el montaje de Remotion ni los audios personales.

No hace falta una suscripción ni una clave de API. El estudio usa **Qwen Base 0.6B residente**: carga el modelo una sola vez y lo reutiliza entre tomas, manteniendo una referencia de voz sintética generada con VoiceDesign. No utiliza grabaciones personales como referencia. El proceso conserva unos 2,6 GB de memoria gráfica mientras el servidor siga abierto. Una cancelación individual cierra el trabajador; la siguiente generación lo vuelve a cargar. Los guiones de generación están limitados a 200 palabras / 2000 caracteres por fragmento.

## Lote automático masculino

**Generar todo con voz masculina** recorre los 144 guiones guardados y guarda cada audio automáticamente en su fragmento. El contador superior y la lista se actualizan a medida que termina cada uno. Podés cerrar la pestaña: el servidor sigue generando. **Pausar al terminar la toma** conserva el audio en curso antes de pausar. **Continuar lote masculino** retoma los pendientes, incluso después de reiniciar la PC. Abrí primero el lanzador para recuperar el servidor.

El lote conserva las tomas anteriores. Si cambiás un guion mientras se está generando su audio, se marca para revisión en lugar de sobrescribir tu texto. Cada guardado se verifica en disco. El estado del lote está en `.local/ai-narration-studio/batch-state.json`; una recuperación después de un corte no duplica una toma que ya se haya guardado. El servidor informa una estimación del tiempo restante basada en los fragmentos terminados.

Las pronunciaciones del texto hablado sustituyen `Bycode` por `baicode` y `DoctorChart` por `Doctor Chart`. El guion visible conserva la escritura de las marcas.

## Instalación y reproducción

Ya se instaló un entorno separado en `.local/qwen-venv/`. Para preparar desde cero:

```powershell
powershell -NoProfile -File automation/setup-qwen.ps1
```

El instalador descarga PyTorch con CUDA desde el repositorio oficial y Qwen TTS desde PyPI; el modelo oficial se descarga con revisión fija y se verifican los SHA256 de sus pesos. Los archivos se conservan en `.local/qwen/model/`. La primera descarga ocupa varios GB. No modifica el entorno Piper anterior ni requiere cambiar los drivers.

**Probar voz Qwen.cmd** genera una muestra independiente. Para voz femenina: `Probar voz Qwen.cmd --voice femenina`. Las muestras están en `qa/qwen-voz-masculina.wav` y `qa/qwen-voz-femenina.wav`; se pueden escuchar también desde el encabezado desplegable del estudio IA.

Procedencia: `docs/qwen-provenance.json` y `docs/qwen-base-provenance.json`. Dependencias instaladas: `docs/qwen-requirements.lock.txt`. Detalles de las muestras, uso de VRAM y duración: los JSON junto a cada WAV en `qa/`. `qa/qwen-resident-benchmark.json` registra dos generaciones consecutivas con el mismo PID, modelo cargado una sola vez y unos 2,6 GB de VRAM.

## Pruebas y preservación

`npm run test:ai-studio` verifica aislamiento de las carpetas, protección de origen, exclusión de generaciones simultáneas, guardado, procedencia de la voz, reinicio y cancelación. Usa un WAV de ensayo para probar el servidor; las muestras de Qwen y la prueba de generación desde el navegador usan el modelo real con GPU.

Se verificó y respaldó el estudio personal antes de crear este: **11 fragmentos, 12 tomas**. El informe privado de respaldo está en `.local/qwen/human-studio-backup.json`; la copia está bajo `.local/narration-studio-backups/`. `qa/qwen-human-preservation.json` registra la comprobación de integridad, sin incluir los audios personales.
