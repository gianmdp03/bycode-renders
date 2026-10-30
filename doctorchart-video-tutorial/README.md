# DoctorChart · producción del videotutorial

**Grabación personal por fragmentos:** abrí `Iniciar estudio de narración.cmd` o ejecutá `npm run narration-studio`, y entrá en http://localhost:3310. Permite editar cada guion y título, grabar/importar, recortar, guardar y continuar otro día. [Instrucciones del estudio](narration-studio/README.md).

**Versión independiente con voz IA:** abrí `Iniciar estudio de voz IA.cmd` o ejecutá `npm run ai-studio`, y entrá en http://localhost:3320. Usa Qwen local con la RTX y conserva guiones, progreso y tomas en otra carpeta. [Instrucciones de voz IA](ai-narration-studio/README.md).

Proyecto editable con **capturas del frontend real**, datos completamente ficticios y servicios locales aislados. El estado verificable se conserva en `qa/project-report.json` y `qa/coverage-report.json`. Los pendientes se enumeran en `inventory/remaining-coverage.md`; no se declara cobertura total mientras existan.

Preview de Remotion: http://localhost:3300/DoctorChart-Tutorial-Preview. Incluye cursor derivado de eventos reales, anillos de clic, zoom puntual, voz es-MX y subtítulos de 32 px en una banda dedicada. La voz neuronal requiere aprobación de naturalidad y pronunciación. No se ha autorizado el MP4 final.

## Archivos para revisar

- `inventory/features.json`, `coverage-matrix.csv`: fuente, rol, especialidad, flags, evidencia y estado por control.
- `inventory/source-provenance.json`, `runtime-specialties.json`: versiones y catálogo efectivo.
- `script/storyboard.json`, `narration-es-419.md`: acciones, precondiciones y voz por beat.
- `recordings/manifest.json`: tomas originales, marcadores, eventos de cursor, fotogramas y respuestas de API sin credenciales.
- `remotion/src/GeneratedTimeline.tsx`: clips y segmentos de voz editables de forma independiente.
- `subtitles/doctorchart-es-419.srt`: subtítulos independientes con límites exactos de las frases sintetizadas.
- `docs/production-brief.md`, `known-blockers.md`, `voice-provenance.json`: decisiones, límites y licencia de la voz.

## Requisitos y preparación

Windows, Node compatible con `remotion/package.json`, Python 3.12, Go, Docker Desktop, Chrome y OBS 32.2.2 con WebSocket. Los checkouts locales de frontend, DoctorChart Go, Gateway, Billing y conversor deben ser los registrados en la procedencia. Ningún comando modifica esos repositorios.

```powershell
npm ci
npm --prefix remotion ci
npm run bootstrap
node automation/python.mjs runtime build
node automation/python.mjs runtime start
node automation/python.mjs runtime frontend
node automation/python.mjs seed accounts
npm run seed
npm run preflight
```

La pila usa un proyecto Docker nuevo etiquetado `doctorchart-tutorial-demo`, bases nuevas, servicios reales y acceso sólo en loopback. Los identificadores exactos de los contenedores se comprueban antes de escribir datos. La preparación inicial de esquemas ocurre exclusivamente en esas bases nuevas. El historial sintético necesita una excepción de datos para fechas inmutables, documentada en el brief; esa capacidad no se presenta como función del producto.

No volver a ejecutar el onboarding de la cuenta A sobre una cuenta ya completada. Las tomas existentes son la evidencia de su primer ingreso; para repetir desde cero se requiere una nueva cuenta DEMO y su concesión Billing real, sin vaciar la cuenta anterior. No sobrescribir secretos ni adoptar contenedores de otro proyecto.

OBS se utiliza en una copia portable dentro de `.local/obs-app`, con perfil `Tutorial`, escena `Tutorial`, fuente `DoctorChart REAL`, sin micrófono ni audio del escritorio. `automation/start-obs.py` prepara ese perfil, después de copiar los archivos de la instalación oficial a esa carpeta. El OBS habitual del usuario se conserva. La captura usa BitBlt con Chrome compuesto por software, geometría nativa y calibración antes de cada capítulo. Una segunda fuente `DoctorChart PDF REAL` permite mostrar el visor real sin perder la ventana principal.

## Producción y comprobación

```powershell
npm run voice
npm run record -- 13-productivity
npm run compile
npm run coverage
npm run qa
npm run preview
```

`record -- <capítulo> --rehearse` ejecuta las acciones reales y aserciones sin grabar. Las pruebas pueden crear o eliminar únicamente documentos y registros marcados DEMO. Las tomas fallidas se conservan fuera del montaje. Las contraseñas nunca se muestran y los eventos de escritura sólo registran longitud.

