# Prompt para un chat nuevo · videotutorial real de Pointly

Quiero que produzcas un videotutorial real de **Pointly**, siguiendo el método que ya desarrollamos para DoctorChart, con la **misma voz masculina de IA** y un ritmo más ágil. Este encargo es para Pointly; DoctorChart es únicamente una referencia técnica que debe preservarse.

Primero leé íntegramente:

1. `C:/Users/gcast/Documents/GitHub/bycode-renders/docs/tutorial-handoffs/METODO_Y_VOZ.md`
2. `C:/Users/gcast/Documents/GitHub/bycode-renders/docs/tutorial-handoffs/VOZ_MASCULINA_DOCTORCHART.json`

Esos archivos contienen preferencias, configuración de voz instalada, rutas y lecciones que no quiero volver a explicar. No dependas del historial de otro chat. Ejecutá con GPT-6.1 Sol y razonamiento alto si ese modelo está disponible y seleccionado; si no podés cambiarlo desde el agente, indicá la limitación sin afirmar que lo cambiaste.

## Recursos locales

- Frontend web: `C:/Users/gcast/Documents/GitHub/pointly-frontend`
- Backend: `C:/Users/gcast/Documents/GitHub/pointly-backend-go`
- Hay un repositorio `pointly-mobile`, pero este encargo cubre **el frontend web**; no sumes una producción móvil salvo que te lo pida.
- Producción separada: `C:/Users/gcast/Documents/GitHub/bycode-renders/pointly-video-tutorial`
- Skills Remotion: catálogo bajo `C:/Users/gcast/Documents/GitHub/bycode-renders/.agents/skills`.
- Herramientas reutilizables y modelos de voz: proyecto `doctorchart-video-tutorial` del mismo repositorio de renders. Inspeccioná sus contratos; no lo modifiques ni mezcles sus datos con Pointly.

## Resultado

Un usuario nuevo de Pointly debe entender cómo entrar, configurar lo necesario, realizar su flujo principal completo y encontrar las opciones habilitadas relevantes. Descubrí el dominio, las entidades, roles y flujos reales de Pointly antes de guionar: **no traslades pacientes, especialidades, wizard ni rutas de DoctorChart a esta aplicación**.

Quiero:

- Capturas de Pointly real ejecutándose, con backend/autenticación de demo verdaderos, datos totalmente ficticios y guardados comprobados.
- Matriz exhaustiva de funcionalidades habilitadas dentro del alcance del usuario, con fuentes, roles/flags, escenas y exclusiones justificadas.
- Guion por capítulos y fragmentos editables, explicación clara, mouse visible y clics discretos.
- Ritmo visual variable entre ×1,5 y ×2 cuando convenga, con voz natural sin acelerarla. Objetivo orientativo 10–15 minutos; si no alcanza para el alcance real, proponé principal + complementos y dejá clara la cobertura.
- La misma referencia masculina de DoctorChart, Qwen local **residente** y generación por lote con guardado automático y continuación. No volver a cargar el modelo por fragmento ni pedirme que genere y guarde uno por uno. No usar mis grabaciones personales para clonar una voz.
- Subtítulos discretos y sincronizados con el audio vigente, SRT independiente, Remotion editable, manifiestos y QA.
- Preview verificable antes del MP4 final. Formato final: 1920×1080, 60 FPS constantes, H.264/yuv420p, AAC 48 kHz estéreo.

## Ejecución

1. Leé las instrucciones de los repositorios, registrá commits/flags y construí `inventory/features.json` y `inventory/coverage-matrix.csv` a partir de código y UI reales.
2. Prepará un entorno de demo propio y un preflight de dependencias, login, roles y operaciones. Seeder reproducible de datos ficticios acordes al modelo de Pointly.
3. Armá el storyboard y una muestra audiovisual de 30–60 segundos, incluyendo navegación y una explicación compleja. Reutilizá la referencia de voz fija y probá la pronunciación de Pointly. Presentá esa muestra para ajustar calidad mientras avanzás en tareas independientes.
4. Automatizá y grabá recorridos reales por capítulos con captura nativa 1080p60 comprobada, eventos de cursor y aserciones. No montes un falso recorrido con imágenes estáticas.
5. Componé en Remotion a partir de capturas y duraciones de audio reales; conectá cambios del guion con audio, captions y preview.
6. Validá cobertura y audiovisual, entregá preview, y esperá aprobación del video completo antes de exportar el MP4 final.

No modifiques Pointly para facilitar la filmación. No uses producción, datos reales, credenciales en el video, bypass de permisos, compras reales, commits, push, deploys ni wipes. Los trabajos de DoctorChart, sus grabaciones personales, su estudio IA y cualquier lote vigente deben conservarse. Verificá puertos y uso de GPU antes de iniciar servicios nuevos.

Mantené `docs/STATE.md` con decisiones y comandos para continuar sin depender de este chat. Empezá por leer las referencias y auditar Pointly; no te quedes solamente en un plan. Si falta algo indispensable, identificá el bloqueo concreto y continuá el trabajo que no dependa de eso.
