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
function crearItem(nombre, esEntregable = false) {
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

  if (esEntregable) {
    const link = document.createElement('a');
    link.href = "entregables.html";
    link.target = "_blank";
    link.textContent = nombre;
    link.style.color = '#1B4F72';
    link.style.textDecoration = 'underline';
    body.appendChild(link);
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

  // Botón guardar en cada ítem
  const btnGuardar = crearBotonGuardar();
  body.appendChild(btnGuardar);

  header.addEventListener('click', () => {
    const isActive = header.classList.toggle('active');
    body.style.display = isActive ? 'block' : 'none';
  });

  itemDiv.appendChild(header);
  itemDiv.appendChild(body);

  return itemDiv;
}

// Función para crear un módulo con todos sus ítems y botón guardar al final
function crearModulo(titulo, items, semanaNumero = null) {
  const modulo = document.createElement('div');
  modulo.classList.add('modulo-item');

  const header = document.createElement('div');
  header.classList.add('modulo-header');
  header.style.cursor = 'pointer';
  header.innerHTML = `${titulo} <i class="fas fa-chevron-right"></i>`;

  const body = document.createElement('div');
  body.classList.add('modulo-body');
  body.style.display = 'none';

  items.forEach(item => {
    const esEntregable = item.toLowerCase() === "entregables de la semana";
    const itemElemento = crearItem(item, esEntregable);
    body.appendChild(itemElemento);
  });

  // Botón guardar al final del módulo principal
  const btnGuardarModulo = crearBotonGuardar();
  btnGuardarModulo.style.marginBottom = '1rem';
  body.appendChild(btnGuardarModulo);

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
