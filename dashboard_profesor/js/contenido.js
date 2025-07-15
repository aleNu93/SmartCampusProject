const contenidoContainer = document.getElementById('contenidoContainer');

function guardarEnLocalStorage(modulo, item, contenidos) {
  const clave = `contenido_${modulo}_${item}`;
  localStorage.setItem(clave, JSON.stringify(contenidos));
}

function cargarDesdeLocalStorage(modulo, item) {
  const clave = `contenido_${modulo}_${item}`;
  const datos = localStorage.getItem(clave);
  return datos ? JSON.parse(datos) : [];
}

function crearItem(nombre, esEntregable = false, esNoEditable = false, moduloTitulo = '') {
  const itemDiv = document.createElement('div');
  itemDiv.classList.add('modulo-item');
  itemDiv.style.marginBottom = '0.5rem';
  itemDiv.style.backgroundColor = '#D9EDF7';
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
    const p = document.createElement('p');
    p.textContent = `Contenido fijo: "${nombre}"`;
    body.appendChild(p);
  } else if (esEntregable) {
  const form = document.createElement('form');
  form.classList.add('modulo-form');
  form.innerHTML = `
    <label>Nombre de la evaluación: <input type="text" name="nombreEvaluacion" required placeholder="Nombre..." /></label><br/><br/>
    <label><input type="checkbox" name="obligatoria" /> Obligatoria</label><br/>
    <label><input type="checkbox" name="evaluable" /> Evaluable</label><br/>
    <label><input type="checkbox" name="grupal" /> Grupal</label><br/>
    <label>Porcentaje asignado: <input type="number" name="porcentaje" min="0" max="100" disabled placeholder="%" /></label><br/><br/>
    <label>Fecha de inicio: <input type="date" name="fechaInicio" required /></label><br/><br/>
    <label>Fecha final: <input type="date" name="fechaFinal" required /></label><br/><br/>
    <button type="button" class="btn-agregar">Agregar evaluación</button>
  `;

  const listaEvaluaciones = document.createElement('div');
  listaEvaluaciones.classList.add('lista-contenidos');
  listaEvaluaciones.style.maxHeight = '120px';
  listaEvaluaciones.style.overflowY = 'auto';
  listaEvaluaciones.style.marginTop = '0.5rem';

  const evaluableCheckbox = form.querySelector('input[name="evaluable"]');
  const porcentajeInput = form.querySelector('input[name="porcentaje"]');
  evaluableCheckbox.addEventListener('change', () => {
    porcentajeInput.disabled = !evaluableCheckbox.checked;
    if (!evaluableCheckbox.checked) {
      porcentajeInput.value = '';
    }
  });

  const clave = `evaluaciones_${moduloTitulo}_${nombre}`;

  function renderEvaluaciones(evaluaciones, clave) {
    listaEvaluaciones.innerHTML = ''; // Limpia la lista
    evaluaciones.forEach((evalObj, index) => {
      const resumenTexto = `Eval: ${evalObj.nombreEval} | Obligatoria: ${evalObj.obligatoria ? 'Sí' : 'No'} | Evaluable: ${evalObj.evaluable ? 'Sí' : 'No'}${evalObj.evaluable ? ` (${evalObj.porcentaje}%)` : ''} | Grupal: ${evalObj.grupal ? 'Sí' : 'No'} | Inicio: ${evalObj.fechaInicio} | Final: ${evalObj.fechaFinal}`;
      const div = document.createElement('div');
      div.style.borderBottom = '1px solid #ccc';
      div.style.padding = '0.25rem 0';
      div.textContent = resumenTexto;

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
      btnEliminar.style.marginLeft = '1rem';
      btnEliminar.style.cursor = 'pointer';
      btnEliminar.addEventListener('click', () => {
        const actual = JSON.parse(localStorage.getItem(clave)) || [];
        actual.splice(index, 1);
        if (actual.length === 0) {
          localStorage.removeItem(clave);
        } else {
          localStorage.setItem(clave, JSON.stringify(actual));
        }
        renderEvaluaciones(actual, clave); // Recarga todo
      });

      div.appendChild(btnEliminar);
      listaEvaluaciones.appendChild(div);
    });
  }

  const evaluacionesGuardadas = JSON.parse(localStorage.getItem(clave)) || [];
  renderEvaluaciones(evaluacionesGuardadas, clave);

  form.querySelector('.btn-agregar').addEventListener('click', () => {
    const nombreEval = form.nombreEvaluacion.value.trim();
    const fechaIni = form.fechaInicio.value;
    const fechaFin = form.fechaFinal.value;
    const esObligatoria = form.obligatoria.checked;
    const esEvaluable = form.evaluable.checked;
    const esGrupal = form.grupal.checked;
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

    const nuevaEval = {
      nombreEval,
      obligatoria: esObligatoria,
      evaluable: esEvaluable,
      grupal: esGrupal,
      porcentaje: esEvaluable ? porcentajeVal : "",
      fechaInicio: fechaIni,
      fechaFinal: fechaFin
    };

    const evaluacionesActuales = JSON.parse(localStorage.getItem(clave)) || [];
    evaluacionesActuales.push(nuevaEval);
    localStorage.setItem(clave, JSON.stringify(evaluacionesActuales));

    renderEvaluaciones(evaluacionesActuales, clave);
    form.reset();
    porcentajeInput.disabled = true;
  });

  body.appendChild(form);
  body.appendChild(listaEvaluaciones);
} else {
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

    const claveTexto = `contenido_${moduloTitulo}_${nombre}`;
    const existentes = JSON.parse(localStorage.getItem(claveTexto)) || [];

    function renderTexto(texto, index) {
      const div = document.createElement('div');
      div.textContent = texto;

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
      btnEliminar.style.marginLeft = '1rem';
      btnEliminar.style.cursor = 'pointer';
      btnEliminar.addEventListener('click', () => {
        const nuevos = JSON.parse(localStorage.getItem(claveTexto)) || [];
        nuevos.splice(index, 1);
        if (nuevos.length === 0) {
          localStorage.removeItem(claveTexto);
        } else {
          localStorage.setItem(claveTexto, JSON.stringify(nuevos));
        }
        div.remove();
      });

      div.appendChild(btnEliminar);
      listaContenidos.appendChild(div);
    }

    existentes.forEach((txt, i) => renderTexto(txt, i));

    form.querySelector('.btn-agregar').addEventListener('click', () => {
      const input = form.contenido.value.trim();
      if (!input) {
        alert('Por favor ingresa contenido válido.');
        return;
      }

      const actuales = JSON.parse(localStorage.getItem(claveTexto)) || [];
      actuales.push(input);
      localStorage.setItem(claveTexto, JSON.stringify(actuales));

      renderTexto(input, actuales.length - 1);
      form.contenido.value = '';
    });

    body.appendChild(form);
    body.appendChild(listaContenidos);
  }

  header.addEventListener('click', () => {
    const isActive = header.classList.toggle('active');
    body.style.display = isActive ? 'block' : 'none';
  });

  itemDiv.appendChild(header);
  itemDiv.appendChild(body);

  return itemDiv;
}

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
    const itemElemento = crearItem(item, esEntregable, esModuloIntro, titulo);
    body.appendChild(itemElemento);
  });

  header.addEventListener('click', () => {
    const isActive = header.classList.toggle('active');
    body.style.display = isActive ? 'block' : 'none';
  });

  modulo.appendChild(header);
  modulo.appendChild(body);

  return modulo;
}

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

const itemsSemana = [
  "Pregunta generadora",
  "Antes de la sesión sincrónica",
  "Durante la sesión sincrónica",
  "Después de la sesión sincrónica",
  "Entregables de la semana",
  "Recursos de apoyo"
];

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
