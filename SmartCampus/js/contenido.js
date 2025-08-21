document.addEventListener('DOMContentLoaded', () => {
  // ===== Header dinámico (grupo/curso por querystring) =====
  const params = new URLSearchParams(window.location.search);
  const grupo = params.get('grupo') || 'Grupo desconocido';
  const curso = params.get('curso') || 'Curso desconocido';
  const header = document.getElementById('header-contenido');
  if (header) header.textContent = `Contenido del Curso - ${grupo} - ${curso}`;

  // ===== Menú hamburguesa (arreglado el scope) =====
  const btnMenu = document.getElementById("btnMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const sidebar = document.getElementById("sidebar");
  const menuList = document.getElementById("menuList");

  const opcionesMenu = [
    { texto: "Dashboard del profesor", href: "dashboard_profesor.html" },
    { texto: "Seleccionar curso", href: "seleccionar_grupo_curso.html" },
    { texto: "Panel curso", href: "panel_grupo.html" },
    { texto: "Cerrar sesión", href: "index.html" }
  ];

  if (menuList) {
    menuList.innerHTML = "";
    opcionesMenu.forEach(op => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = op.href;
      a.textContent = op.texto;
      li.appendChild(a);
      menuList.appendChild(li);
    });

    menuList.addEventListener("click", e => {
      if (e.target.tagName === "A") sidebar.classList.remove("open");
    });
  }

  btnMenu?.addEventListener("click", () => sidebar.classList.add("open"));
  btnCerrarMenu?.addEventListener("click", () => sidebar.classList.remove("open"));

  // ====== Tu funcionalidad (persistente con localStorage) ======
  const contenidoContainer = document.getElementById('contenidoContainer');

  // Helpers evaluaciones
  const claveEvalKey = (mod, item) => `evaluaciones_${mod}_${item}`;
  const cargarEvaluaciones = (mod, item) =>
    JSON.parse(localStorage.getItem(claveEvalKey(mod, item)) || "[]");
  const guardarEvaluaciones = (mod, item, arr) =>
    localStorage.setItem(claveEvalKey(mod, item), JSON.stringify(arr));

  // Helpers textos
  const claveTextoKey = (mod, item) => `contenido_${mod}_${item}`;
  const cargarTextos = (mod, item) =>
    JSON.parse(localStorage.getItem(claveTextoKey(mod, item)) || "[]");
  const guardarTextos = (mod, item, arr) =>
    localStorage.setItem(claveTextoKey(mod, item), JSON.stringify(arr));

  function crearItem(nombre, esEntregable = false, esNoEditable = false, moduloTitulo = '') {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('modulo-item');
    itemDiv.style.marginBottom = '1rem';

    const header = document.createElement('div');
    header.classList.add('modulo-header');
    header.style.cursor = 'pointer';
    header.innerHTML = `${nombre} <i class="fas fa-chevron-right"></i>`;

    const body = document.createElement('div');
    body.classList.add('modulo-body');
    body.style.display = 'none';

    if (esNoEditable) {
      const p = document.createElement('p');
      p.textContent = `Contenido fijo: "${nombre}"`;
      body.appendChild(p);

    } else if (esEntregable) {
      // ---- Entregables (persistentes + cards + borrar) ----
      const form = document.createElement('form');
      form.classList.add('modulo-form');
      form.innerHTML = `
        <label>Nombre de la evaluación:
          <input type="text" name="nombreEvaluacion" required placeholder="Nombre…" />
        </label><br/><br/>
        <label><input type="checkbox" name="obligatoria" /> Obligatoria</label><br/>
        <label><input type="checkbox" name="evaluable" /> Evaluable</label><br/>
        <label><input type="checkbox" name="grupal" /> Grupal</label><br/>
        <label>Porcentaje:
          <input type="number" name="porcentaje" min="0" max="100" disabled placeholder="%" />
        </label><br/><br/>
        <label>Inicio: <input type="date" name="fechaInicio" required /></label><br/><br/>
        <label>Final: <input type="date" name="fechaFinal" required /></label><br/><br/>
        <button type="button" class="btn-agregar">Agregar evaluación</button>
      `;
      body.appendChild(form);

      const listaEvaluaciones = document.createElement('div');
      body.appendChild(listaEvaluaciones);

      const chkEval = form.querySelector('input[name="evaluable"]');
      const inpPorc = form.querySelector('input[name="porcentaje"]');
      chkEval.addEventListener('change', () => {
        inpPorc.disabled = !chkEval.checked;
        if (!chkEval.checked) inpPorc.value = '';
      });

      function renderEvaluaciones() {
        const evs = cargarEvaluaciones(moduloTitulo, nombre);
        listaEvaluaciones.innerHTML = '';
        evs.forEach((e, idx) => {
          const card = document.createElement('div');
          card.classList.add('entregable-card');
          card.innerHTML = `
            <div class="entregable-header">
              <h3>${e.nombreEval}</h3>
              <span class="puntos">${e.evaluable ? e.porcentaje + '%' : '-'}</span>
            </div>
            <div class="entregable-body">
              <p>Obligatoria: <span>${e.obligatoria ? 'Sí' : 'No'}</span></p>
              <p>Evaluable: <span>${e.evaluable ? 'Sí' : 'No'}</span></p>
              <p>Grupal: <span>${e.grupal ? 'Sí' : 'No'}</span></p>
              <p>Inicio: <span>${e.fechaInicio}</span></p>
              <p>Final: <span>${e.fechaFinal}</span></p>
            </div>
          `;
          const btnDel = document.createElement('button');
          btnDel.textContent = '🗑️';
          btnDel.addEventListener('click', () => {
            evs.splice(idx, 1);
            const clave = claveEvalKey(moduloTitulo, nombre);
            if (evs.length === 0) localStorage.removeItem(clave);
            else guardarEvaluaciones(moduloTitulo, nombre, evs);
            renderEvaluaciones();
          });
          card.querySelector('.entregable-header').appendChild(btnDel);
          listaEvaluaciones.appendChild(card);
        });
      }

      renderEvaluaciones();

      form.querySelector('.btn-agregar').addEventListener('click', () => {
        const n  = form.nombreEvaluacion.value.trim();
        const ob = form.obligatoria.checked;
        const ev = form.evaluable.checked;
        const gr = form.grupal.checked;
        const pt = inpPorc.value;
        const ini = form.fechaInicio.value;
        const fin = form.fechaFinal.value;
        if (!n || !ini || !fin || (ev && (!pt || pt <= 0 || pt > 100))) {
          alert('Revisa los datos de la evaluación.');
          return;
        }
        const arr = cargarEvaluaciones(moduloTitulo, nombre);
        arr.push({ nombreEval: n, obligatoria: ob, evaluable: ev, porcentaje: ev ? pt : '', grupal: gr, fechaInicio: ini, fechaFinal: fin });
        guardarEvaluaciones(moduloTitulo, nombre, arr);
        form.reset();
        inpPorc.disabled = true;
        renderEvaluaciones();
      });

    } else {
      // ---- Contenido de texto (persistente + borrar) ----
      const form = document.createElement('form');
      form.classList.add('modulo-form');
      form.innerHTML = `
        <label>Agregar contenido para "${nombre}":
          <input type="text" name="contenido" required placeholder="Escribe aquí..." />
        </label>
        <button type="button" class="btn-agregar">Agregar</button>
      `;
      body.appendChild(form);

      const listaContenidos = document.createElement('div');
      listaContenidos.classList.add('lista-contenidos');
      body.appendChild(listaContenidos);

      const renderTextos = () => {
        const arr = cargarTextos(moduloTitulo, nombre);
        listaContenidos.innerHTML = '';
        arr.forEach((txt, i) => {
          const div = document.createElement('div');
          div.textContent = txt;
          const btnDel = document.createElement('button');
          btnDel.textContent = '🗑️';
          btnDel.style.marginLeft = '1rem';
          btnDel.addEventListener('click', () => {
            arr.splice(i, 1);
            guardarTextos(moduloTitulo, nombre, arr);
            renderTextos();
          });
          div.appendChild(btnDel);
          listaContenidos.appendChild(div);
        });
      };

      renderTextos();

      form.querySelector('.btn-agregar').addEventListener('click', () => {
        const valor = form.contenido.value.trim();
        if (!valor) return alert('Ingresa un texto válido.');
        const arr = cargarTextos(moduloTitulo, nombre);
        arr.push(valor);
        guardarTextos(moduloTitulo, nombre, arr);
        form.contenido.value = '';
        renderTextos();
      });
    }

    // Toggle acordeón
    header.addEventListener('click', () => {
      const abierto = header.classList.toggle('active');
      body.style.display = abierto ? 'block' : 'none';
    });

    itemDiv.appendChild(header);
    itemDiv.appendChild(body);
    return itemDiv;
  }

  function crearModulo(titulo, items) {
    const modulo = document.createElement('div');
    modulo.classList.add('modulo-item');

    const h = document.createElement('div');
    h.classList.add('modulo-header');
    h.style.cursor = 'pointer';
    h.innerHTML = `${titulo} <i class="fas fa-chevron-right"></i>`;

    const b = document.createElement('div');
    b.classList.add('modulo-body');
    b.style.display = 'none';

    const esIntro = titulo === "Módulo Introductorio";
    items.forEach(item => {
      const isEnt = item.toLowerCase() === 'entregables de la semana';
      b.appendChild(crearItem(item, isEnt, esIntro, titulo));
    });

    h.addEventListener('click', () => {
      const o = h.classList.toggle('active');
      b.style.display = o ? 'block' : 'none';
    });

    modulo.appendChild(h);
    modulo.appendChild(b);
    return modulo;
  }

  // Datos base (tus módulos + semanas)
  const modulosBase = [
    { titulo: "Módulo Introductorio", items: ["Consentimiento informado","Plantilla para contratos de trabajo","Plantillas para minutas de trabajo","Foro de presentación","Foro de preguntas y respuestas","Recursos de apoyo"] },
    { titulo: "Información del curso",    items: ["Descripción del curso","Competencias","Contactar al docente","Políticas institucionales","Sílabos","Bibliografía recomendada"] }
  ];
  const itemsSemana = ["Pregunta generadora","Antes de la sesión sincrónica","Durante la sesión sincrónica","Después de la sesión sincrónica","Entregables de la semana","Recursos de apoyo"];
  const modulosIniciales = [
    ...modulosBase,
    ...Array.from({ length: 15 }, (_, i) => ({ titulo: `Semana ${i+1}`, items: itemsSemana }))
  ];

  // Render
  const cont = document.getElementById('contenidoContainer');
  modulosIniciales.forEach(m => cont.appendChild(crearModulo(m.titulo, m.items)));
});
