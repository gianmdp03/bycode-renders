# Validación de entrega · 30/10/2026

**PASS:** `out/pointly_preview_qwen_masculina.mp4`.

- H.264, yuv420p, BT.709, 1080×1920, 60 FPS, 1769 frames. Timeline: 29,483 s; contenedor MP4/AAC: 29,504 s. 5.693.193 bytes.
- AAC estéreo, 48 kHz, 192 kb/s. Mezcla exportada: −16,05 LUFS integrados y −4,94 dBTP. Sin clipping, errores de decodificación ni segmentos negros.
- Música suministrada por el usuario; copia SHA-256 verificada. Cama normalizada a −34 LUFS antes del sidechain; voz a −16 LUFS. Reducción gobernada por la voz, fundidos y salida musical suave.
- Siete tomas Qwen con una sola carga de modelo y referencia. Referencia masculina fija preservada por hash. 52/52 palabras alineadas con Whisper local; timestamps positivos y dentro del montaje. Pronunciación hablada final: **baicod**. Sin aceleración de voz. La evaluación de naturalidad y preferencia de escucha queda abierta a la revisión del usuario; los checks técnicos no la sustituyen.
- Datos ficticios en frontend Angular original. API simulada en memoria, red externa bloqueada, ninguna solicitud inesperada en la captura final. Se verificó que la compra de ejemplo eleva el saldo de 320 a 400 puntos. El backend desplegado no se usó ni se certificó.
- Logos y fuentes auténticos provenientes exclusivamente de Pointly frontend. Se conservó OFL. No se inventó una licencia para la música provista; procedencia en `audio/PROCEDENCIA.md`.

## Revisión visual

Se renderizaron el inicio, cortes de escena, entradas y cierre; se corrigieron encuadres que inicialmente ocultaban el saldo. Se apartó el énfasis “+80 puntos” de las áreas de datos. Se enfocó el saldo móvil y su detalle, con desplazamientos reales del frontend y movimientos de cámara por frame.

Se extrajeron y revisaron cuadros del **MP4 final codificado**, incluidos el saldo del cliente, los 400 puntos del detalle al final del clip, subtítulos y el último frame del CTA. Evidencia: `out/export-review/`, `qa/export-frames.json`; cuadros de escenas y transiciones: `out/frames/`. El CTA y el subtítulo quedan dentro de los márgenes elegidos; no hay texto de producción ni marca de agua permanente. La adaptación audiovisual de colores y tipografía sigue **draft**, pendiente de aprobación humana de identidad.

## Checks ejecutados

- `npm run check`, `npm run check:pointly`: PASS.
- `npm test`: 7 pruebas de biblioteca y 4 de integración, todas PASS.
- `npm run verify:frames`: PASS en retrato, paisaje y límites locales de secuencia.
- Build de biblioteca y bundle de Pointly: PASS.
- Sintaxis de scripts JS y compilación sintáctica de Python: PASS.
- `npm run qa:pointly`: 15 controles PASS. `qa/media-report.json` conserva medición y metadata.
- Versión adicional `out/pointly_preview_sin_voz.mp4`: PASS, misma pista de video sin recodificación. Audio musical: −35,04 LUFS. Reporte `qa/music-media-report.json`.
- `git diff --check`: PASS. Pointly frontend continúa sin modificaciones. Fixture de conservación de originales de DoctorChart: PASS. Se preservaron los cambios ajenos encontrados en el repositorio.

Proyecto y renders guardados en el repositorio y la rama actuales. No se crearon ramas ni worktrees. No se publicó ni desplegó contenido. Remotion Studio está disponible en `http://localhost:3600/Pointly-Qwen-Masculina` mientras siga activo el proceso local.
