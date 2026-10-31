# Estado · 30/10/2026

Reel institucional de Bycode, 1080 × 1920 / 60 FPS. Se eliminó el encabezado fijo superior (logo, Bycode y SOFTWARE) por instrucción del usuario; no reintroducirlo. Las notas técnicas permanecen fuera del cuadro. Trabajo en la rama actual, sin publicar ni modificar el tutorial de DoctorChart.

El usuario reemplazó su pedido inicial de voz humana por una prueba con **Qwen masculina**, igual al tutorial de DoctorChart. Se usa el perfil fijo `doctorchart-masculina-01` de `docs/tutorial-handoffs/VOZ_MASCULINA_DOCTORCHART.json` en la raíz del repositorio. Hash verificado antes y después. Es una referencia sintética, sin grabaciones personales. Generador local Base 0.6B en CUDA, modelo/prompt residentes durante el lote; 6 tomas con checkpoints bajo `public/voice/qwen-masculina/`.

**Pronunciación vigente: Bycode se dice “báicod”, acento en BAI.** La última corrección del usuario reemplaza “baicoud”. El alias central del perfil se actualizó; la transcripción histórica de referencia sigue literal y no se altera su WAV. Se regeneran sólo `intro` y `cta`; las cuatro tomas restantes se reutilizan. Versiones anteriores en `archive/qwen-baicode/` y `archive/qwen-baicoud/`. Las medidas de la primera mezcla que figuran abajo son históricas; consultar los reportes JSON del render actual.

El usuario aportó `C:/Users/gcast/Downloads/Música de fondo para Spot Publicitario.mp3`. La copia de producción es `public/audio/musica-spot-provista.mp3`. Usarla como acompañamiento bajo, con ducking durante la voz; no volver a la composición anterior por defecto. No se adjuntó licencia de catálogo. La composición original y previews anteriores se conservan.

Guion de 50 palabras. Alineación por toma con faster-whisper: 100% de palabras coinciden, con aliases de nombres propios. Se pasa PCM 16 kHz directamente al ASR para evitar la incompatibilidad local entre PyAV y `metadata_errors`, sin reinstalar dependencias. Duración de montaje 28,9 s, sin acelerar la voz. Medidas: voz −16,01 LUFS, música base −34,69 LUFS, mezcla −16,04 LUFS / −4,90 dBTP.

Salidas actuales: `out/bycode_preview_qwen_masculina.mp4`, `out/subtitulos-qwen.srt`, `public/voice/bycode-qwen-masculina.wav`. Runtime: `captions/qwen-runtime.json`, mezcla: `public/audio/qwen-mix.wav`. Composición: `Bycode-Qwen-Masculina`. La composición anterior `Bycode-Institucional` y su preview sin voz se conservan.

Repetir desde la raíz: `npm run voice:qwen --workspace=bycode-institucional-reel`. Sólo render: `npm run render:qwen --workspace=bycode-institucional-reel`. El lote reutiliza tomas válidas y conserva el modelo entre generaciones; no ejecutar en paralelo con otros trabajos GPU. El pipeline no modifica datos ni voces del tutorial de referencia. La naturalidad y pronunciación quedan para escuchar la muestra con el usuario.
