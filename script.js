// Utilidades
function uid(prefix = 'id') {
  return prefix + Math.random().toString(36).slice(2, 9);
}
function nowISO() { return new Date().toISOString(); }
function load(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function escapeHTML(s) {
  return (s || '').replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])
  );
}
function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// login 
if (!load("users")) save("users", [{ username: "admin", password: "admin" }]);

// Elementos 
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const userArea = document.getElementById("user-area");

// Autenticação 
function currentUser() { return load("currentUser"); }
function setCurrentUser(u) { save("currentUser", u); }
function logout() { localStorage.removeItem("currentUser"); renderApp(); }

function renderApp() {
  const u = currentUser();
  if (!u) {
    loginScreen.style.display = "block";
    dashboard.style.display = "none";
    userArea.textContent = "";
  } else {
    loginScreen.style.display = "none";
    dashboard.style.display = "block";
    userArea.textContent = "Usuário: " + u;
  }
  renderPatientsList();
  renderUpcoming();
}

// Login simples
document.getElementById("btn-login").onclick = () => {
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-pass").value;
  const users = load("users") || [];
  const ok = users.find(u => u.username === user && u.password === pass);
  if (ok) { setCurrentUser(user); renderApp(); }
  else alert("Usuário ou senha inválidos");
};
document.getElementById("btn-logout").onclick = () => {
  if (confirm("Deseja sair?")) logout();
};

// Dados 
function getPatients() { return load("patients") || []; }
function getMeds() { return load("meds") || []; }
function getLogs() { return load("logs") || []; }
function savePatients(a) { save("patients", a); }
function saveMeds(a) { save("meds", a); }
function saveLogs(a) { save("logs", a); }

// Pacientes 
const patientsListEl = document.getElementById("patients-list");
const filterPatient = document.getElementById("filter-patient");
filterPatient.addEventListener("input", renderPatientsList);

function renderPatientsList() {
  const q = filterPatient.value.trim().toLowerCase();
  const list = getPatients().filter(p =>
    p.name.toLowerCase().includes(q) || (p.room || "").toLowerCase().includes(q)
  );
  patientsListEl.innerHTML = list.length ? "" : "<div class='sub'>Nenhum paciente</div>";
  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
      <div class="patient-avatar">${(p.name.split(" ").map(x => x[0]).slice(0, 2).join("") || "P").toUpperCase()}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>${p.name}</strong>
            <div class="sub">Quarto: ${p.room || "—"}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost" data-action="open" data-id="${p.id}">Abrir</button>
            <button class="btn" data-action="edit" data-id="${p.id}">Editar</button>
            <button class="btn" data-action="del" data-id="${p.id}" style="color:var(--danger)">✕</button>
          </div>
        </div>
      </div>`;
    patientsListEl.appendChild(div);
  });
  patientsListEl.querySelectorAll("button").forEach(b => b.onclick = () => {
    const id = b.dataset.id, act = b.dataset.action;
    if (act === "open") openPatient(id);
    if (act === "edit") openPatientModal(findPatient(id));
    if (act === "del" && confirm("Excluir paciente e medicamentos?")) {
      deletePatient(id); renderPatientsList(); renderUpcoming();
    }
  });
}
function findPatient(id) { return getPatients().find(p => p.id === id); }
function deletePatient(id) {
  savePatients(getPatients().filter(p => p.id !== id));
  saveMeds(getMeds().filter(m => m.patientId !== id));
  saveLogs(getLogs().filter(l => l.patientId !== id));
  document.getElementById("content-body").innerHTML = "<p class='sub'>Paciente removido.</p>";
}
document.getElementById("btn-add-patient").onclick = () => openPatientModal();

function openPatientModal(patient) {
  const isNew = !patient;
  const p = patient || { id: uid("p_"), name: "", room: "", notes: "" };
  showModal(`
    <h3>${isNew ? "Novo" : "Editar"} paciente</h3>
    <label>Nome</label><input id="m-name" value="${escapeHTML(p.name)}"/>
    <label>Quarto</label><input id="m-room" value="${escapeHTML(p.room)}"/>
    <label>Observações</label><textarea id="m-notes">${escapeHTML(p.notes)}</textarea>
    <div class="actions-end">
      <button class="btn btn-ghost" id="m-cancel">Cancelar</button>
      <button class="btn btn-primary" id="m-save">Salvar</button>
    </div>`);
  document.getElementById("m-cancel").onclick = closeModal;
  document.getElementById("m-save").onclick = () => {
    const name = document.getElementById("m-name").value.trim();
    if (!name) return alert("Nome obrigatório");
    const patients = getPatients();
    if (isNew) patients.push({ ...p, name,
      room: document.getElementById("m-room").value.trim(),
      notes: document.getElementById("m-notes").value.trim()
    });
    else {
      const i = patients.findIndex(x => x.id === p.id);
      patients[i] = { ...patients[i],
        name,
        room: document.getElementById("m-room").value.trim(),
        notes: document.getElementById("m-notes").value.trim()
      };
    }
    savePatients(patients);
    closeModal(); renderPatientsList();
  };
}

function openPatient(id) {
  const p = findPatient(id);
  if (!p) return;
  document.getElementById("content-title").textContent = p.name;
  document.getElementById("content-sub").textContent = `Quarto: ${p.room || "—"}`;
  renderPatientDetails(p);
}

// Medicamentos 
function getMedById(id) { return getMeds().find(m => m.id === id); }
function deleteMed(id) { saveMeds(getMeds().filter(m => m.id !== id)); }

function renderPatientDetails(p) {
  const meds = getMeds().filter(m => m.patientId === p.id);
  const body = document.getElementById("content-body");
  body.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><strong>Medicamentos (${meds.length})</strong></div>
      <button class="btn btn-primary" id="add-med">+ Medicamento</button>
    </div>
    <table>
      <thead><tr><th>Nome</th><th>Dose</th><th>Horários</th><th>Ações</th></tr></thead>
      <tbody id="meds-table"></tbody>
    </table>`;
  document.getElementById("add-med").onclick = () => openMedModal(p);
  const tbody = document.getElementById("meds-table");
  meds.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${m.name}</strong><div class="sub">${m.notes || ""}</div></td>
      <td>${m.dose ? m.dose + " " + (m.unit || "") : "—"}</td>
      <td>${m.times.map(t => `<span class="pill">${t}</span>`).join(" ")}</td>
      <td>
        <button class="btn" data-act="take" data-id="${m.id}">Tomou</button>
        <button class="btn" data-act="edit" data-id="${m.id}">Editar</button>
        <button class="btn" data-act="del" data-id="${m.id}" style="color:var(--danger)">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("button").forEach(b => b.onclick = () => {
    const id = b.dataset.id, act = b.dataset.act;
    if (act === "take") markTaken(id, p.id);
    if (act === "edit") openMedModal(p, getMedById(id));
    if (act === "del" && confirm("Excluir medicamento?")) {
      deleteMed(id); renderPatientDetails(p); renderUpcoming();
    }
  });
}

