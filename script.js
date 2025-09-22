// ===== Configurações =====
const LS_PAT = 'apoiovida.patients';
const LS_MED = 'apoiovida.meds';
const APP_PASS = 'AV2025'; // senha padrão (pode alterar)

// ===== Elementos =====
const panels = document.querySelectorAll('.panel');
const actionBtns = document.querySelectorAll('.action-btn');
const navGhosts = document.querySelectorAll('button.ghost[data-target]');

const patientForm = document.getElementById('patient-form');
const medForm = document.getElementById('med-form');
const mPatientSelect = document.getElementById('m-patient-select');

const resultsPatients = document.querySelector('#results-patients tbody');
const resultsMeds = document.querySelector('#results-meds tbody');

const managePatientsTable = document.querySelector('#manage-patients tbody');
const manageMedsTable = document.querySelector('#manage-meds tbody');

const searchId = document.getElementById('search-id');
const searchName = document.getElementById('search-name');
const searchMed = document.getElementById('search-med');
const searchTime = document.getElementById('search-time');
const searchBtn = document.getElementById('search-btn');
const clearSearch = document.getElementById('clear-search');

const upcomingList = document.getElementById('upcoming-list');

const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');

// ===== Utilitários (localStorage) =====
function loadPatients() { return JSON.parse(localStorage.getItem(LS_PAT) || '[]'); }
function loadMeds() { return JSON.parse(localStorage.getItem(LS_MED) || '[]'); }
function savePatients(arr) { localStorage.setItem(LS_PAT, JSON.stringify(arr)); }
function saveMeds(arr) { localStorage.setItem(LS_MED, JSON.stringify(arr)); }

// ===== Toast simples =====
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ===== ID sequencial 4 dígitos =====
function generatePatientId() {
  const patients = loadPatients();
  if (!patients.length) return '0001';
  // calcula o maior id numérico já existente
  const max = patients.reduce((acc, p) => {
    const n = parseInt(p.id, 10);
    if (!isNaN(n) && n > acc) return n;
    return acc;
  }, 0);
  return (max + 1).toString().padStart(4, '0');
}

function getPatientNameById(id) {
  if (!id) return '';
  const pats = loadPatients();
  const found = pats.find(p => p.id === id);
  return found ? found.name : '';
}

// ===== Navegação entre "páginas" (painéis) =====
function showPanel(id) {
  panels.forEach(p => { p.classList.toggle('active', p.id === id); });
  // atualizações específicas por painel
  if (id === 'add-medication') populatePatientSelect();
  if (id === 'manage') renderManage();
  if (id === 'consult') { clearResults(); renderResults(); }
  if (id === 'home') renderUpcoming();
}
actionBtns.forEach(b => b.addEventListener('click', () => showPanel(b.dataset.target)));
navGhosts.forEach(b => b.addEventListener('click', () => showPanel(b.dataset.target)));

