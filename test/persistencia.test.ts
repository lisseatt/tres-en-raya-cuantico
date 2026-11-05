import { describe, expect, it } from "vitest";
import {
  CLAVE_PARTIDA,
  esEstadoGuardadoValido,
  guardarPartida,
  leerPartida,
  type Almacenamiento,
  type EstadoGuardado,
} from "../src/persistencia";

function crearAlmacenamiento(valorInicial: string | null = null): Almacenamiento & {
  valor: string | null;
} {
  return {
    valor: valorInicial,
    getItem() {
      return this.valor;
    },
    setItem(_clave, valor) {
      this.valor = valor;
    },
  };
}

function crearPartida(parcial: Partial<EstadoGuardado> = {}): EstadoGuardado {
  return {
    tablero: Array(9).fill(null),
    turno: "X",
    seleccionPendiente: null,
    puntuacionX: 0,
    puntuacionO: 0,
    juegoTerminado: false,
    ganador: null,
    ...parcial,
  };
}

describe("persistencia de la partida", () => {
  it("valida el estado inicial, un turno en curso y una selección pendiente", () => {
    expect(esEstadoGuardadoValido(crearPartida())).toBe(true);
    expect(
      esEstadoGuardadoValido(
        crearPartida({
          tablero: ["X", "X", null, null, null, null, null, null, null],
          turno: "O",
          seleccionPendiente: 2,
        }),
      ),
    ).toBe(true);
  });

  it("valida una victoria completa sin volver a depender del turno siguiente", () => {
    expect(
      esEstadoGuardadoValido(
        crearPartida({
          tablero: ["X", "X", "X", "O", "O", null, null, "X", null],
          turno: "X",
          puntuacionX: 1,
          juegoTerminado: true,
          ganador: "X",
        }),
      ),
    ).toBe(true);
  });

  it.each([
    ["tablero de tamaño incorrecto", crearPartida({ tablero: Array(8).fill(null) })],
    ["selección ocupada", crearPartida({ tablero: ["X", null, null, null, null, null, null, null, null], seleccionPendiente: 0 })],
    ["puntaje negativo", crearPartida({ puntuacionX: -1 })],
    [
      "marcas incompatibles con el turno",
      crearPartida({ tablero: ["X", "X", null, null, null, null, null, null, null] }),
    ],
    ["ganador en partida activa", crearPartida({ ganador: "X" })],
    [
      "victoria sin línea",
      crearPartida({ tablero: ["X", "X", null, "O", "O", null, null, null, null], turno: "X", juegoTerminado: true, ganador: "X" }),
    ],
    [
      "línea ganadora en partida activa",
      crearPartida({ tablero: ["X", "X", "X", null, null, null, null, null, null] }),
    ],
  ])("rechaza %s", (_nombre, partida) => {
    expect(esEstadoGuardadoValido(partida)).toBe(false);
  });

  it("rechaza marcas que no pertenecen a los jugadores", () => {
    const partida: unknown = {
      ...crearPartida(),
      tablero: ["Q", null, null, null, null, null, null, null, null],
    };

    expect(esEstadoGuardadoValido(partida)).toBe(false);
  });

  it("lee una instantánea válida y distingue una partida ausente", () => {
    const partida = crearPartida({
      tablero: ["X", "X", null, null, null, null, null, null, null],
      turno: "O",
      seleccionPendiente: 2,
      puntuacionX: 1,
    });
    const almacenamiento = crearAlmacenamiento(JSON.stringify(partida));

    expect(leerPartida(almacenamiento)).toEqual({ estado: "guardado", partida });
    expect(leerPartida(crearAlmacenamiento())).toEqual({ estado: "vacio" });
  });

  it("restaura una partida terminada sin modificar el marcador", () => {
    const partida = crearPartida({
      tablero: ["X", "X", "X", "O", "O", null, null, "X", null],
      turno: "X",
      puntuacionX: 1,
      juegoTerminado: true,
      ganador: "X",
    });

    expect(leerPartida(crearAlmacenamiento(JSON.stringify(partida)))).toEqual({
      estado: "guardado",
      partida,
    });
  });

  it.each(["{", JSON.stringify({ ...crearPartida(), turno: "Z" })])(
    "rechaza datos guardados malformados o inválidos",
    (valor) => {
      expect(leerPartida(crearAlmacenamiento(valor))).toEqual({ estado: "invalido" });
    },
  );

  it("guarda y vuelve a leer el estado completo bajo la clave de la aplicación", () => {
    const partida = crearPartida({
      tablero: ["X", "X", null, null, null, null, null, null, null],
      turno: "O",
      seleccionPendiente: 2,
      puntuacionX: 2,
    });
    const almacenamiento = crearAlmacenamiento();

    expect(guardarPartida(partida, almacenamiento)).toEqual({ guardado: true });
    expect(CLAVE_PARTIDA).toBe("tres-en-raya-cuantico:partida:v1");
    expect(leerPartida(almacenamiento)).toEqual({ estado: "guardado", partida });
  });

  it("devuelve explícitamente errores de lectura y escritura", () => {
    const errorLectura = new Error("lectura denegada");
    const errorEscritura = new Error("cuota excedida");
    const almacenamientoLectura = {
      getItem() {
        throw errorLectura;
      },
      setItem() {},
    };
    const almacenamientoEscritura = {
      getItem() {
        return null;
      },
      setItem() {
        throw errorEscritura;
      },
    };

    expect(leerPartida(almacenamientoLectura)).toEqual({ estado: "error", error: errorLectura });
    expect(guardarPartida(crearPartida(), almacenamientoEscritura)).toEqual({
      guardado: false,
      error: errorEscritura,
    });
  });
});
