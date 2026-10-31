# Continuidad de producción · tutoriales reales de Bycode

Fecha: 30 de octubre de 2026. Este documento conserva el método y las preferencias aprendidas durante DoctorChart para usarlos en otros chats. **Leerlo no autoriza iniciar otro proyecto:** el encargo concreto está en el prompt que el usuario invoque en el chat nuevo.

## Preferencias del usuario

- Tutorial de la aplicación real, claro y ágil, con acciones y resultados comprobados; no publicidad ficticia ni pantallas recreadas.
- Español latino conversacional. El usuario prefiere la **voz masculina de DoctorChart**. Su referencia sintética fija y la configuración están en `VOZ_MASCULINA_DOCTORCHART.json`, en esta misma carpeta.
- **Bycode se pronuncia “báicod”, con el acento en BAI**, según la última corrección expresa del usuario; reemplaza “baicoud”. Cambiar solamente el texto hablado; conservar la marca escrita correctamente en pantalla y en subtítulos. La transcripción de la referencia sintética histórica se conserva literal, aunque use la pronunciación anterior. La pronunciación de Pointly debe comprobarse con una muestra y consultarse únicamente si sigue siendo ambigua.
- El primer montaje de DoctorChart resultó demasiado largo y lento. Usar ritmo visual variable entre **×1,5 y ×2**: ×2 para navegación/tecleo repetitivo, ×1,75 intermedio y ×1,5 para explicación compleja. Medirlo por fragmento. La voz conserva velocidad natural. Estas velocidades son una guía editorial, no una obligación de acelerar cada segundo de toda la captura.
- Acortar repeticiones en el guion y quitar esperas antes de forzar una explicación. Una pausa visual breve puede ayudar; largos congelamientos para rellenar voz ralentizan el tutorial.
- Objetivo orientativo: 10–15 minutos; ajustar según la auditoría. Si la cobertura exige más, separar un recorrido principal y complementos desde el principio. No repetir el error de presentar 28 minutos como una preview razonablemente corta sin discutir la densidad.
- Primero una muestra audiovisual de 30–60 segundos con navegación, explicación compleja y nombres de marca. Comprobar con el usuario ritmo, naturalidad y pronunciación antes de una producción extensa. Esa revisión no exige detener la auditoría ni otros trabajos independientes.
- Guiones y títulos editables por fragmento. Cambiar uno no debe pisar los demás. Poder regenerar solamente los audios afectados y conservar tomas anteriores.

## Voz instalada: reutilizar la referencia, no reinventarla

Proyecto de referencia: `C:/Users/gcast/Documents/GitHub/bycode-renders/doctorchart-video-tutorial`.

Leer `VOZ_MASCULINA_DOCTORCHART.json` y verificar el SHA256 del WAV indicado antes de usarlo. Hay una copia fija bajo `.local/qwen/voice-library/doctorchart-masculina-01/`; no regenerarla ni sobrescribirla. Es una voz creada con IA, **no la voz personal del usuario**.

- Referencia original: Qwen3-TTS VoiceDesign 1.7B.
- Generación instalada: **Qwen3-TTS Base 0.6B**, usando `create_voice_clone_prompt` con esa referencia y su transcripción. Conservar el prompt de voz en memoria y reutilizarlo.
- Python aislado: `doctorchart-video-tutorial/.local/qwen-venv/Scripts/python.exe`.
- Modelo local: `doctorchart-video-tutorial/.local/qwen/base-model/`.
- Procedencia: `docs/qwen-base-provenance.json`; dependencias: `docs/qwen-requirements.lock.txt`, dentro del proyecto de referencia.
- Implementación probada: `automation/qwen-worker.py`, `qwen-client.mjs`, `ai-batch.mjs`, `ai-narration-studio.mjs`. Leer código y contratos; tiene rutas del proyecto original que deben adaptarse para un proyecto nuevo.
- Hardware conocido: RTX 4050 Laptop de 6 GB, 48 GB RAM, i5-13420H. Se probó CUDA 12.8, PyTorch 2.9.1, bfloat16, SDPA y un hilo de Torch/interop. Pico observado en la prueba del generador residente: unos 2,6 GB de VRAM; el rendimiento futuro debe medirse, no darse por garantizado.

