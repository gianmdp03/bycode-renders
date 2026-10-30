# DoctorChart · producción del tutorial real

Encargo leído íntegramente: `C:/Users/gcast/Downloads/CODEX_DOCTORCHART_VIDEOTUTORIAL.md`.
Audiencia: médicos en su primer uso. Edición de grabación de pantalla, no publicidad ni UI recreada.

- Máster: 1920×1080, 60/1 fps, H.264 yuv420p, AAC estéreo 48 kHz.
- Fuente: frontend Angular real, misma fuente que el checkout; sólo configuración pública local en una copia ignorada. OBS 32.2.2, área cliente exacta 1920×1080, sin escalado. Las tomas se repiten con captura de ventana BitBlt y composición por software de Chrome: la prueba de desplazamiento pasó de unas 50 a 58 actualizaciones significativas dentro de 60 frames. No se interpolan fotogramas del frontend.
- Aislamiento: proyecto Docker `doctorchart-tutorial-demo`, bases nuevas, etiqueta de propiedad y IDs de contenedor registrados. PostgreSQL en red interna. Proxy de acceso publicado sólo en loopback. Auth, Billing, Gateway, DoctorChart y conversor reales; ninguna clave de servicios existentes leída o utilizada. Todos los proveedores configurados son locales; pagos/correo externos no se utilizan.
- Las URLs y versiones efectivas están en `inventory/source-provenance.json`. No hay commits, pushes, despliegues ni modificaciones de los dos productos.
- A comienza sin workspace; B dispone de datos ficticios; A2 muestra la conservación de borradores y recuperación de especialidad. Las repeticiones utilizan identidades DEMO nuevas y conservan las anteriores. ADMIN sólo prepara concesiones reales de Billing; NO_PLAN comprueba la rama sin beneficio. Las pantallas administrativas quedan fuera del recorrido médico.
- Catálogo inicial efectivo: sólo Pediatría. La unión de pestañas incluye resumen, historia clínica, vacunas, evolución y curvas, recetas/órdenes, estudios. El catálogo ejecutado se conserva en `inventory/runtime-specialties.json`.
- IA y calculadoras independientes permanecen deshabilitadas. Los campos calculados del editor son una función distinta, que debe auditarse por su propia UI. El router no contiene `/appointments`.
- El recorrido principal conserva los primeros 12 capítulos, alrededor de 13 minutos. La cobertura de controles contextuales, edición avanzada, documentos y recuperación ocupa composiciones complementarias. El storyboard tiene 23 capítulos y 144 beats: su mínimo de 1541 s, antes de acciones más largas, demuestra que la cobertura detallada no cabe en 15 minutos. No se comprime la voz ni se omiten funciones para afirmar que sí cabe.
- Voz: motor neuronal local Piper, es-MX ald medium, sin coste de proveedor. Audio real por beat, duración medida; calidad y pronunciación sujetas a revisión auditiva. Sin música.
- Subtítulos: 32 px en banda inferior dedicada. La fuente real se presenta al 90% para reservar esa banda; ningún botón se oculta detrás de los subtítulos. Zoom limitado a beats concretos, con fuente y cursor transformados juntos.
- Cursor: eventos reales de Playwright; el cursor de captura está deshabilitado. Marcador magenta codificado al comienzo de cada toma sincroniza `performance.now()` y frames; se excluye del montaje. Se conserva la incertidumbre de cuantización de un frame.
- Los PDF se generan por el backend real y se abren en el visor integrado. Una segunda fuente de ventana se prepara debajo de la ficha y pasa al frente cuando ya tiene imagen. La ficha sigue capturada al fondo para evitar ventanas negras al regresar. Se validan capturas nativas además de screenshots de Playwright.
- Los fallos de conexión se producen interrumpiendo o demorando solicitudes reales en el navegador DEMO. No se fabrican respuestas ni pantallas. El aviso global de timeout se prepara antes de iniciar su capítulo para no incluir veinte segundos de espera en el tutorial.

## Continuidad de voz en la preview

El usuario detectó voz entrecortada en Studio. Se exportó una muestra real de 20 s, H.264 1080p60 y AAC estéreo 48 kHz. Su audio decodificado coincidió con la mezcla independiente de los WAV originales (correlación 0.9999855, sin ventanas de voz perdidas). El usuario confirmó que la muestra se escucha continua. Studio usa reproducción HTML nativa y precarga; la exportación utiliza extracción de video OffthreadVideo, después de detectar un timeout con el decodificador anterior. Esto acredita continuidad en esa muestra; la naturalidad general y el montaje completo siguen sujetos a revisión.

## Excepción del seeder histórico

La API rechaza cambiar `encounterDate` (`IMMUTABLE_ENCOUNTER_DATE`). Para crear un historial sintético, todas las relaciones y formularios se crean primero por API. Un UPDATE de datos, restringido por base, contenedor, propietario, ID de paciente/consulta, nombre y marcador DEMO, asigna las fechas iniciales de la fixture. Después una actualización normal por API reconstruye `formulaContext`. No se altera ningún esquema ni se anuncia al médico una capacidad de cambiar fechas que no existe.

La primera base de Auth falló por la preparación del namespace y se conservó. El entorno activo utiliza una segunda base nueva; no se vació ni se reconstruyó la anterior. La reproducción corregida prepara el namespace antes de iniciar GoTrue.

## Criterio de aceptación

Una fila se acredita únicamente con acción real, consecuencia observable y voz. La revisión estática, la generación de audio o un build no equivalen a ejecución. No se declara cobertura total mientras existan filas pendientes. La preview se inspecciona antes de pedir aprobación del máster. El MP4 definitivo se exporta sólo después de esa aprobación, conforme a la skill de edición y a la solicitud del usuario.
