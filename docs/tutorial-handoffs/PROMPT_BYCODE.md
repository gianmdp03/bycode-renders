# Prompt para un chat nuevo · recorrido real del frontend de Bycode

Quiero un videotutorial del **frontend de Bycode** que muestre qué opciones tiene un usuario, para qué sirven y cómo se usan. Ya hicimos un trabajo similar con DoctorChart y quiero conservar su método, su **voz masculina de IA** y un ritmo ágil. Este es un video distinto, con su propio proyecto.

Primero leé íntegramente:

1. `C:/Users/gcast/Documents/GitHub/bycode-renders/docs/tutorial-handoffs/METODO_Y_VOZ.md`
2. `C:/Users/gcast/Documents/GitHub/bycode-renders/docs/tutorial-handoffs/VOZ_MASCULINA_DOCTORCHART.json`

No dependas de un chat anterior. Ejecutá con GPT-6.1 Sol y razonamiento alto si está disponible y seleccionado; no afirmes que cambiaste de modelo si el agente no tiene esa capacidad.

## Recursos locales

- Frontend: `C:/Users/gcast/Documents/GitHub/bycode-frontend`
- Backend: `C:/Users/gcast/Documents/GitHub/bycode-backend-go`
- Servicio de imágenes/correo, si las integraciones realmente lo requieren: `C:/Users/gcast/Documents/GitHub/bycode-image-email-service-go`
- Producción separada: `C:/Users/gcast/Documents/GitHub/bycode-renders/bycode-video-tutorial`
- Skills Remotion: catálogo bajo `C:/Users/gcast/Documents/GitHub/bycode-renders/.agents/skills`.
- Modelo, referencia y herramientas reutilizables: rutas especificadas en los dos documentos de continuidad.

## Alcance editorial

El objetivo es **orientar al usuario en Bycode y mostrar sus opciones reales**. No es un anuncio ficticio ni otro tutorial completo de DoctorChart o Pointly. Si Bycode enlaza a esas aplicaciones, explicar el acceso y el contexto que corresponda; el detalle interno de cada aplicación pertenece a su propio video.

Auditar navegación pública y experiencia autenticada, diferenciando roles. Revisar, **solo si existen y están habilitados**, registro/login/recuperación, cuenta y perfil, catálogo de productos o aplicaciones, accesos, planes/suscripciones, estado de contratación, facturación, preferencias, ayuda y otras opciones presentes. Son pistas para investigar, no una lista de funciones que se puedan dar por existentes.

La experiencia administrativa o de superusuario debe inventariarse por separado y quedar fuera del recorrido del cliente, salvo una petición expresa. No mostrar opciones internas como si todos los usuarios las tuvieran.

## Resultado y calidad

- Matriz de funciones habilitadas y accesibles, con fuentes, roles, precondiciones, flags, escenas y exclusiones justificadas.
- UI y operaciones reales en entorno de demo aislado, con cuentas y datos ficticios. Los estados de plan deben provenir de los servicios de demo, sin engañar al frontend ni usar cuentas productivas.
- Guion breve, práctico y organizado por tareas. Evitar una introducción larga o repetir información. Definir duración después de la auditoría; objetivo orientativo 10–15 minutos o menos si la cobertura se entiende bien.
- Misma referencia masculina de DoctorChart; **Bycode se pronuncia “báicod”**, manteniendo la marca bien escrita en pantalla. Qwen local residente y lote automático, con persistencia y continuación.
- Imagen ágil: ×1,5–×2 por fragmento cuando corresponda, voz a velocidad natural, cursor real y anillos de clic discretos, zoom puntual y subtítulos que no tapen controles.
- Captura nativa 1920×1080 a 60 FPS comprobada, Remotion editable, SRT, capítulos, datos/automatización reproducibles e informe de QA.
- Preview verificable para aprobación antes del MP4 final H.264/yuv420p, 1080p60, AAC 48 kHz estéreo.

## Cuentas, correo y pagos

Usar únicamente sandbox o servicios locales aislados para cualquier compra, contratación, cancelación, facturación, correo o recuperación de acceso. No realizar pagos/cargos reales, comprometer suscripciones, mandar correos a terceros ni modificar cuentas reales para obtener imágenes. Si el flujo requiere una integración sin sandbox autorizado, documentá el límite y cubrí lo que sí se pueda verificar; no simules un pago exitoso ni una operación contractual.

No desactivar seguridad ni validar funciones solo porque existe un endpoint. No inventar métodos de pago, planes, precios, permisos o estados. Lo que se diga en voz y aparezca en el video debe corresponder al checkout y al entorno efectivos de la grabación.

## Ejecución

Empezá leyendo código, instrucciones e integraciones y construyendo la matriz. Después prepará preflight y fixtures; guioná y presentá una muestra audiovisual de 30–60 segundos; automatizá y capturá las tareas reales por capítulos; generá la voz por lote; editá en Remotion y verificá cobertura, sincronía, ritmo y exportación.

No modifiques Bycode para la filmación ni hagas commits, push, deploys, migraciones destructivas o wipes. Preservá los otros proyectos, sus datos, las grabaciones personales y cualquier lote vigente. Cada video necesita sus propios puertos, guiones, audio, manifiestos y persistencia. Reutilizar herramientas no autoriza mezclar cuentas o bases.

Mantené un `docs/STATE.md` corto con decisiones, artefactos, bloqueos y comando para continuar. Avanzá en la producción real y no solo en un plan; preguntá únicamente por información o autorizaciones indispensables que no estén en los archivos o fuentes disponibles.
