# Guion definitivo · 29,48 s

Español argentino. Voz masculina sintética fija instalada, Qwen3-TTS Base 0.6B. La petición directa del usuario reemplaza el requisito anterior del texto adjunto que pedía voz humana. Corrección final: **Bycode se pronuncia “baicod”**. La referencia histórica no se modifica. Pointly conserva su escritura en el texto hablado y fue reconocido como Pointly al alinear la toma.

| Tiempo de escena | Locución |
| --- | --- |
| 0,00–2,70 | ¿Tus clientes compran y no vuelven? |
| 2,70–6,33 | Con Pointly, dales un motivo para volver. |
| 6,33–10,67 | Registrá compras y sumá puntos a tus clientes. |
| 10,67–14,40 | Creá premios y descuentos para canjear. |
| 14,40–19,37 | Cada cliente consulta sus puntos y premios desde el celular. |
| 19,37–25,15 | Fidelización para tu comercio, con todo organizado en un solo lugar. |
| 25,15–29,48 | Conocé Pointly, de Bycode. |

El audio empieza 160 ms después de cada corte. Se recortaron solamente silencios exteriores; no se aceleró la voz. Los subtítulos tienen timestamps reales por palabra, agrupados en hasta tres palabras por frase visual. Los tiempos exactos están en `captions/qwen-runtime.json` y las tomas en `public/voice/qwen-masculina/`.

## Guía para una futura grabación humana

Una toma por fila, en WAV mono o estéreo, sin música, sin reducción de ruido agresiva ni compresor fuerte. Dejar unos 200 ms de aire al inicio y al final. Voz cercana y conversacional; leve pregunta en el gancho, energía en “sumá puntos”, pausa breve después de “Pointly” en el cierre. Leer Bycode como **baicod**. Conservar una velocidad cómoda; el pipeline rechaza una duración superior a 30 s en lugar de acelerar automáticamente.

El manifiesto de importación permite cambiar cada archivo por separado. Ver `README.md`. La sincronía y la mezcla se recalculan con la nueva voz.