`record -- --from=10` reanuda desde un capítulo. Los capítulos de primer ingreso requieren identidades nuevas: `demo/prepare-native-retakes.py <id-de-toma>` crea cuentas DEMO con ese identificador, concede su plan mediante Billing real y conserva las identidades anteriores. Rechaza reutilizar una cuenta que ya tenga workspace. No vacía cuentas ni reestablece estados internos. Antes de repetir el alta del paciente de filmación, `demo/remove-scratch.py --include-demo-encounters` acepta exclusivamente la identidad, documento y motivos DEMO expresamente definidos en ese script; los 40 pacientes base permanecen.

`node automation/render-qa.mjs` produce stills y un borrador corto para QA. `node automation/qa-audio-export.mjs` compara el audio AAC del borrador con una mezcla lossless independiente de los WAV. El usuario ya confirmó que la muestra inicial exportada se escucha continua; esa confirmación no equivale a aprobar el video completo.

La duración objetivo de 10–15 minutos corresponde al recorrido principal. La cobertura fina del editor, documentos, filtros y conflictos exige capítulos complementarios; los capítulos se exponen también como composiciones independientes en Studio. No se omiten los pendientes para alcanzar una duración.

La verificación de movimiento decodifica los fotogramas originales con `node automation/qa-motion.mjs <id>`. No se convierte material a 60 FPS para hacerlo pasar por una captura nativa. Los informes distinguen metadatos de FPS, pérdidas de OBS y cadencia visual.

Tras aprobar una preview concreta, registrar la aprobación del usuario y el hash de esa timeline en `.local/preview-approval.json` y ejecutar `npm run render`. Exporta H.264/yuv420p y AAC; la composición define 1920×1080 a 60 FPS y el audio normalizado es 48 kHz estéreo. Verificar el MP4 y la sonoridad antes de entregarlo.

`npm run clean-demo` detiene sólo los contenedores cuya etiqueta e ID coinciden exactamente con este proyecto. Conserva las bases y el volumen. No borra datos ni opera sobre servicios de producción.

## Prueba completa con voz Qwen masculina

`npm run render:ai:test` toma una copia verificable de las 144 tomas seleccionadas del estudio IA. Comprueba los hashes, el texto grabado y el formato de cada WAV. No escribe en ninguno de los estudios de narración. Mantiene el audio a velocidad normal y usa la velocidad visual guardada en cada fragmento (1,5, 1,75 o 2); cuando la explicación necesita más tiempo, mantiene en pantalla el resultado de la acción.

El proyecto editable es la composición **DoctorChart-IA-Prueba** y los 23 capítulos `IA-*`. `remotion/src/GeneratedAITimeline.tsx` contiene una Sequence independiente por fragmento; `ai-timeline.json` conserva los identificadores, guiones, hashes, tiempos y velocidades del montaje exportado. El render rápido combina las capturas reales con decoraciones generadas por Remotion, cursor derivado de los eventos reales y aros de clic; los cinco acercamientos animados se renderizan completos con Remotion. La unión se codifica en H.264 BT.709/yuv420p a 1920×1080 y 60 FPS, con AAC de 48 kHz estéreo. También se conserva la ruta íntegra por Remotion: `node automation/render-ai-test.mjs --full`.

Resultados: `output/DoctorChart-Tutorial-Prueba-IA.mp4`, `output/DoctorChart-IA-capitulos.txt` y `subtitles/doctorchart-ia-es-419.srt`. Los subtítulos muestran el guion guardado, en un máximo de dos líneas de Arial 32 px; cada cue usa los límites medidos del WAV completo del fragmento, sin atribuirle alineación por palabra. `qa/ai-test-video-report.json` compara el AAC exportado con una mezcla independiente de los WAV, por fragmento y en ventanas de voz de 100 ms. Esta prueba técnica detecta cortes y desfasajes; la naturalidad y la pronunciación requieren revisión auditiva.

Este archivo es una **exportación para revisión solicitada por el usuario**, no un máster final aprobado. La aprobación del máster conserva su flujo separado. Un cambio de guion posterior requiere generar y seleccionar su audio coincidente antes de volver a exportar. Las cachés de una selección anterior se archivan, sin borrar voces ni capturas.

## Material temporal y secretos

`.local/`, WAV, capturas y medios grandes están ignorados. Conservá el proyecto y sus medios juntos para editar sin volver a grabar. No publicar `.local/`, tokens, contraseñas, claves TLS o trazas completas. El material es ficticio y carece de validez diagnóstica o terapéutica.
