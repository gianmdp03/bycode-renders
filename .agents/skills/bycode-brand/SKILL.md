---
name: bycode-brand
description: Configura y aplica la identidad compartida de ByCode y sus productos en piezas visuales o proyectos existentes, con tokens y componentes optativos. Usar para consistencia de marca; no implica rediseñar una composición ni aprobar una identidad pendiente.
---

# ByCode Brand

La identidad de ByCode está **por definir**. Los reels del repositorio son pruebas y no constituyen fuentes de marca aprobadas. `draftBrand` es una base neutral de demostración, no una propuesta oficial. No extraer colores, tipografías, logos, tono, claims ni dominios de esas pruebas como decisiones definitivas.

## Aplicación

- Leer [el contrato de marca](../../../shared/bycode-video-system/README.md) para los tokens y componentes disponibles. En una migración, leer [la guía](../../../docs/brand-system/MIGRATION.md) antes de editar.
- Usar valores y assets que el usuario haya definido para el proyecto. Si la identidad sigue pendiente, mantener `status: "draft"`; para una adopción sin rediseño, mapear el tema local con `createBrand`. Preservar la identidad particular de DoctorChart o Pointly; compartir infraestructura no significa asignarles la paleta de ByCode.
- Centralizar las decisiones adoptadas en una configuración de proyecto. `createBrand` combina grupos parciales sin mutar otros consumidores. Usar proveedores anidados para productos o escenas con identidades diferentes.
- `BrandProvider` solo expone contexto. Incorporarlo no aplica estilos a los componentes antiguos. Elegir explícitamente qué componentes cambian: `BrandLockup`, `SafeArea` o componentes promo.
- Pasar logos existentes mediante una URL resuelta con `staticFile`. No copiar assets desde otra prueba ni dibujar un supuesto logo oficial. Sin logo validado, usar texto provisional. Mantener la carga local de fuentes y sus licencias a cargo del proyecto; el sistema no instala ni descarga fuentes.
- Los márgenes sugeridos son un punto de partida ajustable por formato, controles y subtítulos; no una garantía de zona segura de una red social.

## Convivencia y entrega

Si hay otro agente trabajando, usar rama propia y preferir un worktree aislado. Si eso falla, no editar sus archivos activos. No mover ni reconstruir composiciones para aplicar marca. No actualizar dependencias o tiempos por esta skill. Validar la escena cambiada y conservar la forma de revertir la adopción. No hacer merge en la rama de otro agente.

Entregar qué valores son provisionales, qué componente se adoptó, pruebas realizadas y cualquier definición de marca aún pendiente. No presentar una pieza de prueba como identidad aprobada.
