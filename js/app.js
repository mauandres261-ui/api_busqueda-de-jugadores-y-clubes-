"use strict";

const API = {
  equipos: "https://www.thesportsdb.com/api/v1/json/123/searchteams.php",
  plantilla: "https://www.thesportsdb.com/api/v1/json/123/lookup_all_players.php",
  jugadores: "https://www.thesportsdb.com/api/v1/json/123/searchplayers.php"
};

const FOTO_KEY = "cancha-data-kendrick-franco-photo";
const campos = {
  formulario: document.querySelector("#search-form"),
  busqueda: document.querySelector("#team-query"),
  etiqueta: document.querySelector("#search-label"),
  modos: document.querySelectorAll('input[name="search-mode"]'),
  boton: document.querySelector("#search-button"),
  mensaje: document.querySelector("#message"),
  lista: document.querySelector("#player-list"),
  cantidad: document.querySelector("#result-count"),
  estado: document.querySelector("#connection-label"),
  punto: document.querySelector("#connection-dot"),
  titulo: document.querySelector("#results-title")
};

let busquedaActual = 0;

function obtenerFotoGuardada() {
  try {
    return localStorage.getItem(FOTO_KEY) || "";
  } catch {
    return "";
  }
}

const jugadorPersonalizado = {
  strPlayer: "Kendrick Franco",
  strTeam: "Real Benito Camelas",
  strPosition: "Lateral derecho",
  strNationality: "Venezuela",
  strStatus: "Active",
  strCutout: obtenerFotoGuardada(),
  isCustom: true
};

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function mostrarMensaje(texto = "", esError = false) {
  campos.mensaje.textContent = texto;
  campos.mensaje.className = esError ? "error" : "";
}

function mostrarConexion(texto, conectada) {
  campos.estado.textContent = texto;
  campos.punto.classList.toggle("online", conectada);
}

async function pedirDatos(endpoint, parametro, valor) {
  const url = new URL(endpoint);
  url.searchParams.set(parametro, valor);
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`La API respondió con error ${respuesta.status}.`);
  }

  return respuesta.json();
}

function crearFoto(jugador, marco, iniciales) {
  const imagen = document.createElement("img");
  imagen.src = jugador.strCutout || jugador.strThumb;
  imagen.alt = `Foto de ${jugador.strPlayer || "jugador"}`;
  imagen.loading = "lazy";
  imagen.addEventListener("error", () => {
    if (imagen.parentElement === marco) marco.textContent = iniciales;
  });
  marco.replaceChildren(imagen);
}

function agregarSelectorDeFoto(jugador, marco, iniciales, detalles) {
  const etiqueta = document.createElement("label");
  etiqueta.className = "photo-picker";
  etiqueta.append(document.createTextNode(jugador.strCutout?.startsWith("data:image/") ? "Cambiar foto" : "Subir foto"));

  const selector = document.createElement("input");
  selector.type = "file";
  selector.accept = "image/jpeg,image/png,image/webp";
  selector.setAttribute("aria-label", `Subir foto de ${jugador.strPlayer}`);
  selector.addEventListener("change", () => {
    const archivo = selector.files?.[0];
    if (!archivo) return;

    if (archivo.size > 2 * 1024 * 1024) {
      mostrarMensaje("La foto debe pesar menos de 2 MB.", true);
      selector.value = "";
      return;
    }

    const lector = new FileReader();
    lector.addEventListener("load", () => {
      try {
        jugador.strCutout = String(lector.result);
        localStorage.setItem(FOTO_KEY, jugador.strCutout);
        crearFoto(jugador, marco, iniciales);
        etiqueta.firstChild.textContent = "Cambiar foto";
        mostrarMensaje("Foto guardada en este navegador.");
      } catch {
        mostrarMensaje("No se pudo guardar la foto en este navegador.", true);
      }
    });
    lector.readAsDataURL(archivo);
  });

  etiqueta.append(selector);
  detalles.append(etiqueta);
}

function crearTarjeta(jugador, mostrarEquipo) {
  const tarjeta = document.createElement("article");
  tarjeta.className = jugador.isCustom ? "player custom-player" : "player";

  const marco = document.createElement("div");
  marco.className = jugador.isCustom ? "player-photo custom-photo" : "player-photo";
  const iniciales = (jugador.strPlayer || "?").split(/\s+/).map((parte) => parte[0]).slice(0, 2).join("").toUpperCase();
  marco.textContent = iniciales;
  if (jugador.strCutout || jugador.strThumb) crearFoto(jugador, marco, iniciales);

  const detalles = document.createElement("div");
  const nombre = document.createElement("h3");
  nombre.textContent = jugador.strPlayer || "Jugador sin nombre";
  const posicion = document.createElement("span");
  posicion.className = "position";
  posicion.textContent = jugador.strPosition || "Posición no disponible";
  const pais = document.createElement("p");
  pais.className = "nationality";
  pais.textContent = jugador.strNationality || "Nacionalidad no disponible";
  detalles.append(nombre, posicion, pais);

  if (jugador.isCustom) {
    if (mostrarEquipo) {
      const origen = document.createElement("p");
      origen.className = "nationality";
      origen.textContent = "Añadido manualmente";
      detalles.append(origen);
    }
    agregarSelectorDeFoto(jugador, marco, iniciales, detalles);
  }

  const datos = document.createElement("div");
  datos.className = "player-meta";
  const etiqueta = document.createElement("span");
  etiqueta.className = "position";
  etiqueta.textContent = mostrarEquipo
    ? jugador.strTeam || "Equipo no disponible"
    : jugador.isCustom ? "Añadido manualmente" : "Activo";
  datos.append(etiqueta);
  tarjeta.append(marco, detalles, datos);
  return tarjeta;
}

