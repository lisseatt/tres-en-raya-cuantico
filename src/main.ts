import "./style.css";
import {
  CONFIG,
  crearEstadoInicial,
  iniciarNuevaPartida,
  seleccionarCasilla,
} from "./logica";

const raiz = document.querySelector<HTMLDivElement>("#app");

if (!raiz) {
  throw new Error("No se encontró el contenedor principal del juego.");
}

const estado = crearEstadoInicial();
let casillaEnfocada = 0;

raiz.innerHTML = `
  <main class="juego">
    <header class="encabezado">
      <p class="sobre-titulo">UN CLÁSICO CON UN GIRO</p>
      <h1>Tres en Raya <span>Cuántico</span></h1>
      <p class="introduccion">Elegí dos casillas por turno y encontrá tu línea ganadora.</p>
    </header>

    <section class="marcador" aria-label="Puntaje de la partida">
      <div class="jugador jugador-x" id="marcador-x"></div>
      <div class="separador" aria-hidden="true">:</div>
      <div class="jugador jugador-o" id="marcador-o"></div>
    </section>

    <section class="partida" aria-label="Partida">
      <p class="estado-partida" id="estado-partida" aria-live="polite"></p>
      <div class="tablero" id="tablero" role="group" aria-label="Tablero de tres por tres"></div>
      <p class="ayuda-teclado">Movete con las flechas y elegí con Enter</p>
      <button class="boton-nueva" id="boton-nueva" type="button">Nueva partida</button>
    </section>

    <footer class="leyenda" aria-label="Jugadores">
      <span><i class="punto punto-x" aria-hidden="true"></i>Jugador X</span>
      <span><i class="punto punto-o" aria-hidden="true"></i>Jugador O</span>
    </footer>
  </main>
`;

const tablero = raiz.querySelector<HTMLDivElement>("#tablero")!;
const mensaje = raiz.querySelector<HTMLParagraphElement>("#estado-partida")!;
const marcadorX = raiz.querySelector<HTMLDivElement>("#marcador-x")!;
const marcadorO = raiz.querySelector<HTMLDivElement>("#marcador-o")!;
const botonNueva = raiz.querySelector<HTMLButtonElement>("#boton-nueva")!;

function actualizarInterfaz(restaurarFoco = false): void {
  marcadorX.innerHTML = `<span class="simbolo">X</span><span class="datos-jugador"><strong>Jugador X</strong><small>${estado.puntos.X} ${estado.puntos.X === 1 ? "punto" : "puntos"}</small></span>`;
  marcadorO.innerHTML = `<span class="simbolo">O</span><span class="datos-jugador"><strong>Jugador O</strong><small>${estado.puntos.O} ${estado.puntos.O === 1 ? "punto" : "puntos"}</small></span>`;
  marcadorX.classList.toggle("activo", estado.resultado === "en-curso" && estado.turnoActual === "X");
  marcadorO.classList.toggle("activo", estado.resultado === "en-curso" && estado.turnoActual === "O");

  if (estado.resultado === "victoria") {
    mensaje.textContent = `¡Gana el jugador ${estado.ganador}!`;
    mensaje.className = "estado-partida resultado";
  } else if (estado.resultado === "empate") {
    mensaje.textContent = "¡Empate! No quedan movimientos posibles.";
    mensaje.className = "estado-partida resultado";
  } else {
    const cantidadPendiente = estado.marcasPendientes.length;
    mensaje.textContent = `Turno del jugador ${estado.turnoActual} · Elegí ${cantidadPendiente === 0 ? "2 casillas" : "1 casilla más"}`;
    mensaje.className = "estado-partida";
  }

  tablero.innerHTML = estado.tablero
    .map((jugador, indice) => {
      const pendiente = estado.marcasPendientes.includes(indice);
      const marca = jugador ?? (pendiente ? estado.turnoActual : "");
      const clases = [
        "casilla",
        marca ? `marca-${marca.toLowerCase()}` : "",
        pendiente ? "pendiente" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const descripcion = jugador
        ? `Casilla ${indice + 1}, jugador ${jugador}`
        : pendiente
          ? `Casilla ${indice + 1}, marca doble pendiente del jugador ${estado.turnoActual}`
          : `Casilla ${indice + 1}, vacía`;

      return `<button class="${clases}" type="button" data-indice="${indice}" aria-label="${descripcion}" aria-pressed="${pendiente}" ${estado.resultado !== "en-curso" ? "disabled" : ""}>${marca ? `<span aria-hidden="true">${marca}</span>` : ""}${pendiente ? '<small class="etiqueta-pendiente">DOBLE</small>' : ""}</button>`;
    })
    .join("");

  if (restaurarFoco) {
    tablero.querySelector<HTMLButtonElement>(`[data-indice="${casillaEnfocada}"]`)?.focus();
  }
}

tablero.addEventListener("click", (evento: MouseEvent) => {
  const objetivo = evento.target;
  if (!(objetivo instanceof Element)) return;

  const casilla = objetivo.closest<HTMLButtonElement>("[data-indice]");
  if (!casilla) return;

  casillaEnfocada = Number(casilla.dataset.indice);
  if (seleccionarCasilla(estado, casillaEnfocada)) {
    actualizarInterfaz(true);
  }
});

tablero.addEventListener("keydown", (evento: KeyboardEvent) => {
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evento.key)) return;

  const objetivo = evento.target;
  if (!(objetivo instanceof HTMLButtonElement)) return;

  const indice = Number(objetivo.dataset.indice);
  const fila = Math.floor(indice / CONFIG.columnas);
  const columna = indice % CONFIG.columnas;
  let siguienteIndice = indice;

  if (evento.key === "ArrowUp" && fila > 0) siguienteIndice -= CONFIG.columnas;
  if (evento.key === "ArrowDown" && fila < CONFIG.filas - 1) siguienteIndice += CONFIG.columnas;
  if (evento.key === "ArrowLeft" && columna > 0) siguienteIndice -= 1;
  if (evento.key === "ArrowRight" && columna < CONFIG.columnas - 1) siguienteIndice += 1;

  if (siguienteIndice !== indice) {
    evento.preventDefault();
    casillaEnfocada = siguienteIndice;
    tablero.querySelector<HTMLButtonElement>(`[data-indice="${siguienteIndice}"]`)?.focus();
  }
});

botonNueva.addEventListener("click", () => {
  iniciarNuevaPartida(estado);
  casillaEnfocada = 0;
  actualizarInterfaz();
  tablero.querySelector<HTMLButtonElement>('[data-indice="0"]')?.focus();
});

actualizarInterfaz();
