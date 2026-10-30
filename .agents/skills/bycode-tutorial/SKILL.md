---
name: bycode-tutorial
description: Crea o mejora tutoriales y videos educativos de Bycode, DoctorChart y Pointly con UI real, pasos verificables y ritmo de aprendizaje. Comparte marca sin adoptar narrativa, subtítulos o cierres publicitarios por defecto.
---

# Bycode Tutorial

Aplicar junto a [bycode-brand](../bycode-brand/SKILL.md), automáticamente para pedidos educativos. Trabajar en el repositorio principal y la rama actual. No crear worktrees ni sistemas separados. Identidad provisional hasta aprobación explícita.

## Dirección educativa

- Definir qué podrá hacer el espectador al terminar, conocimientos previos y recorrido. Un tutorial completo prioriza cobertura y comprensión; una explicación breve puede cubrir una sola tarea. No imponer duración de reel, gancho comercial, cortes cada pocos segundos ni CTA de venta.
- Auditar rutas, permisos, especialidades, flags y servicios reales antes de grabar. Mostrar acciones auténticas y su resultado con tiempo para leer. Si una función no está disponible, documentarla o excluirla; no simular éxito ni usar datos sensibles. Usar un entorno DEMO autorizado.
- Mantener guion por capítulos/pasos, capturas originales y vínculo entre narración, acción y resultado. La voz real manda los tiempos si el usuario la requiere. Conservar pausas útiles; no ocultar esperas o errores de forma que enseñen un comportamiento falso.
- Usar `BrandProvider`, `BrandLockup` y perfiles de `@bycode/video-system/brand` cuando corresponda. La biblioteca es única en `shared/bycode-video-system/src/`. No importar `/promo` sólo para aplicar identidad: no introducir captions cinéticos, CTAs ni ritmo comercial automáticamente.

## Capacidades técnicas existentes

Cargar sólo lo necesario, sin duplicar estas guías:

- [Remotion best practices](../remotion-best-practices/SKILL.md): enrutamiento técnico general.
- [Create](../remotion-create/SKILL.md) para una composición nueva; [markup](../remotion-markup/SKILL.md) para escenas y secuencias deterministas.
- [Captions](../remotion-captions/SKILL.md) para transcribir o sincronizar palabras. Preferir texto estable y frases legibles para educación; el resaltado por palabra depende del encargo.
- [Multimedia](../remotion-multimedia/SKILL.md), [Studio](../remotion-studio/SKILL.md) y [render](../remotion-render/SKILL.md) para ingestión, revisión y exportación solicitada.

Para continuar un tutorial existente, leer primero su README, manifiesto de grabaciones y guion. `doctorchart-video-tutorial/` es un proyecto histórico con herramientas específicas: reutilizar lo pertinente sin copiar su entorno, credenciales o edición a un producto nuevo. Los handoffs existentes en `docs/tutorial-handoffs/` son contexto, no una identidad oficial.

## Verificación y entrega

Comprobar acción y resultado visibles por paso, cobertura honesta, texto legible, capítulos consistentes y audio continuo. Diferenciar video nativo de capturas fijas; verificar FPS de origen/exportación. Exportar SRT alineado sólo con locución disponible; identificar previews provisionales.

Conservar el montaje previo al modificar una pieza. Ejecutar TypeScript/build y renders proporcionales al cambio; revisar frames, audio y metadata. No publicar por producir el tutorial. Detenerse al completar la entrega educativa pedida, sin convertirla en un anuncio.
