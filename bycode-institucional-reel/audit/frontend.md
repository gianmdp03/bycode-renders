# Auditoría de contenido y recursos

Fuente exclusiva: `C:/Users/gcast/Documents/GitHub/bycode-frontend`, archivos locales leídos el 30/10/2026. No se consultó el sitio público ni se capturaron cuentas reales. Se recorrieron rutas, portada, componentes institucionales, configuración de productos, páginas de producto, estilos, logos, fuentes y capturas. No se modificó ese repositorio.

## Estructura y jerarquía de fuentes

Es un frontend Angular 22.2.2. `src/app/app.routes.ts:16` carga `pages/home/home.component.ts`, cuyo HTML actual es `pages/home/home.component.html`. Ese HTML y `personal-theme.css` prevalecen sobre los componentes antiguos `hero` y `about`, que también se inspeccionaron pero **no constituyen la portada actual**. Las rutas `/pointly` y `/doctorchart` cargan páginas propias con showcase de capturas locales. El proyecto audiovisual usa esas capturas existentes; no necesita conectarse al backend o iniciar sesión.

## Claims del reel y evidencia local

| Mensaje | Archivo y evidencia |
|---|---|
| Tu comercio, tu consultorio, más simple | `src/app/pages/home/home.component.html:8`, titular de portada. El gancho “Tu día, más simple” es una condensación publicitaria de ese posicionamiento. |
| Bycode crea software para comercios y consultorios | `home.component.html:10` y `:192–208`, productos y misión de simplificar la gestión cotidiana. `footer.component.html` identifica a Bycode Software. |
| Pointly: clientes, puntos y recompensas | `home.component.html:49–91`, puntos por consumo, premios y canjes. `core/config/products.config.ts`, descripción activa de Pointly. `pages/pointly/pointly.component.ts`, descripción y catálogo de premios. |
| DoctorChart: pacientes, consultas y fichas clínicas | `home.component.html:107–141` y `pages/doctorchart/doctorchart.component.ts:89–100`. No se atribuye agenda, diagnóstico automático ni beneficios médicos. |
| Aplicaciones especializadas, servicios independientes | `home.component.html:46` y `:156–168`. No se afirma interoperabilidad de datos entre Pointly y DoctorChart. |
| Acceso desde el navegador, cuenta común | `home.component.html:36–38`, `:173–184`. Requiere cuenta y suscripción correspondiente; no se anuncia gratuidad. |
| @bycode.arg | `home.component.html:350–361` y `components/footer/footer.component.html`, enlace real de Instagram. Se usa como CTA sin visitar el sitio público. |

No se incluyeron Stock Store (deshabilitado en configuración), precios, estadísticas, testimonios, promesas de aumento de ventas, inteligencia artificial, supuestas integraciones ni funcionalidades que sólo existan en otros reels.

## Identidad y assets

- `public/bycode-logo.svg`: copiado byte a byte; relleno original `#2b7fff` y negro, sin redibujar ni invertir. Por eso se usa sobre blanco, incluso dentro de la escena oscura.
- `public/pointly-logo.svg`, `public/doctorchart-logo.svg`: originales, sin modificaciones.
- `src/styles.css:15`: Google Sans. Se conserva el WOFF2 local y OFL de `public/fonts/`, con carga bloqueante antes de renderizar.
- `src/personal-theme.css:14`: tinta `#10284b`. El azul `#2b7fff` procede del logo. Blanco, superficies y líneas sobrias reproducen la dirección Personal. Los tonos secundarios del mapping son ajustes audiovisuales de contraste, no tokens oficiales extraídos literalmente del frontend.
- Perfil reutilizable **draft**: `shared/bycode-video-system/src/bycode-brand/products.ts`, export `bycodeFrontendTheme`. Se aplica optativamente; no cambia los defaults de otros consumidores ni el tema de DoctorChart.
- `components/showcase-carousel/showcase-carousel.component.ts`: documenta las capturas como imágenes de la aplicación con datos de demostración. El gráfico de crecimiento corresponde a un paciente ficticio. Se verificaron visualmente las capturas utilizadas. No hay nombres o datos de clientes reales en los recortes.
- Se incluyen también promociones y vacunas como material auténtico disponible para futuras ediciones; el montaje actual muestra premios y crecimiento.
- `qa/assets.json` registra rutas y SHA-256. La QA verifica que los recursos entregados siguen coincidiendo con los importados.

## Alcance de las demostraciones

Se muestran acercamientos animados a capturas reales, claramente rotulados. No se simula una sesión en vivo, un canje ejecutado, un paciente nuevo ni una medición que se actualiza. Los títulos y contenedores editoriales pertenecen al reel y no pretenden ser controles de la aplicación.

Los perfiles de marca siguen provisionales hasta aprobación humana expresa. Este render no aprueba ni establece una identidad oficial.
