// contenido_est.js
document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenidoContainerEstudiante');

  // 1. Configuración de módulos y semanas
  const modulos = [
    { titulo: "Módulo Introductorio", items: ["Consentimiento informado","Plantilla para contratos de trabajo","Plantillas para minutas de trabajo","Foro de presentación","Foro de preguntas y respuestas","Recursos de apoyo"] },
    { titulo: "Información del curso",    items: ["Descripción del curso","Competencias","Contactar al docente","Políticas institucionales","Sílabos","Bibliografía recomendada"] }
  ];
  const itemsSemana = ["Pregunta generadora","Antes de la sesión sincrónica","Durante la sesión sincrónica","Después de la sesión sincrónica","Entregables de la semana","Recursos de apoyo"];
  const modulosCompletos = [
    ...modulos,
    ...Array.from({ length: 15 }, (_, i) => ({ titulo: `Semana ${i+1}`, items: itemsSemana }))
  ];

  // 2. Funciones profe
  const cargarProfesorContenidos = (mod, item) => {
    const k = `contenido_${mod}_${item}`;
    return JSON.parse(localStorage.getItem(k)) || [];
  };
  const cargarProfesorEvaluaciones = (mod, item) => {
    const k = `evaluaciones_${mod}_${item}`;
    return JSON.parse(localStorage.getItem(k)) || [];
  };

  // 3. Funciones estudiante con índice
  const claveRespuestas = (mod, item, idx) => `respuestas_${mod}_${item}_${idx}`;
  const cargarRespuestas = (mod, item, idx) =>
    JSON.parse(localStorage.getItem(claveRespuestas(mod, item, idx))) || [];
  const guardarRespuestas = (mod, item, idx, arr) =>
    localStorage.setItem(claveRespuestas(mod, item, idx), JSON.stringify(arr));

  // 4. Crear cada ítem
  function crearItemEstudiante(nombre, moduloTitulo) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('accordion-item');

    const btn = document.createElement('button');
    btn.classList.add('accordion-toggle');
    btn.textContent = nombre;

    const body = document.createElement('div');
    body.classList.add('accordion-content');
    body.style.display = 'none';

    const esEntregable = nombre.toLowerCase() === "entregables de la semana";
    const profItems = esEntregable
      ? cargarProfesorEvaluaciones(moduloTitulo, nombre)
      : cargarProfesorContenidos(moduloTitulo, nombre);

    if (profItems.length === 0) {
      const aviso = document.createElement('p');
      aviso.textContent = 'Aún no hay contenido asignado para este ítem.';
      body.appendChild(aviso);
    } else if (esEntregable) {
      // Por cada asignación, su card + su campo de respuesta
      profItems.forEach((entry, idx) => {
        // 4.1 Card de la asignación
        const card = document.createElement('div');
        card.classList.add('entregable-card');
        card.innerHTML = `
          <div class="entregable-header">
            <h3>${entry.nombreEval}</h3>
            <span class="puntos">${entry.evaluable ? entry.porcentaje + '%' : '-' } pts</span>
          </div>
          <div class="entregable-body">
            <p>Obligatoria: <strong>${entry.obligatoria ? 'Sí' : 'No'}</strong></p>
            <p>Grupal: <strong>${entry.grupal ? 'Sí' : 'No'}</strong></p>
            <p>Inicio: <strong>${entry.fechaInicio}</strong></p>
            <p>Final: <strong>${entry.fechaFinal}</strong></p>
          </div>
        `;
        body.appendChild(card);

        // 4.2 Respuestas previas de este idx
        const respArr = cargarRespuestas(moduloTitulo, nombre, idx);
        respArr.forEach(r => {
          const rd = document.createElement('div');
          rd.classList.add('respuesta-item');
          rd.innerHTML = `
            ${r.texto ? `<p>${r.texto}</p>` : ''}
            ${r.file ? `<a href="${r.file.data}" download="${r.file.name}">${r.file.name}</a>` : ''}
            <span class="fecha">Resp: ${r.fecha}</span>
          `;
          // botón borrar
          const btnDel = document.createElement('button');
          btnDel.textContent = '🗑️';
          btnDel.addEventListener('click', () => {
            const i = respArr.indexOf(r);
            if (i > -1) respArr.splice(i,1);
            if (respArr.length) guardarRespuestas(moduloTitulo, nombre, idx, respArr);
            else localStorage.removeItem(claveRespuestas(moduloTitulo, nombre, idx));
            rd.remove();
          });
          rd.appendChild(btnDel);
          body.appendChild(rd);
        });

        // 4.3 Campo de texto para esta asignación
        const ta = document.createElement('textarea');
        ta.placeholder = 'Escribe aquí tu entrega o comentario...';
        body.appendChild(ta);

        // 4.4 Zona de drop + input PDF
        const dropZone = document.createElement('div');
        dropZone.classList.add('file-drop-zone');
        dropZone.textContent = 'Arrastra tu PDF aquí o haz clic';
        body.appendChild(dropZone);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/pdf';
        fileInput.style.display = 'none';
        body.appendChild(fileInput);

        let selectedFile = null;
        const handleFile = file => {
          const reader = new FileReader();
          reader.onload = e => {
            selectedFile = { name: file.name, data: e.target.result };
            dropZone.textContent = `📄 ${file.name}`;
          };
          reader.readAsDataURL(file);
        };
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', e => {
          e.preventDefault(); dropZone.classList.remove('dragover');
          if (e.dataTransfer.files[0]?.type==='application/pdf') handleFile(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', () => {
          if (fileInput.files[0]?.type==='application/pdf') handleFile(fileInput.files[0]);
        });

        // 4.5 Botón enviar para esta asignación
        const btnResp = document.createElement('button');
        btnResp.textContent = 'Enviar entrega';
        btnResp.classList.add('entregable-responder');
        btnResp.addEventListener('click', () => {
          const texto = ta.value.trim();
          if (!texto && !selectedFile) {
            alert('Agrega texto o PDF antes de enviar.');
            return;
          }
          const nuevo = { texto, fecha: new Date().toLocaleString(), file: selectedFile };
          const arr = cargarRespuestas(moduloTitulo, nombre, idx);
          arr.push(nuevo);
          guardarRespuestas(moduloTitulo, nombre, idx, arr);

          const rd = document.createElement('div');
          rd.classList.add('respuesta-item');
          rd.innerHTML = `
            ${nuevo.texto ? `<p>${nuevo.texto}</p>` : ''}
            ${nuevo.file ? `<a href="${nuevo.file.data}" download="${nuevo.file.name}">${nuevo.file.name}</a>` : ''}
            <span class="fecha">Resp: ${nuevo.fecha}</span>
          `;
          const btnDelNew = document.createElement('button');
          btnDelNew.textContent = '🗑️';
          btnDelNew.addEventListener('click', () => {
            const arr2 = cargarRespuestas(moduloTitulo, nombre, idx);
            const j = arr2.indexOf(nuevo);
            if (j > -1) arr2.splice(j,1);
            if (arr2.length) guardarRespuestas(moduloTitulo, nombre, idx, arr2);
            else localStorage.removeItem(claveRespuestas(moduloTitulo, nombre, idx));
            rd.remove();
          });
          rd.appendChild(btnDelNew);
          body.appendChild(rd);

          ta.value = '';
          selectedFile = null;
          dropZone.textContent = 'Arrastra tu PDF aquí o haz clic';
        });
        body.appendChild(btnResp);

        // separador opcional
        const hr = document.createElement('hr');
        hr.style.margin = '1rem 0';
        body.appendChild(hr);
      });
    } else {
      // ... resto de secciones (texto, recursos, etc.) ...
    }

    // Toggle acordeón
    btn.addEventListener('click', () => {
      const open = btn.classList.toggle('active');
      body.style.display = open ? 'block' : 'none';
    });

    itemDiv.appendChild(btn);
    itemDiv.appendChild(body);
    return itemDiv;
  }

  // 5. Crear módulos
  function crearModulo(titulo, items) {
    const mod = document.createElement('div');
    mod.classList.add('accordion-item');
    const h = document.createElement('button');
    h.classList.add('accordion-toggle');
    h.textContent = titulo;
    const b = document.createElement('div');
    b.classList.add('accordion-content');
    b.style.display = 'none';
    items.forEach(it => b.appendChild(crearItemEstudiante(it, titulo)));
    h.addEventListener('click', () => {
      const o = h.classList.toggle('active');
      b.style.display = o ? 'block' : 'none';
    });
    mod.appendChild(h);
    mod.appendChild(b);
    return mod;
  }

  // 6. Render final
  modulosCompletos.forEach(m => {
    contenedor.appendChild(crearModulo(m.titulo, m.items));
  });

  // 7. Menú hamburguesa (funcional, sin inyectar estilos ni crear nodos)
  function initMenu(){
    const side    = document.getElementById('sideMenu');
    const overlay = document.getElementById('backdrop');
    const btnOpen = document.getElementById('btnMenu');
    const btnClose= document.getElementById('btnMenuClose');

    const open = () => {
      side?.classList.add('active');
      overlay?.classList.add('active');
      side?.setAttribute('aria-hidden','false');
      overlay?.setAttribute('aria-hidden','false');
    };
    const close = () => {
      side?.classList.remove('active');
      overlay?.classList.remove('active');
      side?.setAttribute('aria-hidden','true');
      overlay?.setAttribute('aria-hidden','true');
    };

    btnOpen?.addEventListener('click', open);
    btnClose?.addEventListener('click', close);
    overlay?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // arranca cerrado
    close();

    // resalta link activo
    const here = location.pathname.split('/').pop();
    document.querySelectorAll('.menu-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && here && href.toLowerCase() === here.toLowerCase()) {
        a.classList.add('active');
      }
    });
  }

  // Inicializa el menú al final del DOMContentLoaded principal (no anidamos otro listener)
  initMenu();
});
