# DoctorChart · narración es-419

## Acceso a DoctorChart

**access-context** DoctorChart reúne pacientes, consultas y documentación clínica. Vamos a recorrer su uso con datos completamente ficticios.

**access-account** Usá tu cuenta de Bycode y un plan de DoctorChart activo. El registro y la recuperación de acceso se realizan desde Bycode.

**access-visibility** El control del ojo permite revisar la contraseña. En esta grabación, los datos de acceso permanecen ocultos.

**access-signin** Ingresamos con una cuenta DEMO nueva. Al ser el primer acceso, DoctorChart nos guía por la configuración inicial.

## Elegir la especialidad

**specialty-options** La especialidad determina los formularios iniciales y los módulos disponibles. Este entorno publica Pediatría.

**specialty-confirm** Podés revisar esta elección durante la configuración inicial. Al finalizar, queda confirmada; los formularios siguen siendo personalizables.

## Configurar fichas e historias clínicas

**wizard-orientation** El asistente organiza la ficha del paciente por categorías y reserva un paso para la historia clínica de cada consulta.

**wizard-system** Datos Personales contiene campos del sistema. Sus datos obligatorios están protegidos; podés agregar información adicional.

**wizard-family** Antecedentes familiares y datos de tutores tienen sus propios campos. Recorremos cada categoría habilitada.

**wizard-guardians** Estos datos acompañan al paciente. No hace falta repetirlos como si fueran una consulta nueva.

**wizard-clinical** Historia Clínica define lo que vas a registrar en cada atención: motivo, mediciones, examen, desarrollo, evaluación y plan.

**wizard-categories** Podés organizar todas las categorías de la ficha desde una sola vista. El orden también se puede ajustar.

**wizard-add-category** Agregamos una categoría de demostración. Su nombre y sus campos son parte de tu configuración personal.

**wizard-category-order** Las flechas cambian el orden. Desactivar una categoría la conserva para volver a usarla; eliminarla la quita del borrador.

**wizard-add-field** Para agregar un campo, definí una etiqueta clara, el tipo de respuesta y un texto de ayuda si lo necesitás.

**wizard-field-types** El editor ofrece texto, texto largo, números, fechas, listas, respuestas de sí o no y campos calculados.

**wizard-number** Un campo numérico puede tener unidad, mínimo y máximo. Marcá obligatorio únicamente cuando esa respuesta sea necesaria.

**wizard-options** Las listas permiten definir las opciones que verá el médico. La etiqueta visible y el valor guardado se configuran por separado.

**wizard-save-field** Aplicar campo incorpora la definición al borrador. Todavía no cambia los formularios que usás para atender.

**wizard-field-order** Un campo adicional puede editarse, duplicarse, ordenarse o eliminarse. Los campos del sistema permanecen protegidos.

**wizard-save-draft** Guardar borrador conserva el trabajo para retomarlo. No equivale a finalizar ni a aplicar la configuración.

**wizard-reset-review** Restablecer recupera los valores iniciales publicados de la especialidad. La confirmación explica qué se reemplaza.

**wizard-reset-confirm** En este ejemplo descartamos la personalización de prueba. El borrador vuelve a los valores iniciales de Pediatría.

**wizard-finish** Revisamos el paso de Historia Clínica y finalizamos. La configuración se guarda en el servidor y se abre el panel.

## Panel y productividad

**dashboard-account** Seguimos con otra cuenta DEMO de Pediatría, ya preparada con cuarenta pacientes e historias ficticias para explorar el trabajo diario.

**dashboard-kpis** El panel resume pacientes registrados, consultas del mes y atenciones de hoy. Los números provienen de los registros de esta cuenta.

**dashboard-followup** Próximas consultas reúne los controles indicados en la última historia clínica. Desde aquí podés abrir la ficha correspondiente.

**dashboard-recent** La actividad reciente permite consultar una atención, volver a la ficha y avanzar por las páginas del historial.

**dashboard-search** El acceso rápido busca pacientes sin recorrer todo el directorio. Verificá siempre la identidad antes de abrir una ficha.

**dashboard-notes** Notas rápidas sirve como recordatorio de trabajo. Guardamos una nota de demostración y comprobamos que se conserva.

