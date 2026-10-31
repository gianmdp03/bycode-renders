# Validación de la preview · 30/10/2026

**Resultado técnico: PASS.** Archivo real: `out/bycode_preview_sin_voz.mp4` (2.914.259 bytes). Reporte verificable: `media-report.json`.

- 1080 × 1920, 9:16, 60/1 FPS, **1728 frames / 28,800 s**.
- H.264, yuv420p, BT.709, CRF 17; audio AAC, 48 kHz, estéreo, configuración 192 kbps.
- Decodificación completa con FFmpeg finalizada sin errores detectados; no se detectaron segmentos negros.
- Música de preview: −29,09 LUFS integrados; pico verdadero medido −17,34 dBTP. Sin clipping. Es deliberadamente discreta.
- SHA-256 de los assets importados verificados. Logo y capturas originales sin alteraciones del contenido.
- Fixture de conservación de DoctorChart: PASS. Sus capturas, guion, música, fuentes y render archivado conservan sus hashes. No se editaron sus fuentes ni su composición.

## Revisión visual

Se renderizaron e inspeccionaron las seis escenas y los límites de transición: frames 0, 45, 100, 167, 168, 185, 260, 419, 420, 438, 550, 719, 720, 738, 850, 1031, 1032, 1050, 1160, 1403, 1404, 1422, 1540 y 1727. PNG a media resolución en `out/`. Hoja de contacto: `out/contact-sheet.jpg`.

Se corrigió el recorrido de la flecha del gancho para que no cruce el texto secundario. La captura de Pointly se recortó al primer premio completo para evitar una segunda tarjeta cortada. No se cambió ningún texto ni dato de la UI. Los barridos de 18 frames conservan la escena anterior mientras entra la siguiente. El cierre sostiene nombre, CTA y cuenta de Instagram hasta el último frame.

Titulares de 86–122 px, captions de 44 px y datos secundarios en menor tamaño. La captura ampliada de Pointly muestra el premio, puntos y canje auténticos; el gráfico de DoctorChart ilustra seguimiento, no pretende enseñar a leer métricas en cinco segundos. Los títulos dan el contexto comercial legible desde móvil.

Se prepararon overlays ilustrativos de Reels para las escenas de producto, ecosistema y cierre: `out/safe-550.png`, `safe-850.png`, `safe-1160.png`, `safe-1540.png`. Texto principal, logos, CTA y subtítulos quedan en el área reservada de 84–912 px horizontal y 210–1510 px vertical. Se reserva el extremo derecho y la zona inferior para controles. Los overlays de Instagram pueden cambiar; no se presenta esta simulación como garantía de todos sus clientes o formatos.

Se abrió el proyecto en Remotion Studio y se comprobó mediante su API visible: ID `Bycode-Institucional`, 1080 × 1920, 60 FPS, 1728 frames y error actual **null**. Studio queda disponible en `http://localhost:3500/Bycode-Institucional`.

## Checks de integración

- `npm run check`: PASS, incluyendo la pieza nueva.
- `npm test`: 7 pruebas compartidas y 4 de integración, todas PASS.
- `npm run verify:frames`: PASS, preservación de píxeles y tiempos locales en retrato/paisaje.
- Builds de biblioteca, DoctorChart y Bycode: PASS.
- Compilación sintáctica Python de composición musical e ingestión de voz: PASS.
- Dependencias locales NumPy, Pillow y faster-whisper: disponibles.
- Guardia de ingestión sin grabación: rechaza la ejecución antes de modificar un runtime.
- No cambió ninguna versión de paquete existente al registrar el nuevo workspace; el lockfile reorganizó ubicaciones de dependencias compartidas.
- `git diff --check`: PASS. Trabajo en la rama actual, sin commits, ramas nuevas, worktrees ni publicación.

## Pendiente de tu grabación

Esta preview contiene música original y tiempos de subtítulos **estimados**, sin voz. No se generó una voz sintética. Se implementó ASR local con timestamps de palabra, anclaje de escenas y mezcla con sidechain; su calidad sobre tu voz no puede validarse hasta recibir una toma. Al incorporarla, revisar nombres propios, palabras resaltadas y mezcla escuchando el MP4 final. El sistema se detiene si la alineación o la duración no son confiables.

La adaptación audiovisual derivada del frontend continúa **draft**. Este render no constituye aprobación de una identidad oficial.

## Ajuste de encabezado

Se retiró el aviso de producción del cuadro por pedido del usuario. MP4, PNG y hoja de contacto regenerados; typecheck y QA técnico PASS. Las notas sobre ausencia de voz y sincronía provisional permanecen en documentación y metadata. La skill compartida de marca registra esta regla. La versión anterior se conserva en archive/con-aviso-produccion/.

## Retiro del encabezado fijo de marca

Se eliminó de Stage la franja superior completa con logo, nombre Bycode y SOFTWARE, tal como señalaba la foto del usuario. Se retiró su componente auxiliar y se actualizó bycode-brand para no añadir encabezados permanentes salvo pedido explícito. MP4 regenerado y QA PASS. No cambian escenas, tiempos, música ni subtítulos. La versión anterior se conserva en archive/con-encabezado-fijo/.
