const estudiantesContainer = document.getElementById('estudiantesContainer');

// Datos ejemplo
const estudiantes = [
  {
    foto: 'images/alumno1.jpg',
    nombre: 'Juan Pérez López',
    cedula: '1-2345-6789',
    evaluaciones: [
      {
        nombreEvaluacion: 'Foro Introducción',
        tipo: 'Foro',
        descripcion: 'Participación en el foro de bienvenida',
        porcentaje: 10,
        nota: null,
        reclamo: ''
      },
      {
        nombreEvaluacion: 'CEPA Unidad 1',
        tipo: 'CEPA',
        descripcion: 'Evaluación de conocimientos Unidad 1',
        porcentaje: 25,
        nota: null,
        reclamo: ''
      }
    ]
  },
  {
    foto: 'images/alumno2.jpg',
    nombre: 'María Gómez Ruiz',
    cedula: '3-4567-8910',
    evaluaciones: [
      {
        nombreEvaluacion: 'Adelanto Proyecto',
        tipo: 'Adelanto',
        descripcion: 'Entrega parcial del proyecto final',
        porcentaje: 20,
        nota: null,
        reclamo: ''
      }
    ]
  }
];

function crearEstudianteItem(estudiante) {
  const item = document.createElement('div');
  item.classList.add('estudiante-item');

  const header = document.createElement('div');
  header.classList.add('estudiante-header');
  header.innerHTML = `
    <img src="${estudiante.foto}" alt="Foto de ${estudiante.nombre}" />
    <div class="estudiante-info">
      <div class="nombre">${estudiante.nombre}</div>
      <div class="cedula">Cédula: ${estudiante.cedula}</div>
    </div>
    <i class="fas fa-chevron-right"></i>
  `;

  const body = document.createElement('div');
  body.classList.add('evaluaciones-body');
  body.style.display = 'none';  // Para que esté cerrado al inicio

  estudiante.evaluaciones.forEach(evaluacion => {
    const evalDiv = document.createElement('div');
    evalDiv.classList.add('evaluacion-item');

    evalDiv.innerHTML = `
      <div class="evaluacion-header">${evaluacion.nombreEvaluacion} (${evaluacion.tipo})</div>
      <div class="evaluacion-detalles">${evaluacion.descripcion}</div>
      <div class="evaluacion-nota-container">
        <label>
          Nota (0-100):
          <input type="number" min="0" max="100" value="${evaluacion.nota !== null ? evaluacion.nota : ''}" />
        </label>
        <div class="porcentaje">Porcentaje actual: <span class="porcentaje-valor">0</span>%</div>
        <button class="btn-reclamo">Leer/Responder Reclamos</button>
      </div>
      <div class="reclamo-area" style="display:none;">
        <textarea placeholder="Escribe aquí el reclamo o respuesta...">${evaluacion.reclamo}</textarea>
        <button class="btn-guardar-reclamo">Guardar Reclamo</button>
      </div>
    `;

    // Botón reclamo toggle
    const btnReclamo = evalDiv.querySelector('.btn-reclamo');
    const reclamoArea = evalDiv.querySelector('.reclamo-area');
    btnReclamo.addEventListener('click', () => {
      reclamoArea.style.display = reclamoArea.style.display === 'block' ? 'none' : 'block';
    });

    // Input nota y porcentaje dinámico
    const inputNota = evalDiv.querySelector('input[type="number"]');
    const porcentajeSpan = evalDiv.querySelector('.porcentaje-valor');

    // Inicializa porcentaje si ya hay nota
    if (evaluacion.nota !== null) {
      const porcentajeInicial = ((evaluacion.nota * evaluacion.porcentaje) / 100).toFixed(2);
      porcentajeSpan.textContent = porcentajeInicial;
    }

    inputNota.addEventListener('input', () => {
      let val = inputNota.value;
      if(val === '') {
        evaluacion.nota = null;
        porcentajeSpan.textContent = '0';
      } else {
        val = Number(val);
        if(val < 0) val = 0;
        if(val > 100) val = 100;
        inputNota.value = val;
        evaluacion.nota = val;
        const porcentajeActual = ((val * evaluacion.porcentaje) / 100).toFixed(2);
        porcentajeSpan.textContent = porcentajeActual;
      }
    });

    // Guardar reclamo
    const btnGuardarReclamo = evalDiv.querySelector('.btn-guardar-reclamo');
    const textareaReclamo = reclamoArea.querySelector('textarea');
    btnGuardarReclamo.addEventListener('click', () => {
      evaluacion.reclamo = textareaReclamo.value.trim();
      alert('Reclamo guardado');
      reclamoArea.style.display = 'none';
    });

    body.appendChild(evalDiv);
  });

  header.addEventListener('click', () => {
    const isActive = header.classList.contains('active');
    if (isActive) {
      header.classList.remove('active');
      body.style.display = 'none';
    } else {
      header.classList.add('active');
      body.style.display = 'block';
    }
  });

  item.appendChild(header);
  item.appendChild(body);
  return item;
}

function renderizarEstudiantes() {
  estudiantesContainer.innerHTML = '';
  estudiantes.forEach(estudiante => {
    const item = crearEstudianteItem(estudiante);
    estudiantesContainer.appendChild(item);
  });
}

renderizarEstudiantes();
