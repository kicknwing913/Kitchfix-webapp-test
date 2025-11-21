const form = document.getElementById('personnelForm');
const summaryContent = document.getElementById('summaryContent');
const statusBadge = document.getElementById('statusBadge');
const formId = document.getElementById('formId');
const priorityChip = document.getElementById('priorityChip');
const rushToggle = document.getElementById('rushToggle');
const toast = document.getElementById('toast');

const endDateField = document.getElementById('endDateField');
const salaryField = document.getElementById('salaryField');
const fteField = document.getElementById('fteField');
const reasonField = document.getElementById('reasonField');

const actionType = document.getElementById('actionType');
const saveDraftBtn = document.getElementById('saveDraft');
const resetFormBtn = document.getElementById('resetForm');
const loadDemoBtn = document.getElementById('loadDemo');
const downloadBtn = document.getElementById('downloadJson');
const printBtn = document.getElementById('printSummary');

const STORAGE_KEY = 'personnel-action-form-v1';

const DEMO_DATA = {
  employeeName: 'Alex Doe',
  employeeId: 'EMP-2031',
  jobTitle: 'Product Manager',
  department: 'Operations',
  manager: 'Taylor Smith',
  location: 'Chicago',
  actionType: 'Promotion',
  effectiveDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  newSalary: '95000',
  fte: '100',
  reason: 'Performance-based promotion',
  details: 'Promoting to Senior Product Manager. Increase responsibilities include leading launch squad and mentoring associates.',
  equipmentNotes: 'Laptop refresh to 16GB RAM, deliver to Chicago HQ',
  approvalNotes: 'Budget approved in FY24 plan. Finance: REV-104.',
  hrPartner: 'Jordan Lee',
  financeReviewer: 'Casey Nguyen',
  itReviewer: 'Security queue',
  access: ['Email', 'HRIS', 'Payroll', 'VPN'],
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function toggleFields(type) {
  const isLeave = type === 'Leave of absence';
  const showSalary = ['Promotion', 'Salary change', 'New hire'].includes(type);
  const showFte = ['Promotion', 'Salary change', 'Transfer', 'New hire'].includes(type);

  endDateField.style.display = isLeave ? 'block' : 'none';
  salaryField.style.display = showSalary ? 'block' : 'none';
  fteField.style.display = showFte ? 'block' : 'none';
  reasonField.style.display = type ? 'block' : 'none';
}

function updatePriority() {
  if (rushToggle.checked) {
    priorityChip.textContent = 'Rush requested';
    priorityChip.classList.add('priority-high');
  } else {
    priorityChip.textContent = 'Normal priority';
    priorityChip.classList.remove('priority-high');
  }
}

function updateFormId() {
  const random = Math.floor(Math.random() * 9000) + 1000;
  formId.innerHTML = `PAF-<span class="muted">${random}</span>`;
}

function collectFormData() {
  const data = new FormData(form);
  const payload = {};

  for (const [key, value] of data.entries()) {
    if (key === 'access') {
      payload[key] = payload[key] || [];
      payload[key].push(value);
    } else {
      payload[key] = value;
    }
  }

  payload.rush = rushToggle.checked;
  payload.generatedAt = new Date().toISOString();
  return payload;
}

function renderSummary(data) {
  if (!data.employeeName && !data.actionType) {
    summaryContent.innerHTML = '<p class="muted">Start entering details to see a formatted summary.</p>';
    return;
  }

  const accessBadges = (data.access || [])
    .map((item) => `<span class="badge">${item}</span>`)
    .join(' ');

  const rows = [
    ['Employee', data.employeeName || '—'],
    ['ID', data.employeeId || '—'],
    ['Job title', data.jobTitle || '—'],
    ['Department', data.department || '—'],
    ['Manager', data.manager || '—'],
    ['Location', data.location || '—'],
    ['Action', data.actionType || '—'],
    ['Effective', data.effectiveDate || '—'],
    ['End date', data.endDate || '—'],
    ['New salary / rate', data.newSalary ? `$${Number(data.newSalary).toLocaleString()}` : '—'],
    ['FTE %', data.fte ? `${data.fte}%` : '—'],
    ['Reason', data.reason || '—'],
  ]
    .map(
      ([label, value]) =>
        `<div class="summary-row"><span>${label}</span><span class="value">${value}</span></div>`
    )
    .join('');

  const details = data.details
    ? `<div class="summary-card"><div class="eyebrow">Details & instructions</div><p class="muted">${data.details}</p></div>`
    : '';

  const approvals =
    data.hrPartner || data.financeReviewer || data.itReviewer
      ? `<div class="summary-card">
            <div class="eyebrow">Approvals</div>
            <p class="muted">HR: ${data.hrPartner || '—'} | Finance: ${
          data.financeReviewer || '—'
        } | IT/Security: ${data.itReviewer || '—'}</p>
            ${data.approvalNotes ? `<p class="muted">Notes: ${data.approvalNotes}</p>` : ''}
          </div>`
      : '';

  const equipment = data.equipmentNotes || accessBadges
    ? `<div class="summary-card">
          <div class="eyebrow">Access & equipment</div>
          ${accessBadges ? `<div class="pill-group">${accessBadges}</div>` : ''}
          ${data.equipmentNotes ? `<p class="muted">${data.equipmentNotes}</p>` : ''}
        </div>`
    : '';

  summaryContent.innerHTML = `
    <div class="summary-card">
      <div class="summary-row"><span>Form status</span><span class="value">${statusBadge.textContent}</span></div>
      ${rows}
    </div>
    ${details}
    ${equipment}
    ${approvals}
  `;
}

function saveDraft() {
  const data = collectFormData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  statusBadge.textContent = 'Draft saved';
  showToast('Draft saved locally');
  renderSummary(data);
}

function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);
  setFormValues(data);
  statusBadge.textContent = 'Draft loaded';
  renderSummary(data);
  updatePriority();
}

