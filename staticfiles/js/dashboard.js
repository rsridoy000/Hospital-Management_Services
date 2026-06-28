const token = localStorage.getItem('access');
const role = localStorage.getItem('role');
const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };

if (!token) window.location.href = '/login/';

function toggleTheme() {
    const b = document.body;
    b.classList.toggle('white-mode');
    const isWhite = b.classList.contains('white-mode');
    document.getElementById('theme-icon').innerText = isWhite ? '☀️' : '🌙';
    document.getElementById('theme-text').innerText = isWhite ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', isWhite ? 'white' : 'dark');
}
// Load saved theme
if(localStorage.getItem('theme') === 'white') toggleTheme();

async function fx(url, m = 'GET', b = null) {
    const r = await fetch(url, { method: m, ...config, body: b ? JSON.stringify(b) : null });
    if (r.status === 401) { localStorage.clear(); window.location.href = '/login/'; }
    return r.json();
}

const navs = {
    DOCTOR: [
        { id: 'd1', n: '📊 Status Overview', f: loadDocHome },
        { id: 'd2', n: '📅 Appointments', f: loadDocAppts },
        { id: 'd3', n: '👥 Patient Files', f: loadDocPats },
        { id: 'd4', n: '💊 Pharmacy Guide', f: loadPharmacy },
        { id: 'd5', n: '👤 My Profile', f: loadDocProfile }
    ],
    RECEPTIONIST: [
        { id: 'r1', n: '📊 Main Desk', f: loadRecepHome },
        { id: 'r2', n: '📅 Appointments', f: loadRecepAppts },
        { id: 'r3', n: '💰 Billing Hub', f: loadRecepBills },
        { id: 'r4', n: '👥 Patients', f: loadRecepPats },
        { id: 'r5', n: '💊 Pharmacy', f: loadPharmacy }
    ],
    PATIENT: [
        { id: 'p1', n: '📊 Health Overview', f: loadPatHome },
        { id: 'p2', n: '🩺 Find Doctors', f: loadPatDocs },
        { id: 'p3', n: '💊 Prescriptions', f: loadPatPresc },
        { id: 'p4', n: '💰 Medical Bills', f: loadPatBills },
        { id: 'p5', n: '🏥 Hospital Pharmacy', f: loadPharmacy }
    ]
};

