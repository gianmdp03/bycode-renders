# Revisión de coherencia narrativa y visual

Se revisó el MP4 original de 16:10, identificado por SHA256 en `coherence-review.json`, cruzándolo con narración, montaje y resultados reales. Se extrajeron 20 fotogramas dirigidos a los puntos en duda. No se alteró el video original. La revisión técnica anterior no sustituye este cruce de continuidad educativa.

## C01 · El comercio cambia después del alta

Tipo: CONTINUITY. Prioridad: high. Ya conversado con el usuario.

- 01:40–02:05: 04-company crea Almacén Inicio DEMO; 05-settings edita Café del Puerto DEMO. La locución anuncia que pasa al comercio de ejemplo, pero rompe el caso continuo.

Efecto: No queda claro cómo el comercio recién creado llegó al panel que se enseña.

Corrección: Un comercio durante el alta y el ciclo completo de cliente/compra/canje.

## C02 · El vencimiento aparece después de crear la empresa

Tipo: ORDER. Prioridad: high. Ya conversado con el usuario.

- 04-company, 05-settings: El alta deja el vencimiento desactivado y lo explica desde Editar empresa.

Efecto: Separa dos reglas del mismo programa y agrega un salto innecesario.

Corrección: Grabar datos, acumulación, vencimiento y plazo en el alta antes de guardar; explicar una sola vez.

## C03 · El cliente del alta no es el cliente de la compra

Tipo: CONTINUITY. Prioridad: high.

- 03:51: Se crea Martina Demo.
- 04:11: Se asocia Carla en Panadería Costera.
- 05:43: La compra se hace para Ana Torres.

Efecto: El espectador no puede seguir cómo la persona que acaba de ingresar obtiene y usa sus puntos. Otros capítulos agregan Renata, Camila y Bruno.

Corrección: Elegir una persona como protagonista y usar su mismo país/documento en alta, compra, canje y consulta. Presentar otras personas solo si aportan algo imprescindible.

## C04 · Se crea un premio y se canjea otro

Tipo: CONTINUITY. Prioridad: high.

- 08:20: Se configura Desayuno de regalo DEMO por 200 puntos.
- 09:52: Se canjea Café de regalo por 80 puntos, que ya existía.

Efecto: No se completa el procedimiento empezado. Los 180 puntos de Ana después de la compra tampoco alcanzan para el premio de 200 que se acaba de crear.

Corrección: Crear el mismo premio que se va a canjear, con un costo alcanzable mediante la compra mostrada; conservar nombre y costo hasta el resultado.

## C05 · El saldo de la consulta depende de un segundo canje que se quiere recortar

Tipo: SHORT_EDIT_RISK. Prioridad: high.

- 10:10: Ana queda con 100 puntos después del primer canje.
- 12:41: La consulta pública muestra 20 puntos.
- qa/20-redeem-errors-pending-proof.json: El capítulo de incidencia ejecutó realmente otro canje: 100 → 20. El reintento no duplica ese movimiento.

Efecto: El video completo contiene la operación que explica la diferencia. Si se quita el capítulo de incidencias y se reutiliza la consulta actual, quedarían 80 puntos descontados sin explicación.

Corrección: Volver a grabar la consulta en el estado posterior a la única operación del nuevo recorrido. No corregir números mediante edición de imagen ni reutilizar un saldo de otro momento.

## C06 · La compra termina sin mostrar el saldo y movimiento prometidos

Tipo: RESULT_VISIBILITY. Prioridad: high.

- 05:55: La locución dice Después verificamos la venta y el nuevo movimiento del cliente. La imagen muestra Ventas, con Sin dato por venta en la columna de puntos.

Efecto: La operación fue real, pero el espectador no ve ahí los 80 puntos incorporados ni el nuevo saldo del cliente.

Corrección: Después de confirmar, abrir el detalle de esa misma persona y mostrar el saldo anterior, los puntos sumados y el saldo resultante, junto al movimiento real.

## C07 · Varias explicaciones no acompañan al control que se está usando

Tipo: VOICE_ACTION_SYNC. Prioridad: high.

- 01:00.85: Se pasa a Completar perfil mientras la voz sigue describiendo el error de acceso; falta explicar el ingreso exitoso que acaba de ocurrir.
- 07:10.55: La voz explica Pausar; en pantalla todavía está Editar promoción.
- 07:18.55: La voz explica Eliminar y el cursor está en Pausar.
- 09:00.72: La voz explica límites del porcentaje; ya se ve Importe fijo con una cantidad en curso.
- 10:03.57: La voz ya habla del movimiento del canje; aún se está buscando al cliente.

Efecto: Puede enseñar una relación equivocada entre botón, formulario y consecuencia, aunque la operación grabada sea correcta.

Corrección: Elegir menos acciones y ajustar cada frase a su acción y resultado. Rechazar el montaje si una confirmación o valor de otro paso queda bajo esa explicación.

