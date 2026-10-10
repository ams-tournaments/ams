const ADMIN_EMAIL = "jadkoudmani100@gmail.com";
const ADMIN_PASS = "Jadkoudmani572010";

let matchesDB = JSON.parse(localStorage.getItem('ams_pro_db_v6')) || [];
let currentCustomLogo = localStorage.getItem('ams_custom_logo') || '';
let editingMatchIndex = -1;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputPass').value = '';

    applyGlobalLogo();
    switchView('login');
});

function showToast(message) {
    const toast = document.getElementById('toastNotification');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('inputPass');
    const eyeIcon = document.getElementById('eyeIcon');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>';
    } else {
        passInput.type = 'password';
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
}

function processLogin() {
    const email = document.getElementById('inputEmail').value.trim();
    const pass = document.getElementById('inputPass').value.trim();

    if (!email || !pass) {
        showToast('يرجى كتابة البريد الإلكتروني وكلمة المرور');
        return;
    }

    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        localStorage.setItem('ams_current_role', 'admin');
        switchView('admin');
        showToast('أهلاً بك في عالم AMS ✨');
    } else {
        localStorage.setItem('ams_current_role', 'user');
        switchView('public');
        showToast('أهلاً بك في عالم AMS ✨');
    }
}

function logoutAdmin() {
    localStorage.removeItem('ams_current_role');
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputPass').value = '';
    switchView('login');
    showToast('تم تسجيل الخروج بنجاح');
}

function switchView(viewName) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminScreen').style.display = 'none';
    document.getElementById('publicScreen').style.display = 'none';

    if (viewName === 'login') {
        document.getElementById('loginScreen').style.display = 'flex';
    } else if (viewName === 'admin') {
        document.getElementById('adminScreen').style.display = 'block';
        renderMatches('adminMatchesContainer', true);
    } else if (viewName === 'public') {
        document.getElementById('publicScreen').style.display = 'block';
        
        const role = localStorage.getItem('ams_current_role');
        const backBtn = document.getElementById('backAdminBtn');
        if (backBtn) {
            backBtn.style.display = (role === 'admin') ? 'inline-block' : 'none';
        }

        renderMatches('publicMatchesContainer', false);
    }
}

function uploadSiteLogo(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        currentCustomLogo = e.target.result;
        localStorage.setItem('ams_custom_logo', currentCustomLogo);
        applyGlobalLogo();
        showToast('تم تحديث شعار البطولة بنجاح');
    };
    reader.readAsDataURL(file);
}

function applyGlobalLogo() {
    const logoContainers = [
        document.getElementById('loginLogoPreview'),
        document.getElementById('headerLogoContainer'),
        document.getElementById('publicHeaderLogoContainer')
    ];

    logoContainers.forEach(container => {
        if (!container) return;
        if (currentCustomLogo) {
            container.style.backgroundImage = `url(${currentCustomLogo})`;
            container.classList.add('has-image');
        } else {
            container.style.backgroundImage = 'none';
            container.classList.remove('has-image');
        }
    });
}

function saveMatchHandler() {
    const p1Name = document.getElementById('p1Name').value.trim();
    const p1AgeVal = document.getElementById('p1Age').value.trim();
    const p1WeightVal = document.getElementById('p1Weight').value.trim();
    const p1HeightVal = document.getElementById('p1Height').value.trim();
    const p1File = document.getElementById('p1ImgFile').files[0];

    const p2Name = document.getElementById('p2Name').value.trim();
    const p2AgeVal = document.getElementById('p2Age').value.trim();
    const p2WeightVal = document.getElementById('p2Weight').value.trim();
    const p2HeightVal = document.getElementById('p2Height').value.trim();
    const p2File = document.getElementById('p2ImgFile').files[0];

    if (!p1Name || !p2Name) {
        showToast('يرجى إدخال أسماء المتنافسين');
        return;
    }

    const p1Age = p1AgeVal ? p1AgeVal : 'غير محدد';
    const p1Weight = p1WeightVal ? p1WeightVal + ' kg' : 'غير محدد';
    const p1Height = p1HeightVal ? p1HeightVal + ' cm' : 'غير محدد';

    const p2Age = p2AgeVal ? p2AgeVal : 'غير محدد';
    const p2Weight = p2WeightVal ? p2WeightVal + ' kg' : 'غير محدد';
    const p2Height = p2HeightVal ? p2HeightVal + ' cm' : 'غير محدد';

    processImagesAndSave(p1File, p2File, {
        p1: { name: p1Name, age: p1Age, weight: p1Weight, height: p1Height },
        p2: { name: p2Name, age: p2Age, weight: p2Weight, height: p2Height }
    });
}

function processImagesAndSave(file1, file2, matchData) {
    let p1ImgResult = (editingMatchIndex > -1) ? matchesDB[editingMatchIndex].p1.img : 'https://via.placeholder.com/100';
    let p2ImgResult = (editingMatchIndex > -1) ? matchesDB[editingMatchIndex].p2.img : 'https://via.placeholder.com/100';

    const saveToDB = () => {
        matchData.p1.img = p1ImgResult;
        matchData.p2.img = p2ImgResult;

        if (editingMatchIndex > -1) {
            matchesDB[editingMatchIndex] = matchData;
            showToast('تم حفظ التعديلات بنجاح');
        } else {
            matchesDB.push(matchData);
            showToast('تم نشر المواجهة بنجاح');
        }

        localStorage.setItem('ams_pro_db_v6', JSON.stringify(matchesDB));
        resetMatchForm();
        renderMatches('adminMatchesContainer', true);
    };

    if (file1) {
        const reader1 = new FileReader();
        reader1.onload = function(e1) {
            p1ImgResult = e1.target.result;
            checkSecond();
        };
        reader1.readAsDataURL(file1);
    } else {
        checkSecond();
    }

    function checkSecond() {
        if (file2) {
            const reader2 = new FileReader();
            reader2.onload = function(e2) {
                p2ImgResult = e2.target.result;
                saveToDB();
            };
            reader2.readAsDataURL(file2);
        } else {
            saveToDB();
        }
    }
}

