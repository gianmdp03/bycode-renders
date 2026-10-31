# Auditoría de Pointly para el reel

Fuente exclusiva de producto: `../pointly-frontend`, commit `cbc933935608ed899d7a8ed844c3f8b65fbbb4fb`, sin cambios locales al iniciar. No se consultaron los frontends de Bycode ni DoctorChart para inferir funcionalidades. El reel de Bycode se usó como referencia de producción y mezcla; el modelo y la referencia masculina se reutilizan en lectura.

## Funciones que respaldan el guion

| Mensaje | Evidencia en Pointly frontend |
| --- | --- |
| Fidelización para comercios | `src/environments/environment.base.ts`, `src/app/components/footer/footer.html`, `src/index.html` |
| Clientes y saldos | `src/app/pages/company-detail/components/tab-overview/tab-overview.html`, `src/app/core/services/points-account-service.ts` |
| Registrar una compra y sumar puntos | `src/app/core/services/sale-service.ts:20`, `src/app/pages/company-detail/components/modals/sale-modal/sale-modal.html:112` y `:148` |
| Premios físicos y descuentos por puntos | `src/app/core/models/reward.model.ts:4`, `src/app/pages/company-detail/components/tab-rewards/tab-rewards.html:53` y `:61` |
| Consultar puntos y premios desde el celular | `src/app/pages/client-wallet/client-wallet.html:81`, `src/app/core/services/client-wallet-service.ts` |
| CTA existente | `src/app/core/config/site.config.json`: `publicSiteUrl=https://pointly.bycode.com.ar` |

La evidencia demuestra que estos flujos están implementados en el frontend. La grabación usa respuestas API ficticias en memoria y no certifica el estado del backend desplegado. No se muestra ni se usa información de comercios reales.

## Límites editoriales

- Niveles Bronce/Plata/Oro suspendidos: `src/app/core/config/feature-flags.ts:6`, `docs/loyalty-tiers-suspended.md`. Excluidos del anuncio.
- El cliente consulta; el canje se confirma con el comercio (`client-wallet.html:84`). No se anuncia un canje autónomo desde el celular.
- Registrar ventas no cobra ni factura. No se presenta como sistema de pagos o facturación.
- WhatsApp requiere revisión y envío manual; no se anuncia automatización. Correos dependen de configuración y disponibilidad de email; no se prometen campañas automáticas.
- No se anuncian estadísticas comerciales, integraciones, precios, aumentos de ventas ni porcentajes de retención.
- El 15% mostrado es una recompensa ficticia configurada por Café Demo. Los 80 puntos surgen de una compra ficticia de $8.000 con la regla de ejemplo de 10 puntos por cada $1.000. Saldo: 320 → 400. No son beneficios cuantificados del producto.

## Assets y filmación

Logos `public/logo.svg` y `public/bycode-logo.svg`, Google Sans local y OFL copiados desde Pointly con hashes en `qa/assets.json`. Azul `#1A73E8`, fondos blancos y grafito del logo `#292D35`; adaptación audiovisual **draft**, no aprobación de marca.

Se compiló el Angular original hacia `pointly-promo-reel/.local/frontend`, sin modificar su fuente, configuración ni dist existente. Playwright navega controles originales; CDP captura frames reales. `scripts/capture.mjs` intercepta todas las solicitudes externas: sesión sintética, comercio Café Demo, clientes Demo y estados de API en memoria. La venta actualiza el saldo del fixture; ese resultado aparece en la billetera. No hay llamadas de escritura a producción. `qa/capture-manifest.json` conserva las rutas, cantidad de frames y resultados.