**Regla clave: el modelo debe quedar residente entre generaciones.** No abrir Python ni recargar varios GB por cada toma. Ofrecer un lote que recorra todos los guiones, guarde cada audio automáticamente, muestre progreso, permita pausa y continuación y sobreviva a reinicios mediante checkpoints. No exigir un clic y un guardado manual por cada fragmento.

No iniciar varios trabajadores GPU independientes si ya hay un lote usando la placa. Comprobar el trabajo vigente; compartir capacidad de forma controlada o ejecutar por turnos, manteniendo separados los datos de cada proyecto. No interrumpir otros trabajos sin autorización.

No usar Piper como voz principal: la muestra anterior fue rechazada por artificial y por pronunciaciones. No contratar servicios, crear cuentas pagas, pedir claves innecesarias ni asumir que la suscripción de un agente incluye una API TTS. Qwen local ya está disponible en este equipo. Si faltan sus archivos en otro equipo, informar la dependencia concreta.

## Separación de proyectos y conservación de trabajo

Crear un directorio independiente por video. Los repositorios del producto se inspeccionan; no se editan para facilitar la filmación. Conservar cambios ajenos y registrar commits efectivos al iniciar.

DoctorChart tiene trabajos valiosos que **no forman parte de otro encargo**:

- Voz personal: `.local/narration-studio/`, puerto 3310. Se comprobaron 11 fragmentos / 12 tomas en el hito del 30/10; puede haber más después. Nunca restablecer el progreso ni copiar esos audios personales como referencia de IA.
- Voz IA: `.local/ai-narration-studio/`, puerto 3320, con su propio progreso y lote. Consultar su estado actual si importa; no asumir que sigue en el contador de un informe antiguo.
- Backups y reportes del proyecto documentan la integridad. No vaciar `.local`, `audio`, `recordings`, volúmenes o bases para “empezar limpio”.

Cada nuevo video necesita sus propios guiones, tomas, manifiestos, datos de demo, puertos y directorios de persistencia. Reutilizar herramientas o modelos de lectura no equivale a reutilizar cuentas, grabaciones o bases del proyecto anterior.

## Auditoría y entorno de demo

1. Leer `AGENTS.md`, README, integración, router, guards, roles y flags vigentes. Localizar backend y dependencias a partir de contratos reales. Un frontend levantado no prueba que login, permisos o guardados funcionen.
2. Auditar UI y código. Inventariar funcionalidades visibles, disponibles, suspendidas, administrativas y fuera de alcance. Un endpoint no equivale a una acción accesible.
3. Construir una matriz `feature_id,area,subfuncion,route_or_ui,source_file,role,feature_flag,available_at_runtime,required_fixture,scene_id,recording_id,voice_segment,verified_visual_timestamp,status,reason_if_excluded`. Añadir dimensiones propias del producto si corresponde.
4. Estados: PENDING, CAPTURED, EXPLAINED, VERIFIED, DISABLED, BLOCKED, OUT_OF_SCOPE. Capturado no significa verificado. No anunciar cobertura total con exclusiones sin justificar o ramas sin reproducir.
5. Crear un entorno real y aislado, con autenticación y permisos verdaderos, datos ficticios y cuentas de prueba. Auditar dependencias compartidas como Gateway/Billing/Auth; no adoptar producción ni desactivar controles para grabar.
6. Usar fixtures reproducibles adaptadas al dominio. Preferir APIs y workflows reales. Verificar que los datos se recuperan y aparecen en UI. Toda excepción de datos debe estar justificada y limitada al entorno propio; sin modificar esquemas ni producto.
7. No usar datos personales/productivos, credenciales en pantalla, compras reales, envíos a terceros ni llamadas a servicios de pago. Para esos recorridos usar un sandbox autorizado o documentar el bloqueo.

## Captura y edición

Leer las skills Remotion aplicables en `C:/Users/gcast/Documents/GitHub/bycode-renders/.agents/skills`. Empezar por `remotion-best-practices/SKILL.md`; usar el flujo de **screen recording / product tutorial**, no el de anuncio corto. Localizar las referencias según el catálogo real, sin asumir que todas están en una misma subcarpeta.

