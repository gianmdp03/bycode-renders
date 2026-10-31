## Pronunciación vigente: báicod, acento en BAI

El usuario corrigió baicoud a báicod. Presentación y cierre regenerados con ese alias explícitamente acentuado; no se usa el corte entre oraciones de la versión anterior (edits vacío). Las cuatro tomas restantes conservan sus hashes. Voz de referencia intacta, música provista con ducking y escritura Bycode en pantalla. MP4 validado: 1728 frames, 28.800000 segundos, 2889332 bytes; -16.12 LUFS / -4.85 dBTP. QA PASS y 50/50 palabras alineadas. Copia identificada: out/bycode_preview_qwen_baicod.mp4. Datos anteriores que siguen son históricos; referencia actual en reportes JSON y PNG baicod-intro/cta.

## Actualización de pronunciación · baicoud

Esta es la versión actual: 1727 frames, 28.800000 segundos, 2897921 bytes. QA PASS; mezcla exportada -16.27 LUFS / -4.90 dBTP. Presentación y cierre usan baicoud; los subtítulos conservan Bycode. Las cuatro tomas restantes son byte a byte idénticas a la versión anterior. Se conservó la segunda oración correcta de presentación mediante un corte en silencio entre oraciones. Referencia masculina intacta. Captions 50/50 con timestamps reales. La versión previa y sus medidas se conservan en archive/qwen-baicode/.

Los valores de la primera exportación que siguen son históricos. Los reportes JSON y los PNG baicoud-intro/cta documentan la exportación actual.

# Prueba Qwen masculina + música del usuario · 30/10/2026

**MP4 exportado y validado:** `out/bycode_preview_qwen_masculina.mp4`.

- Video H.264 / yuv420p / BT.709, 1080 × 1920, 60 FPS, 1734 frames. Timeline 28,9 s; contenedor AAC/MP4 28,907 s.
- Audio AAC estéreo, 48 kHz. Archivo 2.841.703 bytes.
- QA de decodificación, ausencia de negros y clipping: PASS. Reporte: `qwen-media-report.json`.
- Mezcla exportada: −16,05 LUFS integrados, −4,91 dBTP. Voz aislada −16,01 LUFS, música base −34,69 LUFS antes del sidechain: diferencia de 18,68 LUFS.
- Sidechain de música gobernado por la voz: ratio 3:1, ataque 80 ms, recuperación 650 ms, con fundidos de inicio y final. La música acompaña sin usar la voz como control de volumen inverso.
- Se usa la pista entregada por el usuario, copiada byte a byte a `public/audio/musica-spot-provista.mp3`. No se afirma autoría propia ni una licencia de catálogo no entregada.

## Voz y sincronía

El pedido posterior del usuario autoriza esta prueba sintética y reemplaza la restricción inicial de no usar IA para esta variante. Se reutiliza **la misma referencia sintética masculina del tutorial de DoctorChart**, perfil `doctorchart-masculina-01`, SHA-256 verificado antes y después: `37511600572dd075c64568c80ed829a0a7d35a38a4597f398579b548a1a730f9`.

Modelo local Qwen3-TTS-12Hz-0.6B-Base, revisión `5d83992436eae1d760afd27aff78a71d676296fc`, CUDA / bfloat16 / SDPA. Una carga de modelo y prompt para seis tomas, guardadas individualmente con hashes. No se usaron ni alteraron grabaciones personales. No se lanzó otro trabajo sobre una GPU ocupada: al iniciar no había procesos Qwen y la GPU estaba libre.

Se transcribió cada toma en CPU con faster-whisper small multilingual, usando PCM 16 kHz. **50/50 palabras coinciden** después de normalizar los alias fonéticos de nombres propios y unir Doctor + Chart. Todos los subtítulos tienen tiempos positivos, están dentro de la duración del video y usan los timestamps reales de las palabras. “Bycode” se pronuncia “baicoud”; la escritura de marca permanece correcta en pantalla.

Las escenas siguen las tomas naturales, sin time stretching ni aceleración. Sólo se recortaron silencios exteriores. Se conservaron pausas interiores y una separación breve entre escenas. SRT: `out/subtitulos-qwen.srt`. Runtime: `captions/qwen-runtime.json`. Informes detallados: `qwen-generation.json`, `qwen-word-alignment.json`, `qwen-alignment.json`.

## Conservación y revisión

No hay encabezado fijo de logo/Bycode/SOFTWARE ni avisos técnicos superpuestos. Las escenas de marca de la narrativa permanecen. Se renderizaron imágenes de las seis escenas y sus cortes en `out/qwen/`, y se inspeccionaron encuadres y subtítulos con el nuevo timeline. El fixture de conservación de DoctorChart permanece PASS; referencia, modelos y tomas del tutorial no se modificaron.

TypeScript, compilación sintáctica de los scripts y `git diff --check`: PASS. Las previews sin voz permanecen disponibles. La nueva variante es una **prueba para escuchar**: el reconocimiento correcto y las métricas técnicas no equivalen a aprobación de naturalidad, acento o pronunciación por parte del usuario. No se publicó contenido.

La composición editable nueva es `Bycode-Qwen-Masculina`. El servidor de Studio ya estaba funcionando en el puerto 3500; la apertura automática desde el agente no estuvo disponible porque el uso local del navegador está desactivado en Work settings. El MP4 y las imágenes locales se verificaron de forma independiente.
