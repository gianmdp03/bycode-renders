# Bycode renders

Proyecto audiovisual principal de Bycode, DoctorChart y Pointly. Tres skills de proyecto con selección automática en [AGENTS.md](AGENTS.md): marca compartida, promociones y tutoriales. Identidad provisional hasta aprobación explícita.

```powershell
npm ci
npm run check
npm test
npm run verify:frames
npm run build
npm run dev
```

Un workspace npm y un lockfile raíz. Biblioteca única en `shared/bycode-video-system/src`, consumida por paquete local, sin copias. Perfiles de producto, logos explícitos y componentes de marca independientes del estilo narrativo. Tutoriales mantienen pasos y ritmo educativos; videos genéricos no reciben un formato publicitario automáticamente.

## DoctorChart

```powershell
npm run render:doctorchart
npm run qa:doctorchart
```

Preview actualizada: `doctorchart-promo-reel/out/reel_preview_bycode_integrado.mp4`. Copia versionada: `doctorchart-promo-reel/archive/bycode-integrated/`. Original preservado en `archive/pre-brand-integration/`. Ambos son previews sin locución, 1080×1920, 60 FPS, 28 segundos. Guion, capturas, música y flujo de voz real conservados.

La grabación humana sigue pendiente. El [README del reel](doctorchart-promo-reel/README.md) y su guía explican la ingestión. No se genera TTS. Studio: `http://localhost:3400/DoctorChart-Reel`.

## Compartir identidad en otra pieza

Consultar [el contrato del sistema](shared/bycode-video-system/README.md) y [la adopción en el repositorio principal](docs/brand-system/MIGRATION.md). Mantener el perfil del producto en el registro compartido; consumir `/brand` y, sólo para promociones, `/promo`. No crear otra biblioteca, rama o worktree sin pedido del usuario.

Los videos históricos y el tutorial existente permanecen conservados; sus dependencias no se migran automáticamente. Los materiales previos ajenos a esta integración que ya estaban sin seguimiento no se borran ni se incluyen en commits de forma indiscriminada.

Resultados y evidencia: [INTEGRATION.md](docs/brand-system/INTEGRATION.md).
