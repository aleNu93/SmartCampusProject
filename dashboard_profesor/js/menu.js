document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const curso = params.get("curso") || "";
  const grupo = params.get("grupo") || "";

  // Actualiza enlaces con curso y grupo
  document.querySelectorAll("#menuLateral a").forEach(link => {
    const href = link.getAttribute("href");
    if (href && !href.includes("index.html")) {
      link.href = `${href}?curso=${curso}&grupo=${grupo}`;
    }
  });

  const btnMenu = document.getElementById("btnMenu");
  const menuLateral = document.getElementById("menuLateral");
  const cerrarMenu = document.getElementById("cerrarMenu");

  btnMenu.addEventListener("click", () => {
    menuLateral.classList.add("open");
    document.body.classList.add("menu-open");
  });

  cerrarMenu.addEventListener("click", () => {
    menuLateral.classList.remove("open");
    document.body.classList.remove("menu-open");
  });

  // Cerrar menú si clic fuera del menú y botón
  document.addEventListener("click", e => {
    if (
      menuLateral.classList.contains("open") &&
      !menuLateral.contains(e.target) &&
      e.target !== btnMenu
    ) {
      menuLateral.classList.remove("open");
      document.body.classList.remove("menu-open");
    }
  });
});