function setNav(id) {
    document.querySelectorAll('.sidebar-item').forEach(x => x.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function init() {
    document.getElementById('role-display').innerText = role;
    const navContainer = document.getElementById('sidebar-nav');
    navs[role].forEach(item => {
        const a = document.createElement('a');
        a.className = 'sidebar-item';
        a.id = item.id;
        a.innerHTML = item.n;
        a.onclick = () => { setNav(item.id); item.f(); };
        navContainer.appendChild(a);
    });
    // Auto load first tab
    navs[role][0].f();
    setNav(navs[role][0].id);
}

// --- PHARMACY FEATURE (NEW) ---
async function loadPharmacy() {
    document.getElementById('panel-title').innerText = "Hospital Pharmacy & Medicine Guide";
    document.getElementById('panel-content').innerHTML = `
        <div class="search-box">
            <input type="text" id="medSearch" placeholder="Search medicines available in hospital... (e.g. Paracetamol)" onkeyup="searchMeds(this.value)">
        </div>
        <div id="medResults" class="grid-2" style="grid-template-columns: 1fr 1fr;"></div>
        
        <div style="margin-top: 50px;">
            <h3>📖 Medicine Guide (What does it do?)</h3>
            <p style="color:var(--text-muted); font-size:14px; margin-bottom:15px;">Search for any medicine to see its medical usage and benefits.</p>
            <div style="display:flex; gap:10px;">
                <input type="text" id="guideSearch" placeholder="Type medicine name..." style="flex:1;">
                <button class="btn btn-primary" onclick="getGuide()">Explain Purpose</button>
            </div>
            <div id="guideOutput"></div>
        </div>
    `;
    searchMeds(''); // Show all medicines by default
}

async function searchMeds(q) {
    const data = await fx(`/api/medicines/?search=${q}`);
    const results = data.results || [];
    document.getElementById('medResults').innerHTML = results.map(m => `
        <div class="medicine-card panel-animate">
            <div>
                <div style="font-weight:800; color:var(--primary-blue);">${m.name}</div>
                <div style="font-size:12px; color:var(--text-muted);">${m.unit} • Available</div>
            </div>
            <div class="in-stock-label">In Stock</div>
        </div>
    `).join('') || '<p>No medicines found in pharmacy.</p>';
}

async function getGuide() {
    const q = document.getElementById('guideSearch').value;
    if (!q) return;
    document.getElementById('guideOutput').innerHTML = '<div class="animate-pulse" style="padding:20px;">Analyzing medicine database...</div>';

    // Try to find in our DB first
    const data = await fx(`/api/medicines/?search=${q}`);
    const med = data.results.find(x => x.name.toLowerCase().includes(q.toLowerCase()));

    setTimeout(() => {
        if (med && med.description) {
            document.getElementById('guideOutput').innerHTML = `
                <div class="guide-result panel-animate">
                    <h4 style="color:var(--primary); margin-bottom:10px;">Indication for ${med.name}:</h4>
                    <p style="font-size:15px; color:#374151;">${med.description}</p>
                    <div style="margin-top:10px; font-size:12px; color:var(--primary-blue);">* Always consult a doctor before taking medication.</div>
                </div>
            `;
        } else {
            document.getElementById('guideOutput').innerHTML = `
                <div class="guide-result panel-animate" style="border-left-color: var(--danger);">
                    <h4 style="color:var(--danger); margin-bottom:10px;">Information Not Found</h4>
                    <p>We don't have detailed information for "${q}" in our primary database. Please contact the hospital pharmacy for details.</p>
                </div>
            `;
        }
    }, 800);
}

// --- DASHBOARD HELPERS ---
function closeM() { document.getElementById('mainModal').style.display = 'none'; }
function openM(h, body) {
    document.getElementById('modalBody').innerHTML = `<h2>${h}</h2><div style="margin-top:20px;">${body}</div>`;
    document.getElementById('mainModal').style.display = 'flex';
}

function renderStats(items) {
    document.getElementById('stats-container').innerHTML = items.map(i => `
        <div class="glass-card stat-card panel-animate">
            <div class="stat-label">${i.l}</div>
            <div class="stat-val">${i.v}</div>
        </div>
    `).join('');
}

function renderGrid(t, h, r) {
    document.getElementById('panel-title').innerText = t;
    document.getElementById('panel-content').innerHTML = `
        <table class="panel-animate">
            <thead><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr></thead>
            <tbody>${r.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
    `;
}

// --- ROLE SPECIFIC LOADERS (Refactored) ---

// --- DOCTOR ---
async function loadDocHome() {
    const [p, a] = await Promise.all([fx('/api/accounts/profile/'), fx('/api/appointments/')]);
    document.getElementById('greeting').innerText = `Dr. ${p.last_name}`;
    const appts = a.results || [];
    renderStats([{ l: 'Total Patients', v: new Set(appts.map(x => x.patient)).size }, { l: 'Pending Appts', v: appts.filter(x => x.status === 'PENDING').length }, { l: 'Completed Visits', v: appts.filter(x => x.status === 'COMPLETED').length }]);
    renderGrid('Today\'s Schedule', ['Serial', 'Patient', 'Time', 'Action'], appts.slice(0, 5).map(x => [`#${x.serial_number}`, x.patient_name, new Date(x.appointment_date).toLocaleTimeString(), `<button class="btn btn-outline" style="padding:4px 12px; font-size:12px;" onclick="loadDocAppts()">Details</button>`]));
}

async function loadDocAppts() {
    document.getElementById('panel-title').innerText = 'Appointment Manager';
    document.getElementById('panel-actions').innerHTML = '';
    document.getElementById('panel-content').innerHTML = `<div style="padding:20px;color:var(--text-muted);">⏳ Loading appointments...</div>`;
    const a = await fx('/api/appointments/');
    const appts = a.results || [];

    if (!appts.length) {
        document.getElementById('panel-content').innerHTML = `<p style="padding:20px;color:var(--text-muted);">No appointments found.</p>`;
        return;
    }

    // Stats bar
    const pending   = appts.filter(x => x.status === 'PENDING').length;
    const approved  = appts.filter(x => x.status === 'APPROVED').length;
    const completed = appts.filter(x => x.status === 'COMPLETED').length;
    const cancelled = appts.filter(x => x.status === 'CANCELLED').length;
    renderStats([
        { l: 'Pending',   v: pending },
        { l: 'Approved',  v: approved },
        { l: 'Completed', v: completed },
        { l: 'Cancelled', v: cancelled },
    ]);

    const rows = appts.map(x => {
        // Status badge
        const badgeClass = {
            PENDING:   'badge-warning',
            APPROVED:  'badge-success',
            COMPLETED: 'badge-success',
            CANCELLED: 'badge-danger',
        }[x.status] || 'badge-warning';

        // Action buttons based on status
        let actions = '';
        if (x.status === 'PENDING') {
            actions = `
                <button class="btn btn-primary" style="padding:10px 22px;font-size:14px;font-weight:800;margin-right:8px;background:linear-gradient(135deg,#10b981,#059669);color:#000;border-radius:10px;"
                    onclick="docUpdateApptStatus('${x.id}', 'APPROVED')">✅ Confirm</button>
                <button class="btn btn-outline" style="padding:10px 18px;font-size:13px;border-color:#f87171;color:#f87171;border-radius:10px;"
                    onclick="docUpdateApptStatus('${x.id}', 'CANCELLED')">❌ Cancel</button>`;
        } else if (x.status === 'APPROVED') {
            actions = `
                <button class="btn btn-primary" style="padding:10px 22px;font-size:14px;font-weight:800;border-radius:10px;"
                    onclick="openPrescModal('${x.id}','${x.patient_name}')">💊 Issue Rx</button>`;
        } else if (x.status === 'COMPLETED') {
            actions = `
                <button class="btn btn-outline" style="padding:10px 18px;font-size:13px;border-radius:10px;"
                    onclick="openUpdatePrescModal('${x.id}','${x.patient_name}')">✏️ Update Rx</button>`;
        } else {
            actions = `<span style="color:var(--text-muted);font-size:13px;">—</span>`;
        }

        return [
            `<b style="color:var(--primary-light);">#${x.serial_number}</b>`,
            x.patient_name,
            new Date(x.appointment_date).toLocaleDateString() + '<br><small style="color:var(--text-muted);">' + new Date(x.appointment_date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + '</small>',
            `<span class="badge ${badgeClass}">${x.status}</span>`,
            actions
        ];
    });

    document.getElementById('panel-title').innerText = 'Appointment Manager';
    document.getElementById('panel-content').innerHTML = `
        <table class="panel-animate">
            <thead><tr>${['Serial','Patient','Date & Time','Status','Actions'].map(x=>`<th>${x}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`;
}

async function docUpdateApptStatus(id, status) {
    await fx(`/api/appointments/${id}/update_status/`, 'POST', { status });
    loadDocAppts(); // refresh table without full reload
}

async function openUpdatePrescModal(apptId, pname) {
    // Fetch existing prescription for this appointment
    const all = await fx('/api/prescriptions/');
    const existing = all.results.find(p => String(p.appointment) === String(apptId));
    const meds = await fx('/api/medicines/');

    const prescId   = existing ? existing.id : null;
    const diagnosis = existing ? existing.diagnosis : '';
    const notes     = existing ? existing.notes : '';
    const selMed    = existing && existing.medicines && existing.medicines[0] ? existing.medicines[0].medicine : '';
    const selDos    = existing && existing.medicines && existing.medicines[0] ? existing.medicines[0].dosage : '';
    const selDur    = existing && existing.medicines && existing.medicines[0] ? existing.medicines[0].duration : '';

    let html = `
        <div style="background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.2);border-radius:12px;padding:14px 18px;margin-bottom:22px;">
            <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Updating Prescription for</div>
            <div style="font-size:18px;font-weight:800;color:#22d3ee;">${pname}</div>
        </div>
        <div class="form-group">
            <label>Diagnosis</label>
            <input type="text" id="upDi" value="${diagnosis}" placeholder="e.g. Hypertension...">
        </div>
        <div class="form-group">
            <label>Medication</label>
            <select id="upMe" style="width:100%;">
                ${meds.results.map(m => `<option value="${m.id}" ${String(m.id) === String(selMed) ? 'selected' : ''}>${m.name}</option>`).join('')}
            </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <div class="form-group">
                <label>Dosage</label>
                <input type="text" id="upDos" value="${selDos}" placeholder="1+0+1">
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" id="upDur" value="${selDur}" placeholder="7 days">
            </div>
        </div>
        <div class="form-group">
            <label>Notes / Advice</label>
            <textarea id="upNo" rows="4" placeholder="Additional advice...">${notes}</textarea>
        </div>
        <button class="btn btn-primary" style="width:100%;padding:16px;font-size:16px;font-weight:800;border-radius:14px;" 
            onclick="confirmUpdatePresc('${prescId}', '${apptId}')">
            💾 Save Updated Prescription
        </button>`;
    openM(`Update Prescription — ${pname}`, html);
}

async function confirmUpdatePresc(prescId, apptId) {
    const payload = {
        diagnosis: document.getElementById('upDi').value,
        notes:     document.getElementById('upNo').value,
        medicines: [{ medicine: document.getElementById('upMe').value, dosage: document.getElementById('upDos').value || '1+0+1', duration: document.getElementById('upDur').value || '7 days' }]
    };

    let res;
    if (prescId && prescId !== 'null') {
        // Update existing
        res = await fetch(`/api/prescriptions/${prescId}/`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        // Create new if not found
        payload.appointment = apptId;
        res = await fetch('/api/prescriptions/', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    if (res.ok) {
        closeM();
        alert('✅ Prescription updated successfully!');
        loadDocAppts();
    } else {
        const err = await res.json();
        alert('❌ Error: ' + JSON.stringify(err));
    }
}


async function loadDocPats() {
    const p = await fx('/api/patients/');
    renderGrid('Patient Directory', ['ID', 'Full Name', 'Age', 'Blood Group', 'Phone'], p.results.map(x => [`PAT-${x.id}`, x.user_details.first_name + ' ' + x.user_details.last_name, x.age, x.blood_group, x.phone_number]));
}

// --- DOCTOR PROFILE (Edit Own Details) ---
async function loadDocProfile() {
    document.getElementById('panel-title').innerText = 'My Doctor Profile';
    document.getElementById('panel-actions').innerHTML = '';
    document.getElementById('stats-container').innerHTML = '';
    document.getElementById('panel-content').innerHTML = `<div style="display:flex; align-items:center; gap:12px; padding:20px; color:var(--text-muted);">⏳ Loading profile...</div>`;

    const [prof, docData] = await Promise.all([
        fx('/api/accounts/profile/'),
        fx('/api/doctors/me/')
    ]);

    const isAvailable = docData.availability_status;

    document.getElementById('panel-content').innerHTML = `
        <div style="max-width:900px; margin:0 auto;">

            <!-- Profile Header Card -->
            <div style="
                background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(16,185,129,0.08));
                border: 1px solid rgba(6,182,212,0.25);
                border-radius: 28px;
                padding: 40px;
                margin-bottom: 35px;
                display: flex;
                align-items: center;
                gap: 35px;
            ">
                <!-- Avatar Circle -->
                <div style="
                    width: 100px; height: 100px;
                    background: linear-gradient(135deg, #06b6d4, #10b981);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 42px;
                    font-weight: 900;
                    color: #000;
                    flex-shrink: 0;
                    box-shadow: 0 10px 35px rgba(6,182,212,0.3);
                ">${(prof.first_name || 'D').charAt(0).toUpperCase()}</div>
                <div style="flex:1;">
                    <div style="font-size:13px; color:#22d3ee; font-weight:800; text-transform:uppercase; letter-spacing:2px; margin-bottom:6px;">HOSPITAL MANAGEMENT DOCTOR</div>
                    <h2 style="font-size:34px; font-weight:900; margin:0 0 6px 0; color:var(--text-main);">Dr. ${prof.first_name || ''} ${prof.last_name || ''}</h2>
                    <div style="color:var(--text-muted); font-size:15px;">${docData.specialization} &nbsp;•&nbsp; ${docData.department_name}</div>
                </div>
                <div style="
                    padding: 10px 22px;
                    border-radius: 50px;
                    font-weight: 800;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    background: ${isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)'};
                    color: ${isAvailable ? '#34d399' : '#f87171'};
                    border: 1px solid ${isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'};
                ">${isAvailable ? '✅ Available' : '🔴 Unavailable'}</div>
            </div>

            <!-- Edit Form -->
            <div style="
                background: rgba(17,24,39,0.6);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 28px;
                padding: 40px;
            ">
                <h3 style="color:#22d3ee; font-size:22px; margin-bottom:30px; display:flex; align-items:center; gap:10px;">✏️ Edit Profile Information</h3>

                <!-- Row 1 -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:25px;">
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">First Name</label>
                        <input type="text" id="dp_fname" value="${prof.first_name || ''}" placeholder="First Name" style="width:100%; box-sizing:border-box;">
                    </div>
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">Last Name</label>
                        <input type="text" id="dp_lname" value="${prof.last_name || ''}" placeholder="Last Name" style="width:100%; box-sizing:border-box;">
                    </div>
                </div>

                <!-- Row 2 -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:25px;">
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">🎓 Degree / Education</label>
                        <input type="text" id="dp_edu" value="${docData.education || ''}" placeholder="e.g. MBBS, MD, FRCP" style="width:100%; box-sizing:border-box;">
                    </div>
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">🏥 Specialization</label>
                        <input type="text" id="dp_spec" value="${docData.specialization || ''}" placeholder="e.g. Cardiologist" style="width:100%; box-sizing:border-box;">
                    </div>
                </div>

                <!-- Row 3 -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:25px;">
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">🕒 Available Hours</label>
                        <input type="text" id="dp_hours" value="${docData.available_hours || ''}" placeholder="e.g. 9:00 AM - 5:00 PM" style="width:100%; box-sizing:border-box;">
                    </div>
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">💰 Consultation Fee (৳)</label>
                        <input type="number" id="dp_fee" value="${docData.consultation_fee || ''}" placeholder="500" style="width:100%; box-sizing:border-box;">
                    </div>
                </div>

                <!-- Row 4 -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:25px;">
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">📞 Phone Number</label>
                        <input type="text" id="dp_phone" value="${docData.phone_number || ''}" placeholder="01XXXXXXXXX" style="width:100%; box-sizing:border-box;">
                    </div>
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">💼 Position / Title</label>
                        <input type="text" id="dp_pos" value="${docData.position || ''}" placeholder="e.g. Senior Consultant" style="width:100%; box-sizing:border-box;">
                    </div>
                </div>

                <!-- Row 5 -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:35px;">
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">📅 Years of Experience</label>
                        <input type="number" id="dp_exp" value="${docData.experience || ''}" placeholder="5" style="width:100%; box-sizing:border-box;">
                    </div>
                    <div class="form-group">
                        <label style="color:#94a3b8; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:10px;">✅ Availability Status</label>
                        <select id="dp_avail" style="width:100%; box-sizing:border-box;">
                            <option value="true" ${isAvailable ? 'selected' : ''}>🟢 Currently Available</option>
                            <option value="false" ${!isAvailable ? 'selected' : ''}>🔴 Currently Unavailable</option>
                        </select>
                    </div>
                </div>

                <!-- Save Button -->
                <button class="btn btn-primary" id="dp_saveBtn"
                    onclick="saveDocProfile()"
                    style="width:100%; padding:18px; font-size:18px; font-weight:800; border-radius:18px; letter-spacing:0.5px;">
                    💾 Save Profile
                </button>

                <!-- Success/Error Message -->
                <div id="dp_msg" style="display:none; margin-top:20px; padding:18px 25px; border-radius:16px; font-weight:700; font-size:15px; text-align:center;"></div>
            </div>
        </div>
    `;
}

async function saveDocProfile() {
    const btn = document.getElementById('dp_saveBtn');
    btn.innerText = '⏳ Saving...';
    btn.disabled = true;

    const payload = {
        education: document.getElementById('dp_edu').value,
        specialization: document.getElementById('dp_spec').value,
        available_hours: document.getElementById('dp_hours').value,
        consultation_fee: document.getElementById('dp_fee').value,
        phone_number: document.getElementById('dp_phone').value,
        position: document.getElementById('dp_pos').value,
        experience: document.getElementById('dp_exp').value,
        availability_status: document.getElementById('dp_avail').value === 'true',
        first_name: document.getElementById('dp_fname').value,
        last_name: document.getElementById('dp_lname').value,
    };

    try {
        const res = await fetch('/api/doctors/me/', {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const msgEl = document.getElementById('dp_msg');
        if (res.ok) {
            msgEl.style.display = 'block';
            msgEl.style.background = 'rgba(16,185,129,0.15)';
            msgEl.style.border = '1px solid rgba(16,185,129,0.3)';
            msgEl.style.color = '#34d399';
            msgEl.innerText = '✅ Profile updated successfully!';
            btn.innerText = '✅ Saved!';
            setTimeout(() => { btn.innerText = '💾 Save Profile'; btn.disabled = false; }, 2500);
        } else {
            const err = await res.json();
            msgEl.style.display = 'block';
            msgEl.style.background = 'rgba(248,113,113,0.15)';
            msgEl.style.border = '1px solid rgba(248,113,113,0.3)';
            msgEl.style.color = '#f87171';
            msgEl.innerText = '❌ Something went wrong: ' + JSON.stringify(err);
            btn.innerText = '💾 Save Profile';
            btn.disabled = false;
        }
    } catch(e) {
        btn.innerText = '💾 Save Profile';
        btn.disabled = false;
    }
}

// --- RECEPTIONIST ---
async function loadRecepHome() {
    const [a, b, p] = await Promise.all([fx('/api/appointments/'), fx('/api/billing/'), fx('/api/patients/')]);
    document.getElementById('greeting').innerText = `Hospital Management Registry`;
    renderStats([{ l: 'Revenue (Total)', v: '৳' + b.results.reduce((acc, x) => acc + parseFloat(x.amount), 0).toFixed(0) }, { l: 'Active Appointments', v: a.results.length }, { l: 'Total Patients', v: p.count }]);
    renderGrid('Recent Registrations', ['ID', 'Patient Name', 'Registered On', 'Role'], p.results.slice(0, 5).map(x => [`#${x.id}`, x.user_details.first_name, new Date(x.user_details.date_joined).toLocaleDateString(), 'Patient']));
}

async function loadRecepAppts() {
    const a = await fx('/api/appointments/');
    document.getElementById('panel-actions').innerHTML = `<button class="btn btn-primary" onclick="openQuickBook()">+ New Booking</button>`;

    const rows = a.results.map(x => {
        const badgeClass = {
            PENDING:   'badge-warning',
            APPROVED:  'badge-success',
            COMPLETED: 'badge-success',
            CANCELLED: 'badge-danger',
        }[x.status] || 'badge-warning';

        let actions = '';
        if (x.status === 'PENDING') {
            actions = `
                <button class="btn btn-primary" style="padding:8px 16px;font-size:13px;font-weight:800;background:linear-gradient(135deg,#10b981,#059669);color:#000;border-radius:10px;margin-right:6px;"
                    onclick="updateAStatus('${x.id}', 'APPROVED')">✅ Approve</button>
                <button class="btn btn-outline" style="padding:8px 14px;font-size:13px;border-color:#f87171;color:#f87171;border-radius:10px;"
                    onclick="updateAStatus('${x.id}', 'CANCELLED')">❌ Cancel</button>`;
        } else if (x.status === 'APPROVED') {
            actions = `
                <button class="btn btn-outline" style="padding:8px 14px;font-size:13px;border-color:#f87171;color:#f87171;border-radius:10px;"
                    onclick="updateAStatus('${x.id}', 'CANCELLED')">❌ Cancel</button>`;
        } else {
            actions = `<span style="color:var(--text-muted);font-size:13px;">—</span>`;
        }

        return [
            `<b style="color:var(--primary-light);">#${x.serial_number}</b>`,
            x.patient_name,
            `Dr. ${x.doctor_name}`,
            `<span class="badge ${badgeClass}">${x.status}</span>`,
            actions
        ];
    });

    renderGrid('Master Schedule', ['Serial', 'Patient', 'Doctor', 'Status', 'Actions'], rows);
}

async function loadRecepBills() {
    const b = await fx('/api/billing/');
    document.getElementById('panel-actions').innerHTML = `<button class="btn btn-primary" onclick="openBillCreate()">+ Generate Bill</button>`;
    renderGrid('Billing Dashboard', ['ID', 'Patient', 'Amount', 'Status', 'Actions'], b.results.map(x => [
        x.id, x.patient_name, '৳' + x.amount,
        `<span class="badge ${x.payment_status === 'PAID' ? 'badge-success' : 'badge-danger'}">${x.payment_status}</span>`,
        x.payment_status === 'UNPAID' ? `<button class="btn btn-primary" onclick="payBill('${x.id}')">Mark Paid</button>` : 'Verified'
    ]));
}

async function loadRecepPats() {
    const p = await fx('/api/patients/');
    document.getElementById('panel-actions').innerHTML = `<button class="btn btn-primary" onclick="openPatReg()">+ Register Patient</button>`;
    renderGrid('Registered Patients', ['ID', 'Name', 'Age', 'Gender', 'Phone'], p.results.map(x => [x.id, x.user_details.first_name + ' ' + x.user_details.last_name, x.age, x.gender, x.phone_number]));
}

// --- PATIENT ---
async function loadPatHome() {
    const [p, a, b] = await Promise.all([fx('/api/accounts/profile/'), fx('/api/appointments/'), fx('/api/billing/')]);
    document.getElementById('greeting').innerText = `Hello, ${p.first_name}`;
    renderStats([{ l: 'Active Appointments', v: a.results.length }, { l: 'Unpaid Dues', v: '৳' + b.results.filter(x => x.payment_status === 'UNPAID').reduce((acc, x) => acc + parseFloat(x.amount), 0) }, { l: 'Medical History', v: a.results.filter(x => x.status === 'COMPLETED').length }]);
    renderGrid('My Recent Visits', ['Doctor', 'Date', 'Status'], a.results.slice(0, 5).map(x => ['Dr. ' + x.doctor_name, new Date(x.appointment_date).toLocaleDateString(), x.status]));
}

async function loadPatDocs() {
    document.getElementById('panel-title').innerText = 'Find a Specialist';
    document.getElementById('panel-actions').innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <input type="text" id="docSearchInput" placeholder="🔍 Search by name or specialty..." 
                style="padding:12px 20px; border-radius:14px; font-size:14px; width:260px;"
                oninput="filterDoctorCards(this.value)">
        </div>`;

    document.getElementById('panel-content').innerHTML = `<div style="padding:20px; color:var(--text-muted);">⏳ Loading specialists...</div>`;

    const d = await fx('/api/doctors/');
    window._allDoctors = d.results; // cache for search filter

    renderDoctorCards(d.results);
}

function renderDoctorCards(doctors) {
    if (!doctors.length) {
        document.getElementById('panel-content').innerHTML = `<p style="color:var(--text-muted); padding:20px;">No doctors found.</p>`;
        return;
    }

    let html = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:28px;" class="panel-animate">';

    doctors.forEach(x => {
        // Dynamic accent color by department
        let accent = '#22d3ee';
        let glow   = 'rgba(34,211,238,0.18)';
        const dept = (x.department_name || '').toLowerCase();
        if (dept.includes('cardio'))  { accent = '#f87171'; glow = 'rgba(248,113,113,0.18)'; }
        else if (dept.includes('neuro'))  { accent = '#a78bfa'; glow = 'rgba(167,139,250,0.18)'; }
        else if (dept.includes('derm'))   { accent = '#fbbf24'; glow = 'rgba(251,191,36,0.18)'; }
        else if (dept.includes('ortho'))  { accent = '#34d399'; glow = 'rgba(52,211,153,0.18)'; }
        else if (dept.includes('gyne'))   { accent = '#f472b6'; glow = 'rgba(244,114,182,0.18)'; }

        const isAvail = x.availability_status;
        const initial = (x.user_details.first_name || 'D').charAt(0).toUpperCase();
        const exp = x.experience ? `${x.experience} yrs exp` : '';
        const pos = x.position || '';

        html += `
        <div class="glass-card doc-card" data-name="${x.user_details.first_name} ${x.user_details.last_name}" data-spec="${x.specialization}" style="
            padding: 0;
            border-radius: 24px;
            overflow: hidden;
            border-top: 4px solid ${accent};
            box-shadow: 0 15px 50px ${glow};
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        " onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 25px 60px ${glow}'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 15px 50px ${glow}'">

            <!-- Card Header -->
            <div style="padding:28px 28px 20px; display:flex; gap:20px; align-items:flex-start;">
                <!-- Avatar -->
                <div style="
                    width:72px; height:72px; border-radius:18px; flex-shrink:0;
                    background: linear-gradient(135deg, ${accent}, ${accent}88);
                    display:flex; align-items:center; justify-content:center;
                    font-size:28px; font-weight:900; color:#000;
                    box-shadow: 0 8px 20px ${glow};
                ">${initial}</div>

                <!-- Name & Meta -->
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; color:${accent}; font-weight:900; text-transform:uppercase; letter-spacing:2px; margin-bottom:4px;">
                        ${x.department_name}
                    </div>
                    <h3 style="font-size:20px; font-weight:900; margin:0 0 4px 0; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        Dr. ${x.user_details.first_name} ${x.user_details.last_name}
                    </h3>
                    <div style="font-size:13px; color:${accent}; font-weight:700;">
                        ${x.specialization}${pos ? ' · ' + pos : ''}
                    </div>
                </div>

                <!-- Availability Badge -->
                <div style="
                    padding:5px 12px; border-radius:30px; font-size:11px; font-weight:800;
                    text-transform:uppercase; letter-spacing:1px; flex-shrink:0;
                    background:${isAvail ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.12)'};
                    color:${isAvail ? '#34d399' : '#f87171'};
                    border:1px solid ${isAvail ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.25)'};
                ">${isAvail ? '● Available' : '● Unavailable'}</div>
            </div>

            <!-- Info Row -->
            <div style="padding:0 28px 20px; display:flex; flex-direction:column; gap:10px;">
                <!-- Education & Experience -->
                <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-muted);">
                    <span style="font-size:16px;">🎓</span>
                    <span>${x.education || 'N/A'}${exp ? ' &nbsp;·&nbsp; ' + exp : ''}</span>
                </div>
                <!-- Available Hours -->
                <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-muted);">
                    <span style="font-size:16px;">🕒</span>
                    <span>${x.available_hours || 'Not specified'}</span>
                </div>
            </div>

            <!-- Divider -->
            <div style="height:1px; background:rgba(255,255,255,0.05); margin:0 28px;"></div>

            <!-- Footer: Fee + Book Button -->
            <div style="padding:20px 28px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">Consultation Fee</div>
                    <div style="font-size:26px; font-weight:900; color:${accent};">৳ ${Math.floor(x.consultation_fee || 0)}</div>
                </div>
                <button class="btn btn-primary"
                    style="background:${accent}; color:#000; font-weight:800; padding:12px 24px; border-radius:14px; font-size:14px; ${!isAvail ? 'opacity:0.5; cursor:not-allowed;' : ''}"
                    ${!isAvail ? 'disabled' : ''}
                    onclick="initiateBooking('${x.id}', '${x.user_details.last_name}', '${x.available_hours}')">
                    ${isAvail ? '📅 Book Now' : 'Unavailable'}
                </button>
            </div>
        </div>`;
    });

    document.getElementById('panel-content').innerHTML = html + '</div>';
}

function filterDoctorCards(q) {
    if (!window._allDoctors) return;
    const lq = q.toLowerCase();
    const filtered = window._allDoctors.filter(x =>
        `${x.user_details.first_name} ${x.user_details.last_name}`.toLowerCase().includes(lq) ||
        (x.specialization || '').toLowerCase().includes(lq) ||
        (x.department_name || '').toLowerCase().includes(lq) ||
        (x.education || '').toLowerCase().includes(lq)
    );
    renderDoctorCards(filtered);
}

async function loadPatPresc() {
    const p = await fx('/api/prescriptions/');
    renderGrid('My Prescriptions', ['Date', 'Doctor', 'Diagnosis', 'View'], p.results.map(x => [new Date(x.created_at).toLocaleDateString(), 'Dr. ' + x.doctor_name, x.diagnosis, `<button class="btn btn-outline" onclick="viewPr('${x.id}')">View Full Advice</button>`]));
}

async function loadPatBills() {
    const b = await fx('/api/billing/');
    renderGrid('Payment History', ['ID', 'Date', 'Amount', 'Status', 'Action'], b.results.map(x => [x.id, new Date(x.created_at).toLocaleDateString(), '৳' + x.amount, x.payment_status, x.payment_status === 'UNPAID' ? `<button class="btn btn-primary" onclick="payBill('${x.id}')">Pay Now</button>` : 'Paid']));
}

// --- SHARED ACTIONS ---
async function updateAStatus(id, st) {
    if (!st) return;
    await fx(`/api/appointments/${id}/update_status/`, 'POST', { status: st });
    // Refresh whichever appointment view is currently active (don't reload the page)
    loadRecepAppts();
}
async function payBill(id) {
    await fx(`/api/billing/${id}/`, 'PATCH', { paid: true });
    if (typeof loadRecepBills === 'function' && document.getElementById('panel-title')?.innerText === 'Billing Dashboard') {
        loadRecepBills();
    } else if (typeof loadPatBills === 'function') {
        loadPatBills();
    } else {
        location.reload();
    }
}

// --- NEW MODAL ACTIONS ---
async function openQuickBook() {
    const [docs, pats] = await Promise.all([fx('/api/doctors/'), fx('/api/patients/')]);
    let html = `
        <div class="form-group">
            <label>Doctor</label>
            <select id="qbDoc" style="width:100%;">
                ${docs.results.map(d => `<option value="${d.id}">Dr. ${d.user_details.first_name} ${d.user_details.last_name} — ${d.department_name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Patient</label>
            <select id="qbPat" style="width:100%;">
                ${pats.results.map(p => `<option value="${p.id}">${p.user_details.first_name} ${p.user_details.last_name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Appointment Date</label>
            <input type="date" id="qbDate" required style="width:100%;">
        </div>
        <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#fbbf24;">
            ⚠️ Booking will be created as <b>PENDING</b> — you can Approve or Cancel from the appointments table.
        </div>
        <button class="btn btn-primary" style="width:100%;padding:16px;font-size:16px;font-weight:800;border-radius:14px;" onclick="confirmQuickBook()">
            📅 Create Booking
        </button>`;
    openM('New Appointment Booking', html);
}
async function confirmQuickBook() {
    const date = document.getElementById('qbDate').value;
    if (!date) { alert('Please select a date!'); return; }
    const b = {
        doctor: document.getElementById('qbDoc').value,
        patient: document.getElementById('qbPat').value,
        appointment_date: new Date(date).toISOString(),
        status: 'PENDING'
    };
    await fx('/api/appointments/', 'POST', b);
    closeM();
    loadRecepAppts(); // refresh table in place, don't reload page
}

async function openBillCreate() {
    const p = await fx('/api/patients/');
    let html = `<div class="form-group"><label>Patient</label><select id="bcPat">${p.results.map(x => `<option value="${x.id}">${x.user_details.first_name} ${x.user_details.last_name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Amount (৳)</label><input type="number" id="bcAmt" placeholder="500"></div>
        <button class="btn btn-primary" style="width:100%;" onclick="confirmBill()">Generate Invoice</button>`;
    openM('New Billing Invoice', html);
}
async function confirmBill() {
    await fx('/api/billing/', 'POST', { patient: document.getElementById('bcPat').value, amount: document.getElementById('bcAmt').value, payment_status: 'UNPAID' });
    alert("Bill Issued!"); location.reload();
}

async function openPatReg() {
    let html = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="ru" placeholder="Enter username" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="re" placeholder="patient@email.com" required>
            </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div class="form-group">
                <label>First Name</label>
                <input type="text" id="rf" placeholder="First name" required>
            </div>
            <div class="form-group">
                <label>Age</label>
                <input type="number" id="ra" placeholder="25" required>
            </div>
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:8px; padding:18px; font-size:16px; font-weight:800; border-radius:16px;" onclick="confirmReg()">
            👤 Register Patient
        </button>`;
    openM('Register New Patient', html);
}
async function confirmReg() {
    const b = { username: document.getElementById('ru').value, email: document.getElementById('re').value, first_name: document.getElementById('rf').value, role: 'PATIENT', password: 'patient123', age: document.getElementById('ra').value };
    await fx('/api/accounts/register/', 'POST', b); alert("Patient Created!"); location.reload();
}

async function openPrescModal(aid, pname) {
    const meds = await fx('/api/medicines/');
    let html = `
        <div class="form-group">
            <label>Diagnosis</label>
            <input type="text" id="pDi" placeholder="e.g. Hypertension, Diabetes..." required>
        </div>
        <div class="form-group">
            <label>Medication</label>
            <select id="pMe" style="width:100%;">${meds.results.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}</select>
        </div>
        <div class="form-group">
            <label>Dosage</label>
            <input type="text" id="pDos" placeholder="e.g. 1+0+1 (morning, noon, night)">
        </div>
        <div class="form-group">
            <label>Duration</label>
            <input type="text" id="pDur" placeholder="e.g. 7 days, 2 weeks">
        </div>
        <div class="form-group">
            <label>Detailed Advice / Notes</label>
            <textarea id="pNo" rows="4" placeholder="Write any additional advice for the patient..."></textarea>
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:8px; padding:18px; font-size:16px; font-weight:800; border-radius:16px;" onclick="confirmPresc('${aid}')">
            ✅ Submit Prescription
        </button>`;
    openM(`Prescription for ${pname}`, html);
}
async function confirmPresc(aid) {
    const dosage   = document.getElementById('pDos') ? document.getElementById('pDos').value || '1+0+1' : '1+0+1';
    const duration = document.getElementById('pDur') ? document.getElementById('pDur').value || '7 days' : '7 days';
    await fx('/api/prescriptions/', 'POST', { appointment: aid, diagnosis: document.getElementById('pDi').value, notes: document.getElementById('pNo').value, medicines: [{ medicine: document.getElementById('pMe').value, dosage: dosage, duration: duration }] });
    await fx(`/api/appointments/${aid}/update_status/`, 'POST', { status: 'COMPLETED' });
    alert("Prescribed successfully!"); location.reload();
}

async function initiateBooking(did, dname, dtime) {
    let html = `
        <div class="form-group">
            <label>Select Appointment Date</label>
            <input type="date" id="bDate" required style="width:100%;">
        </div>
        <div style="background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.2); border-radius:14px; padding:16px 20px; margin-bottom:20px;">
            <div style="font-size:12px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Appointment Time</div>
            <div style="font-size:18px; font-weight:800; color:#22d3ee;">🕒 ${dtime.split(' - ')[0]}</div>
        </div>
        <button class="btn btn-primary" style="width:100%; padding:18px; font-size:16px; font-weight:800; border-radius:16px;" onclick="confirmPatBook('${did}', '${dtime}')">
            📅 Request Appointment
        </button>`;
    openM(`Book Appointment with Dr. ${dname}`, html);
}
async function confirmPatBook(did, dtime) {
    const date = document.getElementById('bDate').value; if (!date) return alert("Select date");
    const prof = await fx('/api/accounts/profile/');
    const pats = await fx(`/api/patients/?search=${prof.username}`);
    await fx('/api/appointments/', 'POST', { doctor: did, patient: pats.results[0].id, appointment_date: new Date(`${date} ${dtime.split(' - ')[0]}`).toISOString(), status: 'PENDING' });
    alert("Booking Requested!"); location.reload();
}

async function viewPr(id) {
    const p = await fx(`/api/prescriptions/${id}/`);
    let html = `<div class="guide-result" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(34, 211, 238, 0.3); padding:30px; border-radius:20px;">
        <h3 style="color:#22d3ee !important; margin-bottom:15px; font-size:24px;">${p.diagnosis}</h3>
        <p style="margin:20px 0; color:#cbd5e1; font-size:18px; line-height:1.6;">${p.notes}</p>
        <div style="font-weight:700; color:#94a3b8; border-top:1px solid rgba(255,255,255,0.1); pt:15px; mt:15px;">
            Prescribed by <span style="color:#22d3ee;">Dr. ${p.doctor_name}</span>
        </div>
    </div>`;
    openM('Prescription Details', html);
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});
