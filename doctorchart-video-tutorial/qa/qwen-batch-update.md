# Lote masculino y modelo residente

Implementación comprobada con GPU real el 30 de octubre de 2026. **El lote completo está en ejecución; este documento no declara terminados los 144 fragmentos.** Su estado actual se consulta en http://localhost:3320 o en `.local/ai-narration-studio/batch-state.json`.

- Se reemplazó la recarga por toma por un trabajador Python residente, con Qwen Base 0.6B y SDPA en la RTX 4050.
- Usa como referencia la muestra masculina sintética generada previamente con VoiceDesign, comprobada por SHA256. No usa grabaciones personales.
- Dos generaciones consecutivas de prueba: 12,52 y 14,91 segundos; mismo PID, modelo cargado una sola vez, pico de VRAM 2609 MiB. Evidencia: `qwen-resident-benchmark.json`.
- El lote genera y guarda cada resultado automáticamente mediante el mismo guardado verificado del estudio. Las tomas anteriores se conservan.
- Pruebas de integración: pausa después de guardar, reanudación con nuevo controlador, recuperación sin duplicar una toma importada antes de un corte, procedencia masculina/Base y preservación del estudio personal. `ai-batch-report.json`: PASS. Regresión de los estudios: PASS.
- Prueba real en la página: se inició el lote masculino, se pausó después de 8 guardados y se continuó sin recargar el modelo; el trabajador conservó el PID 14608. La interfaz muestra progreso y una estimación basada en el tiempo observado.
- Los WAV guardados comprobados coinciden con sus SHA256. `ai-batch-live-review.json` conserva una muestra del estado y la verificación.
- Los archivos del estudio personal se comprobaron contra el respaldo y permanecen intactos. Se hizo además una copia del estudio IA antes de la actualización, bajo `.local/ai-narration-backups/`.

El lote sigue sin depender de la pestaña del navegador. Apagar la computadora interrumpe el trabajo en curso, conservando los guardados; al volver a abrir el servidor se puede continuar. El modelo se libera al cerrar el servidor, o si el usuario cancela una generación individual.
