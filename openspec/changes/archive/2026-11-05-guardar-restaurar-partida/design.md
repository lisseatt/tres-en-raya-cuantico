# Design

## Context

La aplicación de producción mantiene su estado en memoria dentro de `src/main.ts` y lo renderiza al inicializar la interfaz. Ese estado incluye una única selección pendiente; la línea ganadora se mantiene aparte y se calcula al completar una jugada. `src/logica.ts` y `test/logica.test.ts` cubren otro modelo y no están conectados a la interfaz actual. Véase `proposal.md` para la motivación y `specs/persistencia-partida/spec.md` para el contrato observable.

## Goals / Non-Goals

**Goals:**
- Restaurar el modelo que usa realmente la interfaz antes de su primer renderizado.
- Validar datos externos antes de usarlos como estado de juego.
- Informar al usuario si el guardado local no está disponible, sin impedir la partida.

**Non-Goals:**
- Conectar la interfaz al módulo de lógica independiente ni cambiar las reglas del juego.
- Sincronizar partidas entre dispositivos, añadir backend o persistir el foco del teclado.

## Decisions

- Persistir una instantánea JSON del estado de interfaz: tablero, turno, selección pendiente, ambos puntajes, indicador de partida terminada y ganador. Es el conjunto mínimo que permite reconstruir la partida existente; los elementos derivados de presentación, como la línea ganadora, se recalculan al restaurar.
- Cargar y validar la instantánea antes del render inicial. Rechazar estructura, valores o combinaciones incompatibles con el tablero y el resultado del juego y, en esos casos, usar el estado inicial. Esto evita que datos corruptos o antiguos bloqueen el arranque.
- Guardar al cambiar el estado y con un intervalo de cinco segundos, además del guardado inicial necesario para establecer la instantánea. El guardado inmediato reduce la pérdida de jugadas recientes; el intervalo cubre el requisito periódico.
- Tratar errores de lectura y escritura como degradación recuperable: continuar con el estado en memoria e informar en la interfaz que el progreso podría no conservarse. Evitar ocultar fallos de acceso al almacenamiento.

## Risks / Trade-offs

- `localStorage` puede no estar disponible o puede llenarse → aislar sus operaciones y mantener la partida en memoria con un aviso visible.
- Un intervalo periódico puede seguir activo tras cambios de vista de la aplicación → crear un único temporizador durante la inicialización de la interfaz.
- El modelo actual duplica parte de la lógica en `src/logica.ts` → probar el nuevo comportamiento contra el estado de interfaz real, sin asumir que las pruebas existentes cubren la aplicación.
