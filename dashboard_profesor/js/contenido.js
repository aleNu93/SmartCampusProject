const contenidoContainer = document.getElementById('contenidoContainer');

// Definición de los módulos y sus ítems
const modulos = [
  {
    titulo: "Módulo Introductorio",
    items: [
      "Consentimiento informado",
      "Plantilla para contratos de trabajo",
      "Plantillas para minutas de trabajo",
      "Foro de presentación",
      "Foro de preguntas y respuestas",
      "Recursos de apoyo"
    ]
  },
  {
    titulo: "Información del curso",
    items: [
      "Descripción del curso",
      "Competencias",
      "Contactar al docente",
      "Políticas institucionales",
      "Sílabos",
      "Bibliografía recomendada"
    ]
  }
];

// Ítems comunes para cada semana
const itemsSemana = [
  "Pregunta generadora",
  "Antes de la sesión sincrónica",
  "Durante la sesión sincrónica",
  "Después de la sesión sincrónica",
  "Entregables de la semana",
  "Recursos de apoyo"
];

// Crear botón guardar (se usa en módulo y submenú)
function crearBotonGuardar() {
  const btnGuardar = document.createElement('button');
  btnGuardar.textContent = 'Guardar';
  btnGuardar.classList.add('btn-guardar');
  btnGuardar.style.marginTop = '1rem';
  btnGuardar.style.padding = '0.4rem 1rem';
  btnGuardar.style.backgroundColor = '#1B4F72';
  btnGuardar.style.color = 'white';
  btnGuardar.style.border = 'none';
  btnGuardar.style.borderRadius = '4px';
  btnGuardar.style.cursor = 'pointer';
  btnGuardar.addEventListener('click', () => {
    alert('Contenido guardado (simulado).');
  });
  return btnGuardar;
}

// Función para crear ítem con colapsable y área de agregar contenido
// Modificada para soportar ítems no editables (como en módulo introductorio)
function crearItem(nombre, esEntregable = false, esNoEditable = false) {
  const itemDiv = document.createElement('div');
  itemDiv.classList.add('modulo-item');
  itemDiv.style.marginBottom = '0.5rem';
  itemDiv.style.backgroundColor = '#D9EDF7'; // Celeste claro para submenús
  itemDiv.style.borderRadius = '4px';
  itemDiv.style.padding = '0.25rem 0.5rem';

  const header = document.createElement('div');
  header.classList.add('modulo-header');
  header.style.fontWeight = 'normal';
  header.style.fontSize = '1rem';
  header.style.cursor = 'pointer';
  header.innerHTML = `${nombre} <i class="fas fa-chevron-right"></i>`;

  const body = document.createElement('div');
  body.classList.add('modulo-body');
  body.style.padding = '0.75rem 1rem';
  body.style.backgroundColor = '#f9f9f9';
  body.style.display = 'none';

  if (esNoEditable) {
    // Solo mostrar texto, sin formulario ni botones
    const p = document.createElement('p');
    p.textContent = `Contenido fijo: "${nombre}"`;
    body.appendChild(p);
  } else if (esEntregable) {
    // Aquí creamos el formulario completo para "Entregables de la semana"
    const form = document.createElement('form');
    form.classList.add('modulo-form');
    form.innerHTML = `
      <label>Nombre de la evaluación: <input type="text" name="nombreEvaluacion" required placeholder="Nombre..." /></label><br/><br/>
      <label><input type="checkbox" name="obligatoria" /> Obligatoria</label><br/>
      <label><input type="checkbox" name="evaluable" /> Evaluable</label><br/>
      <label>Porcentaje asignado: <input type="number" name="porcentaje" min="0" max="100" disabled placeholder="%" /></label><br/><br/>
      <label>Fecha de inicio: <input type="date" name="fechaInicio" required /></label><br/><br/>
      <label>Fecha final: <input type="date" name="fechaFinal" required /></label><br/><br/>
      <button type="button" class="btn-agregar">Agregar evaluación</button>
    `;

    // Lista donde se agregarán las evaluaciones
    const listaEvaluaciones = document.createElement('div');
    listaEvaluaciones.classList.add('lista-contenidos');
    listaEvaluaciones.style.maxHeight = '120px';
    listaEvaluaciones.style.overflowY = 'auto';
    listaEvaluaciones.style.marginTop = '0.5rem';

    // Habilitar o deshabilitar porcentaje según checkbox "evaluable"
    const evaluableCheckbox = form.querySelector('input[name="evaluable"]');
    const porcentajeInput = form.querySelector('input[name="porcentaje"]');
    evaluableCheckbox.addEventListener('change', () => {
      porcentajeInput.disabled = !evaluableCheckbox.checked;
      if (!evaluableCheckbox.checked) {
        porcentajeInput.value = '';
      }
    });

    form.querySelector('.btn-agregar').addEventListener('click', () => {
      // Validar campos básicos
      const nombreEval = form.nombreEvaluacion.value.trim();
      const fechaIni = form.fechaInicio.value;
      const fechaFin = form.fechaFinal.value;
      const esEvaluable = evaluableCheckbox.checked;
      const porcentajeVal = porcentajeInput.value;

      if (!nombreEval) {
        alert('Ingrese el nombre de la evaluación.');
        return;
      }
      if (!fechaIni || !fechaFin) {
        alert('Ingrese fechas válidas.');
        return;
      }
      if (esEvaluable && (!porcentajeVal || porcentajeVal <= 0 || porcentajeVal > 100)) {
        alert('Ingrese un porcentaje válido (1-100).');
        return;
      }

      // Crear div con info resumida de la evaluación
      const div = document.createElement('div');
      div.style.borderBottom = '1px solid #ccc';
      div.style.padding = '0.25rem 0';
      div.textContent = `Eval: ${nombreEval} | Obligatoria: ${form.obligatoria.checked ? 'Sí' : 'No'} | Evaluable: ${esEvaluable ? 'Sí' : 'No'}${esEvaluable ? ` (${porcentajeVal}%)` : ''} | Inicio: ${fechaIni} | Final: ${fechaFin}`;
      listaEvaluaciones.appendChild(div);

      // Limpiar formulario
      form.reset();
      porcentajeInput.disabled = true;
    });

    body.appendChild(form);
    body.appendChild(listaEvaluaciones);

  } else {
    // Ítem normal con formulario para agregar contenido texto
    const form = document.createElement('form');
    form.classList.add('modulo-form');
    form.innerHTML = `
      <label>Agregar contenido para "${nombre}":
        <input type="text" name="contenido" required placeholder="Escribe aquí..." />
      </label>
      <button type="button" class="btn-agregar">Agregar</button>
    `;

    const listaContenidos = document.createElement('div');
    listaContenidos.classList.add('lista-contenidos');
    listaContenidos.style.maxHeight = '120px';
    listaContenidos.style.overflowY = 'auto';
    listaContenidos.style.marginTop = '0.5rem';

    form.querySelector('.btn-agregar').addEventListener('click', () => {
      const input = form.contenido.value.trim();
      if (!input) {
        alert('Por favor ingresa contenido válido.');
        return;
      }
      const div = document.createElement('div');
      div.textContent = input;
      listaContenidos.appendChild(div);
      form.contenido.value = '';
    });

    body.appendChild(form);
    body.appendChild(listaContenidos);
  }

  // Botón guardar en cada ítem (excepto si es no editable)
  if (!esNoEditable) {
    const btnGuardar = crearBotonGuardar();
    body.appendChild(btnGuardar);
  }

  header.addEventListener('click', () => {
    const isActive = header.classList.toggle('active');
    body.style.display = isActive ? 'block' : 'none';
  });

  itemDiv.appendChild(header);
  itemDiv.appendChild(body);

  return itemDiv;
}