function openMedModal(patient, med) {
  const isNew = !med;
  const m = med || { id: uid("m_"), patientId: patient.id, name: "", dose: "", unit: "", times: [], notes: "" };
  showModal(`
    <h3>${isNew ? "Novo" : "Editar"} medicamento</h3>
    <label>Nome</label><input id="med-name" value="${escapeHTML(m.name)}"/>
    <label>Dose</label><input id="med-dose" value="${escapeHTML(m.dose)}"/>
    <label>Unidade</label><input id="med-unit" value="${escapeHTML(m.unit)}"/>
    <label>Horários (separe por vírgula)</label><input id="med-times" value="${escapeHTML(m.times.join(", "))}"/>
    <label>Observações</label><textarea id="med-notes">${escapeHTML(m.notes)}</textarea>
    <div class="actions-end">
      <button class="btn btn-ghost" id="med-cancel">Cancelar</button>
      <button class="btn btn-primary" id="med-save">Salvar</button>
    </div>`);
  document.getElementById("med-cancel").onclick = closeModal;
  document.getElementById("med-save").onclick = () => {
    const name = document.getElementById("med-name").value.trim();
    if (!name) return alert("Nome obrigatório");
    const meds = getMeds();
    const obj = {
      ...m,
      name,
      dose: document.getElementById("med-dose").value.trim(),
      unit: document.getElementById("med-unit").value.trim(),
      times: document.getElementById("med-times").value.split(",").map(s => s.trim()).filter(Boolean),
      notes: document.getElementById("med-notes").value.trim()
    };
    if (isNew) meds.push(obj);
    else {
      const i = meds.findIndex(x => x.id === m.id);
      meds[i] = obj;
    }
    saveMeds(meds);
    closeModal();
    renderPatientDetails(patient);
    renderUpcoming();
  };
}

function markTaken(medId, patientId) {
  const logs = getLogs();
  logs.push({ id: uid("l_"), patientId, medId, time: nowISO(), user: currentUser() });
  saveLogs(logs);
  alert("Dose registrada");
  renderUpcoming();
}

// Próximos Medicamentos 
function renderUpcoming() {
  const upcoming = document.getElementById("upcoming");
  const meds = getMeds();
  if (!meds.length) { upcoming.innerHTML = "<div class='sub'>Nenhum agendamento</div>"; return; }
  const list = meds.map(m => m.times.map(t => ({ med: m, time: t }))).flat();
  upcoming.innerHTML = list.length
    ? list.map(x => `<div>${x.time} - ${x.med.name}</div>`).join("")
    : "<div class='sub'>Nenhum agendamento</div>";
}

//
const backdrop = document.getElementById("modal-backdrop");
const modal = document.getElementById("modal-content");
function showModal(html) {
  modal.innerHTML = html;
  backdrop.style.display = "flex";
}
function closeModal() {
  backdrop.style.display = "none";
  modal.innerHTML = "";
}

// Inicializa
renderApp();