## Directorio de pacientes

**directory-open** El directorio reúne los pacientes de este médico. La ficha clínica pertenece al profesional, independientemente del lugar de atención.

**directory-search** Podés buscar por nombre, documento o teléfono. Limpiar la búsqueda vuelve al listado sin ese criterio.

**directory-filters** Pediatría ofrece filtros por etapas de edad y vacunación pendiente. Seleccionar Todos recupera el conjunto completo.

**directory-scroll** Al desplazarte, el directorio carga más resultados. Cada fila muestra identificación, contacto, controles previos y vacunación.

## Registrar y editar un paciente

**patient-new** Nuevo paciente abre el formulario de la configuración activa. Los asteriscos indican las respuestas obligatorias.

**patient-validation** Si intentás guardar sin los datos necesarios, el formulario señala qué falta. Completamos una identidad exclusivamente ficticia.

**patient-demographics** Registramos nombre, apellido, documento, fecha de nacimiento y sexo. Las fechas se muestran en formato día, mes y año.

**patient-contact** El contacto y la cobertura se completan cuando corresponden. Usamos direcciones de demostración sin destinatarios reales.

**patient-family** Completamos antecedentes y tutores. Las respuestas condicionales muestran información adicional sólo cuando corresponde.

**patient-save** Crear Paciente guarda la ficha y la abre. Confirmamos el resultado recibido del servidor antes de continuar.

**patient-edit** Editar paciente permite corregir los datos de la ficha. Guardamos una modificación y comprobamos el cambio visible.

## Historia clínica y consultas

**encounter-open** La cabecera identifica al paciente activo. Sus acciones y las pestañas dependen de la especialidad y la configuración disponible.

**encounter-first** Nueva historia clínica abre una atención. Cuando el paciente todavía no tiene consultas, Primera consulta es la única opción.

**encounter-reason** Escribimos el motivo y los antecedentes de esta atención. La fecha y hora definitivas las asigna el servidor al guardar.

**encounter-measurements** Cargamos peso, talla y, cuando corresponde, perímetro cefálico. Las unidades y los campos obligatorios se indican en el formulario.

**encounter-plan** Completamos examen, desarrollo, evaluación y plan. Una fecha de seguimiento permite recuperar este control desde el panel.

**encounter-save** Guardar historia clínica incorpora la atención al historial. Abrimos su detalle para revisar los datos efectivamente guardados.

**encounter-edit** La edición conserva el formulario del registro original. Corregimos un texto y guardamos, sin cambiar su fecha de creación.

**encounter-followup** En atenciones posteriores aparecen los tipos de consulta disponibles. El formulario usa la configuración activa para la nueva historia.

**encounter-list** El historial general permite buscar consultas, cargar más resultados y volver al detalle o a la ficha del paciente.

## Vacunación del paciente

**vaccination-open** La pestaña Vacunas combina el calendario con la edad y las aplicaciones registradas de este paciente.

**vaccination-apply** Marcamos una dosis de demostración como aplicada y comprobamos el resultado guardado. No representa una indicación de vacunación.

**vaccination-undo** Si una aplicación se registró por error, revisá el control disponible para corregirla y verificá el nuevo estado.

## Evolución y curvas

**growth-open** Evolución y Curvas utiliza las mediciones persistidas en las consultas. En este ejemplo, los datos son completamente sintéticos.

**growth-chart** La edad y el sexo de referencia determinan qué gráficos corresponden. Revisá el título, los ejes y la leyenda de cada lámina.

**growth-categories** Cambiamos entre las categorías disponibles y sus gráficos. No todas las láminas se aplican a todas las edades.

**growth-history** Consultar períodos históricos permite revisar otras etapas. Las posiciones de medición y las advertencias deben interpretarse en contexto.

## Recetas y órdenes

**rx-open** Recetas y Órdenes permite preparar documentos y consultar su historial. Los ejemplos de este tutorial no tienen validez médica.

**rx-medication** Agregamos una línea ficticia para mostrar los campos: medicamento, presentación, frecuencia, vía e indicaciones.

**rx-add-remove** Agregar incorpora la línea al documento. Quitar la retira del borrador, antes de guardar o emitir.

