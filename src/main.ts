import './style.css';
import {
  COMBINACIONES_GANADORAS,
  guardarPartida,
  leerPartida,
  obtenerLineaGanadora,
  type EstadoGuardado,
  type Jugador,
} from './persistencia';

type EstadoJuego = EstadoGuardado;

let estado: EstadoJuego = {
  tablero: Array(9).fill(null),
  turno: 'X',
  seleccionPendiente: null,
  puntuacionX: 0,
  puntuacionO: 0,
  juegoTerminado: false,
  ganador: null,
};

let lineaGanadora: number[] = [];
let indiceFoco: number = 0;
let temporizadorPersistencia: number | null = null;
let falloPersistencia = false;

const raiz = document.querySelector<HTMLDivElement>('#app');

function inicializarEstructura(): void {
  if (!raiz) return;

  const lectura = leerPartida();
  if (lectura.estado === 'guardado') {
    estado = lectura.partida;
    if (estado.ganador === 'X' || estado.ganador === 'O') {
      lineaGanadora = obtenerLineaGanadora(estado.tablero, estado.ganador) ?? [];
    }
  } else if (lectura.estado === 'error') {
    falloPersistencia = true;
  }

  raiz.innerHTML = `
    <main class="juego">
      <header class="encabezado">
        <p class="sobre-titulo">EXPERIMENTO ACADÉMICO</p>
        <h1>Tres en Raya <span>Cuántico</span></h1>
        <p class="introduccion">Mecánica de doble selección por turno con resolución cuántica.</p>
      </header>

      <section class="marcador" aria-label="Marcador">
        <div class="jugador jugador-x" id="tarjeta-x">
          <span class="simbolo">X</span>
          <div class="datos-jugador">
            <strong>Jugador X</strong>
            <small id="puntaje-x">0 puntos</small>
          </div>
        </div>
        <span class="separador">:</span>
        <div class="jugador jugador-o" id="tarjeta-o">
          <span class="simbolo">O</span>
          <div class="datos-jugador">
            <strong>Jugador O</strong>
            <small id="puntaje-o">0 puntos</small>
          </div>
        </div>
      </section>

      <section class="partida">
        <div class="estado-partida" id="estado-partida" aria-live="polite">Turno del jugador X: Selecciona 2 casillas</div>
        <p class="aviso-persistencia" id="aviso-persistencia" role="status" aria-live="polite" hidden></p>
        
        <div class="tablero-marco" id="tablero-marco">
          <div class="tablero" id="tablero" role="group" aria-label="Tablero de tres por tres"></div>
          <svg class="rayo-victoria" aria-hidden="true" focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient
                id="gradiente-rayo"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="100"
                y2="100"
              >
                <stop offset="0%" stop-color="#65d9ec" />
                <stop offset="100%" stop-color="#ff83b5" />
              </linearGradient>
            </defs>
            <line id="rayo-ganador" x1="0" y1="0" x2="0" y2="0" />
          </svg>
        </div>

        <p class="ayuda-teclado">Movete con las flechas y elegí con Enter</p>
        <button class="boton-nueva" id="boton-nueva" type="button">Nueva partida</button>
      </section>

      <footer class="leyenda">
        <span><i class="punto punto-x"></i> Jugador X</span>
        <span><i class="punto punto-o"></i> Jugador O</span>
      </footer>
    </main>
  `;

  renderizarTablero();
  configurarEventosGlobales();
  persistirEstado();

  if (temporizadorPersistencia === null) {
    temporizadorPersistencia = window.setInterval(persistirEstado, 5000);
  }
  actualizarAvisoPersistencia();
}

function actualizarAvisoPersistencia(): void {
  const aviso = raiz?.querySelector<HTMLParagraphElement>('#aviso-persistencia');
  if (!aviso) return;

  aviso.hidden = !falloPersistencia;
  aviso.textContent = falloPersistencia
    ? 'No se pudo acceder al guardado local. El progreso podría no conservarse al recargar.'
    : '';
}

