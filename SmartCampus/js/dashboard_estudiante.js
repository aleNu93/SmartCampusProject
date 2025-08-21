// js/dashboard_estudiante.js

// Validar que haya sesión activa y que el rol sea estudiante
function mostrarDatosEstudiante() {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

  if (!usuario || (usuario.rol || "").toLowerCase() !== "estudiante") {
    // Si no hay estudiante logueado o el rol no corresponde, redirigir al inicio
    window.location.href = "index.html";
    return;
  }

  // Mostrar nombre en el header
  const nombreUsuario = document.querySelector(".nombre-usuario");
  if (nombreUsuario) {
    const nombreCompleto = usuario.nombre && usuario.apellido
      ? `${usuario.nombre} ${usuario.apellido}`
      : usuario.user.split("@")[0];
    nombreUsuario.textContent = nombreCompleto;
  }

  // Mensaje de bienvenida
  const bienvenida = document.querySelector(".bienvenida h2");
  if (bienvenida) {
    const genero = usuario.nombre.toLowerCase().endsWith("a") ? "Bienvenida" : "Bienvenido";
    bienvenida.textContent = `¡${genero} ${usuario.nombre} ${usuario.apellido} a tu Smart Campus!`;
  }
}

// Cierre de sesión
function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  window.location.href = "index.html";
}

// Eventos del DOM
document.addEventListener("DOMContentLoaded", () => {
  mostrarDatosEstudiante();

  // Botón principal de cerrar sesión
  const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", cerrarSesion);
  }

  // Botón de cerrar sesión en el menú lateral
  const cerrarSesionMenu = document.getElementById("cerrarSesionMenu");
  if (cerrarSesionMenu) {
    cerrarSesionMenu.addEventListener("click", cerrarSesion);
  }

  // Submenú de cursos desplegable
  const cursosBtn = document.getElementById("cursos-btn");
  if (cursosBtn) {
    cursosBtn.addEventListener("click", function () {
      const contenedor = document.getElementById("cursos-contenedor");
      const subopciones = document.getElementById("subopciones-cursos");
      contenedor.classList.toggle("abierto");
      subopciones.style.display =
        subopciones.style.display === "block" ? "none" : "block";
    });
  }
});