// Función para crear un módulo con todos sus ítems y botón guardar al final
// Modificado para que el módulo introductorio no tenga ítems editables
function crearModulo(titulo, items) {
  const modulo = document.createElement('div');
  modulo.classList.add('modulo-item');

  const header = document.createElement('div');
  header.classList.add('modulo-header');
  header.style.cursor = 'pointer';
  header.innerHTML = `${titulo} <i class="fas fa-chevron-right"></i>`;

  const body = document.createElement('div');
  body.classList.add('modulo-body');
  body.style.display = 'none';

  const esModuloIntro = titulo === "Módulo Introductorio";

  items.forEach(item => {
    const esEntregable = item.toLowerCase() === "entregables de la semana";
    // Si es módulo introductorio, ítems no editables excepto "Entregables de la semana" no existe ahí, pero por seguridad
    const itemElemento = crearItem(item, esEntregable, esModuloIntro);
    body.appendChild(itemElemento);
  });

  // Botón guardar al final del módulo principal (pero no en módulo introductorio)
  if (!esModuloIntro) {
    const btnGuardarModulo = crearBotonGuardar();
    btnGuardarModulo.style.marginBottom = '1rem';
    body.appendChild(btnGuardarModulo);
  }

  header.addEventListener('click', () => {
    const isActive = header.classList.toggle('active');
    body.style.display = isActive ? 'block' : 'none';
  });

  modulo.appendChild(header);
  modulo.appendChild(body);

  return modulo;
}

const modulosIniciales = [
  ...modulos,
  ...Array.from({ length: 15 }, (_, i) => ({
    titulo: `Semana ${i + 1}`,
    items: itemsSemana,
  })),
];

modulosIniciales.forEach(mod => {
  contenidoContainer.appendChild(crearModulo(mod.titulo, mod.items));
});
