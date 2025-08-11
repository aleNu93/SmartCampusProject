document.addEventListener("DOMContentLoaded", () => {
  // Menú hamburguesa del panel de grupo EXACTO
  const btnMenu = document.getElementById("btnMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const sidebar = document.getElementById("sidebar");
  const menuList = document.getElementById("menuList");

  // Obtiene parámetros curso y grupo
  const params = new URLSearchParams(window.location.search);
  const curso = params.get("curso") || "Curso desconocido";
  const grupo = params.get("grupo") || "Grupo desconocido";

  // Actualiza título header
  const headerText = document.querySelector(".header-text");
  if (headerText) headerText.textContent = `Registro de Asistencia - ${grupo} - ${curso}`;

  // Opciones del menú (igual al del panel grupo)
  const opcionesMenu = [
    { texto: "Dashboard del profesor", href: "dashboard_profesor.html" },
    { texto: "Seleccionar curso", href: "seleccionar_grupo_curso.html" },
    { texto: "Panel curso", href: "panel_grupo.html" },
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

  // --- Código original para cargar semanas y estudiantes ---

// Lista ejemplo de estudiantes
const estudiantes = [
  { cedula: "1234567", nombre: "Ana Pérez", correo: "ana.perez@mail.com", nota: 8.5, asistencia: 92, foto: "https://i.pravatar.cc/50?img=1" },
  { cedula: "2345678", nombre: "Carlos Ruiz", correo: "carlos.ruiz@mail.com", nota: 9.1, asistencia: 95, foto: "https://i.pravatar.cc/50?img=2" },
  { cedula: "3456789", nombre: "Lucía Gómez", correo: "lucia.gomez@mail.com", nota: 7.8, asistencia: 88, foto: "https://i.pravatar.cc/50?img=3" },
  { cedula: "4567890", nombre: "Jorge Mora", correo: "jorge.mora@mail.com", nota: 6.9, asistencia: 85, foto: "https://i.pravatar.cc/50?img=4" },
  { cedula: "5678901", nombre: "María Sánchez", correo: "maria.sanchez@mail.com", nota: 8.2, asistencia: 90, foto: "https://i.pravatar.cc/50?img=5" },
  { cedula: "6789012", nombre: "Luis Herrera", correo: "luis.herrera@mail.com", nota: 7.4, asistencia: 87, foto: "https://i.pravatar.cc/50?img=6" },
  { cedula: "7890123", nombre: "Sofía Vargas", correo: "sofia.vargas@mail.com", nota: 9.3, asistencia: 96, foto: "https://i.pravatar.cc/50?img=7" },
  { cedula: "8901234", nombre: "Pedro López", correo: "pedro.lopez@mail.com", nota: 6.7, asistencia: 82, foto: "https://i.pravatar.cc/50?img=8" },
  { cedula: "9012345", nombre: "Elena Cruz", correo: "elena.cruz@mail.com", nota: 8.0, asistencia: 89, foto: "https://i.pravatar.cc/50?img=9" },
  { cedula: "0123456", nombre: "Miguel Castillo", correo: "miguel.castillo@mail.com", nota: 7.9, asistencia: 91, foto: "https://i.pravatar.cc/50?img=10" }
];


  const semanasContainer = document.getElementById("semanasContainer");
  const totalSemanas = 15;

  function crearSemana(numSemana) {
    const semanaDiv = document.createElement("div");
    semanaDiv.classList.add("semana");

    const header = document.createElement("div");
    header.classList.add("semana-header");
    header.innerHTML = `Semana ${numSemana} <i class="fas fa-chevron-right"></i>`;

    const body = document.createElement("div");
    body.classList.add("semana-body");

    const tabla = document.createElement("table");
    tabla.classList.add("tabla-asistencia");
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Foto</th>
          <th>Nombre Completo</th>
          <th>Cédula</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${estudiantes
          .map(
            (e, i) => `
          <tr>
            <td><img src="${e.foto}" alt="Foto ${e.nombre}" class="foto-tabla" /></td>
            <td>${e.nombre}</td>
            <td>${e.cedula}</td>
            <td>
              <select name="estadoSemana${numSemana}Estudiante${i}">
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="justificado">Justificado</option>
              </select>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

    body.appendChild(tabla);
    semanaDiv.appendChild(header);
    semanaDiv.appendChild(body);

    // Toggle para abrir/cerrar semana
    header.addEventListener("click", () => {
      const abierto = body.style.display === "block";
      body.style.display = abierto ? "none" : "block";
      header.classList.toggle("active");
    });

    return semanaDiv;
  }

  for (let i = 1; i <= totalSemanas; i++) {
    semanasContainer.appendChild(crearSemana(i));
  }
});
