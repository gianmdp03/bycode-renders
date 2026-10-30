# Incorporar bycode-brand y bycode-promo sin reconstruir un reel

La identidad sigue pendiente y los reels actuales son pruebas. Esta guía permite adoptar infraestructura compartida conservando el proyecto; no convierte sus valores visuales en estándares de marca. La entrega no migra ninguna composición automáticamente.

## 1. Integrar el commit en una rama independiente

Si otro agente sigue trabajando, esperar a que su trabajo esté guardado y commiteado antes de integrar cambios sobre esa línea. Un worktree no incluye sus archivos sin trackear ni sus modificaciones sin commit. No usar `git stash`, `reset`, `clean`, copiar su carpeta activa ni cambiarle la rama para trasladarlos.

Crear un worktree desde el commit o rama del proyecto que se quiera adaptar y aplicar el commit de esta entrega. Ejemplo PowerShell desde la raíz del repositorio (reemplazar los dos valores entre ángulos por referencias reales):

```powershell
git worktree add -b codex/integrate-bycode-system ../bycode-renders-integration <rama-con-proyecto-terminado>
git -C ../bycode-renders-integration cherry-pick <hash-del-commit-del-sistema>
```

El commit del sistema es aditivo: incorpora únicamente las dos skills, `shared/bycode-video-system/` y `docs/brand-system/`. No sustituye un Root ni una composición. Si esos paths ya existen al integrar, revisar el conflicto en esta rama aislada; no resolverlo sobre archivos de otro agente. El merge a una rama de trabajo se decide por separado, cuando su dueño termine.

## 2. Hacer disponibles las skills

Las skills viven en `.agents/skills/bycode-brand/` y `.agents/skills/bycode-promo/`, junto a las skills existentes. Abrir una sesión del agente en el worktree integrado y usar `$bycode-brand` y `$bycode-promo`. Si la sesión aún no las lista, iniciar una nueva sesión en esa raíz o indicar el path de sus `SKILL.md` explícitamente. No es necesario instalar ni sobrescribir skills globales.

Para otro repositorio, llevar esos dos directorios **junto con** `shared/bycode-video-system/` y `docs/brand-system/` respetando la misma estructura relativa: los links de las skills apuntan a esos recursos. Leer la skill no requiere instalar las dependencias de desarrollo del paquete.

## 3. Elegir una forma de consumir componentes

**Opción recomendada: fuente local.** Desde la raíz del worktree integrado, definir el proyecto de destino que ya tiene React/Remotion. Este ejemplo usa un nombre ilustrativo, no el reel activo de DoctorChart:

```powershell
$projectPath = Resolve-Path -LiteralPath './mi-reel'
$destination = Join-Path $projectPath 'src/bycode-system'
if (Test-Path -LiteralPath $destination) { throw 'El destino ya existe; revisar antes de copiar' }
Copy-Item -LiteralPath './shared/bycode-video-system/src' -Destination $destination -Recurse
```

Esto copia solo la biblioteca fuente. No copiar `node_modules`, `verification`, un `Root`, un lockfile o un `package.json` encima del proyecto. No se necesita instalar paquetes nuevos ni alterar la versión de Remotion. Guardar la versión/origen de la copia en el handoff del proyecto; futuras actualizaciones deben revisarse como un diff, nunca copiarse a ciegas.

**Alternativa: tarball local versionado.** En `shared/bycode-video-system/`, ejecutar `npm ci` y `npm pack`; luego instalar el `.tgz` en el proyecto con `npm install --save-exact <ruta-al-tgz>`. Mantener ese tarball en una ruta versionada accesible al proyecto para que `npm ci` sea reproducible. Usar los exports `/brand` y `/promo`. Esta alternativa sí cambia su manifest y lockfile: hacerlo solo en la rama aislada. Revisar el lockfile y `npm ls react react-dom remotion`; no permitir que la adopción actualice ni duplique los peers del proyecto. No usar `npm link`.

