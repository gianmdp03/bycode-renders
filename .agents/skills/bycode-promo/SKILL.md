---
name: bycode-promo
description: Crea o mejora piezas promocionales de ByCode, DoctorChart y Pointly en Remotion, o incorpora componentes promo a reels existentes de forma gradual. Usar para narrativa, CTA y presentación de producto; no para tutoriales extensos ni para convertir pruebas en identidad aprobada.
---

# ByCode Promo

Usar [ByCode Brand](../bycode-brand/SKILL.md) para las decisiones de identidad. La marca sigue por definir; las composiciones existentes son pruebas, no estándares visuales. El pedido del usuario determina el alcance: crear una pieza nueva o adaptar una parte de una existente.

## Antes de editar

Identificar producto, público, objetivo, formato, duración, mensaje y CTA con la información disponible. Resolver solo los datos faltantes que cambien la pieza. Las funciones y afirmaciones deben estar respaldadas por el producto o por material del usuario. No inventar métricas, testimonios, precios, dominios, beneficios médicos ni conexiones entre productos. Mostrar datos ficticios en demostraciones sin usar información real de pacientes.

Si otro agente está produciendo un reel, trabajar en una rama y preferentemente un worktree propios. No escribir en sus escenas, guion, audio, capturas o fuentes. No hacer merge automático. Leer [migración](../../../docs/brand-system/MIGRATION.md) para incorporar este sistema sin reconstruir el proyecto.

## Implementación

- Para una pieza nueva, construir una narrativa ajustada al objetivo: problema reconocible, demostración verificable de la solución y CTA. Es una orientación, no una secuencia ni duración obligatorias. Una petición acotada no autoriza rehacer el guion.
- En proyectos existentes, mantener IDs, registros, orden de escenas, FPS, duración, audio, subtítulos y rutas de assets salvo que el usuario pida cambiarlos. Adoptar primero contexto o un único componente en una escena.
- Consultar [el API y las limitaciones](../../../shared/bycode-video-system/README.md). `PromoStage`, `PromoTitle`, `PromoCta` y `PromoReveal` son optativos; ninguno registra composiciones. No añadir `PromoStage` si basta con reemplazar un título.
- `PromoReveal` usa frames locales a la `Sequence` más cercana. No pasar otra vez el offset global. La duración es en frames, no segundos; al cambiar FPS, recalcular explícitamente solo si corresponde al pedido. No modificar la timeline para acomodar el componente.
- Cargar las guías Remotion instaladas pertinentes a la tarea, sin convertirlas en una dependencia obligatoria de esta skill. Mantener animaciones deterministas por frame, assets locales, UI legible y textos compatibles con el área disponible.
- Mantener el audio y la carga de fuentes del proyecto. Los componentes compartidos no aportan música, locución, captions ni pantallas ficticias del producto.

## Validación y cierre

Ejecutar los checks del proyecto adaptado. Inspeccionar inicio y final de la escena modificada y límites con sus vecinas; revisar contraste, desbordes, controles y subtítulos en el formato real. Confirmar que metadata y audio mantienen sus valores si no se solicitaron cambios. No exportar un MP4 ni publicar una pieza por el solo hecho de aplicar la skill; entregar preview o evidencia proporcional al pedido.

Informar qué cambió y cómo se verificó, junto con instrucciones de integración y reversión cuando sea una migración. Detenerse cuando el alcance pedido esté validado.