## C08 · Los subtítulos pierden la unidad de porcentaje

Tipo: CAPTION_MEANING. Prioridad: high.

- 06:45.23: Se lee Podés elegir 50 más, en lugar de 50 % más.
- 08:57.22: Se lee Por ejemplo, 10 o 2000 pesos, en lugar de 10 % o 2000 pesos.
- audio/13-promotion.alignment.json y audio/17-voucher.alignment.json: El reconocimiento acústico conserva los tokens % con sus tiempos; el filtro posterior los descartaba por no contener letras ni números.

Efecto: Cambia el significado del beneficio mostrado. No se comprobó una omisión de voz: la pérdida confirmada está en el subtítulo.

Corrección: Filtro corregido y guardia añadida para impedir pérdida de unidades. Regeneración verificada en copias aisladas; regenerar subtítulos e incrustarlos en la nueva edición.

## C09 · Se borran los elementos de ejemplo antes de mostrar su utilidad

Tipo: CONTINUITY. Prioridad: medium.

- 13-promotion, 14-promotion-life: Se crea Tarde de puntos DEMO y se elimina en el capítulo siguiente.
- 15-products, 17-voucher, 18-reward-life: Budín de limón y Voucher tutorial DEMO se crean y luego se eliminan; la consulta pública enseña otros elementos ya cargados.

Efecto: El recorrido termina enseñando mantenimiento y cambios de ejemplo, en vez de cómo una promoción, producto o premio ayuda en el caso presentado.

Corrección: Conservar los elementos centrales durante todo el recorrido breve. Reservar eliminación y variantes de mantenimiento para ayuda específica.

## C10 · Notas internas y condiciones de producción llegan al relato comercial

Tipo: AUDIENCE. Prioridad: medium. Ya conversado con el usuario.

- 05-settings, 07-navigation, 12-sales-history, 23-emails, 28-roles: Niveles suspendidos, ausencia de gráficos, campos de respuesta, proveedor de envío de la demo, permisos y código histórico.

Efecto: Distrae del aprendizaje y sugiere carencias técnicas que el comerciante no necesita estudiar.

Corrección: Excluirlas de la locución para clientes. Conservar solo consecuencias de uso que eviten una expectativa incorrecta.

## C11 · Una promoción activa podría contradecir el ejemplo base de puntos

Tipo: SHORT_EDIT_RISK. Prioridad: medium.

- 11-sale, 13-promotion: La compra original de 8500 genera 80 puntos con la regla base. Mostrar antes una promoción del doble vigente y reutilizar esa compra daría a entender otro resultado.

Efecto: Es un riesgo de reordenamiento; no se detectó como error de saldo en el montaje original.

Corrección: Dejar la promoción como complemento posterior a la compra base, o grabar y explicar una compra real bajo la promoción con el importe de puntos correcto.

## C12 · El recorte necesita títulos y alcance propios

Tipo: SHORT_EDIT_RISK. Prioridad: medium.

- Fuente: La portada dice Tutorial completo y el montaje original tiene 30 rótulos numerados y varias menciones a billetera.

Efecto: Recortar segmentos sin rearmar títulos y locución dejaría saltos de numeración y una promesa de cobertura que ya no corresponde.

Corrección: Usar una portada de recorrido breve, numeración consecutiva, locución continua y Consultar puntos y premios. Conservar el original como archivo de producción.

## Qué se descartó como causa

Los saldos de la demo sí coinciden con sus operaciones. La reducción de 100 a 20 se explica por un segundo canje real; se volvería incoherente si se recorta esa operación y se conserva su resultado. El login exitoso también existe: es la explicación del error la que queda desfasada. En los porcentajes, se reprodujo la pérdida del símbolo en el subtitulado, conservándose el token acústico.

## Criterio para volver a montar

Un comercio, una persona y un premio durante el recorrido principal. Mostrar las reglas juntas al crear el comercio. Mostrar el antes y después real de la compra y del canje. Registrar Consultar puntos y premios con esa misma persona y en ese mismo estado. Mantener promociones como complemento posterior a la compra base. Regenerar títulos, voz y subtítulos para el nuevo alcance. No resolver saltos de saldo con imágenes editadas ni trasladando resultados entre clientes.

El generador de subtítulos ya conserva unidades como % y existe una guardia que compara unidades acústicas con unidades de captions. La corrección se ejecutó sobre copias de las dos alineaciones afectadas, sin cambiar sus palabras ni tiempos originales. El video original y sus SRT se conservan; las correcciones deben incorporarse a la edición nueva.

La guardia de unidades se comprobó además contra los 30 audios reales en una copia aislada: rechaza el subtítulo original que pierde %, y pasa al sustituir solamente las dos alineaciones regeneradas. Los WAV y tiempos acústicos originales se mantienen.