// ===== Seed (dados iniciais de exemplo) =====
// ===== Seed (dados iniciais de exemplo) =====
function seed() {
  let pats = loadPatients();
  let meds = loadMeds();
  if (pats.length === 0 && meds.length === 0) {
    pats = [
      { id: "0001", name: "João da Silva", age: 76 },
      { id: "0002", name: "Maria Oliveira", age: 82 },
      { id: "0003", name: "Antônio Souza", age: 80 },
      { id: "0004", name: "José Pereira", age: 78 },
      { id: "0005", name: "Ana Costa", age: 83 },
      { id: "0006", name: "Francisco Mendes", age: 85 },
      { id: "0007", name: "Helena Martins", age: 79 },
      { id: "0008", name: "Paulo Santos", age: 81 },
      { id: "0009", name: "Marta Ferreira", age: 77 },
      { id: "0010", name: "Carlos Nogueira", age: 84 },
      { id: "0011", name: "Beatriz Almeida", age: 75 },
      { id: "0012", name: "Sebastião Ramos", age: 86 },
      { id: "0013", name: "Lúcia Barbosa", age: 80 },
      { id: "0014", name: "Pedro Rocha", age: 82 },
      { id: "0015", name: "Isabel Cardoso", age: 78 },
      { id: "0016", name: "Raimundo Batista", age: 83 },
      { id: "0017", name: "Tereza Gouveia", age: 81 },
      { id: "0018", name: "Vicente Pacheco", age: 79 },
      { id: "0019", name: "Clarice Monteiro", age: 85 },
      { id: "0020", name: "Augusto Ribeiro", age: 87 }
    ];

    meds = [
      { name: 'Losartana', time: '08:00', patientId: "0001" },
      { name: 'Metformina', time: '20:00', patientId: "0001" },

      { name: 'Aspirina', time: '07:30', patientId: "0002" },
      { name: 'Omeprazol', time: '21:00', patientId: "0002" },

      { name: 'Atorvastatina', time: '09:00', patientId: "0003" },
      { name: 'Hidroclorotiazida', time: '19:30', patientId: "0003" },

      { name: 'Captopril', time: '08:30', patientId: "0004" },
      { name: 'Simvastatina', time: '22:00', patientId: "0004" },

      { name: 'Amoxicilina', time: '06:30', patientId: "0005" },

      { name: 'Metoprolol', time: '10:00', patientId: "0006" },
      { name: 'Furosemida', time: '18:00', patientId: "0006" },

      { name: 'Levotiroxina', time: '07:00', patientId: "0007" },
      { name: 'Vitamina D', time: '13:00', patientId: "0007" },

      { name: 'Clonazepam', time: '21:30', patientId: "0008" },

      { name: 'Insulina NPH', time: '08:00', patientId: "0009" },
      { name: 'Insulina Regular', time: '20:00', patientId: "0009" },

      { name: 'Enalapril', time: '19:00', patientId: "0010" },

      { name: 'Losartana', time: '08:00', patientId: "0011" },
      { name: 'Omeprazol', time: '20:00', patientId: "0011" },

      { name: 'Simvastatina', time: '21:00', patientId: "0012" },

      { name: 'Metformina', time: '07:00', patientId: "0013" },
      { name: 'Insulina Regular', time: '19:00', patientId: "0013" },

      { name: 'Aspirina', time: '08:00', patientId: "0014" },
      { name: 'Vitamina B12', time: '12:00', patientId: "0014" },
      { name: 'Omeprazol', time: '20:00', patientId: "0014" },

      { name: 'Captopril', time: '07:30', patientId: "0015" },
      { name: 'Furosemida', time: '18:30', patientId: "0015" },

      { name: 'Amiodarona', time: '09:00', patientId: "0016" },
      { name: 'Paracetamol', time: '21:00', patientId: "0016" },

      { name: 'Atorvastatina', time: '20:00', patientId: "0017" },

      { name: 'Insulina NPH', time: '08:30', patientId: "0018" },
      { name: 'Metformina', time: '19:30', patientId: "0018" },
      { name: 'Omeprazol', time: '20:00', patientId: "0018" },

      { name: 'Levotiroxina', time: '06:00', patientId: "0019" },
      { name: 'Vitamina D', time: '13:30', patientId: "0019" },

      { name: 'Aspirina', time: '07:00', patientId: "0020" },
      { name: 'Captopril', time: '21:00', patientId: "0020" }
    ];

    savePatients(pats); 
    saveMeds(meds);
  }
}
seed();

// ===== Preenche <select> de pacientes =====
function populatePatientSelect() {
  const pats = loadPatients();
  if (!mPatientSelect) return;
  mPatientSelect.innerHTML = '<option value="">Selecione...</option>';
  pats.forEach(p => {
    mPatientSelect.innerHTML += `<option value="${p.id}">${p.name} (ID: ${p.id})</option>`;
  });
}

// ===== Cadastro de paciente (gera ID automaticamente) =====
if (patientForm) {
  patientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('p-name').value.trim();
    const age = document.getElementById('p-age').value.trim();
    if (!name) return showToast('Informe o nome.','error');

    const arr = loadPatients();
    const id = generatePatientId();
    arr.push({ id, name, age: Number(age) });
    savePatients(arr);
    patientForm.reset();
    showToast(`Paciente ${name} adicionado com ID ${id}`,'success');
    showPanel('home');
  });
}

// ===== Cadastro de medicação (vincula por patientId) =====
if (medForm) {
  medForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mname = document.getElementById('m-name').value.trim();
    const mtime = document.getElementById('m-time').value;
    const patientId = mPatientSelect.value;

    if (!mname || !mtime || !patientId) return showToast('Preencha todos os campos.','error');

    const arr = loadMeds();
    arr.push({ name: mname, time: mtime, patientId });
    saveMeds(arr);
    medForm.reset();
    showToast('Medicação adicionada!','success');
    showPanel('home');
  });
}

