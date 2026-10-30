# Sistema de marca y promo ByCode

Biblioteca optativa para React/Remotion. La identidad está **por definir**: `draftBrand` usa grises y `sans-serif` como valores de demostración. No incluye logo oficial, fuentes, dominios, claims ni colores extraídos de los reels de prueba.

Las skills están en [bycode-brand](../../.agents/skills/bycode-brand/SKILL.md) y [bycode-promo](../../.agents/skills/bycode-promo/SKILL.md). Para un proyecto existente seguir [la migración gradual](../../docs/brand-system/MIGRATION.md).

## API

| Export | Función | Adopción |
| --- | --- | --- |
| `createBrand(overrides)` | Combina grupos parciales de tokens sin mutarlos | Mapear el tema local, sin aprobarlo como marca |
| `draftBrand` | Defaults neutrales, `status: "draft"` | Base de demostración |
| `BrandProvider` / `useBrand` | Contexto de React, admite proveedores anidados | Sin wrapper DOM, CSS global ni efectos de carga |
| `BrandLockup` | Nombre y logo opcional, tamaño explícito | `logoSrc` es una URL resuelta; sin logo muestra texto |
| `SafeArea` | Contenedor absoluto con insets explícitos | Solo para elementos nuevos o adaptados |
| `suggestedSafeInsets(width, height)` | Márgenes orientativos en píxeles de composición | Ajustar a controles, captions y formato real |
| `PromoStage` | Fondo y tipografía de una escena | Solo si se desea adoptar también esos estilos |
| `PromoTitle` | Título con tokens | `fontSize` en píxeles y `style` sobreescribibles |
| `PromoCta` | Texto de acción y destino visual opcional | No navega ni valida dominios; usar copy confirmado |
| `PromoReveal` | Entrada con opacidad y desplazamiento por frame | `start=0`, `duration=18`, `distance=24`; no crea `Sequence` |
| `entranceProgress` | Progreso cúbico con límites 0–1 | Función pura; duración cero permite entrada inmediata |

Tokens: nombre, estado `draft/approved`, colores de fondo/superficie/texto/muted/accent/onAccent/borde, familia/pesos/interlineados tipográficos y radio. `status` registra una decisión humana; la biblioteca no impide previews ni cambia apariencia al aprobar. Los defaults están congelados y `createBrand` entrega grupos independientes para cada consumidor.

Los props `style` prevalecen sobre el estilo del componente. Ningún componente fija FPS, resolución, duración, IDs, offsets de escenas ni orden narrativo. `PromoReveal` lee el frame local a la `Sequence` contenedora: no sumarle el offset global. Los títulos y CTA no reducen automáticamente el texto; revisar textos largos en el formato de destino. El sistema no añade audio, captions, UI de producto ni carga de fuentes. Las fuentes genéricas pueden variar entre máquinas: para producción usar la carga local y las fuentes autorizadas del proyecto.

## Uso como fuente o paquete

Se recomienda copiar **solo `src/`** al proyecto existente para conservar su resolución de React/Remotion y no cambiar sus dependencias. La fuente usa imports relativos sin extensión compatibles con TypeScript y el bundler de Remotion; no requiere cambiar el tsconfig ni configurar un monorepo. El paquete compilado usa CommonJS, consumible desde imports de React/Remotion. Ver comandos en la guía.

También puede empaquetarse con `npm pack`. Los exports del paquete son `@bycode/video-system/brand` y `@bycode/video-system/promo`; React, React DOM y Remotion son peer dependencies, no copias embebidas. No instalar el paquete mediante un symlink a un directorio con otro `node_modules`, para evitar duplicar contextos de React/Remotion. El paquete es privado; no se publica a un registry.

Compatibilidad declarada: React/React DOM 18.3.1–19.x y Remotion desde 4.0.530 hasta antes de 5, usando APIs estables. La validación concreta está registrada en [VALIDATION.md](../../docs/brand-system/VALIDATION.md); el rango de peers no implica que cada combinación se haya probado. No actualizar un proyecto por adoptar el sistema y mantener todos sus paquetes `@remotion/*` en la misma versión.

## Desarrollo aislado

Desde este directorio:

```powershell
npm ci
npm run check
npm test
npm run verify:frames
npm pack --dry-run
```

`verify:frames` genera PNG y un reporte en `qa/` (ignorado por Git), sin exportar video ni abrir Studio. Usa fixtures propias y verifica igualdad de píxeles al añadir solo contexto a un lienzo anterior, en retrato y paisaje. También comprueba los límites de una entrada dentro de una `Sequence`. No escribe ni importa escenas de los reels existentes.
