# Grabá tu voz real

Texto definitivo: `guion-final.md`. Duración orientativa: 26–29 s, sin apurarte. No grabes mientras reproducís el video: los planos se ajustarán a tu voz.

| Tiempo aproximado | Bloque que vas a decir |
|---|---|
| 0–3,5 s | ¿Tu consultorio sigue entre papeles y mil ventanas? |
| 3,5–11,5 s | Con DoctorChart, reuní pacientes, historias clínicas y consultas en un solo lugar. |
| 11,5–20 s | Personalizá tus formularios según tu especialidad y encontrá la información que necesitás. |
| 20–24,5 s | Todo más organizado, para poner el foco en tus pacientes. |
| 24,5–28 s | Conocé DoctorChart. Tu consultorio, mejor organizado. |

1. Habitación silenciosa con cortinas o muebles. Celular fijo a 15–20 cm, levemente al costado de la boca. Desactivá notificaciones.
2. Leé una vez y grabá dos tomas completas. Tono cercano, seguro y con intención; sonrisa leve en el cierre. Enfatizá lo marcado en negrita en el guion. No sobreactúes.
3. Dejá un segundo de silencio al principio y al final. No pongas música ni apliques efectos, filtros o reducción agresiva de ruido. Evitá auriculares Bluetooth.
4. Preferible WAV mono 48 kHz, 24 o 16 bits. También se aceptan MP3/M4A de buena calidad. No renombres un M4A como WAV: conservá su extensión.
5. Guardá la toma elegida en `voice/locucion-original.wav` o pasá la ruta original al importador.

Desde esta carpeta:

```powershell
npm run ingest-voice -- "C:\ruta\tu-toma.m4a"
```

El comando convierte y normaliza, recorta únicamente silencios exteriores con margen, conserva todas las pausas interiores, transcribe en español localmente y obtiene marcas por palabra. Compara con el guion, exporta captions y SRT y redistribuye los planos. No sintetiza ni clona voz. Una discrepancia relevante o una toma demasiado larga bloquea el render automático y deja un informe para revisar.

Después de aprobar la preview visual, generá el final con:

```powershell
npm run render:final -- --approved
```

La salida será `out/reel_final_con_voz.mp4`. Si querés permitir un pequeño ajuste de duración porque tu lectura es natural pero excede 30 s, usá `npm run ingest-voice -- "C:\ruta\tu-toma.m4a" --allow-longer`. Se documenta la duración; no se acelera el audio.

Revisá con oído humano que cada palabra resaltada corresponda a lo que decís. Whisper estima alineación, no garantiza exactitud fonética. Podés corregir `captions/aligned.json` y los beats en `captions/voice-runtime.json` antes de renderizar nuevamente. Los captions de la primera preview son sólo una simulación editorial.
