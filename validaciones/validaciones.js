"use strict";

window.validaciones = {
  validarBusqueda(valor, modo) {
    const consulta = String(valor ?? "").trim();
    const tipo = modo === "player" ? "jugador" : "equipo";

    if (!consulta) {
      return { valida: false, mensaje: `Escribe el nombre del ${tipo}.` };
    }

    if (consulta.length < 2) {
      return { valida: false, mensaje: "Escribe al menos 2 caracteres." };
    }

    if (consulta.length > 60) {
      return { valida: false, mensaje: "La búsqueda no puede superar 60 caracteres." };
    }

    return { valida: true, valor: consulta };
  }
};