function persistirEstado(): void {
  const resultado = guardarPartida(estado);
  if (!resultado.guardado) {
    falloPersistencia = true;
    actualizarAvisoPersistencia();
  }
}

function renderizarTablero(): void {
  const tableroEl = raiz?.querySelector<HTMLDivElement>('#tablero');
  if (!tableroEl) return;

  tableroEl.innerHTML = '';

  estado.tablero.forEach((valor, indice) => {
    const casilla = document.createElement('button');
    casilla.className = 'casilla';
    casilla.setAttribute('type', 'button');
    casilla.setAttribute('data-indice', String(indice));
    casilla.setAttribute('role', 'gridcell');

    let ariaLabel = `Casilla ${indice + 1}`;

    if (valor) {
      casilla.classList.add(`marca-${valor.toLowerCase()}`);
      casilla.innerHTML = `<span>${valor}</span>`;
      casilla.setAttribute('disabled', 'true');
      ariaLabel += `, ocupada por ${valor}`;
    } else if (estado.seleccionPendiente === indice) {
      casilla.classList.add('pendiente');
      casilla.innerHTML = `<span>${estado.turno}</span>`;
      ariaLabel += `, selección pendiente de ${estado.turno}`;
    } else {
      casilla.innerHTML = `<span></span>`;
      ariaLabel += ', vacía';
    }

    if (lineaGanadora.includes(indice)) {
      casilla.classList.add('casilla-ganadora');
    }

    casilla.setAttribute('aria-label', ariaLabel);

    casilla.addEventListener('click', () => manejarAccionCasilla(indice));
    tableroEl.appendChild(casilla);
  });

  actualizarInterfazEstado();
}

function actualizarInterfazEstado(): void {
  const estadoEl = raiz?.querySelector<HTMLDivElement>('#estado-partida');
  const tarjetaX = raiz?.querySelector<HTMLDivElement>('#tarjeta-x');
  const tarjetaO = raiz?.querySelector<HTMLDivElement>('#tarjeta-o');
  const puntajeXEl = raiz?.querySelector<HTMLElement>('#puntaje-x');
  const puntajeOEl = raiz?.querySelector<HTMLElement>('#puntaje-o');

  if (puntajeXEl) puntajeXEl.textContent = `${estado.puntuacionX} puntos`;
  if (puntajeOEl) puntajeOEl.textContent = `${estado.puntuacionO} puntos`;

  tarjetaX?.classList.toggle('activo', estado.turno === 'X' && !estado.juegoTerminado);
  tarjetaO?.classList.toggle('activo', estado.turno === 'O' && !estado.juegoTerminado);

  if (!estadoEl) return;

  if (estado.juegoTerminado) {
    if (estado.ganador === 'Empate') {
      estadoEl.textContent = '¡Empate cuántico!';
      estadoEl.classList.add('resultado');
    } else {
      estadoEl.textContent = `¡Gana el jugador ${estado.ganador}!`;
      estadoEl.classList.add('resultado');
      dibujarRayoGanador();
    }
  } else {
    estadoEl.classList.remove('resultado');
    if (estado.seleccionPendiente === null) {
      estadoEl.textContent = `Turno del jugador ${estado.turno}: Selecciona la 1ª casilla`;
    } else {
      estadoEl.textContent = `Turno del jugador ${estado.turno}: Selecciona la 2ª casilla`;
    }
  }

  sincronizarFocoTeclado();
}

function manejarAccionCasilla(indice: number): void {
  if (estado.juegoTerminado || estado.tablero[indice] !== null) return;

  if (estado.seleccionPendiente === null) {
    estado.seleccionPendiente = indice;
    renderizarTablero();
    persistirEstado();
  } else if (estado.seleccionPendiente === indice) {
    estado.seleccionPendiente = null;
    renderizarTablero();
    persistirEstado();
  } else {
    const casilla1 = estado.seleccionPendiente;
    const casilla2 = indice;
    estado.seleccionPendiente = null;

    estado.tablero[casilla1] = estado.turno;
    estado.tablero[casilla2] = estado.turno;

    const ganadorActual = verificarGanador();
    if (ganadorActual) {
      estado.juegoTerminado = true;
      estado.ganador = ganadorActual;
      if (ganadorActual === 'X') estado.puntuacionX++;
      if (ganadorActual === 'O') estado.puntuacionO++;
    } else if (estado.tablero.every((v) => v !== null)) {
      estado.juegoTerminado = true;
      estado.ganador = 'Empate';
    } else {
      estado.turno = estado.turno === 'X' ? 'O' : 'X';
    }

    renderizarTablero();
    persistirEstado();
  }
}

