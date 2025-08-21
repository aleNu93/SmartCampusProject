// js/calificaciones_estudiante.js
document.addEventListener('DOMContentLoaded', () => {
  const cursos = document.querySelectorAll('.curso-acordeon');

  // -------- utils ultra-defensivos --------
  const safeParse = (json, fallback) => {
    try { return JSON.parse(json); } catch { return fallback; }
  };
  const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const toNum = v => {
    if (v == null) return NaN;
    const n = parseFloat(String(v).replace('%','').trim());
    return Number.isFinite(n) ? n : NaN;
  };
  const safeGetLS = (k) => {
    try { return localStorage.getItem(k); } catch { return null; }
  };
  const safeSetLS = (k, v) => {
    try { localStorage.setItem(k, v); } catch {}
  };
  const lsLength = () => {
    try { return localStorage.length; } catch { return 0; }
  };
  const lsKey = (i) => {
    try { return localStorage.key(i); } catch { return null; }
  };

  // ---------- Evaluaciones del profe ----------
  function getEvaluaciones() {
    const out = [];
    const L = lsLength();
    for (let i = 0; i < L; i++) {
      const k = lsKey(i);
      if (!k || !k.startsWith('evaluaciones_')) continue;
      const parts = k.split('_');
      const modulo = parts[1];
      const item = parts.slice(2).join('_');
      const arr = safeParse(safeGetLS(k), []);
      if (!Array.isArray(arr)) continue;
      arr.forEach((ev, idx) => out.push({
        modulo, item, idx,
        nombreEval: ev?.nombreEval || `Evaluación ${idx+1}`
      }));
    }
    return out;
  }

  // ============= finder de notas robusto =================
  function findNota(modulo, item, idx) {
    const baseIdx  = `nota_${modulo}_${item}_${idx}`;
    const baseItem = `nota_${modulo}_${item}`;

    // 1) con idx e intento -> tomar intento más alto
    let best = null;
    for (let i = 0, L = lsLength(); i < L; i++) {
      const k = lsKey(i);
      if (!k || !k.startsWith(baseIdx + '_')) continue;
      const intento = parseInt(k.slice((baseIdx + '_').length), 10);
      const v = toNum(safeGetLS(k));
      if (!Number.isFinite(intento) || isNaN(v)) continue;
      if (!best || intento > best.intento) best = { intento, val: v };
    }
    if (best) return best.val;

    // 2) exacta sin intento
    const exact = toNum(safeGetLS(baseIdx));
    if (!isNaN(exact)) return exact;

    // 3) sin idx pero con intento (nivel item)
    let best2 = null;
    for (let i = 0, L = lsLength(); i < L; i++) {
      const k = lsKey(i);
      if (!k || !k.startsWith(baseItem + '_')) continue;
      const intento = parseInt(k.slice((baseItem + '_').length), 10);
      const v = toNum(safeGetLS(k));
      if (!Number.isFinite(intento) || isNaN(v)) continue;
      if (!best2 || intento > best2.intento) best2 = { intento, val: v };
    }
    if (best2) return best2.val;

    // 4) llana
    const simple = toNum(safeGetLS(baseItem));
    if (!isNaN(simple)) return simple;

    // 5) BORROSO
    const nMod = norm(modulo);
    const nItem = norm(item);
    let fuzzyBest = null; // {score, val}
    for (let i = 0, L = lsLength(); i < L; i++) {
      const k = lsKey(i);
      if (!k || !k.startsWith('nota_')) continue;
      const nk = norm(k);
      if (!nk.includes(nMod) || !nk.includes(nItem)) continue;

      const v = toNum(safeGetLS(k));
      if (isNaN(v)) continue;

      let score = 1;
      if (nk.includes('_' + String(idx) + '_') || nk.endsWith('_' + String(idx))) score += 2;
      if (/_\d+$/.test(nk)) score += 1;

      if (!fuzzyBest || score > fuzzyBest.score) fuzzyBest = { score, val: v };
    }
    return fuzzyBest ? fuzzyBest.val : NaN;
  }
  // =======================================================

  // ---------- Chat ----------
  const chatKey = (mod, item, idx) => `chat_${mod}_${item}_${idx}`;

  function dateToTs(d) {
    const t = (d instanceof Date) ? d.getTime() : Date.parse(d);
    return Number.isFinite(t) ? t : Date.now();
  }

  function loadChat(mod, item, idx, nombreEval) {
    const key = chatKey(mod, item, idx);
    let chat = safeParse(safeGetLS(key), []);
    if (!Array.isArray(chat)) chat = [];

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

    chat = chat.filter(m => m && typeof m === 'object' && typeof m.text === 'string');
    chat.sort((a,b) => (a.ts||0) - (b.ts||0));

    safeSetLS(key, JSON.stringify(chat));
    return chat;
  }

  function saveChat(mod, item, idx, chat) {
    if (!Array.isArray(chat)) chat = [];
    safeSetLS(chatKey(mod, item, idx), JSON.stringify(chat));
  }

  function hasUnreadFromProf(mod, item, idx, nombreEval) {
    const chat = loadChat(mod, item, idx, nombreEval);
    return chat.some(m => m.from === 'profesor' && !m.readByStudent);
  }

  function openChatModal(mod, item, idx, nombreEval, notifSpan) {
    const modal = document.getElementById('modal-reclamo');
    const thread = document.getElementById('chat-thread');
    const textarea = document.getElementById('mensaje-reclamo');
    const btnEnviar = document.getElementById('btn-enviar-reclamo');

    if (!modal || !thread || !textarea || !btnEnviar) return;

    let chat = loadChat(mod, item, idx, nombreEval);

    const renderThread = () => {
      thread.innerHTML = '';
      chat.forEach(m => {
        const line = document.createElement('div');
        line.className = `chat-msg ${m.from === 'estudiante' ? 'from-student' : 'from-prof'}`;
        const bubble = document.createElement('div');
        bubble.className = `bubble ${m.from === 'estudiante' ? 'bubble-student' : 'bubble-prof'}`;
        const fecha = new Date(m.ts || Date.now());
        bubble.innerHTML = `<div>${String(m.text||'').replace(/\n/g,'<br>')}</div><div class="msg-meta">${fecha.toLocaleString()}</div>`;
        line.appendChild(bubble);
        thread.appendChild(line);
      });
      thread.scrollTop = thread.scrollHeight;
    };

    chat = chat.map(m => (m.from === 'profesor' ? { ...m, readByStudent: true } : m));
    saveChat(mod, item, idx, chat);
    renderThread();
    if (notifSpan) notifSpan.classList.add('oculto');

    const send = () => {
      const text = textarea.value.trim();
      if (!text) return;
      chat.push({ from: 'estudiante', text, ts: Date.now(), readByStudent: true, readByProfessor: false });
      saveChat(mod, item, idx, chat);
      textarea.value = '';
      renderThread();
    };

    btnEnviar.onclick = send;
    textarea.onkeydown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); }
    };

    modal.style.display = 'block';
  }

  (function wireModal() {
    const modal = document.getElementById('modal-reclamo');
    const cerrar = document.querySelector('.cerrar-modal');
    if (cerrar) cerrar.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    window.addEventListener('click', e => { if (modal && e.target === modal) modal.style.display = 'none'; });
  })();

  // -------- Render calificaciones --------
  cursos.forEach((cursoEl, cursoIdx) => {
    const nombreCurso = cursoEl.querySelector('.info-curso h3').textContent.trim();
    const cont = cursoEl.querySelector('.contenido-acordeon');
    const spanFinal = cursoEl.querySelector('.porcentaje');

    cont.innerHTML = '';
    let suma = 0, count = 0;

    if (cursoIdx === 0) {
      const evals = getEvaluaciones();

      if (!evals.length) {
        const p = document.createElement('p');
        p.textContent = 'Aún no hay asignaciones.';
        cont.appendChild(p);
      } else {
        evals.forEach(({ modulo, item, idx, nombreEval }) => {
          const row = document.createElement('div');
          row.classList.add('item-calificacion');

          const name = document.createElement('span');
          name.classList.add('nombre-item');
          name.textContent = nombreEval;
          row.appendChild(name);

          const right = document.createElement('div');
          right.classList.add('contenedor-valor-reclamo');

          const valSpan = document.createElement('span');
          valSpan.classList.add('valor-item');

          const nota = findNota(modulo, item, idx);
          if (!isNaN(nota)) {
            valSpan.textContent = `${nota}%`;
            suma += nota; count++;
          } else {
            valSpan.textContent = 'Pendiente de calificación';
            valSpan.classList.add('pendiente');
          }
          right.appendChild(valSpan);

          const recWrap = document.createElement('div');
          recWrap.classList.add('contenedor-reclamo');
          let hasUnread = false;
          try { hasUnread = hasUnreadFromProf(modulo, item, idx, nombreEval); } catch { hasUnread = false; }
          recWrap.innerHTML = `
            <i class="fas fa-envelope icono-reclamo"></i>
            <span class="notificacion-reclamo${hasUnread ? '' : ' oculto'}"><i class="fas fa-circle"></i></span>
          `;
          right.appendChild(recWrap);

          const notifSpan = recWrap.querySelector('.notificacion-reclamo');
          recWrap.querySelector('.icono-reclamo').addEventListener('click', () => {
            openChatModal(modulo, item, idx, nombreEval, notifSpan);
          });

          row.appendChild(right);
          cont.appendChild(row);
        });
      }
    } else {
      const p = document.createElement('p');
      p.textContent = 'Aún no hay asignaciones.';
      cont.appendChild(p);
    }

    spanFinal.textContent = count > 0 ? `${Math.round(suma / count)}%` : '0%';

    const head = cursoEl.querySelector('.encabezado-acordeon');
    const icon = cursoEl.querySelector('.icono-desplegar');
    head.addEventListener('click', () => {
      const open = cont.style.display === 'block';
      document.querySelectorAll('.contenido-acordeon').forEach(c => c.style.display = 'none');
      document.querySelectorAll('.icono-desplegar').forEach(i => i.classList.remove('rotado'));
      if (!open) { cont.style.display = 'block'; icon.classList.add('rotado'); }
    });
  });

  // --- Menú hamburguesa ---
  const menu = document.getElementById('menuLateral');
  const btnAbrir = document.getElementById('btnMenu');
  const btnCerrar = document.getElementById('cerrarMenu');

  if (menu && btnAbrir && btnCerrar) {
    const abrir  = () => menu.classList.add('active');
    const cerrar = () => menu.classList.remove('active');
    const toggle = () => menu.classList.toggle('active');

    btnAbrir.addEventListener('click', toggle);
    btnCerrar.addEventListener('click', cerrar);

    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrar));

    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
  }
});
