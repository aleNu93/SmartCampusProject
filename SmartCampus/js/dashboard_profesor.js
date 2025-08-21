document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado");
  mostrarDatosUsuarioActivo();

  // Código original para los cursos
  const cursos = document.querySelectorAll('.curso');
  cursos.forEach(curso => {
    curso.addEventListener('click', () => {
      const nombreCurso = curso.querySelector('h3').textContent.trim();
      const nombreCursoURL = encodeURIComponent(nombreCurso);
      window.location.href = `seleccionar_grupo_curso.html?curso=${nombreCursoURL}`;
    });
  });

  // --- NUEVO: menú hamburguesa ---
  const btnMenu = document.getElementById("btnMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const sidebar = document.getElementById("sidebar");
  const menuList = document.getElementById("menuList");

  // Opciones del menú (modifica según tus necesidades)
  const opcionesMenu = [
    { texto: "Cerrar sesión", href: "index.html" }
  ];

  // Insertar opciones en el menú lateral
  menuList.innerHTML = "";
  opcionesMenu.forEach(opcion => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = opcion.href;
    a.textContent = opcion.texto;
    li.appendChild(a);
    menuList.appendChild(li);
  });

  // Abrir menú hamburguesa
  btnMenu.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  // Cerrar menú hamburguesa
  btnCerrarMenu.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});

function mostrarDatosUsuarioActivo() {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  console.log("Usuario activo:", usuario);
  if (!usuario) {
    console.warn("No hay usuario activo, redirigiendo...");
    window.location.href = "index.html";
    return;
  }

  const nombreEl = document.querySelector(".nombre-usuario");
  const correoEl = document.querySelector(".correo-usuario");
  const rolEl = document.querySelector(".rol-usuario");
  const saludo = document.getElementById("saludo-profesor");

  console.log("Elementos encontrados:", { nombreEl, correoEl, rolEl, saludo });

  if (saludo && usuario.rol === "profesor") {
    const genero = usuario.nombre.toLowerCase().endsWith("a") ? "Bienvenida" : "Bienvenido";
    saludo.textContent = `¡${genero} ${usuario.nombre} ${usuario.apellido}!`;
  }
}
