// js/asignacion_menu.js
document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById("btnMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const sidebar = document.getElementById("sidebar");
  const menuList = document.getElementById("menuList");
  const backdrop = document.querySelector(".menu-backdrop");

  if (!btnMenu || !btnCerrarMenu || !sidebar || !menuList || !backdrop) return;

  // Define tus enlaces (ajusta rutas según tu app)
  const opcionesMenu = [
    // { texto: "Inicio", href: "index.html" },
    // { texto: "Perfil", href: "perfil.html" },
    { texto: "Dashboard del profesor", href: "dashboard_profesor.html" },
    { texto: "Seleccionar curso", href: "seleccionar_grupo_curso.html" },
    { texto: "Cerrar sesión", href: "index.html" }
  ];

  // Poblar lista
  menuList.innerHTML = "";
  opcionesMenu.forEach(op => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = op.href;
    a.textContent = op.texto;
    li.appendChild(a);
    menuList.appendChild(li);
  });

  const openMenu = () => {
    sidebar.classList.add("open");
    backdrop.classList.add("show");
    sidebar.setAttribute("aria-hidden", "false");
    // Accesibilidad: foco al botón cerrar
    setTimeout(() => btnCerrarMenu.focus(), 0);
    // Evitar scroll del fondo
    document.documentElement.style.overflow = "hidden";
  };

  const closeMenu = () => {
    sidebar.classList.remove("open");
    backdrop.classList.remove("show");
    sidebar.setAttribute("aria-hidden", "true");
    btnMenu.focus();
    document.documentElement.style.overflow = "";
  };

  btnMenu.addEventListener("click", openMenu);
  btnCerrarMenu.addEventListener("click", closeMenu);
  backdrop.addEventListener("click", closeMenu);

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeMenu();
    }
  });
});
