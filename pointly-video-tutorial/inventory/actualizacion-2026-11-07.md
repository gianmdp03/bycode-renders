# Revisión local de actualización · 7 de noviembre de 2026

Se comparó la auditoría guardada (b1d33ba) con el checkout local 0791245 y sus cambios sin commit. `update-review.json` conserva hashes y rutas; `history/` conserva el inventario previo. Se analizaron 76 plantillas y 291 controles con el compilador Angular del propio frontend, sin errores de parseo.

| Cambio comprobado en código | Impacto educativo | Tomas/narración afectadas |
|---|---|---|
| `/points` redirige al inicio; el formulario público está en Home | Consultar con país y DNI mediante «Ver mis puntos» | 01, 22, 24–26, 30 |
| Nueva ruta pública `/for-businesses`, con tres pasos y vínculo a Bycode | Explicar cuenta Bycode, regreso a Pointly y plan por aplicación | 02 |
| Inicio comercial sin formulario público ni información comercial pública | Distinguir acceso público de Operaciones Rápidas autenticadas | 07, 29 |
| «Ingresar como comercio» / «Soy comercio» en el menú público | Actualizar entrada al login | 02 |
| «Ver clientes» sustituye accesos anteriores a consultar puntos | Enseñar lista, búsqueda y detalle; retirar consulta histórica como flujo recomendado | 07, 10, 12 |
| Contactos cargados directamente en detalle y tarjetas autorizadas | Retirar la instrucción de mostrar/ocultar contactos; explicar campos ausentes y reintento | 10, 21 |
| Menús público/comercial/billetera simplificados | Retomar la billetera desde el inicio y «Ver mi enlace personal» | 24–26 |
| Inicio reconoce acceso guardado | Demostrar «Abrir mi acceso guardado» | 26 |
| Aviso de archivo desaparece a los cinco segundos o al cambiar pestaña | No depender de un aviso permanente para explicar resultado | 22 |
| Guía de instalación visible solo bajo 900 px | Captura responsive auténtica; instalación final dependiente del navegador | 26 |

Las reglas de puntos, canjes, premios físicos/vouchers, promociones, productos, archivo y correos conservan su contrato funcional. El backend local de Pointly permanece en 8ef6d21 (31 de octubre), sin cambios de negocio introducidos por producción audiovisual. IA y niveles siguen desactivados. No se hallaron gráficos estadísticos nuevos.

Se sincroniza una copia DEMO byte a byte de fuentes locales y recursos públicos, excluyendo la configuración generada y secretos. Las versiones anteriores se conservan. Las tomas se sustituyen mediante nuevas grabaciones, sin alterar la interfaz de negocio. Se regenera solamente la narración modificada y se vuelven a obtener tiempos acústicos.

La infraestructura DEMO se recuperó alrededor del volumen original verificado por etiquetas, con respaldo en frío previo. No se reinicializó ninguna base. El reporte `qa/container-recovery.json` identifica el volumen y el respaldo local.

El conteo de controles incluye estados condicionales y código conservado: no equivale a 291 funciones operativas distintas. La matriz separa flujos enseñados, código sin acceso desde la navegación actual, flags y dependencias externas no ejecutadas.