async function buscarEquipo(consulta) {
  if (normalizar(jugadorPersonalizado.strTeam) === normalizar(consulta)) {
    return {
      jugadores: [jugadorPersonalizado],
      titulo: `Plantilla de ${jugadorPersonalizado.strTeam}`,
      origen: "local",
      activos: false
    };
  }

  const datosEquipo = await pedirDatos(API.equipos, "t", consulta);
  const equipos = datosEquipo.teams || [];
  const equipo = equipos.find((item) => item.strSport?.toLowerCase() === "soccer" && normalizar(item.strTeam) === normalizar(consulta))
    || equipos.find((item) => item.strSport?.toLowerCase() === "soccer")
    || equipos[0];

  if (!equipo) {
    return { jugadores: [], titulo: "Resultados", mensaje: "No se encontró ese equipo. Prueba con otro nombre." };
  }

  const datosPlantilla = await pedirDatos(API.plantilla, "id", equipo.idTeam);
  return {
    jugadores: (datosPlantilla.player || []).filter((jugador) => jugador.strStatus?.toLowerCase() === "active"),
    titulo: `Plantilla de ${equipo.strTeam}`,
    mensaje: "La API no devolvió jugadores marcados como activos para este equipo.",
    origen: "api",
    activos: true
  };
}

async function buscarJugador(consulta) {
  if (normalizar(jugadorPersonalizado.strPlayer).includes(normalizar(consulta))) {
    return {
      jugadores: [jugadorPersonalizado],
      titulo: `Resultados para ${consulta}`,
      origen: "local",
      mostrarEquipo: true
    };
  }

  const datos = await pedirDatos(API.jugadores, "p", consulta);
  return {
    jugadores: (datos.player || []).filter((jugador) => jugador.strStatus?.toLowerCase() === "active"),
    titulo: `Resultados para ${consulta}`,
    mensaje: "No se encontraron jugadores activos con ese nombre.",
    origen: "api",
    mostrarEquipo: true
  };
}

async function buscar(consulta, modo) {
  const idBusqueda = ++busquedaActual;
  campos.boton.disabled = true;
  campos.boton.textContent = "Buscando...";
  campos.lista.replaceChildren();
  campos.cantidad.textContent = "";
  mostrarMensaje(modo === "player" ? "Buscando jugador..." : "Buscando el equipo y su plantilla...");

  try {
    const resultado = modo === "player" ? await buscarJugador(consulta) : await buscarEquipo(consulta);
    if (idBusqueda !== busquedaActual) return;

    campos.titulo.textContent = resultado.titulo;
    mostrarConexion(resultado.origen === "local" ? "Dato local" : "API conectada", resultado.origen === "api");

    if (resultado.jugadores.length === 0) {
      mostrarMensaje(resultado.mensaje);
      return;
    }

    mostrarMensaje();
    const cantidad = resultado.jugadores.length;
    const unidad = cantidad === 1 ? "jugador" : "jugadores";
    campos.cantidad.textContent = `${cantidad} ${unidad}${resultado.activos ? " activos" : ""}`;
    campos.lista.append(...resultado.jugadores.map((jugador) => crearTarjeta(jugador, resultado.mostrarEquipo)));
  } catch (error) {
    if (idBusqueda !== busquedaActual) return;
    mostrarConexion("Sin conexión", false);
    mostrarMensaje(`No se pudo completar la búsqueda. ${error.message} Revisa tu conexión e inténtalo de nuevo.`, true);
  } finally {
    if (idBusqueda === busquedaActual) {
      campos.boton.disabled = false;
      campos.boton.textContent = "Buscar";
    }
  }
}

campos.modos.forEach((modo) => {
  modo.addEventListener("change", () => {
    if (!modo.checked) return;
    busquedaActual += 1;
    campos.boton.disabled = false;
    campos.boton.textContent = "Buscar";
    const esJugador = modo.value === "player";
    campos.etiqueta.textContent = esJugador ? "Nombre del jugador" : "Nombre del equipo";
    campos.busqueda.placeholder = esJugador ? "Ej. Lionel Messi" : "Ej. Barcelona";
    campos.busqueda.value = "";
    campos.busqueda.focus();
    campos.lista.replaceChildren();
    campos.cantidad.textContent = "";
    campos.titulo.textContent = esJugador ? "Busca un jugador" : "Plantilla actual";
    mostrarMensaje(esJugador ? "Escribe el nombre de un jugador para ver su equipo." : "Escribe el nombre de un club para consultar su plantilla.");
  });
});

campos.formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const modo = document.querySelector('input[name="search-mode"]:checked').value;
  const validacion = window.validaciones.validarBusqueda(campos.busqueda.value, modo);

  if (!validacion.valida) {
    mostrarMensaje(validacion.mensaje, true);
    campos.busqueda.focus();
    return;
  }

  buscar(validacion.valor, modo);
});

buscar("Barcelona", "team");