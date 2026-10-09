export const CONFIG = {
  filas: 3, // unidad: filas
  columnas: 3, // unidad: columnas
  marcasPorTurno: 2, // unidad: marcas por turno
  puntosPorVictoria: 1, // unidad: puntos por victoria
  puntosIniciales: 0, // unidad: puntos por jugador al comenzar
  indiceInicial: 0, // unidad: índice de casilla
  pasoIndice: 1, // unidad: posiciones entre casillas consecutivas
} as const;

export type Jugador = "X" | "O";
export type Casilla = Jugador | null;
export type Tablero = Casilla[];
export type ResultadoPartida = "en-curso" | "victoria" | "empate";

export interface EstadoJuego {
  tablero: Tablero;
  turnoActual: Jugador;
  marcasPendientes: number[];
  puntos: Record<Jugador, number>;
  resultado: ResultadoPartida;
  ganador: Jugador | null;
}

const cantidadCasillas = CONFIG.filas * CONFIG.columnas;

export function crearEstadoInicial(): EstadoJuego {
  return {
    tablero: Array.from({ length: cantidadCasillas }, () => null),
    turnoActual: "X",
    marcasPendientes: [],
    puntos: {
      X: CONFIG.puntosIniciales,
      O: CONFIG.puntosIniciales,
    },
    resultado: "en-curso",
    ganador: null,
  };
}

export function seleccionarCasilla(estado: EstadoJuego, indice: number): boolean {
  if (
    estado.resultado !== "en-curso" ||
    !Number.isInteger(indice) ||
    indice < CONFIG.indiceInicial ||
    indice >= cantidadCasillas ||
    estado.tablero[indice] !== null ||
    estado.marcasPendientes.includes(indice)
  ) {
    return false;
  }

  const casillasLibres = estado.tablero.filter((casilla) => casilla === null).length;
  if (casillasLibres < CONFIG.marcasPorTurno) {
    return false;
  }

  estado.marcasPendientes.push(indice);
  if (estado.marcasPendientes.length < CONFIG.marcasPorTurno) {
    return true;
  }

  for (const casilla of estado.marcasPendientes) {
    estado.tablero[casilla] = estado.turnoActual;
  }
  estado.marcasPendientes = [];

  if (hayTresEnLinea(estado.tablero, estado.turnoActual)) {
    estado.resultado = "victoria";
    estado.ganador = estado.turnoActual;
    estado.puntos[estado.turnoActual] += CONFIG.puntosPorVictoria;
    return true;
  }

  const espaciosRestantes = estado.tablero.filter((casilla) => casilla === null).length;
  if (espaciosRestantes < CONFIG.marcasPorTurno) {
    estado.resultado = "empate";
    return true;
  }

  estado.turnoActual = estado.turnoActual === "X" ? "O" : "X";
  return true;
}

export function iniciarNuevaPartida(estado: EstadoJuego): boolean {
  estado.tablero = Array.from({ length: cantidadCasillas }, () => null);
  estado.turnoActual = "X";
  estado.marcasPendientes = [];
  estado.resultado = "en-curso";
  estado.ganador = null;
  return true;
}

export function hayTresEnLinea(tablero: Tablero, jugador: Jugador): boolean {
  for (let fila = CONFIG.indiceInicial; fila < CONFIG.filas; fila += CONFIG.pasoIndice) {
    const inicioFila = fila * CONFIG.columnas;
    if (
      tablero[inicioFila] === jugador &&
      tablero[inicioFila + CONFIG.pasoIndice] === jugador &&
      tablero[inicioFila + CONFIG.columnas - CONFIG.pasoIndice] === jugador
    ) {
      return true;
    }
  }

  for (
    let columna = CONFIG.indiceInicial;
    columna < CONFIG.columnas;
    columna += CONFIG.pasoIndice
  ) {
    if (
      tablero[columna] === jugador &&
      tablero[columna + CONFIG.columnas] === jugador &&
      tablero[columna + CONFIG.columnas * (CONFIG.filas - CONFIG.pasoIndice)] === jugador
    ) {
      return true;
    }
  }

  const centro = CONFIG.columnas + CONFIG.pasoIndice;
  return (
    (tablero[CONFIG.indiceInicial] === jugador &&
      tablero[centro] === jugador &&
      tablero[cantidadCasillas - CONFIG.pasoIndice] === jugador) ||
    (tablero[CONFIG.columnas - CONFIG.pasoIndice] === jugador &&
      tablero[centro] === jugador &&
      tablero[cantidadCasillas - CONFIG.columnas] === jugador)
  );
}