# Proposal

## Why

Al recargar o volver a abrir el juego se pierde la partida en curso porque el estado solo existe en memoria. Guardarlo localmente permitirá continuar desde el mismo tablero y conservar el marcador sin añadir un servicio remoto.

## What Changes

- Guardar periódicamente el estado actual de la partida en el almacenamiento local del navegador.
- Restaurar el último estado válido al iniciar la aplicación.
- Mantener el juego disponible cuando no exista un estado guardado o no se pueda leer.
- Persistir también el estado resultante de iniciar una nueva partida para que una recarga no recupere el tablero anterior.

## Capabilities

### New Capabilities
- `persistencia-partida`: guardar y restaurar el estado de la partida entre sesiones del navegador.

### Modified Capabilities

## Impact

- Aplicación del navegador en `src/main.ts` y pruebas relacionadas con el estado del juego.
- Usa `localStorage` del navegador; no requiere backend ni dependencias nuevas.
