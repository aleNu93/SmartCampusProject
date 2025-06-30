// Datos iniciales (puedes reemplazar con datos reales o cargar desde backend)
let estudiantes = [
  {
    foto: "https://randomuser.me/api/portraits/men/32.jpg",
    nombre: "Juan Pérez López",
    cedula: "1-2345-6789",
    correo: "juan.perez@example.com",
    nota: 88,
  },
  {
    foto: "https://randomuser.me/api/portraits/women/44.jpg",
    nombre: "María Gómez Sánchez",
    cedula: "1-9876-5432",
    correo: "maria.gomez@example.com",
    nota: 92,
  },
];

// Asistencia simulada: porcentaje (0-100) por cédula
// En práctica, esto vendría de la base de datos o localStorage.
let asistencia = {
  "1-2345-6789": 85,
  "1-9876-5432": 92,
};

// Referencias DOM
const tbodyEstudiantes = document.getElementById("tbodyEstudiantes");
const modalAgregar = document.getElementById("modalAgregar");
const btnAgregar = document.getElementById("btnAgregar");
const cerrarModal = document.getElementById("cerrarModal");
const formAgregarEstudiante = document.getElementById("formAgregarEstudiante");

// Mostrar estudiantes en la tabla
function renderizarEstudiantes() {
  tbodyEstudiantes.innerHTML = ""; // limpiar tabla

  estudiantes.forEach((est) => {
    const porcentajeAsis = asistencia[est.cedula] ?? 0;

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td><img src="${est.foto}" alt="Foto de ${est.nombre}" class="foto-tabla" /></td>
      <td>${est.nombre}</td>
      <td>${est.cedula}</td>
      <td>${est.correo}</td>
      <td class="nota-texto">${est.nota}</td>
      <td class="porcentaje">${porcentajeAsis}%</td>
    `;

    tbodyEstudiantes.appendChild(fila);
  });
}

// Abrir modal
btnAgregar.addEventListener("click", () => {
  modalAgregar.style.display = "flex";
});

// Cerrar modal
cerrarModal.addEventListener("click", () => {
  modalAgregar.style.display = "none";
});

// Cerrar modal al hacer click fuera del contenido
window.addEventListener("click", (e) => {
  if (e.target === modalAgregar) {
    modalAgregar.style.display = "none";
  }
});

// Validar y agregar estudiante nuevo
formAgregarEstudiante.addEventListener("submit", (e) => {
  e.preventDefault();

  const foto = document.getElementById("fotoInput").value.trim();
  const nombre = document.getElementById("nombreInput").value.trim();
  const cedula = document.getElementById("cedulaInput").value.trim();
  const correo = document.getElementById("correoInput").value.trim();
  const nota = Number(document.getElementById("notaInput").value);

  // Validación básica
  if (!foto || !nombre || !cedula || !correo || isNaN(nota)) {
    alert("Por favor complete todos los campos correctamente.");
    return;
  }

  // Verificar cédula única
  const cedulaExiste = estudiantes.some((est) => est.cedula === cedula);
  if (cedulaExiste) {
    alert("La cédula ingresada ya existe.");
    return;
  }

  // Agregar nuevo estudiante
  estudiantes.push({
    foto,
    nombre,
    cedula,
    correo,
    nota,
  });

  // Asistencia nueva = 0%
  asistencia[cedula] = 0;

  renderizarEstudiantes();

  formAgregarEstudiante.reset();
  modalAgregar.style.display = "none";
});

// Inicial
renderizarEstudiantes();

