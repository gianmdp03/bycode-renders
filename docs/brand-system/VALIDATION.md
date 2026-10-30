# Verificación de la entrega

Fecha: 30 de octubre de 2026. Base: `7d22a02`. Rama: `codex/bycode-brand-promo`. Implementación en el worktree independiente `bycode-renders-brand-system`.

## Resultado

| Prueba | Resultado |
| --- | --- |
| Validador oficial `skill-creator/scripts/quick_validate.py` | Ambas skills válidas |
| Metadatos de las skills y links locales de documentación | Válidos |
| `npm run check` | TypeScript sin errores, incluidos ejemplos y fixtures |
| `npm test` | 6 pruebas aprobadas: tokens, contexto sin wrapper, identidades anidadas, estilos/copy, márgenes y límites de animación |
| `npm run verify:frames`, Remotion 4.0.530 | Aprobado, retrato 1080×1920 y paisaje 1920×1080 |
| `npm run verify:frames`, Remotion 4.0.532 | Aprobado, mismos formatos |
| `npm test`, Remotion 4.0.532 | Las mismas 6 pruebas aprobadas, consumiendo los exports del paquete |
| `npm pack --dry-run` | Compila y empaqueta los dos exports y sus declaraciones; sin fuentes de QA ni dependencias embebidas |

Entorno de ejecución: Windows, Node 24.20.0, npm 12.0.2, React/React DOM 19.2.3 y TypeScript 5.9.3. El lockfile de desarrollo fija Remotion 4.0.530. La comprobación 4.0.532 se hizo reemplazando temporalmente solo las dependencias del paquete nuevo con `--no-save --package-lock=false`; después se restauró el entorno del lockfile con `npm ci`.

## Qué prueban los frames

Las fixtures viven exclusivamente en `shared/bycode-video-system/verification/`. Se comprobó igualdad exacta de píxeles entre una escena local anterior y esa misma escena con `BrandProvider`, en ambos formatos. La escena anterior conserva sus estilos aunque el proveedor exponga otros valores.

En ambos formatos se comprobó una entrada dentro de una `Sequence from={12}`: el frame global 12 (local 0) sigue oculto; en el frame global 24 (local 12) la entrada está completa y se mantiene igual al final, frame 59. También se comprueban dimensiones, FPS, duración y ausencia de warnings/errores del navegador. Las imágenes visibles se inspeccionaron visualmente para verificar legibilidad y encuadre.

Los PNG y el reporte ejecutable se generan en `shared/bycode-video-system/qa/`, ignorado por Git. No se exportó un MP4 ni se levantó un servidor de Studio compartido.

## Límites de esta evidencia

La verificación cubre la biblioteca con fixtures aisladas, no el reel activo de DoctorChart. No se lo migró ni se ejecutaron scripts dentro de sus directorios. La adopción real debe verificar el proyecto receptor siguiendo [MIGRATION.md](MIGRATION.md).

No se probó cada versión del rango de peers, incluyendo React 18. No se validó ni aprobó una identidad visual: todos los valores iniciales siguen siendo `draft`. No se tomaron los reels de prueba como fuente oficial de marca.

El commit incorpora solo archivos nuevos en `.agents/skills/bycode-brand/`, `.agents/skills/bycode-promo/`, `shared/bycode-video-system/` y `docs/brand-system/`. No modifica ni elimina composiciones, manifests, lockfiles o assets de proyectos existentes. No hace merge ni publica cambios.
