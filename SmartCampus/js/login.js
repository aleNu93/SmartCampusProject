// js/login.js

// Obtener usuarios (profesores y estudiantes predeterminados + registrados en localStorage)
function getUsers() {
  // Profesores predeterminados
  const profesores = [
    {
      nombre: "Karina",
      apellido: "Hernandez Morales",
      user: "khernandezm@smartcampus.ed.cr",
      pass: "Karina123",
      rol: "profesor"
    },
    {
      nombre: "Alberto",
      apellido: "Mora Umaña",
      user: "amorau80@smartcampus.ed.cr",
      pass: "Alberto123",
      rol: "profesor"
    },
    {
      nombre: "Alejandro",
      apellido: "Altafulla Rivera",
      user: "aaltafullar70@smartcampus.ed.cr",
      pass: "Alejandro123",
      rol: "profesor"
    },
    {
      nombre: "Mario",
      apellido: "Kart Perez",
      user: "mkartp65@smartcampus.ed.cr",
      pass: "Mario123",
      rol: "profesor"
    }
  ];

  // Estudiantes predeterminados
  const estudiantes = [
    {
      nombre: "Laura",
      apellido: "Sanchez Torres",
      user: "lsanchezt@smartcampus.est.cr",
      pass: "Laura123",
      rol: "estudiante"
    },
    {
      nombre: "Pedro",
      apellido: "Ramirez Solis",
      user: "pramirezs@smartcampus.est.cr",
      pass: "Pedro123",
      rol: "estudiante"
    },
    {
      nombre: "Ana",
      apellido: "Lopez Fernandez",
      user: "alopezf@smartcampus.est.cr",
      pass: "Ana123",
      rol: "estudiante"
    },
    {
      nombre: "Jose",
      apellido: "Gomez Rojas",
      user: "jgomezr@smartcampus.est.cr",
      pass: "Jose123",
      rol: "estudiante"
    }
  ];

  // Usuarios registrados manualmente
  const registrados = JSON.parse(localStorage.getItem("usuarios")) || [];

  return [...profesores, ...estudiantes, ...registrados];
}

// Guardar usuario nuevo
function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("usuarios", JSON.stringify(users));
}

// Validación de dominio según el rol
function validarDominio(correo, rol) {
  return (
    (rol === "estudiante" && correo.endsWith("@smartcampus.est.cr")) ||
    (rol === "profesor" && correo.endsWith("@smartcampus.ed.cr"))
  );
}

// ========================= REGISTRO =========================
const registroForm = document.getElementById("registerForm");
if (registroForm) {
  registroForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const rol = document.getElementById("role").value;
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!nombre || !apellido || !user || !pass || !rol) {
      errorMsg.textContent = "Todos los campos son obligatorios.";
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass)) {
      errorMsg.textContent = "La contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula y número.";
      return;
    }

    if (!validarDominio(user, rol)) {
      errorMsg.textContent = "Correo no válido para el rol seleccionado";
      return;
    }

    const usuarios = getUsers();
    if (usuarios.some(u => u.user === user)) {
      errorMsg.textContent = "Este usuario ya está registrado";
      return;
    }

    saveUser({ rol, user, pass, nombre, apellido });
    alert("Registro exitoso 🎉");
    window.location.href = "index.html";
  });
}

// ========================= LOGIN ESTUDIANTE =========================
const formEst = document.querySelector("form") && document.getElementById("user-est");
if (formEst) {
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    const user = document.getElementById("user-est").value.trim();
    const pass = document.getElementById("pass-est").value;
    const usuarios = getUsers();

    if (!user.endsWith("@smartcampus.est.cr")) {
      alert("El correo no es válido para estudiante.");
      return;
    }

    const match = usuarios.find(u => u.user === user && u.pass === pass && u.rol === "estudiante");
    if (match) {
      alert("¡Bienvenido estudiante!");
      localStorage.setItem("usuarioActivo", JSON.stringify(match));
      window.location.href = "dashboard_estudiante.html";
    } else {
      alert("Credenciales incorrectas o usuario no registrado.");
    }
  });
}

// ========================= LOGIN PROFESOR =========================
const formPro = document.querySelector("form") && document.getElementById("user-pro");
if (formPro) {
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    const user = document.getElementById("user-pro").value.trim();
    const pass = document.getElementById("pass-pro").value;
    const usuarios = getUsers();

    if (!user.endsWith("@smartcampus.ed.cr")) {
      alert("El correo no es válido para profesor.");
      return;
    }

    const match = usuarios.find(u => u.user === user && u.pass === pass && u.rol === "profesor");
    if (match) {
      alert("¡Bienvenido profesor!");
      localStorage.setItem("usuarioActivo", JSON.stringify(match));
      window.location.href = "dashboard_profesor.html";
    } else {
      alert("Credenciales incorrectas o usuario no registrado.");
    }
  });
}

// ========================= RECUPERAR CONTRASEÑA PROFESOR =========================
const btnRecuperarPro = document.getElementById("btnRecuperarPro");
if (btnRecuperarPro) {
  btnRecuperarPro.addEventListener("click", function () {
    const correo = prompt("Por favor, ingresa tu correo institucional de profesor para recuperar la contraseña:");
    if (!correo) return alert("No ingresaste ningún correo.");

    const usuarios = getUsers();
    const usuarioEncontrado = usuarios.find(u => u.user === correo.trim() && u.rol === "profesor");

    if (usuarioEncontrado) {
      alert(`Tu contraseña es: ${usuarioEncontrado.pass}`);
    } else {
      alert("El correo no está registrado o no corresponde a un profesor.");
    }
  });
}

// ========================= DESCARGAR USUARIOS (ADMIN) =========================
function descargarUsuarios() {
  const clave = prompt("Ingresa la contraseña de administrador:");
  if (clave !== "ADMINPRO") {
    alert("Contraseña incorrecta. Acceso denegado.");
    return;
  }

  const usuarios = getUsers();
  const blob = new Blob([JSON.stringify(usuarios, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "usuarios-smartcampus.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ========================= DASHBOARDS (DATOS DINÁMICOS) =========================
function mostrarDatosUsuarioActivo() {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  const spans = document.querySelectorAll(".nombre-usuario, .correo-usuario, .rol-usuario");
  spans.forEach(span => {
    if (span.classList.contains("nombre-usuario")) {
      span.textContent = `${usuario.nombre} ${usuario.apellido}`;
    }
    if (span.classList.contains("correo-usuario")) {
      span.textContent = usuario.user;
    }
    if (span.classList.contains("rol-usuario")) {
      span.textContent = usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1);
    }
  });

  // Saludo específico para profesor
  const saludo = document.getElementById("saludo-profesor");
  if (saludo && usuario.rol === "profesor") {
    const genero = usuario.nombre.toLowerCase().endsWith("a") ? "Bienvenida" : "Bienvenido";
    saludo.textContent = `¡${genero} ${usuario.nombre} ${usuario.apellido}!`;
  }
}

// Ejecutar en los dashboards
document.addEventListener("DOMContentLoaded", () => {
  if (
    window.location.href.includes("dashboard_estudiante.html") ||
    window.location.href.includes("dashboard_profesor.html")
  ) {
    mostrarDatosUsuarioActivo();
  }
});

// ========================= CERRAR SESIÓN =========================
function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  window.location.href = "index.html";
}