**rx-save** Completamos diagnóstico e indicaciones generales y guardamos en el historial. Verificamos la aparición del documento.

**rx-study** La modalidad Orden de estudios utiliza su propia lista. Agregamos un estudio ficticio y una especificación de demostración.

**rx-print** La impresión genera un documento real con los datos guardados. Revisalo antes de usar las opciones del visor o enviarlo a imprimir.

## Adjuntar y consultar estudios

**studies-open** Estudios realizados guarda los archivos adjuntos a la ficha. Usamos un documento sintético, sin imágenes ni estudios de personas reales.

**studies-upload** Seleccionamos el archivo, asignamos un nombre clínico para identificarlo y agregamos una descripción antes de subirlo.

**studies-preview** Cuando finaliza la carga, abrimos la vista previa y comprobamos el contenido. El nombre del estudio se distingue del nombre del archivo.

**studies-download** La descarga recupera el archivo protegido. Una eliminación requiere revisar la confirmación para evitar quitar un adjunto por error.

## Calendario, preferencias y perfil

**calendar-open** El calendario general permite consultar las columnas por edad. Las referencias amplían la información de cada aplicación.

**calendar-reference** Nos desplazamos por la tabla y abrimos una referencia. Confirmá siempre la información vigente antes de una decisión clínica.

**preferences-theme** Los controles superiores permiten cambiar el tema y el tamaño del texto. Elegí una presentación cómoda para tu consulta.

**profile-open** Perfil profesional muestra la identidad de esta cuenta, su especialidad y los datos profesionales disponibles.

**profile-personalize** Personalizar Fichas permite volver al asistente. Guardar un borrador, aplicarlo y descartarlo son decisiones diferentes.

**closing** Para comenzar, configurá tus formularios, creá el paciente y registrá la primera consulta. Revisá siempre la ficha activa antes de guardar.

## Más opciones de consulta e historial

**extra-dashboard-search** También podés buscar consultas por paciente, motivo o diagnóstico, cambiar cuántas ves por página y limpiar la búsqueda.

**extra-dashboard-detail** Desde una consulta reciente abrís su detalle o la ficha. Los accesos vuelven al mismo registro que seleccionaste.

**extra-directory-paging** La búsqueda rápida del panel tiene páginas anteriores y siguientes. El directorio completo usa carga progresiva al desplazarte.

**extra-empty-search** Una búsqueda sin coincidencias muestra un estado vacío. Restablecer los filtros recupera el listado, sin borrar pacientes.

**extra-timeline-expand** En Historia Clínica, expandir muestra las respuestas de una atención. Expandir todo y colapsar todo permiten comparar varios registros.

**extra-timeline-presets** Los filtros de treinta días, noventa días y año actual acotan el historial. Todas vuelve a mostrar las consultas completas.

**extra-timeline-range** Podés indicar un rango de fechas con el selector compartido. Limpiar quita ese rango; no cambia las fechas de las consultas.

**extra-nav** El menú lateral se puede colapsar y expandir. Para cambiar de paciente, volvé al directorio y abrí la ficha correcta.

## Configuración avanzada de campos

**extra-editor-begin** Volvemos al editor con una cuenta que ya atiende. La especialidad está confirmada; la personalización trabaja sobre un borrador.

**extra-editor-category** Creamos una categoría de prueba. También podemos eliminar una categoría adicional; las categorías protegidas del sistema se conservan.

**extra-editor-boolean** Agregamos una respuesta de sí o no. Otro campo puede depender de esta respuesta para aparecer únicamente cuando corresponde.

**extra-editor-condition** La condición vincula un campo con una respuesta previa. Elegimos mostrar la observación cuando la respuesta sea Sí.

**extra-editor-edit** Editar permite corregir un campo existente del borrador. Cancelar vuelve a la lista sin aplicar esa edición.

**extra-editor-options** En una lista, agregar y quitar opciones cambia las respuestas disponibles. Revisá etiquetas y valores antes de aplicar el campo.

**extra-editor-formula** Un campo calculado pertenece al formulario. Elegís la operación y el origen de sus entradas; el resultado lo calcula el servidor.

**extra-editor-measurement** Historia Clínica permite agregar la posición de medición de longitud o estatura. Esta información aporta contexto a las curvas.

