const evaluacionesContainer = document.getElementById('evaluacionesContainer');

const tiposEvaluacion = [
  "Foro",
  "Tarea",
  "Prueba de desempeño",
  "Resumen",
  "Adelanto",
  "Contrato de trabajo",
  "Laboratorio",
  "Práctica",
  "Investigación",
  "CEPA"
];

// Función para crear cada bloque evaluable
function crearEvaluacionItem(tipo) {
  const item = document.createElement('div');
  item.classList.add('evaluacion-item');
  item.dataset.tipo = tipo.toLowerCase().replace(/\s+/g, '-');

  const header = document.createElement('div');
  header.classList.add('evaluacion-header');
  header.innerHTML = `${tipo} <i class="fas fa-chevron-right"></i>`;

  const body = document.createElement('div');
  body.classList.add('evaluacion-body');

  // Formulario
  const form = document.createElement('form');
  form.classList.add('evaluacion-form');
  form.innerHTML = `
    <label>Nombre de la evaluación:
      <input type="text" name="nombre" required />
    </label>
    <label>Semana a la que pertenece:
      <input type="number" name="semana" min="1" max="15" required />
    </label>
    <label>Obligatoria:
      <select name="obligatoria" required>
        <option value="">Seleccione</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </label>
    <label>¿Evaluable?
      <select name="evaluable" required>
        <option value="">Seleccione</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </label>
    <label class="porcentaje-container" style="display:none;">
      Porcentaje asignado (%):
      <input type="number" name="porcentaje" min="0" max="100" />
    </label>
    <label>Fecha de inicio:
      <input type="datetime-local" name="fechaInicio" required />
    </label>
    <label>Fecha de entrega:
      <input type="datetime-local" name="fechaEntrega" required />
    </label>
    <button type="button" class="btn-agregar">Agregar Evaluación</button>
  `;

  const listaEvaluaciones = document.createElement('div');
  listaEvaluaciones.classList.add('lista-evaluaciones');

  const btnGuardar = document.createElement('button');
  btnGuardar.type = 'button';
  btnGuardar.classList.add('btn-guardar-evaluaciones');
  btnGuardar.textContent = `Guardar Evaluaciones ${tipo}`;

  body.appendChild(form);
  body.appendChild(listaEvaluaciones);
  body.appendChild(btnGuardar);

  item.appendChild(header);
  item.appendChild(body);

  // Toggle body
  header.addEventListener('click', () => {
    const isActive = header.classList.toggle('active');
    body.style.display = isActive ? 'block' : 'none';
  });

  // Mostrar u ocultar campo porcentaje según evaluable
  const selectEvaluable = form.querySelector('select[name="evaluable"]');
  const porcentajeContainer = form.querySelector('.porcentaje-container');
  const inputPorcentaje = porcentajeContainer.querySelector('input[name="porcentaje"]');

  selectEvaluable.addEventListener('change', () => {
    if (selectEvaluable.value === 'Sí') {
      porcentajeContainer.style.display = 'block';
      inputPorcentaje.required = true;
    } else {
      porcentajeContainer.style.display = 'none';
      inputPorcentaje.required = false;
      inputPorcentaje.value = '';
    }
  });

  // Lista interna para almacenar evaluaciones agregadas localmente
  const evaluacionesAgregadas = [];

  // Botón agregar evaluación
  form.querySelector('.btn-agregar').addEventListener('click', () => {
    const nombre = form.nombre.value.trim();
    const semana = form.semana.value;
    const obligatoria = form.obligatoria.value;
    const evaluable = form.evaluable.value;
    const porcentaje = form.porcentaje.value;
    const fechaInicio = form.fechaInicio.value;
    const fechaEntrega = form.fechaEntrega.value;

    if (!nombre || !semana || !obligatoria || !evaluable || !fechaInicio || !fechaEntrega) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (evaluable === 'Sí') {
      if (!porcentaje || porcentaje < 0 || porcentaje > 100) {
        alert('Por favor ingrese un porcentaje válido entre 0 y 100.');
        return;
      }
    }

    // Validar que fecha de inicio sea menor o igual a fecha de entrega
    if (fechaInicio > fechaEntrega) {
      alert('La fecha de inicio no puede ser posterior a la fecha de entrega.');
      return;
    }

    // Agregar a lista interna
    const evaluacion = {
      nombre,
      semana: Number(semana),
      obligatoria,
      evaluable,
      porcentaje: evaluable === 'Sí' ? Number(porcentaje) : 0,
      fechaInicio,
      fechaEntrega
    };
    evaluacionesAgregadas.push(evaluacion);

    // Mostrar en lista visual
    const div = document.createElement('div');
    div.textContent = `${nombre} - Semana ${semana} - Obligatoria: ${obligatoria} - Evaluable: ${evaluable}${evaluable === 'Sí' ? ` - ${porcentaje}%` : ''} - Inicio: ${fechaInicio.replace('T', ' ')} - Entrega: ${fechaEntrega.replace('T', ' ')}`;
    listaEvaluaciones.appendChild(div);

    // Reset form excepto semana y evaluable
    form.nombre.value = '';
    form.obligatoria.value = '';
    form.fechaInicio.value = '';
    form.fechaEntrega.value = '';
    if (evaluable === 'Sí') {
      form.porcentaje.value = '';
    }
  });

  // Botón guardar
  btnGuardar.addEventListener('click', () => {
    if (evaluacionesAgregadas.length === 0) {
      alert('No hay evaluaciones para guardar.');
      return;
    }
    console.log(`Evaluaciones guardadas para ${tipo}:`, evaluacionesAgregadas);
    alert(`Evaluaciones de ${tipo} guardadas correctamente.`);
  });

  return item;
}

// Crear todos los bloques al cargar la página
tiposEvaluacion.forEach(tipo => {
  evaluacionesContainer.appendChild(crearEvaluacionItem(tipo));
});