function setFormValues(values) {
  Object.entries(values).forEach(([key, value]) => {
    if (key === 'access') {
      document.querySelectorAll('input[name="access"]').forEach((checkbox) => {
        checkbox.checked = value.includes(checkbox.value);
      });
    } else if (key === 'rush') {
      rushToggle.checked = Boolean(value);
    } else if (form.elements[key]) {
      form.elements[key].value = value;
    }
  });
}

function loadDemo() {
  setFormValues(DEMO_DATA);
  statusBadge.textContent = 'Demo loaded';
  renderSummary({ ...DEMO_DATA, rush: rushToggle.checked });
  updatePriority();
  showToast('Demo data loaded');
}

function resetForm() {
  form.reset();
  rushToggle.checked = false;
  toggleFields('');
  updatePriority();
  summaryContent.innerHTML = '<p class="muted">Start entering details to see a formatted summary.</p>';
  statusBadge.textContent = 'Draft';
  showToast('Form reset');
}

function downloadJson() {
  const data = collectFormData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.employeeName || 'personnel-action'}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('JSON download prepared');
}

function printSummary() {
  window.print();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = collectFormData();
  const requiredFields = ['employeeName', 'actionType', 'effectiveDate'];
  const missing = requiredFields.filter((field) => !data[field]);
  if (missing.length) {
    showToast(`Please fill ${missing.join(', ')} to generate summary.`);
    return;
  }
  statusBadge.textContent = 'Ready for approval';
  renderSummary(data);
  showToast('Summary updated');
});

form.addEventListener('input', () => {
  renderSummary(collectFormData());
});

actionType.addEventListener('change', (e) => {
  toggleFields(e.target.value);
  renderSummary(collectFormData());
});

rushToggle.addEventListener('change', () => {
  updatePriority();
  renderSummary(collectFormData());
});

saveDraftBtn.addEventListener('click', saveDraft);
resetFormBtn.addEventListener('click', resetForm);
loadDemoBtn.addEventListener('click', loadDemo);
downloadBtn.addEventListener('click', downloadJson);
printBtn.addEventListener('click', printSummary);

document.addEventListener('DOMContentLoaded', () => {
  toggleFields('');
  updatePriority();
  updateFormId();
  loadDraft();
});
