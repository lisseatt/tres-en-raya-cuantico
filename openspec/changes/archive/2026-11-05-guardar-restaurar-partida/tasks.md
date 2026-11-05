# Tasks

## 1. Persistencia y validación del estado

- [x] 1.1 Definir el tipo de instantánea persistida y una función que valide el estado completo antes de aceptarlo; cubrir tablero de nueve casillas, marcas, turno, selección pendiente libre, puntajes enteros no negativos y combinaciones coherentes de victoria/empate con pruebas unitarias en `test/persistencia.test.ts`, verificadas con `npm test -- test/persistencia.test.ts`.
- [x] 1.2 Implementar lectura y escritura JSON de la instantánea desde `localStorage`, distinguiendo ausencia, datos malformados y fallos de acceso/escritura; probar con almacenamiento simulado que los errores se devuelvan explícitamente sin lanzar ni descartar silenciosamente el fallo, y verificar con `npm test -- test/persistencia.test.ts`.

## 2. Restauración al iniciar la interfaz

- [x] 2.1 Cargar la última instantánea válida antes del primer render de `src/main.ts`, inicializando el estado vacío cuando no exista o sea inválida; añadir pruebas para partida sin guardado, partida en curso con selección pendiente y partida terminada, y verificar que `npm test -- test/persistencia.test.ts` pase.
- [x] 2.2 Reconstruir los datos visuales derivados del estado restaurado, incluida la línea ganadora y el resultado mostrado, sin volver a incrementar puntajes; verificar en navegador que una victoria restaurada conserva el marcador y bloquea nuevas jugadas hasta pulsar “Nueva partida”.

## 3. Guardado inmediato y periódico

- [x] 3.1 Guardar la instantánea después de cada transición de estado de `src/main.ts`: primera selección, cancelación de selección, resolución de turno o partida y reinicio; añadir pruebas que confirmen que cada acción persiste el tablero, turno, selección pendiente y puntajes actualizados.
- [x] 3.2 Configurar un único guardado periódico de cinco segundos durante la inicialización, además del guardado inicial y los guardados por cambio; probar el intervalo con temporizadores controlados y verificar que tras cinco segundos se persiste el estado más reciente sin crear temporizadores duplicados.

## 4. Degradación visible cuando falla el almacenamiento

- [x] 4.1 Mantener la partida jugable cuando falle la lectura o escritura y mostrar un aviso accesible de que el progreso podría no conservarse al recargar; probar fallos de lectura y escritura y verificar que el aviso se presenta sin interrumpir las acciones de juego.

## 5. Verificación integral

- [x] 5.1 Ejecutar `npm test` y `npm run build`; en navegador, verificar recarga durante una partida con selección pendiente, restauración de partida terminada, reinicio con puntajes conservados y continuidad del juego cuando `localStorage` no esté disponible.
