# Integración audiovisual en main · 30/10/2026

## Qué quedó integrado

El commit original `88a3a19a8af2cbeea7bd5a814a65d0a329c97c68` es ancestro de `main` mediante `e9beacf`, sin conflictos y sin nuevas ramas/worktrees. El reel anterior se guardó primero en `d21976a`; archivos fuente, assets y copia del MP4 quedan en Git.

Tres skills del proyecto: `bycode-brand`, `bycode-promo`, `bycode-tutorial`, con `allow_implicit_invocation: true`. El AGENTS raíz establece la selección automática. Se revisaron estos casos:

| Pedido representativo | Selección esperada según AGENTS | Separación narrativa |
|---|---|---|
| «Hacé una publicidad de DoctorChart para Reels» | brand + promo | Beneficios y CTA comercial |
| «Creá un reel de Bycode» | brand + promo | Misma biblioteca, perfil Bycode draft |
| «Anuncio de Pointly» | brand + promo | Misma biblioteca, perfil Pointly draft |
| «Tutorial completo para registrar una consulta» | brand + tutorial | Pasos, resultados y ritmo educativo |
| «Animá este mapa / video genérico» | Capacidades Remotion pertinentes | Sin estructura publicitaria obligatoria |

Esta tabla documenta la revisión de instrucciones del agente; no es un clasificador programático ni una promesa de entrenamiento del modelo. Los links locales de las skills y su política de invocación se comprueban en tests.

Un workspace npm, un lockfile raíz y una biblioteca `@bycode/video-system`. React/React DOM 19.2.3 y Remotion 4.0.539 compartidos, comprobados mediante igualdad de rutas reales de resolución. No hay snapshots de la biblioteca dentro del reel.

Fuente única: `shared/bycode-video-system/src/`. Perfiles de producto en `bycode-brand/products.ts`; componentes y movimiento comerciales en `bycode-promo/`. Todos los perfiles permanecen **draft**. DoctorChart mapea el tema previo; Bycode y Pointly continúan neutrales hasta definición humana. La identidad no fue aprobada ni deducida de pruebas.

## DoctorChart

- Nuevo: `doctorchart-promo-reel/out/reel_preview_bycode_integrado.mp4`.
- Copia versionada: `doctorchart-promo-reel/archive/bycode-integrated/reel_preview_bycode_integrado.mp4`.
- Original conservado y versionado: `doctorchart-promo-reel/archive/pre-brand-integration/reel_preview_sin_voz.mp4`.
- Contact sheet actualizado y reportes incluidos en el archivo de la versión integrada.

Adopción incremental: provider, lockup con logo auténtico, títulos, curvas de entrada, captions y CTA compartidos. Ocho escenas, guion, capturas, tiempos estimados, música y flujo de voz real conservados. Ningún TTS ni cambio de contenido comercial. Continúa siendo una preview sin locución: la grabación del usuario es un requisito de la entrega final con voz, no un pendiente de esta integración.

## Pruebas ejecutadas

| Comprobación | Resultado |
|---|---|
| Validación de las tres skills con `quick_validate.py` | PASS, las tres |
| `npm ci` desde la raíz | PASS; se cerró el Studio anterior que bloqueaba binarios en Windows antes del reintento |
| `npm run check` | PASS, biblioteca y DoctorChart |
| `npm test` | PASS, 7 de componentes + 4 de integración |
| `npm run build` | PASS, biblioteca y bundle Remotion |
| `npm run verify:frames` | PASS, retrato/paisaje, límites de entradas, logs, Bycode, Pointly y educación |
| Reproducción de Studio integrado | PASS, Play/Pause y cero errores de página |
| `npm run render:doctorchart` | PASS, MP4 completo |
| `npm run qa:doctorchart` | PASS, codec, FPS, dimensiones, audio, decodificación, negros y clipping |
| Preservación del trabajo previo | PASS, 28 archivos protegidos y MP4 original por SHA256 |
| Audio entre ambos MP4 | PASS, PCM decodificado idéntico |

Metadata: H.264 yuv420p BT.709, 1080×1920, 60/1 FPS, 1680 frames / 28 s, AAC estéreo 48 kHz. Música: −23,09 LUFS, pico −12,09 dBTP. Sin segmentos negros detectados de 40 ms o más ni errores de decodificación. Revisión de frames/contact sheet: logo, CTA y captions legibles y sin cambiar el montaje.

La prueba educativa compara píxeles idénticos de una lección antes/después de añadir contexto de marca y mantiene 30 FPS/600 frames. No se aplicaron cambios al tutorial histórico ni a los otros videos.

Evidencia: `evidence/shared-frames.json`, PNG de Bycode/Pointly/lección, `doctorchart-promo-reel/qa/brand-integration-comparison.json`, `studio-integration.json` y `media-report.json`.

## Conservación y limpieza

Respaldo adicional de fuente, renders y archivos ignorados del worktree en `.git/integration-backups/2026-10-30/`; dependencias regenerables desde el lockfile. La limpieza se ejecuta después del commit de integración y de validar el respaldo. Su resultado queda registrado en `evidence/cleanup.json`.

Los archivos ajenos que ya estaban sin seguimiento —otros videos, zip y documentación histórica— permanecen sin tocar. Los commits de esta integración no los incorporan indiscriminadamente. No se hicieron pushes, publicaciones ni despliegues.
