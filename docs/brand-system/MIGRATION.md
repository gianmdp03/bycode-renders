# Integración en el proyecto principal

Estado: el sistema de `88a3a19a8af2cbeea7bd5a814a65d0a329c97c68` se incorporó a `main` mediante el merge `e9beacf`. Antes se guardó el reel anterior en `d21976a`, con el MP4 en `doctorchart-promo-reel/archive/pre-brand-integration/`. No se crearon ramas ni worktrees para integrar.

## Una sola biblioteca

La raíz es un workspace npm con `shared/bycode-video-system` y `doctorchart-promo-reel`. Un único `package-lock.json` fija la instalación. La biblioteca se consume como `@bycode/video-system/brand` y `/promo`; no copiar `src/`, no empaquetar snapshots de la biblioteca ni mantener una versión por video. `npm ci` en la raíz compila sus exports automáticamente. React y Remotion se resuelven desde el mismo árbol.

La identidad permanece provisional. `createProductBrand` consulta el registro único `shared/bycode-video-system/src/bycode-brand/products.ts`. DoctorChart conserva su paleta y Google Sans como adaptación **draft**; Bycode y Pointly usan defaults neutrales hasta que se definan sus valores. No convertir una prueba en identidad oficial. Logos y fuentes autorizados siguen siendo assets de producto; el componente los recibe explícitamente.

## Adoptar un proyecto existente

1. Preservar fuente y render anterior. Registrar metadata y fuentes que no deben cambiar.
2. Añadir su carpeta al workspace raíz y `@bycode/video-system: 0.1.0` a sus dependencias. Resolver las versiones de React/Remotion con el árbol existente; no actualizar aplicaciones históricas por efecto secundario.
3. Consultar el perfil del producto con `createProductBrand`, envolver con `BrandProvider` y adoptar componentes compartidos donde corresponda. No copiar implementaciones. Los adaptadores locales sólo asignan layout, fuentes de la pieza y metadata.
4. Compilar la biblioteca antes de Studio/render. Revisar límites de escena, legibilidad, UI, capturas y audio, y producir un render con nombre nuevo. Guardar los cambios autorizados en la rama de trabajo actual.

No hay que crear otra rama, un worktree ni un sistema separado. No usar `git stash`, `reset` o `clean` sobre material de otros agentes. Los proyectos históricos permanecen intactos hasta una migración explícita.

## DoctorChart incorporado

Se conservaron las ocho escenas, sus IDs, 1080×1920, 60 FPS, 28 s, guion, timings provisionales, capturas reales, música y pipeline de voz humana. Se adoptaron `BrandProvider`, `BrandLockup`, `PromoTitle`, `PromoReveal`, `PromoCta` y `PromoCaptions`. `src/theme.ts` es un adaptador al registro compartido, no otro catálogo de marca.

El render actualizado es `doctorchart-promo-reel/out/reel_preview_bycode_integrado.mp4`. El original permanece en `out/reel_preview_sin_voz.mp4` y su copia versionada en `archive/pre-brand-integration/`. La versión integrada queda versionada en `archive/bycode-integrated/`. Sigue sin locución: no se aprobó una identidad definitiva ni se fabricó la voz pendiente.

## Tutoriales y videos genéricos

`AGENTS.md` selecciona las skills por intención. Tutoriales: `bycode-brand` + `bycode-tutorial`; promociones: `bycode-brand` + `bycode-promo`. Un video genérico usa las capacidades pertinentes de Remotion sin imponer publicidad.

Los tutoriales consumen `/brand`, con pasos legibles, capítulos y voz educativa; no se les añade `/promo`, CTA ni captions cinéticos automáticamente. La prueba visual educativa conserva exactamente sus píxeles y su metadata de 30 FPS/600 frames al incorporar contexto de marca.

## Reversión y conservación

El commit `d21976a` y el MP4 archivado permiten recuperar la pieza previa sin reconstruirla. Para revertir una adopción futura, usar el commit específico de esa adopción y conservar assets/renders; no borrar la biblioteca compartida ni el trabajo ajeno. Los archivos ignorados del worktree temporal se respaldaron en `.git/integration-backups/2026-10-30/worktree-ignored/` antes de su limpieza. Dependencias y `dist` se reconstruyen desde el lockfile y las fuentes versionadas.
