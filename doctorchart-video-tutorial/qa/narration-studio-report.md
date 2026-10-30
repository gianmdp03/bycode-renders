# Estudio de narración · comprobación

Estado: **PASS**. Pruebas realizadas el 30 de octubre de 2026.

## Guardado y recuperación

`npm run test:narration-studio`: **10 tests aprobados, 0 fallos**. Los 144 fragmentos provienen de las 23 capturas reales del proyecto. Las pruebas usan carpetas de datos independientes de las grabaciones del usuario.

- Edición de una palabra y del título: lectura del `state.json` físico y comprobación de que otro fragmento permanece intacto.
- Importación de audio WAV real, conversión a 48 kHz estéreo, recorte de 0,5 a 3,25 segundos: duración final 2,75 segundos.
- El WAV descargado tiene exactamente los mismos bytes y SHA256 que el archivo físico.
- Destrucción y nueva creación del servidor con la misma carpeta: se recuperan el texto, la toma seleccionada, su hash y sus bytes.
- Segunda toma, recorte posterior y selección de una toma anterior, sin sobrescribir los originales.
- Edición del guion después de grabar: estado **Revisar guion**, conservando el audio.
- Rechazo de revisiones antiguas, audio inválido, recortes imposibles y solicitudes de otro origen.
- Fallo real de escritura al reemplazar temporalmente el destino por un directorio, únicamente en la carpeta de ensayo: respuesta de error, ausencia de confirmación de guardado y recuperación del estado anterior al reiniciar.

Evidencia estructurada: `narration-studio-report.json`.

## Navegador

Comprobación con el navegador integrado mediante Computer Use:

- Guion y título editados, audio importado, recortado y guardado desde los botones de la página; recarga y recuperación verificadas.
- Ensayo aislado con un MediaStream sintético: **MediaRecorder real → Detener → recortar → Guardar y seguir → volver → recargar**. El WAV guardado dura 3 segundos y coincide por bytes y hash con la descarga.
- Vista previa con velocidad de audio **1** y velocidad de imágenes **1,75**.
- Cambio posterior del guion: marca **Revisar guion**, sin perder la toma.
- Sin errores de consola en el ensayo del grabador.
- Diseño comprobado en 1440, 719 y 390 píxeles de ancho, sin desplazamiento horizontal de la página.
- Lanzador de Windows comprobado desde cero: abre el servidor local y recupera los 144 fragmentos; una segunda ejecución reutiliza el servidor.

El ensayo de MediaRecorder usa una señal sintética y **no prueba la calidad ni los permisos del micrófono físico del usuario**. El permiso del navegador se solicita al presionar Grabar; se puede cancelar la solicitud pendiente.

Evidencia: `narration-studio-browser-report.json`, `narration-studio.png`.

## Estado entregado

El estudio del usuario en el puerto **3310** conserva sus datos en `.local/narration-studio/`. No se agregaron tomas ni guiones de QA al trabajo del usuario. Se preservó el montaje original de Remotion, no se generó el MP4 final y no se modificó DoctorChart.

El estudio permite revisar cada fragmento con la toma seleccionada y exportar el manifiesto para el próximo montaje; guardar no recompila automáticamente el video completo. El recorte disponible ajusta el principio y el final. Las tomas anteriores se conservan.
