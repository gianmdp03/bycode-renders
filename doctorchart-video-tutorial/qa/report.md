# DoctorChart · revisión de la preview

Estado: **PREVIEW_READY_FOR_USER_REVIEW**.

Recorrido principal: **13:03**. Complementos: **15:01**. Total: **28:04**, 23 capítulos y 144 segmentos reales de voz. Las composiciones están separadas en Studio.

| Comprobación | Resultado |
|---|---|
| Código de los cinco servicios/productos y copia del frontend sin cambios | PASS |
| Geometría nativa, reloj, audio y subtítulos | PASS |
| Fuente original sin tramos negros y con capturas de OBS por beat | PASS |
| Movimiento original: seis capítulos con prueba contra duplicación de 30 FPS | PASS |
| Guards de médico, administración y cuenta sin plan | PASS |
| Stills de la timeline actual y borrador renderizado | PASS |
| Continuidad del AAC frente a mezcla lossless independiente | PASS |
| Matriz y 23 capítulos enlazados, sin referencias pendientes | PASS |

## Cobertura

223 filas con acción capturada, voz y posición en la timeline; 80 deshabilitadas y 61 fuera del alcance efectivo. No hay filas PENDING. **No se declara cobertura del 100%**: dos ramas defensivas de error no fueron alcanzables a través de los guards de esta versión.

- **DCV-071**, Volver a cargar: El guard exige workspace completo y definición antes de montar este formulario; loadForm usa la copia ya cargada. No se fuerza un estado interno inválido para hacer aparecer el botón.
- **DCV-154**, Intentar cargar nuevamente: El fallo inicial de workspace se captura en el guard/shell antes del wizard; una vez cargado, loadInitial utiliza la copia del store. Se acredita el reintento real del shell y se conserva esta rama defensiva como no reproducida.

El catálogo real sólo publica Pediatría. La cuenta de administración se revisó aparte y la cuenta sin plan quedó fuera de las rutas clínicas. IA y calculadoras independientes siguen deshabilitadas.

## Captura y audio

Todas las fuentes seleccionadas son 1920×1080 y 60/1; se remuxan sin conversión de FPS. Los seis capítulos con desplazamiento controlado pasaron el análisis de movimiento original. Tres tomas con apertura de PDF informaron dos frames omitidos en OBS; se conservan sus contadores en el manifest, sin ocultarlos. El análisis de fuentes no encontró tramos negros de 50 ms o más.

Los WAV se normalizaron a 48 kHz estéreo. Se comprobó que ninguna voz supera su intervalo. Los subtítulos de 32 px caben en dos líneas y tienen límites de frase obtenidos de las muestras reales de Piper. El usuario confirmó que la muestra exportada de 20 s se escucha continua; la revisión de naturalidad y del montaje completo corresponde a esta preview.

Voz: Piper es-MX ald medium; procedencia y licencia en docs/voice-provenance.json. Sin música. Datos clínicos completamente ficticios. Los checkouts de los productos conservan sus hashes y commits originales.

## Entrega y siguiente paso

- Preview completa: http://localhost:3300/DoctorChart-Tutorial-Preview
- Principal: http://localhost:3300/DoctorChart-Recorrido-Principal
- Complementos: http://localhost:3300/DoctorChart-Capitulos-Complementarios
- SRT completo, principal y complementos en subtitles/.
- Proyecto editable y comandos en README.md.

El máster final se genera únicamente tras aprobar esta preview, en output/DoctorChart-Tutorial-Final.mp4: H.264, yuv420p, 1920×1080 a 60 FPS y AAC estéreo 48 kHz. Todavía no se creó ese máster.
