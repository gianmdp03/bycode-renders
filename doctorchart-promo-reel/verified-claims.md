# Claims y evidencia

Auditoría: 30/10/2026. Checkout DoctorChart `14196974125e5769c5a95e309896397acad96e63`, limpio al inicio y después de las capturas. Se examinó material previo de la misma revisión para localizar beneficios; las imágenes incorporadas son capturas NUEVAS de Playwright sobre la UI real y API de la pila DEMO aislada reactivada en localhost:24443. Frontend servido desde copia nueva en este proyecto, localhost:24202. Sin respuestas de API mockeadas ni reconstrucción de pantallas. Datos explícitamente ficticios. No se leyó ni contactó producción. Evidencia exacta: `assets/capture-manifest.json` y hashes SHA256.

| Frase | Evidencia de implementación y UI real | Alcance |
|---|---|---|
| Tus pacientes, en un solo lugar | `src/app/features/patient-list/patient-list.component.html`, servicio patient; captura nueva `public/assets/patients.png` | Directorio del profesional, no agenda |
| Historias clínicas y consultas | `features/patient-record/patient-record.component.html`, `features/encounter-form/encounter-form.component.html`, `features/encounter-detail/encounter-detail-page.component.html`; capturas nuevas `record.png`, `history.png`, `detail.png`, `encounter.png` | Registro y recuperación, sin prometer resultados clínicos |
| Encontrá la información | Búsqueda por nombre, documento o teléfono en patient-list; input auténtico visible en `patients.png`, registros visibles en `history.png` | Sin prometer búsqueda semántica o IA |
| Personalizá tus formularios | `features/onboarding/onboarding-wizard/onboarding-wizard.component.ts` y `features/form-field-editor/form-field-editor.component.html`; capturas nuevas `customize.png`, `custom-fields.png` | Campos y categorías sobre especialidad publicada |
| Según tu especialidad | `features/onboarding/specialty-selection/specialty-selection.component.html` y workspace store; cabecera de personalización de Pediatría en `customize.png` | Demo disponible: Pediatría. No se afirma oferta de todas las especialidades ni cambio libre posterior |
| Más foco en tus pacientes / mejor organizado | Posicionamiento aspiracional relacionado con centralización | No es un ahorro medido ni garantía |
| Conocé DoctorChart | Logo original `public/doctorchart-logo.svg` | No se inventa dominio, oferta o prueba gratis |

Excluidos: IA y calculadoras (`core/config/feature-flags.ts`: ambos false), turnos (sin ruta), pagos, recetas y otras prestaciones no seleccionadas. Las pestañas secundarias pueden existir en la UI completa, pero los encuadres elegidos no las promocionan.

Las cifras visibles en fuentes son exclusivamente DEMO. No se usarán como prueba comercial. Capturas fijas: movimiento de cámara digital a 60 FPS; no se atribuye movimiento nativo a esas imágenes. Los clips reales, si se usan, conservan su procedencia original.
