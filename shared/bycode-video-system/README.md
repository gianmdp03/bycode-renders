# Sistema audiovisual compartido Bycode

Fuente única de código reutilizable para Bycode, DoctorChart y Pointly dentro de `bycode-renders`. Identidad **provisional**: ningún perfil se considera aprobado. No se extraen decisiones oficiales de renders de prueba.

## Consumo

Desde la raíz: `npm ci`, `npm run build:system`. Los proyectos del workspace importan directamente:

```tsx
import {BrandProvider, BrandLockup, createProductBrand} from '@bycode/video-system/brand';
import {PromoCta, PromoReveal} from '@bycode/video-system/promo';

const brand = createProductBrand('pointly'); // draft, valores neutrales hasta definición
// Dentro de una escena Remotion existente:
<BrandProvider brand={brand}>
  <BrandLockup />
  <PromoReveal duration={18}>
    <PromoCta>Conocé Pointly</PromoCta>
  </PromoReveal>
</BrandProvider>
```

Para un tutorial usar sólo `/brand` y sus componentes educativos existentes. El contexto no cambia estilos, narrativa, metadata ni tiempos. No copiar la biblioteca ni instalar otra instancia de React/Remotion. El build genera `dist` desde `src`; no editar `dist`.

## Contrato

| Export | Responsabilidad |
|---|---|
| `createBrand` / `draftBrand` | Tokens combinables sin mutar defaults congelados |
| `createProductBrand` | Perfiles únicos `bycode`, `doctorchart`, `pointly`, todos draft |
| `BrandProvider` / `useBrand` | Contexto sin wrapper DOM ni efectos globales |
| `BrandLockup` | Nombre y logo explícito, tamaños y `logoStyle` opcional |
| `SafeArea` / `suggestedSafeInsets` / `portraitSafeInsets` | Layout ajustable, no garantía de overlays de plataformas |
| `PromoStage` / `PromoTitle` / `PromoCta` | Presentación comercial sin imponer estructura de escenas |
| `PromoReveal` / `entranceProgress` | Entrada determinista; frames locales a la Sequence |
| `PromoCaptions` | Palabra activa y grupos breves sobre timestamps provistos |

Perfiles y decisiones de producto en `src/bycode-brand/products.ts`; defaults neutrales en `tokens.ts`. DoctorChart conserva el tema previo como configuración draft. Compartir infraestructura no asigna su paleta a Bycode o Pointly. La carga de Google Sans y su licencia permanece en el proyecto consumidor.

`PromoCaptions` consume `Caption` de Remotion, lee FPS de la composición y no genera ni transcribe audio. La procedencia provisional/real de sus tiempos la comunica la pieza. Voz, música, claims, URL y capturas son responsabilidad del proyecto; nada se inventa en estos componentes.

Los props `style` permiten adaptar la pieza sin duplicar componentes. Ningún componente registra composiciones ni cambia IDs, offsets, duración, resolución o FPS. `status: approved` sólo representa aprobación humana explícita.

## Verificación

Desde la raíz: `npm run check`, `npm test`, `npm run verify:frames`. Incluye aislamiento de contextos, perfiles, captions, preservación de píxeles y prueba educativa. React 19.2.3 y paquetes Remotion 4.0.539 alineados en el workspace. El rango de peers no implica haber probado todas las versiones admitidas.

Skills: [brand](../../.agents/skills/bycode-brand/SKILL.md), [promo](../../.agents/skills/bycode-promo/SKILL.md), [tutorial](../../.agents/skills/bycode-tutorial/SKILL.md). Enrutamiento automático en [AGENTS.md](../../AGENTS.md). Integración y conservación: [MIGRATION.md](../../docs/brand-system/MIGRATION.md).
