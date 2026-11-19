# Sistema real de subtítulos

No se encontró WhisperX ni stable-ts como implementación de estos flujos. Hay varias generaciones que no deben confundirse.

| Producción | Fuente de tiempos | Presentación |
|---|---|---|
| DoctorChart tutorial IA, compile-ai-video.py / RetimedBeat.tsx | cue de fragmento completo, fronteras exactas del WAV seleccionado; NO tiempos por palabra | Arial 32 px, dos líneas, izquierda 288 / ancho 1320 / top 987 / alto 84 en 1920x1080 |
| DoctorChart histórico Piper, voice.py | fronteras de muestras de frases sintetizadas separadamente | captions por frase; NO alineación de palabras |
| Pointly tutorial, automation/align.py + revise-captions.mjs | faster-whisper small, audio definitivo, tiempos acústicos por palabra; comparación contra guion | Google Sans 28 px, peso 400, #10284b; izquierda/derecha 220, top 1017, alto 54 en 1920x1080; sin zoom/palabra cinética |
| Reels DoctorChart/Bycode/Pointly | faster-whisper small CPU int8; validación de palabras, montaje según duración real; recorte sólo de silencio exterior | PromoCaptions compartido y adaptaciones de grupos/tamaño de cada pieza |
| Previews sin locución | algunos captions son temporales según guion | no certifican sincronización real |

Pointly automation/align.py usa WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4,num_workers=1). Ese alias original permite descargar sin revisión fija: la réplica lo sustituye por ruta local a la revisión comprobada 536b0662742c02347bc0e980a01041f333bce120. Es una adaptación explícita para reproducibilidad, no otro modelo. El modelo local de reels tiene esa revisión por metadata de los cuatro archivos.

language='es', beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False. Prompt contextual del tutorial: 'Pointly, Bycode Software, DNI, QR, WhatsApp, JPEG, PNG, WebP.'. Los reels usan a veces el texto hablado de la toma como initial_prompt. ASR contextual puede influir en el reconocimiento: no es verificación auditiva independiente ni forced alignment de WhisperX.

Audio → FFmpeg mono float32 16 kHz → Whisper CPU → palabras {word,start,end,probability} en segundos → comparación con guion y correcciones explícitas de escritura → Caption {text,startMs,endMs,timestampMs:null,confidence} → frases/SRT y Remotion. Acentos y puntuación del guion sólo se restauran sobre coincidencias; diferencias quedan registradas. revise-captions.mjs además contiene correcciones revisadas de capítulos concretos; no se aplican a textos arbitrarios.

Los tiempos dependen del WAV definitivo; normalizar o cambiar voz exige realinear. El tutorial no hace time stretching de voz; acelerar capturas no acelera narración ni reloj de captions. Los reels suman offsets de escena, entrada de audio y recorte a los tiempos locales. La prueba aislada empieza a cero y no añade música ni offsets ficticios.

PromoCaptions está en shared/bycode-video-system/src/bycode-promo/captions.tsx. Agrupa hasta cinco palabras o pageBreakAfter; busca grupo por reloj real/FPS, conserva 70 ms al final y activa palabra sólo dentro de su intervalo. Texto activo accentLight, peso de título, scale 1.025; fondo backgroundDark, borde 18, padding 14x22, fuente contextual; fontSize default42, bottom21%, left8%, right16%. Las piezas pueden sobreescribir geometría/grupos: no afirmar que cinco palabras sea universal.

El paquete incluye el artefacto compilado de la misma biblioteca, sin duplicar una biblioteca fuente por producto. La petición explícita autoriza esta distribución interna mínima; no se migra ningún proyecto. El componente tutorial se extrae de Chapter.tsx y su origen queda guardado. No se copian capturas del producto ni datos de pacientes. No existe un componente tutorial compartido equivalente a PromoCaptions en la biblioteca actual.

bycode-brand define marca provisional; bycode-promo aporta presentación comercial y NO transcribe; bycode-tutorial pide textos discretos y distingue guion/audio/tiempos. Ninguna skill convierte los renders de QA en una identidad oficial. El perfil Pointly del demo sigue draft.
