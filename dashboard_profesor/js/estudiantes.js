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

// Grupos formados (array de objetos)
let grupos = [];

// Id autoincremental para grupos
let nextId = 1;

const tbodyEstudiantes = document.getElementById("tbodyEstudiantes");
const btnFormarGrupos = document.getElementById("btnFormarGrupos");
const resultadoGrupos = document.getElementById("resultadoGrupos");
const tipoGrupoSelect = document.getElementById("tipoGrupo");
const metodoFormacionSelect = document.getElementById("metodoFormacion");
const cantidadGruposInput = document.getElementById("cantidadGrupos");
const cantidadEstudiantesInput = document.getElementById("cantidadEstudiantes");
const seleccionManualContainer = document.getElementById("seleccionManualContainer");
const fechaExpiracionInput = document.getElementById("fechaExpiracion");
const fechaExpiracionRow = document.getElementById("fechaExpiracionRow");

// Mostrar estudiantes en tabla
function mostrarEstudiantes() {
  tbodyEstudiantes.innerHTML = "";
  estudiantes.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${e.foto}" alt="${e.nombre}" width="40" height="40" style="border-radius:50%"></td>
      <td>${e.nombre}</td>
      <td>${e.cedula}</td>
      <td>${e.correo}</td>
      <td>${e.nota.toFixed(1)}</td>
      <td>${e.asistencia}%</td>
    `;
    tbodyEstudiantes.appendChild(tr);
  });
}

// Mostrar grupos
function mostrarGrupos() {
  limpiarGruposExpirados();
  resultadoGrupos.innerHTML = "";
  if(grupos.length === 0){
    resultadoGrupos.innerHTML = '<p class="mensaje-sin-grupos">No hay grupos formados.</p>'
    return;
  }
  grupos.forEach(g => {
    const div = document.createElement("div");
    div.className = "grupo";
    div.dataset.id = g.id;

    const fechaTexto = g.tipo === "temporal" && g.fechaExpiracion
      ? ` | Expira: ${new Date(g.fechaExpiracion).toLocaleDateString()}`
      : "";

    div.innerHTML = `
      <div class="grupo-header">
        <h3>Grupo ${g.id} (${g.tipo.toUpperCase()})${fechaTexto}</h3>
        <div>
          <button class="btn-editar" data-id="${g.id}">Editar</button>
          <button class="btn-eliminar" data-id="${g.id}">Eliminar</button>
        </div>
      </div>
      <div class="grupo-body">
        <ul>
          ${g.estudiantes.map(e => `<li>${e.nombre} (${e.cedula})</li>`).join("")}
        </ul>
      </div>
    `;
    resultadoGrupos.appendChild(div);
  });
  agregarEventosBotonesGrupos();
}

// Limpia grupos temporales expirados
function limpiarGruposExpirados() {
  const hoy = new Date();
  grupos = grupos.filter(g => {
    if(g.tipo === "temporal" && g.fechaExpiracion){
      return new Date(g.fechaExpiracion) >= hoy;
    }
    return true;
  });
}

// Formar grupos aleatorios
function formarGruposAleatorios(cantGrupos, cantEstudiantes, tipo, fechaExp) {
  limpiarGruposExpirados();

  // Verificar que hay suficientes estudiantes
  const totalNecesarios = cantGrupos * cantEstudiantes;
  if(totalNecesarios > estudiantes.length){
    alert(`No hay suficientes estudiantes (${estudiantes.length}) para formar ${cantGrupos} grupos de ${cantEstudiantes} estudiantes.`);
    return;
  }

  // Copia para mezclar
  const estudiantesDisponibles = [...estudiantes];
  // Shuffle
  for (let i = estudiantesDisponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [estudiantesDisponibles[i], estudiantesDisponibles[j]] = [estudiantesDisponibles[j], estudiantesDisponibles[i]];
  }

  // Crear grupos sin eliminar existentes permanentes
  for(let i=0; i < cantGrupos; i++){
    const grupo = {
      id: nextId++,
      tipo,
      fechaExpiracion: tipo === "temporal" ? fechaExp : null,
      estudiantes: estudiantesDisponibles.slice(i * cantEstudiantes, (i + 1) * cantEstudiantes)
    };
    grupos.push(grupo);
  }
  mostrarGrupos();
  seleccionManualContainer.innerHTML = "";
}

// Formar grupos manual
function formarGruposManuales(cantGrupos, cantEstudiantes, tipo, fechaExp) {
  limpiarGruposExpirados();

  seleccionManualContainer.innerHTML = `<p>Seleccione estudiantes para cada grupo:</p>`;
  const form = document.createElement("form");
  form.id = "formSeleccionManual";

  for(let i=1; i<=cantGrupos; i++){
    const grupoDiv = document.createElement("div");
    grupoDiv.className = "grupo";
    grupoDiv.innerHTML = `<h4>Grupo ${i} (${tipo})</h4>`;
    estudiantes.forEach(est => {
      const idCheck = `check_g${i}_e${est.cedula}`;
      const label = document.createElement("label");
      label.style.display = "block";
      label.style.marginBottom = "3px";
      label.innerHTML = `<input type="checkbox" name="grupo_${i}" value="${est.cedula}" id="${idCheck}" /> ${est.nombre} (${est.cedula})`;
      grupoDiv.appendChild(label);
    });
    form.appendChild(grupoDiv);
  }

  const btnSubmit = document.createElement("button");
  btnSubmit.type = "submit";
  btnSubmit.className = "btn-agregar";
  btnSubmit.textContent = "Guardar grupos manuales";

  form.appendChild(btnSubmit);
  seleccionManualContainer.appendChild(form);

  form.addEventListener("submit", e => {
    e.preventDefault();

    let gruposNuevos = [];
    for(let i=1; i<=cantGrupos; i++){
      const checkboxes = form.querySelectorAll(`input[name="grupo_${i}"]:checked`);
      if(checkboxes.length !== cantEstudiantes){
        alert(`El grupo ${i} debe tener exactamente ${cantEstudiantes} estudiantes seleccionados.`);
        return;
      }
      let estudiantesGrupo = [];
      checkboxes.forEach(ch => {
        const est = estudiantes.find(est => est.cedula === ch.value);
        if(est) estudiantesGrupo.push(est);
      });
      gruposNuevos.push({
        id: nextId++,
        tipo,
        fechaExpiracion: tipo === "temporal" ? fechaExp : null,
        estudiantes: estudiantesGrupo
      });
    }
    grupos = grupos.concat(gruposNuevos);
    seleccionManualContainer.innerHTML = "";
    mostrarGrupos();
  });
}

// Eventos para editar y eliminar grupos
function agregarEventosBotonesGrupos() {
  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      grupos = grupos.filter(g => g.id !== id);
      mostrarGrupos();
    };
  });

  document.querySelectorAll(".btn-editar").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const grupo = grupos.find(g => g.id === id);
      if(!grupo) return;

      // Para simplicidad, sólo permito editar estudiantes (manual)
      seleccionManualContainer.innerHTML = `<p>Editar Grupo ${id} (${grupo.tipo}): seleccione estudiantes</p>`;
      const form = document.createElement("form");
      form.id = "formEditarGrupo";

      estudiantes.forEach(est => {
        const idCheck = `check_edit_g${id}_e${est.cedula}`;
        const checked = grupo.estudiantes.some(e => e.cedula === est.cedula) ? "checked" : "";
        const label = document.createElement("label");
        label.style.display = "block";
        label.style.marginBottom = "3px";
        label.innerHTML = `<input type="checkbox" name="grupo_edit" value="${est.cedula}" id="${idCheck}" ${checked} /> ${est.nombre} (${est.cedula})`;
        form.appendChild(label);
      });

      const btnSubmit = document.createElement("button");
      btnSubmit.type = "submit";
      btnSubmit.className = "btn-agregar";
      btnSubmit.textContent = "Guardar cambios";

      form.appendChild(btnSubmit);
      seleccionManualContainer.appendChild(form);

      form.addEventListener("submit", e => {
        e.preventDefault();
        const checkboxes = form.querySelectorAll("input[name='grupo_edit']:checked");
        if(checkboxes.length === 0){
          alert("Debe seleccionar al menos un estudiante.");
          return;
        }
        let estudiantesGrupo = [];
        checkboxes.forEach(ch => {
          const est = estudiantes.find(est => est.cedula === ch.value);
          if(est) estudiantesGrupo.push(est);
        });
        grupo.estudiantes = estudiantesGrupo;
        seleccionManualContainer.innerHTML = "";
        mostrarGrupos();
      });
    };
  });
}

// Manejar visibilidad fecha expiración
tipoGrupoSelect.addEventListener("change", () => {
  if(tipoGrupoSelect.value === "temporal"){
    fechaExpiracionRow.style.display = "block";
  } else {
    fechaExpiracionRow.style.display = "none";
  }
});

// Botón formar grupos
btnFormarGrupos.addEventListener("click", () => {
  const tipo = tipoGrupoSelect.value;
  const metodo = metodoFormacionSelect.value;
  const cantGrupos = Number(cantidadGruposInput.value);
  const cantEstudiantes = Number(cantidadEstudiantesInput.value);
  const fechaExp = tipo === "temporal" ? fechaExpiracionInput.value : null;

  if (tipo === "temporal" && (!fechaExp || new Date(fechaExp) < new Date())) {
    alert("Debe seleccionar una fecha de expiración válida para grupos temporales.");
    return;
  }

  if(cantGrupos < 1 || cantEstudiantes < 1){
    alert("La cantidad de grupos y estudiantes por grupo debe ser al menos 1.");
    return;
  }

  if(metodo === "aleatorio"){
    formarGruposAleatorios(cantGrupos, cantEstudiantes, tipo, fechaExp);
  } else {
    formarGruposManuales(cantGrupos, cantEstudiantes, tipo, fechaExp);
  }
});

// Mostrar datos iniciales
mostrarEstudiantes();
mostrarGrupos();