- Automatizar acciones mediante locators semánticos, estados visibles y respuestas reales. Usar solamente las capacidades de navegador/automatización autorizadas en ese chat. No grabar mocks ni sustituir respuestas por JSON inventado.
- Capturar contenido nativo de **1920×1080 a 60 fps reales**, DPR 1, escala coherente. El video auxiliar de Playwright no garantiza 60 fps ni cursor.
- En este Windows funcionó OBS portable, BitBlt, Chrome con composición por software y ventana de contenido a 1920×1080. Es una configuración de referencia; comprobarla de nuevo con movimiento real, no copiarla como garantía universal. No cambiar el OBS habitual del usuario.
- Registrar eventos reales de cursor y clic con reloj sincronizado a la captura. Overlay único de cursor y anillos discretos. Las transformaciones de zoom/velocidad deben aplicarse también a sus coordenadas y tiempos.
- Grabar por capítulos/fracciones recuperables, con manifiesto, estados esperados y pruebas. No repetir tomas útiles por cambiar la narración: reeditar fuentes existentes.
- Con PDF, popups y ventanas adicionales, comprobar que el contenido nativo ya está pintado antes de cambiar la fuente. Detectar negros y congelamientos. Una captura DOM correcta no prueba que OBS esté capturando bien.
- Remotion compone grabaciones reales, rótulos discretos, zoom puntual y subtítulos. No recrea las pantallas para ocultar errores. Evitar zooms que recorten títulos, ejes o leyendas.

## Texto, tiempos y subtítulos

Medir el audio final y construir el timeline con sus duraciones reales. Normalizar voz alrededor de -16 LUFS y mantener picos verdaderos por debajo de -1 dBTP; comprobar el archivo. Salida AAC 48 kHz estéreo. No acelerar la voz para hacer entrar un guion demasiado largo.

Los subtítulos deben corresponder al **guion hablado y al audio actuales**, con alineación verificada. Entregar SRT independiente y JSON de captions. Máximo dos líneas discretas, referencia 30–36 px en 1080p, sin cubrir controles. Si se cambia el guion o la voz, regenerar/revisar los subtítulos de ese fragmento.

Conectar explícitamente guion → audio → captions → Remotion. Guardar un texto en un editor no actualiza mágicamente un video ya compilado: automatizar ese enlace y verificarlo, o mostrar claramente que requiere compilar la preview. No prometer actualización automática si no está implementada y probada.

Una preview interactiva puede entrecortar audio por rendimiento aunque el WAV esté bien. Probar un pequeño MP4 exportado y separar continuidad, sincronización y naturalidad: que el usuario confirme “se escucha continua” no significa que apruebe la voz o todo el video.

## Persistencia, QA y aprobación

- Texto/audio: archivos reales escritos de forma atómica, readback y SHA256. Ensayar guardar, recargar y reiniciar el servidor, revisiones entre pestañas, fallos de escritura y recuperación. Usar carpetas de prueba aisladas, sin marcar trabajo del usuario como completado.
- Lote: guardar por fragmento, conservar tomas previas, evitar duplicados al continuar después de un corte y proteger ediciones concurrentes del guion.
- Cobertura: comparar matriz vs. storyboard vs. capturas vs. voces vs. timeline. Justificar lo que no se muestra; no forzar estados inaccesibles pasando por alto guards.
- Audiovisual: stills y muestras de cada capítulo, fuentes sin negros accidentales, mouse/clics alineados, captions legibles, voz continua y clara, ritmo revisado por el usuario. Auditar el audio exportado, no solo el reproductor de desarrollo.
- Final: MP4 H.264, yuv420p, 1920×1080, 60 fps constantes, AAC 48 kHz estéreo; SRT, capítulos y proyecto editable. La exportación a 60 fps no convierte una captura de 30 en captura nativa de 60.
- Presentar preview verificable y obtener aprobación explícita **antes del MP4 final**. No tratar la aprobación de una muestra de voz como aprobación del video completo.

## Continuidad sin depender del chat

Mantener en cada proyecto un `docs/STATE.md` breve: objetivo, alcance, preferencias, rutas, fase actual, decisiones, artefactos, comprobaciones, bloqueos, procesos propios y comando exacto para continuar. Estado y resultados grandes van en archivos; mostrar resúmenes y rutas, sin volcar timelines enormes ni secretos en la conversación.

Si se retoma un trabajo, leer primero ese estado y verificar los archivos actuales. No empezar de cero, no repetir decisiones ya tomadas ni asumir que un reporte histórico describe el estado de hoy. Compartir avances concretos y avanzar en tareas autorizadas; pedir al usuario solamente datos o permisos realmente ausentes.