**extra-editor-discard** Salir conservando borrador permite retomarlo. Descartar edición elimina ese borrador y conserva la configuración activa.

## Revisar documentos y adjuntos

**extra-rx-lines** Quitar medicamento retira una línea del borrador. Limpiar formulario vacía la preparación actual; no elimina el historial guardado.

**extra-rx-study** Las sugerencias de estudios completan una línea que todavía podés revisar o quitar antes de guardar.

**extra-document-view** Abrimos un documento generado por DoctorChart. El visor permite revisar su contenido real antes de descargar o imprimir.

**extra-rx-delete** Eliminar registro quita ese documento del historial. Revisá su identidad antes de usar este control; en este ejemplo retiramos sólo un documento ficticio.

**extra-study-picker** Podés cambiar o quitar el archivo seleccionado antes de subirlo. El nombre clínico se completa por separado.

**extra-study-delete** Cerrar vista vuelve al historial. Eliminar estudio pide confirmación; conservá el archivo si no querés quitarlo.

**extra-vaccine-date** Una aplicación registrada permite corregir su fecha. El calendario guarda la modificación y actualiza el estado del paciente.

**extra-calendar-details** Las referencias del calendario amplían las patologías prevenidas y las condiciones de aplicación. Abrimos las dos secciones.

## Leer los detalles de las curvas

**extra-growth-points** Cada punto representa una medición guardada. Al seleccionarlo, la aplicación muestra sus datos y su referencia.

**extra-growth-table** El detalle permite revisar fechas, valores y mediciones sin depender sólo de la posición de los puntos en el gráfico.

**extra-growth-context** Abrimos ahora otra ficha DEMO. La edad y el sexo de referencia cambian las láminas disponibles, sin cambiar de especialidad.

**extra-growth-reference** Cuando el sexo de referencia no está identificado, la vista solicita confirmación. Esa elección es local a esta vista y no modifica la ficha.

**extra-growth-reset** Revisar referencia confirmada permite volver a elegir. Al terminar, conservamos los datos originales del paciente de prueba.

## Revisar conflictos y cerrar sesión

**extra-conflict-patient** Si la ficha cambia en otra ventana, DoctorChart conserva tus respuestas locales y pide revisar la copia del servidor antes de guardar.

**extra-conflict-review** Consultar la copia guardada permite compararla. Adoptarla descarta expresamente la edición local; revisá esa decisión antes de continuar.

**extra-encounter-cancel** Cancelar edición conserva la consulta guardada. Volver desde una historia nueva sin guardarla tampoco crea una atención.

**extra-encounter-delete** Eliminar una consulta requiere revisar su confirmación. En este ejemplo se elimina exclusivamente un control ficticio de demostración.

**extra-session-close** Al terminar de atender, cerrá la sesión desde el perfil o el menú de cuenta. Comprobamos que volvemos a la pantalla de acceso.

## Accesos y salida de documentos

**more-dashboard-links** Desde Inicio, las próximas consultas abren la ficha indicada. También podés entrar a una ficha desde los últimos pacientes atendidos.

**more-dashboard-paging** Los números de página recorren las últimas atenciones. Ver historial completo abre la lista general de consultas.

**more-encounter-links** En el historial, el nombre lleva a la ficha. Ver Detalle abre el contenido completo de esa consulta; Ficha vuelve al paciente.

**more-summary-edit** El resumen también tiene un acceso a Editar datos. Volver a la ficha cancela este recorrido sin guardar cambios.

**more-rx-output** El formulario permite emitir e imprimir en una sola acción. Revisamos la duración y mostramos el PDF producido por el sistema.

**more-calendar-notes** Las letras y números del calendario muestran la nota de referencia. Estas aclaraciones amplían la información visible en cada aplicación.

**more-profile-return** Desde el perfil, Volver a Inicio regresa al panel. El menú de cuenta ofrece también Personalizar fichas y consultas y Cerrar sesión.

## Recuperar una carga interrumpida

**recover-dashboard** Si una carga falla, usá el reintento del bloque afectado. En esta prueba interrumpimos sólo la conexión de demostración y la restablecemos.

