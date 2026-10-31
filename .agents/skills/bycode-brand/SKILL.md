---
name: bycode-brand
description: Aplica la identidad audiovisual compartida de Bycode, DoctorChart y Pointly a promociones y tutoriales, preservando sus diferencias y el estado provisional de marca. No convierte renders de prueba en una identidad aprobada.
---

# Bycode Brand

La identidad de ByCode está **por definir**. Los reels del repositorio son pruebas y no constituyen fuentes de marca aprobadas. `draftBrand` es una base neutral de demostración, no una propuesta oficial. No extraer colores, tipografías, logos, tono, claims ni dominios de esas pruebas como decisiones definitivas.

## Aplicación

- Leer [el contrato de marca](../../../shared/bycode-video-system/README.md) para los tokens y componentes disponibles. En una migración, leer [la guía](../../../docs/brand-system/MIGRATION.md) antes de editar.
- Usar valores y assets que el usuario haya definido para el proyecto. Si la identidad sigue pendiente, mantener `status: "draft"`; para una adopción sin rediseño, mapear el tema local con `createBrand`. Preservar la identidad particular de DoctorChart o Pointly; compartir infraestructura no significa asignarles la paleta de ByCode.
- Perfiles únicos en `shared/bycode-video-system/src/bycode-brand/products.ts`. Consumir `createProductBrand` del workspace `@bycode/video-system/brand`. Agregar allí decisiones reutilizables; mantener sólo adaptadores de layout/metadata en cada pieza. No copiar código fuente de la biblioteca ni derivar identidad oficial de una prueba. `createBrand` combina grupos parciales sin mutar otros consumidores; admite proveedores anidados.
- `BrandProvider` solo expone contexto. Incorporarlo no aplica estilos a los componentes antiguos. Elegir explícitamente qué componentes cambian: `BrandLockup`, `SafeArea` o componentes promo.
- No añadir un encabezado fijo con logo, nombre y «SOFTWARE», ni una marca de agua repetida en todas las escenas, salvo pedido explícito del usuario. Integrar la marca en los momentos que la narrativa requiera, sin convertirla en un rótulo permanente.
- Pasar logos existentes mediante una URL resuelta con `staticFile`. No copiar assets desde otra prueba ni dibujar un supuesto logo oficial. Sin logo validado, usar texto provisional. Mantener la carga local de fuentes y sus licencias a cargo del proyecto; el sistema no instala ni descarga fuentes.
- Los márgenes sugeridos son un punto de partida ajustable por formato, controles y subtítulos; no una garantía de zona segura de una red social.
- Mantener los avisos de producción (preview sin voz, tiempos o subtítulos provisionales, estado draft) en documentación, metadata o reportes de QA. No superponerlos al video ni a sus previews salvo pedido explícito del usuario. El estado provisional se conserva aunque no aparezca rotulado en pantalla.

## Convivencia y entrega

Trabajar en el proyecto principal y su rama actual; no crear ramas, worktrees ni copias del sistema sin pedido explícito. Coordinar cambios sobre archivos activos sin sobrescribir trabajo ajeno. No mover ni reconstruir composiciones para aplicar marca. No actualizar dependencias o tiempos por esta skill salvo necesidad comprobada dentro del alcance autorizado. Validar la escena cambiada y conservar la forma de revertir la adopción.

Entregar qué valores son provisionales, qué componente se adoptó, pruebas realizadas y cualquier definición de marca aún pendiente. No presentar una pieza de prueba como identidad aprobada.
