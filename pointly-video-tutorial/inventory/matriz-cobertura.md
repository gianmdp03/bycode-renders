# Matriz funcional de Pointly · cruce con el MP4 final

Auditoría local: 76 plantillas, 291 controles, 34 grupos funcionales. Los 34 grupos tienen escena real y narración. La impresión conserva validación parcial; no se declara cobertura operativa total de esa dependencia. Cada grupo enlaza fuentes, toma, respuesta, audio, alineación y tiempos en `coverage-features.json`. Los controles repetidos se vinculan al flujo, sin afirmar 291 acciones independientes.

| ID | Función | Evidencia frontend | Escena / inicio | Validación | Condiciones / límites |
|---|---|---|---|---|---|
| F01 | Acceso comercial y guía Empezá ahora | src/app/pages/for-businesses/for-businesses.html:2 | 02-access · 0:25 | DEMONSTRATED_AND_NARRATED | Ruta pública for-businesses; registro en Bycode y regreso a Pointly; plan por aplicación. Google y registro local desactivados. |
| F02 | Completar DNI del comerciante | src/app/components/complete-profile-modal/complete-profile-modal.html:34 | 03-profile · 1:02 | DEMONSTRATED_AND_NARRATED | DNI del administrador, no del cliente. |
| F03 | Alta de empresa, enlace único, país y ubicación opcional | src/app/pages/new-company/new-company-page.html:6 | 04-company · 1:28 | DEMONSTRATED_AND_NARRATED | Nombre 2–100; enlace único; país obligatorio; campos físicos opcionales. |
| F04 | Editar regla base y vencimiento | src/app/pages/company-detail/components/modals/edit-company-modal/edit-company-modal.html:26 | 05-settings · 1:57 | DEMONSTRATED_AND_NARRATED | Configuración de compras nuevas; no renovar lotes anteriores. |
| F05 | Foto: cargar, recortar, reemplazar y quitar | src/app/pages/company-photo/company-photo.html:2 | 06-photo · 2:31 | DEMONSTRATED_AND_NARRATED | JPEG/PNG/WebP hasta 10 MB; API de medios y convertidor reales. |
| F06 | Enlace público: disponibilidad y confirmación de cambio | src/app/components/qr-generator/qr-generator.html:12 | 06-photo · 2:31 | DEMONSTRATED_AND_NARRATED | El anterior se invalida; la reserva anterior puede impedir reutilización inmediata. |
| F07 | Navegación y contadores del comercio | src/app/pages/company-detail/components/company-detail-tabs-nav/company-detail-tabs-nav.html:2 | 07-navigation · 3:04 | DEMONSTRATED_AND_NARRATED | Indicadores y tablas reales; sin gráficos estadísticos implementados. |
| F08 | Alta/asociación de clientes y contactos opcionales | src/app/pages/company-detail/components/modals/client-modal/client-modal.html:35 | 08-client · 3:43 | DEMONSTRATED_AND_NARRATED | Identidad por país+DNI; perfiles anteriores no se sobrescriben. |
| F09 | QR: copiar enlace, descargar e impresión | src/app/components/qr-generator/qr-generator.html:12 | 09-qr · 4:18 | PARTIAL_PRINT_ENVIRONMENT_LIMITATION | PNG y copia locales; impresión requiere revisión específica del navegador. |
| F10 | Alta pública por enlace de comercio | src/app/pages/client-join/client-join.html:7 | 09-qr · 4:18 | DEMONSTRATED_AND_NARRATED | Alta inmediata con nombre, DNI y país; sin confirmación de email. |
| F11 | Búsqueda, filtros y paginación de clientes | src/app/pages/company-detail/components/tab-clients/tab-clients.html:6 | 10-search · 4:48 | DEMONSTRATED_AND_NARRATED | Por nombre/DNI; ALL/ACTIVE/ARCHIVED; detalle. |
| F12 | Detalle, saldo, contactos e historial paginado | src/app/pages/company-client/company-client.html:4 | 10-search · 4:48 | DEMONSTRATED_AND_NARRATED | Contactos cargados automáticamente con permiso; sin botón de mostrar/ocultar. |
| F13 | Entrada Ver clientes y saldo autorizado | src/app/pages/company-client/company-client.html:4 | 10-search · 4:48 | DEMONSTRATED_AND_NARRATED | Reemplaza los antiguos accesos a consultar puntos. Contactos automáticos solo con cuenta y comercio activos. |
| F14 | Venta y estimación por tramos completos | src/app/pages/company-detail/components/modals/sale-modal/sale-modal.html:31 | 11-sale · 5:27 | DEMONSTRATED_AND_NARRATED | No cobra ni factura; conserva operación pendiente para reintentos. |
| F15 | Historial de ventas y compra con cero puntos | src/app/pages/company-detail/components/tab-sales/tab-sales.html:9 | 12-sales-history · 5:57 | DEMONSTRATED_AND_NARRATED | La API actual puede no devolver pointsGenerated por venta; Sin dato no significa cero. |
| F16 | Crear promoción y elegir beneficio | src/app/pages/company-detail/components/modals/promotion-modal/promotion-modal.html:25 | 13-promotion · 6:34 | DEMONSTRATED_AND_NARRATED | 50% extra/doble/triple/personalizado, fecha futura y fin posterior; sin solapamientos. |
| F17 | Editar, pausar, reactivar y eliminar promoción | src/app/pages/company-detail/components/tab-promotions/tab-promotions.html:37 | 14-promotion-life · 7:05 | DEMONSTRATED_AND_NARRATED | Confirmaciones en documento, conservación del historial. |
| F18 | CRUD de productos e imágenes archivo/enlace/sin foto | src/app/pages/company-detail/components/modals/product-modal/product-modal.html:25 | 15-products · 7:34 | DEMONSTRATED_AND_NARRATED | Catálogo informativo; no hay carrito ni inventario. |
| F19 | Premio físico, foto y calculadora de costo | src/app/pages/company-detail/components/modals/reward-modal/reward-modal.html:25 | 16-physical-reward · 8:14 | DEMONSTRATED_AND_NARRATED | Calculadora orientativa; requiere guardar el premio. |
| F20 | Voucher porcentual e importe fijo | src/app/pages/company-detail/components/modals/reward-modal/reward-modal.html:25 | 17-voucher · 8:47 | DEMONSTRATED_AND_NARRATED | Descuento manual; no genera código ni aplica dinero automáticamente. |
| F21 | Editar, pausar, reactivar y eliminar premios | src/app/pages/company-detail/components/tab-rewards/tab-rewards.html:9 | 18-reward-life · 9:16 | DEMONSTRATED_AND_NARRATED | No se borran canjes históricos ni sus instantáneas. |
| F22 | Canje por país y DNI y descuento de saldo | src/app/pages/company-detail/components/modals/redeem-modal/redeem-modal.html:42 | 19-redeem · 9:45 | DEMONSTRATED_AND_NARRATED | Validación contra saldo vigente y premio habilitado. |
| F23 | Rechazo por saldo y operación incierta | src/app/pages/company-detail/components/modals/redeem-modal/redeem-modal.html:42 | 20-redeem-errors · 10:16 | DEMONSTRATED_AND_NARRATED | Rechazo real distinto de una respuesta perdida; no duplicar operación. |
| F24 | Inactividad, períodos y WhatsApp manual | src/app/pages/company-detail/components/tab-inactive-clients/tab-inactive-clients.html:40 | 21-inactive · 10:48 | DEMONSTRATED_AND_NARRATED | Solo se revisa/copia borrador; sin comunicación externa. |
| F25 | Archivo manual y reactivación con cupo | src/app/pages/company-detail/components/archived-clients/archived-clients.html:24 | 22-archive · 11:17 | DEMONSTRATED_AND_NARRATED | Conserva saldos, historial y vencimientos; inactividad no archiva automáticamente. |
| F26 | Correos: Sí/No y tres vistas previas | src/app/pages/company-detail/components/company-emails/company-emails.html:11 | 23-emails · 11:47 | DEMONSTRATED_AND_NARRATED | Configuración persistida; proveedor saliente desactivado en DEMO. |
| F27 | Billetera: consulta y comercios asociados | src/app/pages/client-wallet/client-wallet.html:3 | 24-wallet · 12:20 | DEMONSTRATED_AND_NARRATED | Sin cuenta comercial; vínculo de lectura protegido. |
| F28 | Catálogos públicos y elegibilidad | src/app/pages/client-wallet/client-wallet-catalog.html:4 | 24-wallet · 12:20 | DEMONSTRATED_AND_NARRATED | Consulta de premios, productos y promociones vigentes; canje coordinado. |
| F29 | Lotes con vencimiento y sin vencimiento | src/app/pages/client-wallet/client-wallet.html:3 | 25-expiration · 12:58 | DEMONSTRATED_AND_NARRATED | Fechas y grupos provistos por API, no reconstruidos con regla actual. |
| F30 | Mi acceso: copiar, recordar y quitar | src/app/pages/client-wallet/client-wallet.html:3 | 26-wallet-access · 13:32 | DEMONSTRATED_AND_NARRATED | Acceso local y enlace de consulta; no es una nueva cuenta. |
| F31 | Instalar/agregar acceso según navegador | src/app/components/install-guide/install-guide.html:6 | 26-wallet-access · 13:32 | DEMONSTRATED_AND_NARRATED | Guía real; disponibilidad de instalación depende del navegador. |
| F32 | Habilitar/deshabilitar comercio y plan | src/app/components/dashboard/components/role-admin-view/role-admin-view.html:22 | 27-company-status · 14:08 | DEMONSTRATED_AND_NARRATED | No libera cupo de comercios; plan expirado o ausente restringe funciones. |
| F33 | Vista SUPER_ADMIN y permisos del servidor | src/app/components/dashboard/components/role-app-admin-view/role-app-admin-view.html:13 | 28-roles · 14:39 | DEMONSTRATED_AND_NARRATED | Vista global; el backend no habilita automáticamente toda acción visible. |
| F34 | Tema, preguntas frecuentes, errores, sesión | src/app/components/account-menu/account-menu.html:2 | 29-help · 15:12 | DEMONSTRATED_AND_NARRATED | Reintentos diferenciados de lista vacía; cierre de sesión real. |

