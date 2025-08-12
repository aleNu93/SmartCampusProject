document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById("btnMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const sidebar = document.getElementById("sidebar");
  const menuList = document.getElementById("menuList");

  const params = new URLSearchParams(window.location.search);
  const curso = params.get("curso") || "Curso desconocido";
  const grupo = params.get("grupo") || "Grupo desconocido";

  document.getElementById("titulo-grupo").textContent = `${grupo} - ${curso}`;

  // Opciones de menú
  const opcionesMenu = [
    { texto: "Dashboard del profesor", href: "dashboard_profesor.html" },
    { texto: "Seleccionar curso", href: "seleccionar_grupo_curso.html" },
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

  // Acciones del panel del grupo
  const acciones = [
    { icono: 'fa-user-graduate', texto: 'Estudiantes', link: 'estudiantes.html' },
    { icono: 'fa-calendar-check', texto: 'Asistencia', link: 'asistencia.html' },
    { icono: 'fa-book', texto: 'Contenido', link: 'contenido.html' },
    { icono: 'fa-file-alt', texto: 'Evaluaciones', link: 'evaluaciones.html' }
  ];

  const contenedor = document.getElementById('accionesGrupo');

  acciones.forEach(({ icono, texto, link }) => {
    const a = document.createElement('a');
    a.href = `${link}?curso=${encodeURIComponent(curso)}&grupo=${encodeURIComponent(grupo)}`;
    a.className = 'accion';
    a.innerHTML = `
      <i class="fas ${icono} fa-2x"></i>
      <h3>${texto}</h3>
    `;
    contenedor.appendChild(a);
  });
});
