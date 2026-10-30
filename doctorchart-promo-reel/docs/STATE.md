# DoctorChart promocional · estado

El encargo activo de este chat es exclusivamente `doctorchart-promo-reel/`. `bycode-institucional-reel/` pertenece a otro chat: no generar, editar, mezclar ni renderizar allí. La respuesta previa que entregó Bycode fue un error de selección de proyecto.

El usuario autorizó ahora una variante de **DoctorChart con Qwen masculina** y la música `C:/Users/gcast/Downloads/Música de fondo para Spot Publicitario.mp3`, baja para acompañar. Esta instrucción reemplaza el requisito inicial de sólo voz humana para esta prueba. Mantener el importador humano y previews originales intactos; no presentar Qwen como voz humana.

Usar el perfil sintético fijo del tutorial DoctorChart, verificado por SHA256, sin tocar sus modelos, referencia ni grabaciones personales. `render/qwen.mjs` genera las cinco frases con modelo residente, alinea palabras y ajusta los ocho planos existentes a la voz sin acelerar. Assets, escenas y guion del reel DoctorChart se conservan. Salida exclusiva: `out/doctorchart_preview_qwen_masculina.mp4` y `out/subtitulos-qwen.srt`.

Pronunciación corregida por el usuario: **Bycode = báicod, acento en BAI**, nunca baicoud ni baicód. El perfil compartido ya contiene `báicod`. La transcripción histórica de la referencia de voz se conserva literal para no alterar su prompt; no es la pronunciación de nuevas tomas. El guion de este reel no menciona Bycode.

No iniciar Qwen mientras otro chat usa la GPU; esperar a que termine, sin interrumpirlo. Estado de QA, procedencia sintética y mezcla en `qa/qwen-*.json`. Música provista por el usuario, sin atribuirle la licencia de la composición original. No publicar.

Resultado del 30/10/2026: preview completa de DoctorChart exportada, 28,02 s / 1681 frames, 1080×1920 a 60 FPS, H.264 yuv420p, AAC estéreo 48 kHz. Las 48 palabras se cotejaron con el guion y se alinearon con ASR local por frase. Montaje con las mismas ocho escenas; sin acelerar la voz. Mezcla medida en el MP4: −16,08 LUFS, pico verdadero −4,93 dBTP. Música base −35 LUFS, casi 19 LU bajo voz antes de sidechain. Decodificación, negros y clipping PASS. TypeScript y las cuatro pruebas de preservación/integración PASS; previews originales intactas por hash.

Composición Studio adicional: `DoctorChart-Qwen-Masculina`. Contact sheet y MP4 archivados en `archive/qwen-masculina/`. Falta únicamente la revisión subjetiva del usuario de voz/música; no se etiqueta como final aprobado. No se hizo ninguna escritura en `bycode-institucional-reel/` durante esta corrección.
