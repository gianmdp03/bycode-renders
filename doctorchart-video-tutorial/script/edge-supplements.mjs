export const edgeSupplements=[
 {id:'22-contexts-and-recovery',title:'Estados vacíos, adjuntos y recuperación',account:'B',route:'/patients/1',prepare_key:'edge-prepare',expected_state:'Controles contextuales reales y recuperación verificados con fixtures expresas',beats:[
 ['edge-timeout','Si una lectura demora demasiado, aparece un aviso de conexión. Entendido cierra el aviso; revisá el estado antes de repetir una operación.',12,'edge-timeout'],
 ['edge-dashboard-directory','Inicio ofrece dos accesos al directorio: el indicador de pacientes y la acción rápida. Los dos llevan a la misma lista.',12,'edge-dashboard-directory'],
 ['edge-no-selection','Cuando no hay un paciente seleccionado, podés ir al directorio o abrir el formulario de un paciente nuevo.',11,'edge-no-selection'],
 ['edge-empty-history','Una ficha sin atenciones permite iniciar su primera historia desde el encabezado o desde el estado vacío.',11,'edge-empty-history'],
 ['edge-empty-filter','Si un rango de fechas no devuelve registros, Quitar filtro de fechas recupera la historia completa. No elimina consultas.',11,'edge-empty-filter'],
 ['edge-growth-frame','Este caso ficticio incluye un punto fuera del marco de impresión. Ampliar ejes permite verlo; Volver al marco del PDF restaura la presentación.',12,'edge-growth-frame'],
 ['edge-growth-source','Fuente oficial abre el documento de referencia de la curva. Es la fuente enlazada por esta versión de DoctorChart.',12,'edge-growth-source'],
 ['edge-current-vaccine','Las dosis que corresponden ahora también permiten registrar su aplicación. En esta prueba ficticia comprobamos y deshacemos esa marca.',12,'edge-current-vaccine'],
 ['edge-pdf-study','También se puede adjuntar un PDF. Guardamos un documento DEMO, descargamos el archivo y lo abrimos en el visor del navegador.',14,'edge-pdf-study'],
 ['edge-shell-retry','Si falla la carga inicial de la cuenta, Reintentar permite recuperarla. Cerrar sesión también está disponible en esa pantalla.',13,'edge-shell-retry'],
 ]},
 {id:'23-selection-recovery',title:'Recuperar la selección inicial',account:'A2',route:'/onboarding/setup',expected_state:'Catálogo real recargado, conflicto de versión revisado y navegación pública comprobada',beats:[
 ['edge-specialty-retry','Si no se pudo cargar la lista de especialidades, Intentar cargar nuevamente vuelve a consultar el catálogo disponible.',11,'edge-specialty-retry'],
 ['edge-specialty-conflict','Si la configuración cambió en otra sesión, Volver a cargar la configuración recupera su versión actual antes de confirmar.',12,'edge-specialty-conflict'],
 ['edge-login-home','La flecha de acceso vuelve a la portada. En una página larga, el botón de subir permite recuperar el inicio.',12,'edge-login-home'],
 ]},
];
