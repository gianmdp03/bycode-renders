# Cobertura pendiente o no reproducida

No quedan filas PENDING.


- BLOCKED DCV-071: Volver a cargar · src/app/features/encounter-form/encounter-form.component.html:136
  El guard exige workspace completo y definición antes de montar este formulario; loadForm usa la copia ya cargada. No se fuerza un estado interno inválido para hacer aparecer el botón.
- BLOCKED DCV-154: Intentar cargar nuevamente · src/app/features/onboarding/onboarding-wizard/onboarding-wizard.component.html:86
  El fallo inicial de workspace se captura en el guard/shell antes del wizard; una vez cargado, loadInitial utiliza la copia del store. Se acredita el reintento real del shell y se conserva esta rama defensiva como no reproducida.
