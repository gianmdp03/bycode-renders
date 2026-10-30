# Pendientes concretos

Estado: preview lista para revisión del usuario. Informe completo en `qa/report.md`.

- Acceso real a la pila DEMO: resuelto. Auth ES256/JWKS, Gateway y concesiones Billing comprobados.
- Datos: 40 pacientes, 128 consultas, ocho pacientes con ocho mediciones longitudinales; API comprobada. La verificación visual de cada módulo se acredita durante la captura.
- Captura: 23 capítulos nativos 1080p60, calibrados y sincronizados. Seis capítulos pasaron la comparación de movimiento original; las fuentes no tienen tramos negros de 50 ms o más. Los contadores de dos frames omitidos en tres tomas de PDF permanecen documentados.
- Voz local es-MX: 144 segmentos reales; continuidad del AAC comprobada contra WAV independiente. El usuario confirmó que la muestra exportada se escucha continua. Naturalidad y montaje completo pendientes de aprobación de la preview.
- Cobertura: 223 controles capturados y narrados, sin filas PENDING; 80 deshabilitados y 61 fuera del alcance efectivo. DCV-071 y DCV-154 permanecen BLOCKED: sus ramas defensivas de error quedan detrás de los guards/carga compartida de esta versión. No se fabrican estados internos para mostrarlas ni se declara cobertura del 100%.
- Registro y recuperación de cuenta en Bycode, planes/pagos y administración: inventariados aparte; no pertenecen al tutorial clínico dentro de DoctorChart. No se simulan sus resultados.
- Asistente IA, calculadoras independientes y acceso Google: deshabilitados por el código efectivo. Agenda/turnos: ruta ausente.
- Aprobación de la preview: pendiente. No hay MP4 final autorizado ni entregado.
- Duración: principal 13:03, complementos 15:01, total 28:04. La cobertura detallada no cabe en 15 minutos; se entregan composiciones y SRT separados para ambas partes.
