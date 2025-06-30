const estudiantes = [
  {
    nombre: "Juan Pérez Ramírez",
    cedula: "109230456",
    foto: "images/foto_estudiante1.png"
  },
  {
    nombre: "María López García",
    cedula: "108765432",
    foto: "images/foto_estudiante2.png"
  },
  {
    nombre: "Carlos Hernández Soto",
    cedula: "107654321",
    foto: "images/foto_estudiante3.png"
  }
];

const semanasContainer = document.getElementById('semanasContainer');
const totalSemanas = 15;

function crearSemana(numSemana) {
  const semanaDiv = document.createElement('div');
  semanaDiv.classList.add('semana');

  const header = document.createElement('div');
  header.classList.add('semana-header');
  header.innerHTML = `Semana ${numSemana} <i class="fas fa-chevron-right"></i>`;

  const body = document.createElement('div');
  body.classList.add('semana-body');

  const tabla = document.createElement('table');
  tabla.classList.add('tabla-asistencia');
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
      ${estudiantes.map((e, i) => `
        <tr>
          <td><img src="${e.foto}" alt="Foto ${e.nombre}" class="foto-tabla" /></td>
          <td>${e.nombre}</td>
          <td>${e.cedula}</td>
          <td>
            <select class="estado" data-semana="${numSemana}" data-estudiante="${i}">
              <option value="Presente">Presente</option>
              <option value="Ausente">Ausente</option>
              <option value="Tardía">Tardía</option>
            </select>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  const guardarBtn = document.createElement('button');
  guardarBtn.classList.add('btn-guardar');
  guardarBtn.textContent = `Guardar Asistencia Semana ${numSemana}`;
  guardarBtn.addEventListener('click', () => {
    const selects = tabla.querySelectorAll('select.estado');
    const asistenciaSemana = [];

    selects.forEach((select) => {
      const estudianteIdx = select.getAttribute('data-estudiante');
      const estado = select.value;
      asistenciaSemana.push({
        nombre: estudiantes[estudianteIdx].nombre,
        cedula: estudiantes[estudianteIdx].cedula,
        estado
      });
    });

    console.log(`Asistencia Semana ${numSemana}:`, asistenciaSemana);
    alert(`Asistencia de la semana ${numSemana} guardada correctamente.`);
  });

  body.appendChild(tabla);
  body.appendChild(guardarBtn);

  semanaDiv.appendChild(header);
  semanaDiv.appendChild(body);

  header.addEventListener('click', () => {
    const isActive = header.classList.toggle('active');
    body.style.display = isActive ? 'block' : 'none';
  });

  return semanaDiv;
}

for (let i = 1; i <= totalSemanas; i++) {
  semanasContainer.appendChild(crearSemana(i));
}