## Límites y exclusiones comprobados

- QR: copia y PNG validados; ventana de impresión parcial en headless. No se muestra impresión vacía como éxito.
- Bycode: se enseña el recorrido de registro, perfil y plan; no se crea una cuenta externa ni se contrata un plan.
- Correos: configuración persistida y tres vistas previas reales; envío saliente desactivado. WhatsApp: borrador y copia, sin envío externo.
- Instalación: guía responsive real; no se afirma instalación en Android, iOS ni en el sistema operativo local.
- SUPER_ADMIN: vista global real; permisos de escritura contrastados con servidor, sin afirmar que toda acción global esté autorizada.
- IA y niveles: flags desactivados. Autogestión histórica, confirmación de email, LoginModal, carrusel, Hero, WalletPreview y CheckPointsModal no montados en el recorrido vigente. `/points` redirige a Home.
- No hay gráficos estadísticos, carrito, stock, facturación, ajustes arbitrarios de puntos ni canje público autogestionado. Los indicadores existentes sí se explican.
- La política de vencimiento se contrasta con datos reales y fuente del servidor; no se espera el transcurso de 90 días durante la grabación.

Detalle individual: `coverage-controls.json`. Pruebas de reintentos sin duplicación: `qa/12-sales-history-pending-proof.json` y `qa/20-redeem-errors-pending-proof.json`. Auditoría audiovisual: `qa/final-video-verification.json`, `qa/audio-input-verification.json` y `qa/visual-review.json`.