**recover-directory** El directorio ofrece Reintentar cuando no puede cargar la lista. Al recuperar la conexión vuelven los pacientes guardados.

**recover-consultations** El historial de consultas también permite reintentar la lectura. Esto vuelve a consultar los registros existentes.

**recover-detail** Si no se pudo abrir el detalle de una consulta, Reintentar vuelve a solicitar esa misma atención.

**recover-patient-form** Un problema al cargar la ficha no obliga a crear otro paciente. Recuperá la conexión y reintentá desde el formulario.

**recover-growth** Las curvas ofrecen su propio reintento de carga. Los puntos vuelven a calcularse con las mediciones guardadas.

**recover-vaccinations** En vacunas, Actualizar y reintentar vuelve a cargar el calendario del paciente. Revisá el estado antes de repetir un registro.

**recover-prescriptions** El historial de documentos dispone de Reintentar. La recuperación carga los documentos guardados, sin emitir uno nuevo.

**recover-print** Si falla la generación del PDF, DoctorChart informa el problema. Entendido cierra el aviso; los datos clínicos guardados se conservan.

## Revisar versiones de configuración

**review-new-patient** La configuración puede cambiar mientras completás una ficha. Consultar copia del servidor permite revisar el formulario actual antes de continuar.

**review-new-encounter** En una consulta nueva se aplica la misma revisión. Se conservan las respuestas compatibles; los cambios se revisan antes de guardar.

**review-saved-encounter** Una consulta editada en dos ventanas también protege su versión. Consultamos la copia del servidor y descartamos explícitamente la edición local.

**review-wizard** El editor de configuración evita sobrescribir un borrador cambiado en otra ventana. Revisamos la copia guardada antes de adoptarla.

## Interrumpir y retomar la configuración inicial

**draft-specialty-session** Antes de elegir especialidad también podés cerrar la sesión. Volvemos a ingresar con esta cuenta adicional de demostración.

**draft-wizard-steps** Siguiente y Anterior recorren las categorías habilitadas. Revisar la selección vuelve al paso de especialidad dentro de la configuración.

**draft-save-signout** Guardar y cerrar sesión conserva el borrador del asistente. Al ingresar otra vez retomamos la configuración pendiente.

## Estados vacíos, adjuntos y recuperación

**edge-timeout** Si una lectura demora demasiado, aparece un aviso de conexión. Entendido cierra el aviso; revisá el estado antes de repetir una operación.

**edge-dashboard-directory** Inicio ofrece dos accesos al directorio: el indicador de pacientes y la acción rápida. Los dos llevan a la misma lista.

**edge-no-selection** Cuando no hay un paciente seleccionado, podés ir al directorio o abrir el formulario de un paciente nuevo.

**edge-empty-history** Una ficha sin atenciones permite iniciar su primera historia desde el encabezado o desde el estado vacío.

**edge-empty-filter** Si un rango de fechas no devuelve registros, Quitar filtro de fechas recupera la historia completa. No elimina consultas.

**edge-growth-frame** Este caso ficticio incluye un punto fuera del marco de impresión. Ampliar ejes permite verlo; Volver al marco del PDF restaura la presentación.

**edge-growth-source** Fuente oficial abre el documento de referencia de la curva. Es la fuente enlazada por esta versión de DoctorChart.

**edge-current-vaccine** Las dosis que corresponden ahora también permiten registrar su aplicación. En esta prueba ficticia comprobamos y deshacemos esa marca.

**edge-pdf-study** También se puede adjuntar un PDF. Guardamos un documento DEMO, descargamos el archivo y lo abrimos en el visor del navegador.

**edge-shell-retry** Si falla la carga inicial de la cuenta, Reintentar permite recuperarla. Cerrar sesión también está disponible en esa pantalla.

## Recuperar la selección inicial

**edge-specialty-retry** Si no se pudo cargar la lista de especialidades, Intentar cargar nuevamente vuelve a consultar el catálogo disponible.

**edge-specialty-conflict** Si la configuración cambió en otra sesión, Volver a cargar la configuración recupera su versión actual antes de confirmar.

**edge-login-home** La flecha de acceso vuelve a la portada. En una página larga, el botón de subir permite recuperar el inicio.
