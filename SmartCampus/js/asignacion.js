// asignacion.js — título + lista de entregas + notas + reclamos (compat calificaciones_estudiante)

(function () {
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const fmtFecha = (d = new Date()) => new Date(d).toLocaleString();

  // ================== TÍTULO ==================
  document.addEventListener('DOMContentLoaded', () => {
    const tituloEl = $("#titulo-asignacion");
    const sub = $("#subtitulo-asignacion");

    const params = new URLSearchParams(location.search);
    const modulo = decodeURIComponent(params.get("modulo") || "").trim();
    const item   = decodeURIComponent(params.get("item") || "").trim();
    const idxStr = params.get("idx");
    const idx    = Number.isFinite(Number(idxStr)) ? parseInt(idxStr, 10) : 0;

    // Misma clave que usa contenido.js (sin encode extra)
    const evalKey = `evaluaciones_${modulo}_${item}`;
    let evaluaciones = [];
    try { evaluaciones = JSON.parse(localStorage.getItem(evalKey)) || []; } catch {}
    const evalSel = evaluaciones[idx];
    const nombreEval = (evalSel && (evalSel.nombreEval || evalSel.titulo)) || "Asignación";

    if (tituloEl) tituloEl.textContent = nombreEval;
    if (sub && (modulo || item)) sub.textContent = [modulo, item].filter(Boolean).join(" • ");

    renderEntregas({ modulo, item, idx, nombreEval });
  });

  // ================== CHAT/RECLAMOS (CLAVES Y ESTADO — MISMO FORMATO QUE calificaciones_estudiante) ==================
  const chatKey = (mod, item, idx) => `chat_${mod}_${item}_${idx}`;

  function safeGetLS(k){ try { return localStorage.getItem(k); } catch { return null; } }
  function safeSetLS(k,v){ try { localStorage.setItem(k,v); } catch {} }
  function safeParse(str, fallback){ try { const j = JSON.parse(str); return j ?? fallback; } catch { return fallback; } }
  function dateToTs(d){ const t = (d instanceof Date)? d.getTime() : Date.parse(d); return Number.isFinite(t) ? t : Date.now(); }

  function loadChat(mod, item, idx, nombreEval) {
    const key = chatKey(mod, item, idx);
    let chat = safeParse(safeGetLS(key), []);
    if (!Array.isArray(chat)) chat = [];

    // ---- Migración legacy (igual que calificaciones_estudiante) ----
    try {
      const legacyReclamo = safeGetLS(`reclamo_${mod}_${item}_${idx}`);
      if (legacyReclamo && !chat.some(m => m?.text === legacyReclamo)) {
        chat.push({ from: 'estudiante', text: legacyReclamo, ts: Date.now(), readByStudent: true, readByProfessor: false });
      }
    } catch {}

    try {
      const reclamosGlobal = safeParse(safeGetLS('reclamos'), []);
      if (Array.isArray(reclamosGlobal)) {
        reclamosGlobal
          .filter(r => r && typeof r === 'object' && r.asignacion === nombreEval)
          .forEach(r => {
            const msg = String(r.mensaje || '').trim();
            if (!msg) return;
            if (!chat.some(m => m?.text === msg)) {
              chat.push({
                from: 'estudiante',
                text: msg,
                ts: dateToTs(r.fecha || Date.now()),
                readByStudent: true,
                readByProfessor: false
              });
            }
          });
      }
    } catch {}

    try {
      const legacyResp = safeGetLS(`respuesta_reclamo_${mod}_${item}_${idx}`);
      if (legacyResp && !chat.some(m => m?.text === legacyResp)) {
        chat.push({ from: 'profesor', text: legacyResp, ts: Date.now(), readByStudent: false, readByProfessor: true });
      }
    } catch {}

    // Normalización y orden
    chat = chat.filter(m => m && typeof m === 'object' && typeof m.text === 'string');
    chat.sort((a,b) => (a.ts||0) - (b.ts||0));
    safeSetLS(key, JSON.stringify(chat));
    return chat;
  }

  function saveChat(mod, item, idx, chat) {
    if (!Array.isArray(chat)) chat = [];
    safeSetLS(chatKey(mod, item, idx), JSON.stringify(chat));
  }

  // Unread para el PROFESOR: mensajes del estudiante no leídos por el profe
  function hasUnreadForProfessor(mod, item, idx, nombreEval) {
    const chat = loadChat(mod, item, idx, nombreEval);
    return chat.some(m => m.from === 'estudiante' && !m.readByProfessor);
  }

  // Marcar como leídos (lado profesor)
  function markReadForProfessor(mod, item, idx, nombreEval) {
    let chat = loadChat(mod, item, idx, nombreEval);
    let changed = false;
    chat = chat.map(m => {
      if (m.from === 'estudiante' && !m.readByProfessor) { changed = true; return { ...m, readByProfessor: true }; }
      return m;
    });
    if (changed) saveChat(mod, item, idx, chat);
    return chat;
  }

  // ================== RENDER ENTREGAS ==================
  function renderEntregas(ctx) {
    const { modulo, item, idx, nombreEval } = ctx;
    const tbody = $("#tbody-entregas");
    if (!tbody) return;

    const keyResp = `respuestas_${modulo}_${item}_${idx}`;
    let respuestas = [];
    try { respuestas = JSON.parse(localStorage.getItem(keyResp)) || []; } catch {}

    const usuarioNombre = localStorage.getItem("usuarioNombre") || "Estudiante";
    // const rol = localStorage.getItem("usuarioRol") || ""; // ya no condicionamos por rol

    tbody.innerHTML = "";

    if (!respuestas.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay entregas registradas para esta asignación.";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    respuestas.forEach((r, eIdx) => {
      const tr = document.createElement("tr");
      tr.className = "fila-entrega";

      // Col 1: Entrega
      const c1 = document.createElement("td");
      c1.innerHTML = `
        <div class="entrega-autor">👤 ${escapeHtml(r?.autor || usuarioNombre)}</div>
        <div class="entrega-contenido">
          ${r?.texto ? `<p>${escapeHtml(r.texto)}</p>` : ""}
          ${(r?.file && r.file.data && r.file.name)
            ? `<a class="link-archivo" href="${r.file.data}" download="${encodeAttr(r.file.name)}">📄 ${escapeHtml(r.file.name)}</a>`
            : ""}
        </div>
      `;

      // Col 2: Fecha
      const c2 = document.createElement("td");
      c2.textContent = r?.fecha || "—";

      // Col 3: Nota  (SIEMPRE editable acá, sin importar rol)
      const c3 = document.createElement("td");
      const wrap = document.createElement("div");
      wrap.className = "nota-wrap";

      const inp = document.createElement("input");
      inp.type = "number"; inp.min = "0"; inp.max = "100"; inp.step = "0.01";
      inp.value = (r?.nota ?? "");

      const btn = document.createElement("button");
      btn.textContent = "Guardar";
      btn.className = "btn-guardar-nota";

      btn.addEventListener("click", () => {
        const val = parseFloat(inp.value);
        if (Number.isNaN(val) || val < 0 || val > 100) {
          alert("Ingresa una nota válida (0–100).");
          return;
        }

        // 1) Guardar en respuestas_... (vista profe)
        respuestas[eIdx].nota = val;
        localStorage.setItem(keyResp, JSON.stringify(respuestas));

        // 2) Guardar para calificaciones_estudiante
        localStorage.setItem(`nota_${modulo}_${item}_${idx}`, String(val));
        localStorage.setItem(`nota_${modulo}_${item}_${idx}_${eIdx + 1}`, String(val));

        btn.textContent = "Guardado ✓";
        setTimeout(() => (btn.textContent = "Guardar"), 1000);
      });

      wrap.appendChild(inp);
      wrap.appendChild(btn);
      c3.appendChild(wrap);

      // Col 4: Acción — carta con puntito rojo (mismo marcado que calificaciones_estudiante)
      const c4 = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "acciones-entrega";

      if (r?.file && r.file.data && r.file.name) {
        const a = document.createElement("a");
        a.className = "btn-link";
        a.href = r.file.data;
        a.download = encodeAttr(r.file.name);
        actions.appendChild(a);
      }

      const recWrap = document.createElement("div");
      recWrap.className = "contenedor-reclamo";
      const unread = hasUnreadForProfessor(modulo, item, idx, nombreEval);
      recWrap.innerHTML = `
        <i class="fas fa-envelope icono-reclamo"></i>
        <span class="notificacion-reclamo${unread ? "" : " oculto"}"><i class="fas fa-circle"></i></span>
      `;
      actions.appendChild(recWrap);

      const notifSpan = recWrap.querySelector('.notificacion-reclamo');
      recWrap.querySelector('.icono-reclamo').addEventListener('click', () => {
        openChatModal(modulo, item, idx, nombreEval, notifSpan);
      });

      c4.appendChild(actions);

      tr.appendChild(c1);
      tr.appendChild(c2);
      tr.appendChild(c3);
      tr.appendChild(c4);
      tbody.appendChild(tr);
    });
  }

  // ================== MODAL CHAT (compat estructura) ==================
  function ensureModal() {
    if ($("#modal-reclamo")) return;
    const modal = document.createElement("div");
    modal.id = "modal-reclamo";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="contenido-modal">
        <span class="cerrar-modal" aria-label="Cerrar">&times;</span>
        <h2 style="margin-bottom:.6rem;">Reclamos</h2>
        <div id="chat-thread" class="chat-thread" style="max-height:45vh; overflow:auto; margin-bottom:10px;"></div>
        <textarea id="mensaje-reclamo" class="campo-mensaje" rows="3" placeholder="Escribe tu mensaje..."></textarea>
        <button id="btn-enviar-reclamo" class="boton-enviar" style="margin-top:10px;">Enviar</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.cerrar-modal').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target.id === 'modal-reclamo') modal.style.display = 'none'; });
  }

  function openChatModal(mod, item, idx, nombreEval, notifSpan) {
    ensureModal();
    const modal    = $("#modal-reclamo");
    const thread   = $("#chat-thread");
    const textarea = $("#mensaje-reclamo");
    const btnEnviar= $("#btn-enviar-reclamo");

    if (!modal || !thread || !textarea || !btnEnviar) return;

    let chat = markReadForProfessor(mod, item, idx, nombreEval); // marca leídos estudiante->profe
    if (notifSpan) notifSpan.classList.add('oculto');

    const renderThread = () => {
      thread.innerHTML = '';
      chat.forEach(m => {
        const line = document.createElement('div');
        line.className = `chat-msg ${m.from === 'estudiante' ? 'from-student' : 'from-prof'}`;
        const bubble = document.createElement('div');
        bubble.className = `bubble ${m.from === 'estudiante' ? 'bubble-student' : 'bubble-prof'}`;
        bubble.innerHTML = `
          <div>${escapeHtml(m.text || "")}</div>
          <div class="msg-meta">${fmtFecha(m.ts || Date.now())}</div>
        `;
        line.appendChild(bubble);
        thread.appendChild(line);
      });
      thread.scrollTop = thread.scrollHeight;
    };

    const send = () => {
      const text = (textarea.value || "").trim();
      if (!text) return;
      const nuevo = {
        from: 'profesor',
        text,
        ts: Date.now(),
        readByStudent: false,  // el estudiante aún no lo leyó
        readByProfessor: true
      };
      chat.push(nuevo);
      saveChat(mod, item, idx, chat);
      textarea.value = "";
      renderThread();
    };

    btnEnviar.onclick = send;
    textarea.onkeydown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); }
    };

    renderThread();
    modal.style.display = 'block';
  }

  // ================== HELPERS ==================
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function encodeAttr(str) {          // para atributos HTML (descarga de archivo)
    return String(str).replace(/"/g, "&quot;");
  }
})();
