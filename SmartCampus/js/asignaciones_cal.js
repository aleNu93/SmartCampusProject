// js/asignaciones_cal.js
document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
   * 1) Llenar lista de tareas
   * =========================== */
  const lista = document.querySelector('.lista-tareas');
  if (lista) {
    lista.innerHTML = ''; // limpiamos

    // Escanear claves de evaluaciones del profe
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('evaluaciones_')) continue;

      // "evaluaciones_<modulo>_<item>"
      const [, rawModulo, rawItem] = key.split('_');
      const modulo = decodeURIComponent(rawModulo || '');
      const item   = decodeURIComponent(rawItem || '');

      let evs = [];
      try {
        evs = JSON.parse(localStorage.getItem(key)) || [];
      } catch {
        evs = [];
      }

      evs.forEach((e, idx) => {
        const li = document.createElement('li');
        const a  = document.createElement('a');
        a.classList.add('titulo-tarea');

        // link a la vista de la asignación seleccionada
        a.href = `asignacion.html?modulo=${encodeURIComponent(modulo)}&item=${encodeURIComponent(item)}&idx=${idx}`;

        // INFO DETALLADA
        a.innerHTML = `
          <div class="tarea-titulo">${e?.nombreEval ?? 'Evaluación'}</div>
          <div class="tarea-meta">
            <span class="estado">Abierto</span>
            <span class="fecha">Fecha de entrega ${e?.fechaFinal ?? ''}</span>
            <span class="puntos">${e?.evaluable ? (e?.porcentaje ?? 0) + ' %' : '0 pts'}</span>
          </div>
        `;

        li.appendChild(a);
        lista.appendChild(li);
      });
    }

    if (!lista.children.length) {
      const li = document.createElement('li');
      li.textContent = 'Aún no hay tareas asignadas.';
      lista.appendChild(li);
    }
  }

  /* ===========================
   * 2) Menú hamburguesa (igual a panel_grupo)
   * =========================== */
  const btnMenu = document.getElementById("btnMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const sidebar = document.getElementById("sidebar");
  const menuList = document.getElementById("menuList");

  if (btnMenu && btnCerrarMenu && sidebar && menuList) {
    const opcionesMenu = [
      { texto: "Dashboard del profesor", href: "dashboard_profesor.html" },
      { texto: "Seleccionar curso", href: "seleccionar_grupo_curso.html" },
      { texto: "Cerrar sesión", href: "index.html" }
    ];

    menuList.innerHTML = "";
    opcionesMenu.forEach(op => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = op.href;
      a.textContent = op.texto;
      li.appendChild(a);
      menuList.appendChild(li);
    });

    btnMenu.addEventListener("click", () => sidebar.classList.add("open"));
    btnCerrarMenu.addEventListener("click", () => sidebar.classList.remove("open"));
    menuList.addEventListener("click", e => {
      if (e.target.tagName === "A") sidebar.classList.remove("open");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    });
  }
});
