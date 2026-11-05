export type Jugador = "X" | "O";

export interface EstadoGuardado {
  tablero: (Jugador | null)[];
  turno: Jugador;
  seleccionPendiente: number | null;
  puntuacionX: number;
  puntuacionO: number;
  juegoTerminado: boolean;
  ganador: Jugador | "Empate" | null;
}

export interface Almacenamiento {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

export type ResultadoLectura =
  | { estado: "guardado"; partida: EstadoGuardado }
  | { estado: "vacio" | "invalido" }
  | { estado: "error"; error: unknown };

export type ResultadoEscritura =
  | { guardado: true }
  | { guardado: false; error: unknown };

export const CLAVE_PARTIDA = "tres-en-raya-cuantico:partida:v1";

export const COMBINACIONES_GANADORAS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function obtenerLineaGanadora(
  tablero: EstadoGuardado["tablero"],
  jugador: Jugador,
): number[] | null {
  for (const combinacion of COMBINACIONES_GANADORAS) {
    if (combinacion.every((indice) => tablero[indice] === jugador)) {
      return [...combinacion];
    }
  }
  return null;
}

export function esEstadoGuardadoValido(valor: unknown): valor is EstadoGuardado {
  if (!esRegistro(valor)) return false;

  const campos = [
    "tablero",
    "turno",
    "seleccionPendiente",
    "puntuacionX",
    "puntuacionO",
    "juegoTerminado",
    "ganador",
  ];
  if (
    Object.keys(valor).length !== campos.length ||
    !campos.every((campo) => Object.hasOwn(valor, campo))
  ) {
    return false;
  }

  const tablero = valor.tablero;
  const turno = valor.turno;
  const seleccionPendiente = valor.seleccionPendiente;
  const ganador = valor.ganador;
  const juegoTerminado = valor.juegoTerminado;
  const seleccionValida =
    seleccionPendiente === null ||
    (typeof seleccionPendiente === "number" &&
      Number.isInteger(seleccionPendiente) &&
      seleccionPendiente >= 0 &&
      seleccionPendiente < 9);

  if (
    !Array.isArray(tablero) ||
    tablero.length !== 9 ||
    !tablero.every((casilla) => casilla === null || casilla === "X" || casilla === "O") ||
    (turno !== "X" && turno !== "O") ||
    !seleccionValida ||
    (typeof seleccionPendiente === "number" && tablero[seleccionPendiente] !== null) ||
    typeof valor.puntuacionX !== "number" ||
    !Number.isInteger(valor.puntuacionX) ||
    valor.puntuacionX < 0 ||
    typeof valor.puntuacionO !== "number" ||
    !Number.isInteger(valor.puntuacionO) ||
    valor.puntuacionO < 0 ||
    typeof juegoTerminado !== "boolean" ||
    (ganador !== null && ganador !== "X" && ganador !== "O" && ganador !== "Empate")
  ) {
    return false;
  }

  const cantidadX = tablero.filter((casilla) => casilla === "X").length;
  const cantidadO = tablero.filter((casilla) => casilla === "O").length;
  const lineaX = obtenerLineaGanadora(tablero, "X");
  const lineaO = obtenerLineaGanadora(tablero, "O");

  if (!juegoTerminado) {
    return (
      ganador === null &&
      lineaX === null &&
      lineaO === null &&
      (turno === "X" ? cantidadX === cantidadO : cantidadX === cantidadO + 2)
    );
  }

  if (seleccionPendiente !== null || ganador === null) return false;
  if (ganador === "Empate") {
    return tablero.every((casilla) => casilla !== null) && lineaX === null && lineaO === null;
  }

  return (
    ganador === turno &&
    (ganador === "X"
      ? lineaX !== null && lineaO === null && cantidadX === cantidadO + 2
      : lineaO !== null && lineaX === null && cantidadX === cantidadO)
  );
}

export function leerPartida(almacenamiento?: Almacenamiento): ResultadoLectura {
  let valor: string | null;
  try {
    const destino = almacenamiento ?? window.localStorage;
    valor = destino.getItem(CLAVE_PARTIDA);
  } catch (error) {
    return { estado: "error", error };
  }

  if (valor === null) return { estado: "vacio" };

  let partida: unknown;
  try {
    partida = JSON.parse(valor);
  } catch (error) {
    if (error instanceof SyntaxError) return { estado: "invalido" };
    return { estado: "error", error };
  }

  if (!esEstadoGuardadoValido(partida)) return { estado: "invalido" };
  return { estado: "guardado", partida };
}

export function guardarPartida(
  partida: EstadoGuardado,
  almacenamiento?: Almacenamiento,
): ResultadoEscritura {
  if (!esEstadoGuardadoValido(partida)) {
    return { guardado: false, error: new Error("El estado de la partida no es válido.") };
  }

  try {
    const destino = almacenamiento ?? window.localStorage;
    destino.setItem(CLAVE_PARTIDA, JSON.stringify(partida));
    return { guardado: true };
  } catch (error) {
    return { guardado: false, error };
  }
}
