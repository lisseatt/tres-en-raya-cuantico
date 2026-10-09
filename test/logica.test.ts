import { describe, expect, it } from "vitest";
import {
  crearEstadoInicial,
  hayTresEnLinea,
  iniciarNuevaPartida,
  seleccionarCasilla,
  type EstadoJuego,
} from "../src/logica";

function jugarTurno(estado: EstadoJuego, primera: number, segunda: number): void {
  expect(seleccionarCasilla(estado, primera)).toBe(true);
  expect(seleccionarCasilla(estado, segunda)).toBe(true);
}

describe("La lógica de Tres en Raya Cuántico", () => {
  it("crea un tablero vacío con X al turno y el marcador en cero", () => {
    expect(crearEstadoInicial()).toEqual({
      tablero: Array(9).fill(null),
      turnoActual: "X",
      marcasPendientes: [],
      puntos: { X: 0, O: 0 },
      resultado: "en-curso",
      ganador: null,
    });
  });

  it("acepta dos casillas válidas, coloca las marcas y cambia el turno", () => {
    const estado = crearEstadoInicial();

    expect(seleccionarCasilla(estado, 0)).toBe(true);
    expect(estado.tablero).toEqual(Array(9).fill(null));
    expect(estado.marcasPendientes).toEqual([0]);

    expect(seleccionarCasilla(estado, 4)).toBe(true);
    expect(estado.tablero[0]).toBe("X");
    expect(estado.tablero[4]).toBe("X");
    expect(estado.marcasPendientes).toEqual([]);
    expect(estado.turnoActual).toBe("O");
  });

  it("rechaza una casilla repetida, ocupada o fuera del tablero", () => {
    const estado = crearEstadoInicial();

    expect(seleccionarCasilla(estado, 0)).toBe(true);
    expect(seleccionarCasilla(estado, 0)).toBe(false);
    expect(seleccionarCasilla(estado, -1)).toBe(false);
    expect(seleccionarCasilla(estado, 9)).toBe(false);
    expect(seleccionarCasilla(estado, 4)).toBe(true);
    expect(seleccionarCasilla(estado, 0)).toBe(false);
    expect(estado.tablero[0]).toBe("X");
  });

  it.each([
    ["horizontal", ["X", "X", "X", null, null, null, null, null, null]],
    ["vertical", ["O", null, null, "O", null, null, "O", null, null]],
    ["diagonal", ["X", null, null, null, "X", null, null, null, "X"]],
    ["diagonal inversa", [null, null, "O", null, "O", null, "O", null, null]],
  ] as const)("reconoce una línea ganadora %s", (_tipo, tablero) => {
    const jugador = tablero.find((casilla) => casilla !== null);

    expect(jugador).not.toBeNull();
    expect(hayTresEnLinea([...tablero], jugador!)).toBe(true);
  });

  it("termina mal en empate cuando ya no hay espacio para otro par de marcas", () => {
    const estado = crearEstadoInicial();

    jugarTurno(estado, 0, 1);
    jugarTurno(estado, 3, 4);
    jugarTurno(estado, 6, 7);
    jugarTurno(estado, 2, 8);

    expect(estado.tablero).toEqual(["X", "X", "O", "O", "O", null, "X", "X", "O"]);
    expect(estado.resultado).toBe("empate");
    expect(estado.ganador).toBeNull();
    expect(seleccionarCasilla(estado, 5)).toBe(false);
  });

  it("reinicia el tablero y conserva los puntos acumulados", () => {
    const estado = crearEstadoInicial();

    jugarTurno(estado, 0, 1);
    jugarTurno(estado, 3, 4);
    jugarTurno(estado, 2, 8);
    expect(estado.puntos.X).toBe(1);

    expect(iniciarNuevaPartida(estado)).toBe(true);
    expect(estado.tablero).toEqual(Array(9).fill(null));
    expect(estado.turnoActual).toBe("X");
    expect(estado.marcasPendientes).toEqual([]);
    expect(estado.resultado).toBe("en-curso");
    expect(estado.ganador).toBeNull();
    expect(estado.puntos).toEqual({ X: 1, O: 0 });
  });

  it("permite jugar una partida completa hasta que X logra la victoria", () => {
    const estado = crearEstadoInicial();

    jugarTurno(estado, 0, 1);
    jugarTurno(estado, 3, 4);
    jugarTurno(estado, 2, 8);

    expect(estado.tablero).toEqual(["X", "X", "X", "O", "O", null, null, null, "X"]);
    expect(estado.resultado).toBe("victoria");
    expect(estado.ganador).toBe("X");
    expect(estado.puntos).toEqual({ X: 1, O: 0 });
    expect(seleccionarCasilla(estado, 5)).toBe(false);
  });
});
