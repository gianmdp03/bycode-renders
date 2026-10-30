# Estado de los subtítulos

`provisional.json`, `preview-runtime.json` y `subtitulos-provisionales.srt` contienen tiempos estimados a partir del guion. No son una transcripción ni están sincronizados con una voz existente.

El importador de voz generará `aligned.json` usando marcas por palabra de la grabación humana y `voice-runtime.json` con los planos reprogramados. Exportará entonces `out/subtitulos.srt`. No existe todavía un SRT definitivo.

Contrato JSON: `Caption` de `@remotion/captions`: text, startMs, endMs, timestampMs, confidence, pageBreakAfter. La palabra activa cambia de color y escala moderadamente; el texto aparece en grupos breves. Corregí manualmente marcas o palabras si tu escucha detecta errores del reconocimiento.
