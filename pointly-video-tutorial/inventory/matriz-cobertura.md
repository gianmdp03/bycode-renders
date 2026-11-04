# Matriz funcional de Pointly

Fuente: frontend local, 75 plantillas y 300 controles analizados con Angular parseTemplate. Una escena grabada no prueba por sí sola cada control: se conservan estados pendientes hasta el cruce final.

| ID | Función | Evidencia frontend | Escena | Estado | Condiciones / límites |
|---|---|---|---|---|---|
| F01 | Acceso comercial y derivación a Bycode | src/app/pages/login/login.html:12 | 02-access | RECORDED_AWAITING_FINAL_CROSSCHECK | Cuenta Bycode y plan por módulo. Google y registro local desactivados. |
| F02 | Completar DNI del comerciante | src/app/components/complete-profile-modal/complete-profile-modal.html:34 | 03-profile | RECORDED_AWAITING_FINAL_CROSSCHECK | DNI del administrador, no del cliente. |
| F03 | Alta de empresa, enlace único, país y ubicación opcional | src/app/pages/new-company/new-company-page.html:6 | 04-company | RECORDED_AWAITING_FINAL_CROSSCHECK | Nombre 2–100; enlace único; país obligatorio; campos físicos opcionales. |
| F04 | Editar regla base y vencimiento | src/app/pages/company-detail/components/modals/edit-company-modal/edit-company-modal.html:26 | 05-settings | RECORDED_AWAITING_FINAL_CROSSCHECK | Configuración de compras nuevas; no renovar lotes anteriores. |
| F05 | Foto: cargar, recortar, reemplazar y quitar | src/app/pages/company-photo/company-photo.html:2 | 06-photo | RECORDED_AWAITING_FINAL_CROSSCHECK | JPEG/PNG/WebP hasta 10 MB; API de medios y convertidor reales. |
| F06 | Enlace público: disponibilidad y confirmación de cambio | src/app/components/qr-generator/qr-generator.html:12 | 06-photo | RECORDED_AWAITING_FINAL_CROSSCHECK | El anterior se invalida; la reserva anterior puede impedir reutilización inmediata. |
| F07 | Navegación y contadores del comercio | src/app/pages/company-detail/components/company-detail-tabs-nav/company-detail-tabs-nav.html:2 | 07-navigation | RECORDED_AWAITING_FINAL_CROSSCHECK | Indicadores y tablas reales; sin gráficos estadísticos implementados. |
| F08 | Alta/asociación de clientes y contactos opcionales | src/app/pages/company-detail/components/modals/client-modal/client-modal.html:35 | 08-client | RECORDED_AWAITING_FINAL_CROSSCHECK | Identidad por país+DNI; perfiles anteriores no se sobrescriben. |
| F09 | QR: copiar enlace, descargar e impresión | src/app/components/qr-generator/qr-generator.html:12 | 09-qr | RECORDED_AWAITING_FINAL_CROSSCHECK | PNG y copia locales; impresión requiere revisión específica del navegador. |
| F10 | Alta pública por enlace de comercio | src/app/pages/client-join/client-join.html:7 | 09-qr | RECORDED_AWAITING_FINAL_CROSSCHECK | Alta inmediata con nombre, DNI y país; sin confirmación de email. |
| F11 | Búsqueda, filtros y paginación de clientes | src/app/pages/company-detail/components/tab-clients/tab-clients.html:6 | 10-search | RECORDED_AWAITING_FINAL_CROSSCHECK | Por nombre/DNI; ALL/ACTIVE/ARCHIVED; detalle. |
| F12 | Detalle, saldo, contactos e historial paginado | src/app/pages/company-client/company-client.html:4 | 10-search | RECORDED_AWAITING_FINAL_CROSSCHECK | Consulta autorizada de contactos; ocultación posterior. |
| F13 | Consultar puntos desde comercio | src/app/components/company-quick-actions/modals/check-points-modal/check-points-modal.html:2 | 10-search | RECORDED_AWAITING_FINAL_CROSSCHECK | Formulario administrativo distinto de billetera pública. |
| F14 | Venta y estimación por tramos completos | src/app/pages/company-detail/components/modals/sale-modal/sale-modal.html:31 | 11-sale | RECORDED_AWAITING_FINAL_CROSSCHECK | No cobra ni factura; conserva operación pendiente para reintentos. |
| F15 | Historial de ventas y compra con cero puntos | src/app/pages/company-detail/components/tab-sales/tab-sales.html:9 | 12-sales-history | RECORDED_AWAITING_FINAL_CROSSCHECK | La API actual puede no devolver pointsGenerated por venta; Sin dato no significa cero. |
| F16 | Crear promoción y elegir beneficio | src/app/pages/company-detail/components/modals/promotion-modal/promotion-modal.html:25 | 13-promotion | RECORDED_AWAITING_FINAL_CROSSCHECK | 50% extra/doble/triple/personalizado, fecha futura y fin posterior; sin solapamientos. |
| F17 | Editar, pausar, reactivar y eliminar promoción | src/app/pages/company-detail/components/tab-promotions/tab-promotions.html:37 | 14-promotion-life | RECORDED_AWAITING_FINAL_CROSSCHECK | Confirmaciones en documento, conservación del historial. |
| F18 | CRUD de productos e imágenes archivo/enlace/sin foto | src/app/pages/company-detail/components/modals/product-modal/product-modal.html:25 | 15-products | RECORDED_AWAITING_FINAL_CROSSCHECK | Catálogo informativo; no hay carrito ni inventario. |
| F19 | Premio físico, foto y calculadora de costo | src/app/pages/company-detail/components/modals/reward-modal/reward-modal.html:25 | 16-physical-reward | RECORDED_AWAITING_FINAL_CROSSCHECK | Calculadora orientativa; requiere guardar el premio. |
| F20 | Voucher porcentual e importe fijo | src/app/pages/company-detail/components/modals/reward-modal/reward-modal.html:25 | 17-voucher | RECORDED_AWAITING_FINAL_CROSSCHECK | Descuento manual; no genera código ni aplica dinero automáticamente. |
| F21 | Editar, pausar, reactivar y eliminar premios | src/app/pages/company-detail/components/tab-rewards/tab-rewards.html:9 | 18-reward-life | RECORDED_AWAITING_FINAL_CROSSCHECK | No se borran canjes históricos ni sus instantáneas. |
| F22 | Canje por país y DNI y descuento de saldo | src/app/pages/company-detail/components/modals/redeem-modal/redeem-modal.html:42 | 19-redeem | RECORDED_AWAITING_FINAL_CROSSCHECK | Validación contra saldo vigente y premio habilitado. |
| F23 | Rechazo por saldo y operación incierta | src/app/pages/company-detail/components/modals/redeem-modal/redeem-modal.html:42 | 20-redeem-errors | RECORDED_AWAITING_FINAL_CROSSCHECK | Rechazo real distinto de una respuesta perdida; no duplicar operación. |
| F24 | Inactividad, períodos y WhatsApp manual | src/app/pages/company-detail/components/tab-inactive-clients/tab-inactive-clients.html:40 | 21-inactive | RECORDED_AWAITING_FINAL_CROSSCHECK | Solo se revisa/copia borrador; sin comunicación externa. |
| F25 | Archivo manual y reactivación con cupo | src/app/pages/company-detail/components/archived-clients/archived-clients.html:24 | 22-archive | RECORDED_AWAITING_FINAL_CROSSCHECK | Conserva saldos, historial y vencimientos; inactividad no archiva automáticamente. |
| F26 | Correos: Sí/No y tres vistas previas | src/app/pages/company-detail/components/company-emails/company-emails.html:11 | 23-emails | RECORDED_AWAITING_FINAL_CROSSCHECK | Configuración persistida; proveedor saliente desactivado en DEMO. |
| F27 | Billetera: consulta y comercios asociados | src/app/pages/client-wallet/client-wallet.html:3 | 24-wallet | RECORDED_AWAITING_FINAL_CROSSCHECK | Sin cuenta comercial; vínculo de lectura protegido. |
| F28 | Catálogos públicos y elegibilidad | src/app/pages/client-wallet/client-wallet-catalog.html:4 | 24-wallet | RECORDED_AWAITING_FINAL_CROSSCHECK | Consulta de premios, productos y promociones vigentes; canje coordinado. |
| F29 | Lotes con vencimiento y sin vencimiento | src/app/pages/client-wallet/client-wallet.html:3 | 25-expiration | RECORDED_AWAITING_FINAL_CROSSCHECK | Fechas y grupos provistos por API, no reconstruidos con regla actual. |
| F30 | Mi acceso: copiar, recordar y quitar | src/app/pages/client-wallet/client-wallet.html:3 | 26-wallet-access | RECORDED_AWAITING_FINAL_CROSSCHECK | Acceso local y enlace de consulta; no es una nueva cuenta. |
| F31 | Instalar/agregar acceso según navegador | src/app/components/install-guide/install-guide.html:6 | 26-wallet-access | RECORDED_AWAITING_FINAL_CROSSCHECK | Guía real; disponibilidad de instalación depende del navegador. |
| F32 | Habilitar/deshabilitar comercio y plan | src/app/components/dashboard/components/role-admin-view/role-admin-view.html:22 | 27-company-status | RECORDED_AWAITING_FINAL_CROSSCHECK | No libera cupo de comercios; plan expirado o ausente restringe funciones. |
| F33 | Vista SUPER_ADMIN y permisos del servidor | src/app/components/dashboard/components/role-app-admin-view/role-app-admin-view.html:13 | 28-roles | RECORDED_AWAITING_FINAL_CROSSCHECK | Vista global; el backend no habilita automáticamente toda acción visible. |
| F34 | Tema, preguntas frecuentes, errores, sesión | src/app/components/account-menu/account-menu.html:2 | 29-help | RECORDED_AWAITING_FINAL_CROSSCHECK | Reintentos diferenciados de lista vacía; cierre de sesión real. |

## Funciones excluidas o suspendidas

- Asistente IA: AI_ASSISTANT_ENABLED=false.
- Niveles Bronce/Plata/Oro: LOYALTY_TIERS_ENABLED=false, bloqueo también en servidor.
- OAuth Google y registro comercial dentro de Pointly: políticas false; deriva a Bycode.
- Autogestión antigua, confirmación de email y preferencias del cliente: retiradas; contactos opcionales.
- Depuración automática por inactividad: suspendida; archivo manual.
- Editor de plantillas: reemplazado por tres correos fijos.
- ClientPointsPage histórico: segunda ruta points eclipsada por points/full de Billetera.
- Hero, carrusel y WalletPreview históricos sin montaje actual: no confundir código conservado con UI operativa.
- No se encontraron gráficos, carrito de compras, facturación, stock, edición arbitraria de puntos ni canje autogestionado público.

Inventario individual y condiciones: coverage-controls.json. No se afirma envío externo de correos/WhatsApp ni compra de planes.
