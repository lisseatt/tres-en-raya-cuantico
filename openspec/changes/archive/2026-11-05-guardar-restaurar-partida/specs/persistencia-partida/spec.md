# Spec Delta

## Purpose

Permite que una partida continúe después de recargar o volver a abrir la aplicación, conservando el progreso y el marcador en el mismo navegador.

## ADDED Requirements

### Requirement: Guardado periódico del estado de la partida
El sistema SHALL guardar en el almacenamiento local una instantánea completa del estado de la partida al menos cada cinco segundos mientras la aplicación esté abierta y después de cada acción que lo cambie. La instantánea incluye tablero, turno, selección pendiente, puntajes, resultado y ganador.

#### Scenario: Guardar una partida en curso
- **WHEN** transcurren cinco segundos desde el último guardado mientras hay una partida en curso
- **THEN** el almacenamiento local contiene el estado actual, incluidas las casillas y la selección pendiente

#### Scenario: Guardar un cambio antes del siguiente intervalo
- **WHEN** una acción cambia el estado de la partida entre dos guardados periódicos
- **THEN** el almacenamiento local se actualiza con el nuevo estado sin esperar al siguiente intervalo

#### Scenario: Guardar una nueva partida
- **WHEN** el usuario inicia una nueva partida
- **THEN** el estado guardado refleja el tablero reiniciado y conserva los puntajes acumulados

### Requirement: Restauración de la última partida válida
Al iniciar la aplicación, el sistema SHALL restaurar la última instantánea válida disponible y mostrar el mismo progreso, turno, selección pendiente, puntajes y resultado que tenía al guardarse.

#### Scenario: Continuar una partida en curso
- **WHEN** existe una instantánea válida de una partida en curso al iniciar la aplicación
- **THEN** se muestra el tablero, turno, selección pendiente y puntajes guardados, y el usuario puede continuar jugando

#### Scenario: Restaurar una partida terminada
- **WHEN** existe una instantánea válida de una partida terminada al iniciar la aplicación
- **THEN** se muestra el resultado y marcador guardados y no se permiten más jugadas hasta iniciar una nueva partida

### Requirement: Recuperación ante datos inválidos o almacenamiento no disponible
El sistema SHALL iniciar una partida nueva si no hay una instantánea válida y SHALL mantener el juego utilizable si el almacenamiento local no puede leerse o escribirse.

#### Scenario: No hay una partida guardada
- **WHEN** se inicia la aplicación sin una instantánea guardada
- **THEN** se muestra una partida nueva con el tablero vacío y los valores iniciales

#### Scenario: La instantánea guardada no es válida
- **WHEN** se inicia la aplicación y los datos guardados están dañados o no corresponden a un estado válido del juego
- **THEN** se inicia una partida nueva sin interrumpir la aplicación

#### Scenario: No se puede acceder al almacenamiento local
- **WHEN** una lectura o escritura del almacenamiento local falla
- **THEN** la aplicación sigue permitiendo jugar y comunica que el progreso puede no conservarse al recargar
