document.addEventListener("DOMContentLoaded", function() {
  // Elementos del DOM
  const btnMenu = document.getElementById("btnMenu");
  const menuLateral = document.getElementById("menuLateral");
  const cerrarMenu = document.getElementById("cerrarMenu");
  const cerrarSesionMenu = document.getElementById("cerrarSesionMenu");

  // Función para abrir/cerrar el menú
  function toggleMenu() {
    menuLateral.classList.toggle("active");
    document.body.style.overflow = menuLateral.classList.contains("active") ? "hidden" : "";
  }

  // Evento para el botón hamburguesa
  if (btnMenu) {
    btnMenu.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Evento para cerrar menú
  if (cerrarMenu) {
    cerrarMenu.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Evento para cerrar sesión
  if (cerrarSesionMenu) {
    cerrarSesionMenu.addEventListener("click", function(e) {
      e.preventDefault();
      localStorage.removeItem('usuarioActivo');
      window.location.href = 'index.html';
    });
  }

  // Cerrar menú al hacer clic fuera
  document.addEventListener("click", function(e) {
    if (menuLateral.classList.contains("active") && 
        !menuLateral.contains(e.target) && 
        e.target !== btnMenu) {
      toggleMenu();
    }
  });

  // Prevenir que el clic en el menú lo cierre
  menuLateral.addEventListener("click", function(e) {
    e.stopPropagation();
  });
});