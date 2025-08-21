document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById("btnMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const sidebar = document.getElementById("sidebar");
  const menuList = document.getElementById("menuList");

  // Opciones de menú
  const opcionesMenu = [
    { texto: "Dashboard del profesor", href: "dashboard_profesor.html" },
    { texto: "Cerrar sesión", href: "index.html" }
  ];

  menuList.innerHTML = "";
  opcionesMenu.forEach(op => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = op.href;
    a.textContent = op.texto;
    li.appendChild(a);
    menuList.appendChild(li);
  });

  btnMenu.addEventListener("click", () => sidebar.classList.add("open"));
  btnCerrarMenu.addEventListener("click", () => sidebar.classList.remove("open"));

  menuList.addEventListener("click", e => {
    if (e.target.tagName === "A") {
      sidebar.classList.remove("open");
    }
  });

  const params = new URLSearchParams(window.location.search);
  const curso = params.get("curso") || "Curso desconocido";
  document.getElementById("titulo-curso").textContent = `Curso: ${curso}`;

  // Redirección al seleccionar grupo
  document.querySelectorAll(".grupo").forEach(grupo => {
    grupo.addEventListener("click", () => {
      const nombreGrupo = encodeURIComponent(grupo.querySelector("h3").textContent);
      window.location.href = `panel_grupo.html?curso=${encodeURIComponent(curso)}&grupo=${nombreGrupo}`;
    });
  });
});
