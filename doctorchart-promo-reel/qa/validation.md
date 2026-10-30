# Verificación de la primera preview

**Estado: PREVIEW SIN VOZ, lista para revisión creativa.** No hay un reel final con locución ni SRT definitivo. No se generó TTS ni se utilizó voz del tutorial.

## Archivo físico y técnica

`out/reel_preview_sin_voz.mp4`. Ver mediciones completas en `media-report.json`.

- Canvas y exportación: 1080×1920, proporción 9:16.
- 60/1 FPS constante; 1680 frames de video, 28,000 s. Contenedor alrededor de 28,01 s por padding AAC.
- H.264, yuv420p, rango TV, BT.709. Se corrigió la prueba inicial que usaba JPEG y quedaba yuvj420p: el exportado entregado usa PNG intermedio y conversión BT.709.
- AAC 48.000 Hz, 2 canales estéreo, 192 kb/s solicitado.
- Decodificación completa sin errores. Detección de negro sin segmentos de 40 ms o más con umbral 98% del cuadro.
- Música medida en el MP4: −23,09 LUFS integrados; pico verdadero −12,09 dBTP, sin clipping. Cama secundaria y suave; no se afirmó una prueba de inteligibilidad de voz inexistente.

## Revisión visual

12 frames extraídos del MP4 y contact sheet, incluidas apertura, directorio, historia, editor, consulta, beneficio emocional y CTA. Logo original y fuente local Google Sans; texto revisado en español argentino. Capturas de datos ficticios identificados DEMO, sin credenciales, tokens, información de pacientes reales ni direcciones personales. Las cifras demo no se presentan como prueba de resultados.

Gancho visible en frame 0. Marca en apertura y reveal. Cuatro bloques de producto breves, sin instrucciones de botones. Recortes y cámaras sobre capturas auténticas; sin clics falsos. Dos cortes de detalle dentro de historia/editor. Disoluciones de 12 frames entre escenas, animaciones deterministas, sin timers ni CSS keyframes.

Captions estimados en grupos de 2–5 palabras, con palabra activa. Label persistente de preview y tiempos provisionales. No se anuncian como sincronizados con una voz real. Área de captions alrededor de y=1430, por encima del pie social; ancho limitado a x=84…912. Puede haber recortes de UI secundarios por encuadre, pero ningún claim clave depende de leer columnas cortadas.

Safe areas revisadas con overlay ilustrativo en `out/mobile-safe-area-400.png`, `970.png`, `1570.png`: CTA, logo, títulos y captions fuera de controles. No se asumen medidas de Instagram como constantes. Vistas de 540×960 y contact sheet a 270×480 revisadas: titulares/CTA/captions legibles; los detalles pequeños de la UI no se utilizan para transmitir la promesa comercial.

CTA «Conocé DoctorChart» visible hasta el último frame, más de 2 segundos estable. Sin dominio inventado; URL editable pendiente de confirmar.

## Remotion y reproducibilidad

Studio `http://localhost:3400/DoctorChart-Reel` abierto en Chrome y reproducción comprobada; cero errores de página (`studio-browser.json`). La vista Studio puede bajar de 60 FPS durante un render concurrente; eso no altera los 60 FPS del MP4 exportado. TypeScript sin errores.

Versiones exactas en `source-versions.json`, `node-versions.json`, `python-versions.txt`, `package-lock.json`. Remotion 4.0.539 alineado. Frontend DoctorChart y Bycode permanecen con git status limpio. Los untracked preexistentes de bycode-renders se conservaron; la única carpeta de producción nueva es `doctorchart-promo-reel/`.

Modelo Whisper small multilingüe descargado en esta carpeta y cargado localmente en CPU int8. Importador Python compila. Se verificó que ingestión sin archivo humano y render final sin aprobación/voz abortan sin crear entregables falsos. Timings provisionales: grupos de 2–5 palabras, rangos positivos, cobertura de escenas continua 0–28 s y formato SRT comprobados en `metadata-checks.json`.

## Pendiente exclusivamente de la voz y revisión del usuario

- Aprobar o ajustar dirección creativa de esta preview.
- Recibir una toma humana del guion de 48 palabras; ver guía en `script/`.
- Ejecutar ingestión real, cotejar transcripción y ajustar marcas con escucha humana. No se declara prueba end-to-end de una toma que todavía no existe.
- Escuchar mezcla definitiva en celular, ajustar cama/ducking si hace falta y exportar final tras aprobación.
- URL pública opcional, aún no confirmada.

La pista es una composición original sintetizada localmente, con fuente y nota de uso en `audio/music-license.md`. No se contactó producción, no se publicó ni se hicieron commits/pushes.