// ===== Consultar =====
function clearResults() {
  if (resultsPatients) resultsPatients.innerHTML = '';
  if (resultsMeds) resultsMeds.innerHTML = '';
}
function renderResults() {
  const patients = loadPatients();
  const meds = loadMeds();
  const fId = searchId ? searchId.value.trim() : '';
  const fName = searchName ? searchName.value.trim().toLowerCase() : '';
  const fMed = searchMed ? searchMed.value.trim().toLowerCase() : '';
  const fTime = searchTime ? searchTime.value.trim() : '';

  // pacientes
  const pFiltered = patients.filter(p => {
    if (fId && !(p.id && p.id.includes(fId))) return false;
    if (fName && !p.name.toLowerCase().includes(fName)) return false;
    return true;
  });
  if (resultsPatients) {
    resultsPatients.innerHTML = pFiltered.length === 0 ?
      `<tr><td colspan="3">Nenhum paciente encontrado</td></tr>` :
      pFiltered.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.age}</td></tr>`).join('');
  }

  // medicações
  const mFiltered = meds.filter(m => {
    if (fMed && !m.name.toLowerCase().includes(fMed)) return false;
    if (fTime && !m.time.includes(fTime)) return false;
    if (fId && !(m.patientId && m.patientId.includes(fId))) return false;
    return true;
  });
  if (resultsMeds) {
    resultsMeds.innerHTML = mFiltered.length === 0 ?
      `<tr><td colspan="4">Nenhuma medicação encontrada</td></tr>` :
      mFiltered.map(m => {
        const pname = getPatientNameById(m.patientId);
        return `<tr>
          <td>${m.name}</td>
          <td>${m.time}</td>
          <td>${m.patientId || ''}</td>
          <td>${pname || '-'}</td>
        </tr>`;
      }).join('');
  }
}
if (searchBtn) searchBtn.addEventListener('click', () => renderResults());
if (clearSearch) clearSearch.addEventListener('click', () => {
  if (searchId) searchId.value='';
  if (searchName) searchName.value='';
  if (searchMed) searchMed.value='';
  if (searchTime) searchTime.value='';
  renderResults();
});

// ===== Gerenciar (lista e exclusão por índice) =====
function renderManage() {
  const patients = loadPatients();
  const meds = loadMeds();

  if (managePatientsTable) {
    managePatientsTable.innerHTML = patients.length === 0 ?
      `<tr><td colspan="4">Nenhum paciente</td></tr>` :
      patients.map((p, index) => `
        <tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.age}</td>
          <td><button class="table-action" data-action="del-patient" data-index="${index}">Excluir</button></td>
        </tr>`).join('');
  }

  if (manageMedsTable) {
    manageMedsTable.innerHTML = meds.length === 0 ?
      `<tr><td colspan="5">Nenhuma medicação</td></tr>` :
      meds.map((m, index) => {
        const pname = getPatientNameById(m.patientId);
        return `
        <tr>
          <td>${m.name}</td>
          <td>${m.time}</td>
          <td>${m.patientId || ''}</td>
          <td>${pname || ''}</td>
          <td><button class="table-action" data-action="del-med" data-index="${index}">Excluir</button></td>
        </tr>`;
      }).join('');
  }
}

// exclusão de paciente
if (managePatientsTable) {
  managePatientsTable.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'del-patient') {
      const idx = Number(e.target.dataset.index);
      if (!confirm('Excluir paciente? Esta ação não excluirá as medicações vinculadas automaticamente.')) return;
      let arr = loadPatients();
      arr.splice(idx, 1);
      savePatients(arr);
      renderManage();
      showToast('Paciente excluído','success');
    }
  });
}

// exclusão de medicação
if (manageMedsTable) {
  manageMedsTable.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'del-med') {
      const idx = Number(e.target.dataset.index);
      if (!confirm('Excluir medicação?')) return;
      let arr = loadMeds();
      arr.splice(idx, 1);
      saveMeds(arr);
      renderManage();
      showToast('Medicação excluída','success');
    }
  });
}

// ===== Próximos horários (próximas 2 horas) =====
function renderUpcoming() {
  const meds = loadMeds();
  const now = new Date();
  const nowMinutes = now.getHours()*60 + now.getMinutes();

  const upcoming = meds.filter(m => {
    if (!m.time) return false;
    const [hh, mm] = m.time.split(':').map(Number);
    const mins = hh*60 + mm;
    return (mins >= nowMinutes && mins <= nowMinutes + 120);
  }).sort((a,b)=> a.time.localeCompare(b.time));

  if (!upcomingList) return;
  upcomingList.innerHTML = upcoming.length ?
    upcoming.map(m => {
      const pname = getPatientNameById(m.patientId);
      return `<li><strong>${m.time}</strong> — ${m.name} (${pname || 'Paciente não encontrado'} - ${m.patientId || '-'})</li>`;
    }).join('') :
    `<li>Nenhum medicamento nas próximas 2 horas</li>`;
}
setInterval(renderUpcoming, 60000);

// ===== Notificações por horário (checa a cada minuto) =====
if ("Notification" in window) {
  Notification.requestPermission().catch(()=>{/* ignorar */});
}
function checkNotifications() {
  const meds = loadMeds();
  const now = new Date();
  const timeNow = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  meds.forEach(m => {
    if (m.time === timeNow) {
      const pname = getPatientNameById(m.patientId);
      const title = "Hora do medicamento!";
      const body = `${m.name} — ${pname ? pname + ' (ID: ' + m.patientId + ')' : m.patientId || ''}`;
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
      showToast(`Hora de ${m.name} — ${pname || m.patientId || ''}`,'success');
    }
  });
}
setInterval(checkNotifications, 60000);

// ===== Login (tela independente) =====
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('login-pass').value;
    if (pass === APP_PASS) {
      // esconde login e mostra home
      loginScreen.classList.remove('active');
      showPanel('home');
      // atualiza dados visuais ao entrar
      populatePatientSelect();
      renderManage();
      renderUpcoming();
    } else {
      showToast('Senha incorreta','error');
    }
  });
}

// ===== Inicialização (pré-carregamento) =====
populatePatientSelect();
renderManage();
renderUpcoming();