function editMatch(index) {
    editingMatchIndex = index;
    const match = matchesDB[index];

    document.getElementById('p1Name').value = match.p1.name;
    document.getElementById('p1Age').value = parseInt(match.p1.age) || '';
    document.getElementById('p1Weight').value = parseFloat(match.p1.weight) || '';
    document.getElementById('p1Height').value = parseInt(match.p1.height) || '';

    document.getElementById('p2Name').value = match.p2.name;
    document.getElementById('p2Age').value = parseInt(match.p2.age) || '';
    document.getElementById('p2Weight').value = parseFloat(match.p2.weight) || '';
    document.getElementById('p2Height').value = parseInt(match.p2.height) || '';

    document.getElementById('formBadgeText').innerText = '✏️ وضع تعديل المواجهة';
    document.getElementById('formTitleText').innerText = `تعديل النزال #${index + 1}`;
    document.getElementById('submitMatchBtn').innerText = '💾 حفظ التعديلات';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    document.getElementById('formPanel').scrollIntoView({ behavior: 'smooth' });
}

function resetMatchForm() {
    editingMatchIndex = -1;
    document.querySelectorAll('#adminScreen input[type="text"]').forEach(input => input.value = '');
    document.querySelectorAll('#adminScreen input[type="number"]').forEach(input => input.value = '');
    document.querySelectorAll('#adminScreen input[type="file"]').forEach(input => input.value = '');

    document.getElementById('formBadgeText').innerText = '⚔️ إضافة مواجهة جديدة';
    document.getElementById('formTitleText').innerText = 'بيانات النزال المرتقب (VS)';
    document.getElementById('submitMatchBtn').innerText = '🚀 حفظ ونشر النزال';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

function toggleMatchDetails(id) {
    const detailsDiv = document.getElementById(id);
    if (!detailsDiv) return;
    detailsDiv.style.display = (detailsDiv.style.display === 'block') ? 'none' : 'block';
}

function renderMatches(containerId, showActions) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (matchesDB.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--silver-muted); padding: 30px; background: var(--card-bg); border-radius: 12px; border: 1px dashed var(--card-border); grid-column: 1 / -1;">
                لا توجد مواجهات مضافة حالياً.
            </div>
        `;
        return;
    }

    matchesDB.forEach((m, index) => {
        const detailsId = `details_${containerId}_${index}`;
        const actionsHtml = showActions ? `
            <div class="card-actions-bar">
                <button class="btn-card-action edit" onclick="editMatch(${index})">✏️ تعديل الكتابة والصور</button>
                <button class="btn-card-action delete" onclick="deleteMatch(${index})">🗑️ حذف</button>
            </div>
        ` : '';

        container.innerHTML += `
            <div class="match-card">
                <div class="match-header-bar">AMS OFFICIAL MATCH #${index + 1}</div>
                
                <div class="arena-flex" onclick="toggleMatchDetails('${detailsId}')">
                    <div class="fighter-profile">
                        <img src="${m.p1.img}" class="fighter-avatar-skew" alt="${m.p1.name}" onerror="this.src='https://via.placeholder.com/100'">
                    </div>

                    <div class="vs-divider">
                        <div class="vs-badge-text">VS</div>
                    </div>

                    <div class="fighter-profile">
                        <img src="${m.p2.img}" class="fighter-avatar-skew" alt="${m.p2.name}" onerror="this.src='https://via.placeholder.com/100'">
                    </div>
                </div>

                <div id="${detailsId}" class="match-details-expandable">
                    <div class="details-row">
                        <div class="details-fighter-info">
                            <div class="name">${m.p1.name}</div>
                            <div class="info-line">العمر: <span>${m.p1.age}</span></div>
                            <div class="info-line">الوزن: <span>${m.p1.weight}</span></div>
                            <div class="info-line">الطول: <span>${m.p1.height}</span></div>
                        </div>

                        <div class="details-fighter-info">
                            <div class="name">${m.p2.name}</div>
                            <div class="info-line">العمر: <span>${m.p2.age}</span></div>
                            <div class="info-line">الوزن: <span>${m.p2.weight}</span></div>
                            <div class="info-line">الطول: <span>${m.p2.height}</span></div>
                        </div>
                    </div>
                </div>

                ${actionsHtml}
            </div>
        `;
    });
}

function deleteMatch(index) {
    if(confirm('هل أنت متأكد من حذف هذه المواجهة نهائياً؟')) {
        matchesDB.splice(index, 1);
        localStorage.setItem('ams_pro_db_v6', JSON.stringify(matchesDB));
        renderMatches('adminMatchesContainer', true);
        showToast('تم حذف المواجهة بنجاح');
    }
}
