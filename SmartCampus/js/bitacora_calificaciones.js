// Bitácora de calificaciones — acordeón por cuatrimestre + menú (SIN tabla/filtros)
// Estados "Reprobada / Quemada" eliminados: siempre muestra "Aprobada".
(function(){
  const $ = (s, ctx=document) => ctx.querySelector(s);

  const KEY = "bitacora_calificaciones";
  const EXP_KEY = "expediente_periodos";

  // Helpers
  const get  = k => { try{ return localStorage.getItem(k); }catch{return null;} };
  const set  = (k,v) => { try{ localStorage.setItem(k,v); }catch{} };
  const parse= (s,f=[]) => { try{ const j = JSON.parse(s); return j ?? f; }catch{ return f; } };
  const fmt  = ts => new Date(ts||Date.now()).toLocaleString();

  // ===== Menú lateral =====
  function initMenu(){
    const side = $("#sideMenu");
    const overlay = $("#backdrop");
    const open = () => { side.classList.add("active"); overlay.classList.add("active"); };
    const close= () => { side.classList.remove("active"); overlay.classList.remove("active"); };
    $("#btnMenu")?.addEventListener("click", open);
    $("#btnMenuClose")?.addEventListener("click", close);
    overlay?.addEventListener("click", close);
    close(); // arrancar cerrado
  }

  // ===== Usuario (solo para mostrar nombre si existe) =====
  function initUser(){
    const u = parse(get("usuarioActivo"), null);
    $("#nombreUsuario").textContent =
      (u && u.nombre && u.apellido) ? `${u.nombre} ${u.apellido}` :
      (u && u.user) ? u.user.split("@")[0] : "Estudiante";
  }

  // ===== API pública para registrar movimientos (se mantiene por si la usan en otro lado) =====
  window.appendBitacoraRegistro = function(reg){
    const arr = parse(get(KEY), []);
    arr.push({
      id: Date.now() + "_" + Math.random().toString(36).slice(2,8),
      ts: Date.now(),
      periodo: reg.periodo || get("periodoActual") || "1CO2025",
      curso: reg.curso || get("cursoActual") || "Curso",
      evaluacion: reg.evaluacion || "Evaluación",
      antes: reg.antes ?? null,
      ahora: reg.ahora ?? null,
      actor: reg.actor || "profesor",
      estado: "Aprobada",      // forzamos "Aprobada"
      quemada: false           // nunca quemada
    });
    set(KEY, JSON.stringify(arr));
  };

  // ===== Semillas =====
  function seedBitacoraIfEmpty(){
    const curr = parse(get(KEY), []);
    if (curr.length) return;
    const seed = [
      {periodo:"1CO2025", curso:"Ingeniería de Software", evaluacion:"Sprint 1", antes:0,  ahora:90, actor:"profesor", estado:"Aprobada", ts: Date.parse("2025-02-10")},
      {periodo:"3CO2024", curso:"Bases de Datos",         evaluacion:"Laboratorio 3", antes:70, ahora:75, actor:"profesor", estado:"Aprobada", ts: Date.parse("2024-11-10")},
      {periodo:"2CO2024", curso:"Física I",               evaluacion:"Reposición",    antes:59, ahora:59, actor:"profesor", estado:"Aprobada", ts: Date.parse("2024-07-20")},
      {periodo:"2CO2024", curso:"Inglés A2",              evaluacion:"Oral",          antes:80, ahora:85, actor:"profesor", estado:"Aprobada", ts: Date.parse("2024-07-15")},
      {periodo:"1CO2024", curso:"Cálculo I",              evaluacion:"Examen Final",  antes:55, ahora:55, actor:"profesor", estado:"Aprobada", ts: Date.parse("2024-03-28")},
      {periodo:"1CO2024", curso:"Programación I",         evaluacion:"Proyecto",      antes:68, ahora:72, actor:"profesor", estado:"Aprobada", ts: Date.parse("2024-03-25")}
    ];
    set(KEY, JSON.stringify(seed));
  }

  function seedExpedienteIfEmpty(){
    const curr = parse(get(EXP_KEY), []);
    if (curr.length) return;
    const exp = [
      {
        periodo:"1CO2024",
        cursos:[
          {curso:"Fundamentos de tecnología de la información", porcentaje:82, estado:"Aprobada"},
          {curso:"Precálculo",                                   porcentaje:65, estado:"Aprobada"},
          {curso:"Freshman seminar: relaciones humanas",         porcentaje:90, estado:"Aprobada"},
          {curso:"Inglés I",                                     porcentaje:88, estado:"Aprobada"},
          {curso:"Fundamentos de programación",                  porcentaje:78, estado:"Aprobada"}
        ]
      },
      {
        periodo:"2CO2024",
        cursos:[
          {curso:"Organización y arquitectura computacionales",  porcentaje:72, estado:"Aprobada"},
          {curso:"Cálculo I",                                    porcentaje:58, estado:"Aprobada"},
          {curso:"Salud, deporte y bienestar",                   porcentaje:85, estado:"Aprobada"},
          {curso:"Inglés II",                                    porcentaje:76, estado:"Aprobada"},
          {curso:"Programación paralela y distribuida",          porcentaje:69, estado:"Aprobada"}
        ]
      },
      {
        periodo:"3CO2024",
        cursos:[
          {curso:"Estructuras de datos y algoritmos",            porcentaje:73, estado:"Aprobada"},
          {curso:"Sistemas operativos",                          porcentaje:81, estado:"Aprobada"},
          {curso:"Elementos de probabilidad y estadística",      porcentaje:67, estado:"Aprobada"},
          {curso:"Inglés III",                                   porcentaje:79, estado:"Aprobada"},
          {curso:"Ingeniería de requerimientos de software",     porcentaje:83, estado:"Aprobada"}
        ]
      },
      {
        periodo:"1CO2025",
        cursos:[
          {curso:"Base de datos",                                porcentaje:74, estado:"Aprobada"},
          {curso:"Redes",                                        porcentaje:70, estado:"Aprobada"},
          {curso:"Ingeniería económica",                         porcentaje:61, estado:"Aprobada"},
          {curso:"Inglés IV",                                    porcentaje:90, estado:"Aprobada"},
          {curso:"Diseño y arquitectura de software",            porcentaje:86, estado:"Aprobada"}
        ]
      },
      {
        periodo:"2CO2025",
        cursos:[
          {curso:"Seguridad informática y protección de datos",  porcentaje:84, estado:"Aprobada"},
          {curso:"Gestión de proyectos de software",             porcentaje:77, estado:"Aprobada"},
          {curso:"Lenguaje de consulta de base de datos",        porcentaje:71, estado:"Aprobada"},
          {curso:"Argumentación y retórica",                     porcentaje:92, estado:"Aprobada"}
        ]
      }
    ];
    set(EXP_KEY, JSON.stringify(exp));
  }

  // ===== Normalización de datos existentes en localStorage =====
  // Cambia cualquier estado "Reprobada" a "Aprobada" y limpia 'quemada'.
  function normalizeExpediente(){
    const exp = parse(get(EXP_KEY), []);
    let changed = false;
    exp.forEach(p => p.cursos?.forEach(c => {
      if (typeof c.estado === "string" && /reprob/i.test(c.estado)) { c.estado = "Aprobada"; changed = true; }
      if (c.quemada) { c.quemada = false; changed = true; }
    }));
    if (changed) set(EXP_KEY, JSON.stringify(exp));
  }

  // ===== Acordeón (ordenado por año y luego cuatrimestre 1→2→3) =====
  function renderAccordion(){
    const cont = $("#accordionPeriodos");
    const data = parse(get(EXP_KEY), []);
    cont.innerHTML = "";

    // Parse "1CO2024" -> {year: 2024, cuatr: 1}
    const parsePeriodo = (s) => {
      const m = String(s).toUpperCase().match(/^(\d)\s*CO\s*(\d{4})$/);
      if (m) return { year: parseInt(m[2], 10), cuatr: parseInt(m[1], 10) };
      const year = parseInt(String(s).slice(-4), 10) || 0;
      const cuatr = parseInt(String(s)[0], 10) || 0;
      return { year, cuatr };
    };

    const ordered = data.slice().sort((a, b) => {
      const A = parsePeriodo(a.periodo);
      const B = parsePeriodo(b.periodo);
      if (A.year !== B.year) return A.year - B.year;
      return A.cuatr - B.cuatr;
    });

    ordered.forEach((p, i) => {
      const box = document.createElement("div");
      box.className = "periodo";
      box.innerHTML = `
        <button type="button" class="periodo-head" aria-expanded="false">
          <span class="badge-periodo">${p.periodo}</span>
          <span class="meta">${p.cursos.length} materias</span>
          <span class="caret">▾</span>
        </button>
        <div class="periodo-content">
          <div class="grid-materias">
            ${p.cursos.map(c => `
              <div class="materia">
                <div class="m-title">${c.curso}</div>
                <div class="m-meta">
                  <span class="m-porc">${Number(c.porcentaje)}%</span>
                  <span class="badge badge-ok">Aprobada</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
      const head = box.querySelector(".periodo-head");
      head.addEventListener("click", () => {
        const open = box.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });

      // Abre el más reciente por defecto (último del orden ascendente)
      if (i === ordered.length - 1) {
        box.classList.add("open");
        head.setAttribute("aria-expanded","true");
      }

      cont.appendChild(box);
    });
  }

  // ===== Init =====
  document.addEventListener("DOMContentLoaded", () => {
    initUser();
    initMenu();

    seedBitacoraIfEmpty();
    seedExpedienteIfEmpty();

    // normaliza lo ya guardado
    normalizeExpediente();

    renderAccordion();
  });
})();
