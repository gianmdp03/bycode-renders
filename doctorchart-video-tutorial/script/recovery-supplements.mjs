export const recoverySupplements=[
 {id:'18-shortcuts-and-output',title:'Accesos y salida de documentos',account:'B',route:'/dashboard',expected_state:'Accesos alternativos, controles y salidas reales comprobados',beats:[
 ['more-dashboard-links','Desde Inicio, las próximas consultas abren la ficha indicada. También podés entrar a una ficha desde los últimos pacientes atendidos.',12,'more-dashboard-links'],
 ['more-dashboard-paging','Los números de página recorren las últimas atenciones. Ver historial completo abre la lista general de consultas.',11,'more-dashboard-paging'],
 ['more-encounter-links','En el historial, el nombre lleva a la ficha. Ver Detalle abre el contenido completo de esa consulta; Ficha vuelve al paciente.',13,'more-encounter-links'],
 ['more-summary-edit','El resumen también tiene un acceso a Editar datos. Volver a la ficha cancela este recorrido sin guardar cambios.',11,'more-summary-edit'],
 ['more-rx-output','El formulario permite emitir e imprimir en una sola acción. Revisamos la duración y mostramos el PDF producido por el sistema.',15,'more-rx-output'],
 ['more-calendar-notes','Las letras y números del calendario muestran la nota de referencia. Estas aclaraciones amplían la información visible en cada aplicación.',12,'more-calendar-notes'],
 ['more-profile-return','Desde el perfil, Volver a Inicio regresa al panel. El menú de cuenta ofrece también Personalizar fichas y consultas y Cerrar sesión.',12,'more-profile-return'],
 ]},
 {id:'19-connection-recovery',title:'Recuperar una carga interrumpida',account:'B',route:'/dashboard',expected_state:'Errores auténticos por interrupción controlada del acceso local; reintentos exitosos',beats:[
 ['recover-dashboard','Si una carga falla, usá el reintento del bloque afectado. En esta prueba interrumpimos sólo la conexión de demostración y la restablecemos.',13,'recover-dashboard'],
 ['recover-directory','El directorio ofrece Reintentar cuando no puede cargar la lista. Al recuperar la conexión vuelven los pacientes guardados.',11,'recover-directory'],
 ['recover-consultations','El historial de consultas también permite reintentar la lectura. Esto vuelve a consultar los registros existentes.',11,'recover-consultations'],
 ['recover-detail','Si no se pudo abrir el detalle de una consulta, Reintentar vuelve a solicitar esa misma atención.',10,'recover-detail'],
 ['recover-patient-form','Un problema al cargar la ficha no obliga a crear otro paciente. Recuperá la conexión y reintentá desde el formulario.',11,'recover-patient-form'],
 ['recover-growth','Las curvas ofrecen su propio reintento de carga. Los puntos vuelven a calcularse con las mediciones guardadas.',11,'recover-growth'],
 ['recover-vaccinations','En vacunas, Actualizar y reintentar vuelve a cargar el calendario del paciente. Revisá el estado antes de repetir un registro.',11,'recover-vaccinations'],
 ['recover-prescriptions','El historial de documentos dispone de Reintentar. La recuperación carga los documentos guardados, sin emitir uno nuevo.',11,'recover-prescriptions'],
 ['recover-print','Si falla la generación del PDF, DoctorChart informa el problema. Entendido cierra el aviso; los datos clínicos guardados se conservan.',12,'recover-print'],
 ]},
 {id:'20-review-configuration-conflicts',title:'Revisar versiones de configuración',account:'B',route:'/patients/new',expected_state:'Conflictos reales de configuración resueltos con revisión explícita',beats:[
 ['review-new-patient','La configuración puede cambiar mientras completás una ficha. Consultar copia del servidor permite revisar el formulario actual antes de continuar.',13,'review-new-patient'],
 ['review-new-encounter','En una consulta nueva se aplica la misma revisión. Se conservan las respuestas compatibles; los cambios se revisan antes de guardar.',13,'review-new-encounter'],
 ['review-saved-encounter','Una consulta editada en dos ventanas también protege su versión. Consultamos la copia del servidor y descartamos explícitamente la edición local.',13,'review-saved-encounter'],
 ['review-wizard','El editor de configuración evita sobrescribir un borrador cambiado en otra ventana. Revisamos la copia guardada antes de adoptarla.',13,'review-wizard'],
 ]},
 {id:'21-onboarding-draft-session',title:'Interrumpir y retomar la configuración inicial',account:'A2',route:'/onboarding/select-specialty',expected_state:'Cuenta adicional DEMO conserva borrador y retoma login real',beats:[
 ['draft-specialty-session','Antes de elegir especialidad también podés cerrar la sesión. Volvemos a ingresar con esta cuenta adicional de demostración.',11,'draft-specialty-session'],
 ['draft-wizard-steps','Siguiente y Anterior recorren las categorías habilitadas. Revisar la selección vuelve al paso de especialidad dentro de la configuración.',13,'draft-wizard-steps'],
 ['draft-save-signout','Guardar y cerrar sesión conserva el borrador del asistente. Al ingresar otra vez retomamos la configuración pendiente.',13,'draft-save-signout'],
 ]},
];
