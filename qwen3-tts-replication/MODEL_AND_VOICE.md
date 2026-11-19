# Modelo y voz exactos

Modelo de generación: Qwen/Qwen3-TTS-12Hz-0.6B-Base, tamaño comercial 0.6B (config tts_model_size=0b6, tts_model_type=base, tokenizer_12hz). Revisión: 5d83992436eae1d760afd27aff78a71d676296fc. Pesos raíz 1.829.344.272 bytes más speech_tokenizer/model.safetensors 682.293.092 bytes. Hashes de TODOS los archivos en models-manifest.json. Se descarga también el speech tokenizer de ESA revisión, sin reemplazarlo con otro modelo.

La identidad es doctorchart-masculina-01, una voz sintética propia. NO tiene speaker ID de CustomVoice y no es Ryan ni otra voz masculina de catálogo. Se construye con create_voice_clone_prompt(ref_audio=reference.wav, ref_text=profile.reference_spoken_text, x_vector_only_mode=False), modo ICL. El prompt se mantiene residente. El WAV y su transcripción literal son imprescindibles; no se puede reconstruir la misma identidad sólo con un prompt descriptivo.

Referencia SHA-256: 37511600572dd075c64568c80ed829a0a7d35a38a4597f398579b548a1a730f9. 25,84 s, 48 kHz estéreo. voice/reference-metadata.json demuestra su generación sintética y user_voice_reference=null. La copia está autorizada por este pedido de replicar esa voz sintética; no se extrajeron audios personales. Perfil autónomo en voice/profile.json.

Origen de referencia: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign, revisión 5ecdb67327fd37bb2e042aab12ff7391903235d3, seed 20261030. Instrucción literal en profile.voice_design_instruction y reference-metadata.json: varón latinoamericano treintañero, acento argentino, tono cálido y conversacional. Esa instrucción creó el WAV histórico; NO se vuelve a pasar como instruct a generate_voice_clone.

## Parámetros efectivos comprobados

CUDA:0, torch.bfloat16, SDPA, Torch threads=1 e interop=1. language='Spanish', non_streaming_mode=True. temperature=0.9, top_p=1.0, top_k=50, do_sample=True, repetition_penalty=1.05; subtalker_dosample=True, subtalker_temperature=0.9, subtalker_top_p=1.0, subtalker_top_k=50. Son valores de generation_config.json que _merge_generate_kwargs usa en la versión instalada, NO parámetros adivinados. Seed se establece tanto en torch.manual_seed como en torch.cuda.manual_seed_all.

Modelo devuelve 24.000 Hz en la prueba. Worker y tutorial normalizan con loudnorm=I=-16:TP=-1.5:LRA=7 y exportan PCM16 estéreo 48 kHz; sin acelerar voz ni cambiar pitch. Reels guardan primero PCM16 nativo y luego recortan silencio exterior, normalizan/mezclan. No se presenta esta diferencia de cuantización/recorte como idéntico posprocesamiento. El adaptador de prueba usa el generador del institucional y el posprocesamiento comprobado del worker, expresamente documentado.

## Variantes REALES: no existe un único seed/alias universal

| Flujo | Texto hablado | Seed | Límite |
|---|---|---|---|
| Perfil vigente / institucional | Bycode → báicod; DoctorChart → Doctor Chart | 20261030 + índice de toma; overrides por ID | min(2048,max(384,palabras*12)) |
| Pointly reel | Bycode → baicod, override local sin acento | 20261030 + índice; overrides por ID | mismo |
| DoctorChart worker histórico | Bycode/bycode → baicode | 20261030 | min(2048,max(384,palabras*9)) |
| Pointly tutorial existente | Bycode → baicode, Pointly → Pointli, aliases de siglas en script | 20261103 | min(2048,max(512,palabras*12)) |

El handoff recomienda báicod, pero narrate.py de Pointly todavía implementa baicode. Se informa el desacuerdo sin corregir el original. scripts/generate.py ofrece bycode-current (default, perfil vigente), pointly-tutorial y doctorchart-worker. Cada reporte registra el texto realmente enviado. Estas opciones reflejan flujos existentes; no cambian la identidad de voz ni ofrecen modelos alternativos. Los overrides de seeds de reels y cortes editoriales se consultan en sus manifiestos, no se trasladan a una narración nueva sin motivo.

Prueba solicitada: test-text.json conserva el texto escrito literal. Hablado: «Bienvenidos a báicod Software. En este tutorial vamos a aprender a utilizar Pointly de forma sencilla y rápida.» Seed 20261030, max_new_tokens=384. Configuración efectiva, GPU y resultados en demo/public/reference.generation.json. Se restaura la escritura Bycode/Pointly en captions sólo sobre palabras reconocidas y con aliases explícitos.
