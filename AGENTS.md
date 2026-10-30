# Bycode renders · proyecto audiovisual único

Trabajar en este repositorio y su rama actual. No crear ramas, worktrees ni sistemas paralelos salvo pedido explícito posterior. Preservar cambios ajenos, originales, capturas y renders previos. No publicar ni desplegar por producir un video.

## Selección automática de skills

No exigir que el usuario nombre las skills. Seleccionar por la intención del pedido y leer los archivos indicados antes de producir o modificar una pieza:

| Pedido | Skills que se aplican |
|---|---|
| Reel, anuncio, publicidad, promo o campaña de producto | [bycode-brand](.agents/skills/bycode-brand/SKILL.md) + [bycode-promo](.agents/skills/bycode-promo/SKILL.md) |
| Tutorial, capacitación, recorrido educativo o explicación paso a paso | [bycode-brand](.agents/skills/bycode-brand/SKILL.md) + [bycode-tutorial](.agents/skills/bycode-tutorial/SKILL.md) |
| Video genérico, documental, animación u otro formato | Elegir las capacidades técnicas de [Remotion](.agents/skills/remotion-best-practices/SKILL.md) según el trabajo; añadir marca sólo si corresponde. No imponer gancho comercial, ritmo de anuncio ni CTA publicitario. |

Si el pedido mezcla formatos, conservar la finalidad principal y separar las secciones educativas de las comerciales. Las instrucciones explícitas del usuario prevalecen.

## Una fuente compartida

- Código y configuraciones de marca: `shared/bycode-video-system/src/`. Consumir `@bycode/video-system/brand` y `/promo` mediante el workspace npm. No copiar la biblioteca ni crear un sistema por producto.
- Perfiles de Bycode, DoctorChart y Pointly: `src/bycode-brand/products.ts` dentro de esa biblioteca. Todos permanecen **draft** hasta aprobación humana explícita. Los renders de prueba no definen una identidad oficial. Los valores conservados de DoctorChart son una adaptación provisional, no defaults oficiales para los otros productos.
- `bycode-brand` comparte identidad e infraestructura; `bycode-promo` contiene recursos comerciales. Un tutorial usa marca neutral y sus herramientas educativas, sin importar componentes promo por defecto.
- Preservar fuentes locales, licencias, logos auténticos, datos ficticios y claims comprobados. No generar voces sintéticas si se pidió voz humana.

## Comandos desde esta raíz

`npm ci` instala el workspace y compila la biblioteca. `npm run check`, `npm test`, `npm run verify:frames` y `npm run build` validan la integración. `npm run dev` abre DoctorChart en Studio; `npm run render:doctorchart` produce su preview actualizada sin reemplazar el render anterior.

Los proyectos históricos conservan sus archivos y dependencias hasta que un pedido requiera adaptarlos. No migrarlos ni alterar su narrativa como efecto secundario de usar una skill. Ver [estado y migración](docs/brand-system/MIGRATION.md).
