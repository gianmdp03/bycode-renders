# Entrega revisada de Pointly

Video: `output/Pointly-tutorial-completo-1080p60.mp4`.

- Duración: 16 minutos y 10,4 segundos; 30 capítulos con metadata y lista para YouTube.
- H.264 High, 1920×1080, 60 FPS CFR, yuv420p, AAC estéreo, 48 kHz. Tamaño: 305,933,322 bytes.
- Narración: 30 secciones Qwen3-TTS locales con la misma referencia masculina sintética. Sin servicios pagos ni voz personal.
- Subtítulos: SRT y texto incrustado, con tiempos acústicos locales del audio final; sin estimaciones basadas en longitud.
- Audio final: -16.18 LUFS integrados, -4.08 dBTP; decodificación completa sin errores.
- SHA256 del MP4: `37bf5794973e2937a9442bc5d2d391789dab691988bdec14a048d288a1648b7c`.

## Recursos conservados

| Entregable | Ubicación |
|---|---|
| Remotion editable, composición completa y escenas individuales | `remotion/src/` |
| Guion, acciones, objetivos y transcripción final | `script/guion-completo.md` |
| Matriz funcional y controles individuales | `inventory/matriz-cobertura.md`, `coverage-features.json`, `coverage-controls.json` |
| Storyboard | `script/storyboard.json` |
| Tomas reales, originales y manifiestos de captura y edición | `recordings/`, `manifest.json`, `edit-manifest.json`, `supplements.json` |
| Datos ficticios y preparación de infraestructura | `demo/` |
| WAV, procedencia Qwen y alineación de cada capítulo | `audio/` |
| Subtítulos externos y capítulos YouTube | `script/pointly-tutorial.srt`, `script/capitulos-youtube.txt` |
| MP4 narrado | `output/Pointly-tutorial-completo-1080p60.mp4` |
| Instrucciones de actualización y regeneración | `README.md` |

## Cobertura y límites comprobados

Se cruzaron 76 plantillas y 291 controles del frontend local actualizado con 34 grupos funcionales enseñados. La matriz enlaza código, grabación real, resultado, locución, tiempos del MP4 y validación. Los controles duplicados se vinculan al flujo; no se afirma que se hayan ejecutado independientemente los 291 estados.

La impresión del QR mantiene validación parcial por el popup headless. Copiar el enlace y descargar el PNG sí se validaron. El tutorial explica esa alternativa. El registro/contratación externa de Bycode, envíos de correo/WhatsApp e instalación del sistema operativo se explican según la UI, sin ejecutarlos ni presentarlos como operaciones probadas.

IA, niveles y componentes históricos sin ruta o montaje se separan de las funciones disponibles. No se inventan gráficos, stock, facturación ni ajustes arbitrarios de puntos.

Las fuentes y recursos públicos de la copia DEMO coinciden con el checkout auditado; no hubo cambios de negocio ni acceso a bases de producción. Las pruebas reales de compras/canjes coinciden con el ledger y los reintentos conservan su identidad sin duplicar saldo.

## Revisión audiovisual

Se decodificó el MP4 completo y se comprobaron formato, cantidad de fotogramas, capítulos, volumen y ausencia de intervalos negros. Se revisaron seis hojas con 90 fotogramas finales, más cuadros críticos a resolución completa. El reporte distingue esa inspección de una reproducción humana integral. La locución se verificó con transcripción acústica independiente, hashes, silencios y niveles; no se afirma una escucha humana.

La captura es de una pestaña real rasterizada a 1920×1080, independiente del monitor físico. La salida es de 60 FPS CFR; los timestamps VFR originales y las pausas de lectura intencionales se conservan. No se afirma que cada segundo de captura contenga 60 imágenes diferentes.

La identidad compartida sigue marcada `draft`, con logos y fuentes auténticos. Los renders no constituyen aprobación oficial de marca. Originales, modelos, datos privados DEMO y renders permanecen locales y excluidos de Git; se versionan fuentes, manifiestos, datos reproducibles y reportes.