function verificarGanador(): Jugador | null {
  for (const comb of COMBINACIONES_GANADORAS) {
    const [a, b, c] = comb;
    if (
      estado.tablero[a] &&
      estado.tablero[a] === estado.tablero[b] &&
      estado.tablero[a] === estado.tablero[c]
    ) {
      lineaGanadora = [...comb];
      return estado.tablero[a];
    }
  }
  return null;
}

function dibujarRayoGanador(): void {
  if (lineaGanadora.length !== 3) return;

  const rayo = raiz?.querySelector<SVGLineElement>('#rayo-ganador');
  if (!rayo) return;

  const centros = [16.5, 50, 83.5];
  const primerIndice = lineaGanadora[0];
  const ultimoIndice = lineaGanadora[2];
  const x1 = centros[primerIndice % 3];
  const y1 = centros[Math.floor(primerIndice / 3)];
  const x2 = centros[ultimoIndice % 3];
  const y2 = centros[Math.floor(ultimoIndice / 3)];

  rayo.setAttribute('x1', String(x1));
  rayo.setAttribute('y1', String(y1));
  rayo.setAttribute('x2', String(x2));
  rayo.setAttribute('y2', String(y2));
}

function reiniciarPartida(): void {
  estado.tablero = Array(9).fill(null);
  estado.turno = 'X';
  estado.seleccionPendiente = null;
  estado.juegoTerminado = false;
  estado.ganador = null;
  lineaGanadora = [];

  const rayo = raiz?.querySelector<SVGLineElement>('#rayo-ganador');
  if (rayo) {
    rayo.setAttribute('x1', '0');
    rayo.setAttribute('y1', '0');
    rayo.setAttribute('x2', '0');
    rayo.setAttribute('y2', '0');
  }

  renderizarTablero();
  persistirEstado();
}

function sincronizarFocoTeclado(): void {
  const tableroEl = raiz?.querySelector<HTMLDivElement>('#tablero');
  if (!tableroEl) return;
  const botones = tableroEl.querySelectorAll<HTMLButtonElement>('button');
  botones.forEach((btn, idx) => {
    if (idx === indiceFoco) {
      btn.setAttribute('tabindex', '0');
    } else {
      btn.setAttribute('tabindex', '-1');
    }
  });
}

function configurarEventosGlobales(): void {
  const botonNueva = raiz?.querySelector<HTMLButtonElement>('#boton-nueva');
  botonNueva?.addEventListener('click', reiniciarPartida);

  document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      if (e.key === 'ArrowUp') indiceFoco = (indiceFoco + 6) % 9;
      if (e.key === 'ArrowDown') indiceFoco = (indiceFoco + 3) % 9;
      if (e.key === 'ArrowLeft') indiceFoco = (indiceFoco + 8) % 9;
      if (e.key === 'ArrowRight') indiceFoco = (indiceFoco + 1) % 9;

      const tableroEl = raiz?.querySelector<HTMLDivElement>('#tablero');
      const botonActual = tableroEl?.querySelectorAll<HTMLButtonElement>('button')[indiceFoco];
      botonActual?.focus();
    }

    if (e.key === 'Enter') {
      const tableroEl = raiz?.querySelector<HTMLDivElement>('#tablero');
      const botonActual = tableroEl?.querySelectorAll<HTMLButtonElement>('button')[indiceFoco];
      if (botonActual && !botonActual.disabled) {
        manejarAccionCasilla(indiceFoco);
      }
    }
  });
}

inicializarEstructura();