## 4. Mapear el tema que ya tiene el proyecto

Crear `src/brand.config.ts` (adaptar los campos al tema local real):

```tsx
import { createBrand } from './bycode-system/bycode-brand/index';
import { theme } from './theme';

export const projectBrand = createBrand({
  name: 'ByCode', // O la identidad propia del producto en esa escena.
  status: 'draft',
  colors: {
    background: theme.ink,
    text: theme.white,
    // Mapear también accent/onAccent según el tema local antes de adoptar CTA.
  },
  typography: { fontFamily: theme.font },
});
```

No cambiar `status` a `approved` sin una definición explícita del usuario. Mantener la carga de fuentes existente y los logos en el `public/` del proyecto. No cambiar Google Sans por Product Sans ni al revés por adoptar esta biblioteca. No se incluyen ni se copian fuentes de las pruebas.

## 5. Adoptar contexto sin cambio visual

Dentro del componente que actualmente representa la escena, añadir contexto alrededor de su contenido actual:

```tsx
import { BrandProvider } from './bycode-system/bycode-brand/index';
import { projectBrand } from './brand.config';

// ExistingScene representa aquí el contenido actual, conservado íntegro.
export const SceneWithBrand = () => (
  <BrandProvider brand={projectBrand}>
    <ExistingScene />
  </BrandProvider>
);
```

`BrandProvider` no genera nodos DOM ni estilos: el contenido antiguo se verá igual. Mantener el nombre/export del componente usado por el proyecto; el nombre del ejemplo no obliga a renombrarlo. Conservar las declaraciones `<Composition>` y `<Sequence>` existentes, sus IDs, duración, FPS, resolución, audio y captions.

## 6. Reemplazar una sola pieza cuando corresponda

En el contenedor existente del CTA, mantener el texto y destino confirmados y adoptar:

```tsx
import { PromoCta } from './bycode-system/bycode-promo/index';

<PromoCta destination={existingDestination} fontSize={existingFontSize}>
  {existingCopy}
</PromoCta>
```

El aspecto de ese CTA sí cambia: validar padding, contraste y tamaño; usar `style` para conservar el diseño si se desea. No agregar `PromoStage` ni `SafeArea` alrededor de toda una composición si solo se requiere un CTA. Para el logo, pasar el asset del proyecto con `logoSrc={staticFile('ruta/al-logo-validado.svg')}` a `BrandLockup`; sin asset validado, dejarlo sin logo.

Si se adopta `PromoReveal` dentro de una `Sequence from={600}`, `start={0}` empieza en el frame global 600: el componente recibe frames locales. `duration` está en frames. No pasar `start={600}` ni cambiar la duración de la escena para acomodarlo. El componente solo anima sus hijos; no crea una timeline.

Hay patrones tipados en [incremental-adoption.tsx](../../shared/bycode-video-system/examples/incremental-adoption.tsx). Cada escena puede adoptar el sistema por separado; las demás siguen usando sus componentes locales.

## 7. Verificar y poder volver atrás

Antes y después de adaptar una escena, ejecutar los checks que el proyecto ya tenga y comparar su metadata: ID, width, height, fps y durationInFrames deben conservarse si no se pidieron cambios. Revisar frames al inicio, entrada completa, final y límites de las escenas vecinas, además de audio/captions y desbordes. Registrar qué quedó `draft`.

Los checks del paquete compartido (`npm run check`, `npm test`, `npm run verify:frames`) prueban la biblioteca y fixtures aisladas. No sustituyen los checks del proyecto adaptado ni prueban el reel en producción del otro agente.

Hacer un commit separado para la adopción del proyecto. Para revertir solo esa adopción, ejecutar `git revert <commit-de-adopcion>` en la rama de integración: la composición vuelve a sus imports y componentes anteriores, mientras la biblioteca y las skills pueden permanecer disponibles. No hace falta reconstruir el reel ni borrar composiciones.
