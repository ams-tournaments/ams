const ADMIN_EMAIL = "jadkoudmani100@gmail.com";
const ADMIN_PASS = "Jadkoudmani572010";

let matchesDB = JSON.parse(localStorage.getItem('ams_pro_db_v7')) || [];
let currentCustomLogo = localStorage.getItem('ams_custom_logo') || '';
let editingMatchIndex = -1;

window.addEventListener('DOMContentLoaded', () => {
    applyGlobalLogo();

    // التحقق من حالة تسجيل الدخول السابقة عند فتح الموقع أو عمل Refresh
    const savedRole = localStorage.getItem('ams_current_role');

    if (savedRole === 'admin') {
        switchView('admin');
    } else if (savedRole === 'user') {
        switchView('public');
    } else {
        const emailInput = document.getElementById('inputEmail');
        const passInput = document.getElementById('inputPass');
        if (emailInput) emailInput.value = '';
        if (passInput) passInput.value = '';
        switchView('login');
    }
});

function showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        document.body.appendChild(toast);
    }
    
    // فرض الستايل البرمجي بالكامل لضمان ظهوره في الأسفل ومنعه من الصعود للأعلى
    toast.style.cssText = `
        position: fixed !important;
        bottom: -90px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: rgba(18, 18, 28, 0.95) !important;
        backdrop-filter: blur(12px) !important;
        color: #fff !important;
        border: 1px solid #e50914 !important;
        padding: 13px 26px !important;
        border-radius: 35px !important;
        font-size: 13px !important;
        font-weight: bold !important;
        box-shadow: 0 10px 30px rgba(229, 9, 20, 0.5) !important;
        z-index: 999999 !important;
        transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease !important;
        opacity: 0 !important;
        pointer-events: none !important;
        white-space: nowrap !important;
        font-family: 'Tajawal', sans-serif !important;
    `;
    
    toast.innerText = message;
    
    // إظهار الإشعار من الأسفل
    setTimeout(() => {
        toast.style.bottom = '35px';
        toast.style.opacity = '1';
    }, 20);

    // إخفاء الإشعار بعد 2.8 ثانية
    setTimeout(() => {
        toast.style.bottom = '-90px';
        toast.style.opacity = '0';
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
    const emailInput = document.getElementById('inputEmail');
    const passInput = document.getElementById('inputPass');
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
    switchView('login');
    showToast('تم تسجيل الخروج بنجاح');
}

function switchView(viewName) {
    const loginScr = document.getElementById('loginScreen');
    const adminScr = document.getElementById('adminScreen');
    const publicScr = document.getElementById('publicScreen');

    if (loginScr) loginScr.style.display = 'none';
    if (adminScr) adminScr.style.display = 'none';
    if (publicScr) publicScr.style.display = 'none';

    if (viewName === 'login') {
        if (loginScr) loginScr.style.display = 'flex';
    } else if (viewName === 'admin') {
        if (adminScr) adminScr.style.display = 'block';
        renderMatches('adminMatchesContainer', true);
    } else if (viewName === 'public') {
        if (publicScr) publicScr.style.display = 'block';
        
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
    const p1Nickname = document.getElementById('p1Nickname').value.trim();
    const p1Club = document.getElementById('p1Club').value.trim();
    const p1Insta = document.getElementById('p1Insta').value.trim();
    const p1AgeVal = document.getElementById('p1Age').value.trim();
    const p1WeightVal = document.getElementById('p1Weight').value.trim();
    const p1HeightVal = document.getElementById('p1Height').value.trim();
    const p1File = document.getElementById('p1ImgFile').files[0];

    const p2Name = document.getElementById('p2Name').value.trim();
    const p2Nickname = document.getElementById('p2Nickname').value.trim();
    const p2Club = document.getElementById('p2Club').value.trim();
    const p2Insta = document.getElementById('p2Insta').value.trim();
    const p2AgeVal = document.getElementById('p2Age').value.trim();
    const p2WeightVal = document.getElementById('p2Weight').value.trim();
    const p2HeightVal = document.getElementById('p2Height').value.trim();
    const p2File = document.getElementById('p2ImgFile').files[0];

    if (!p1Name || !p2Name) {
        showToast('يرجى إدخال أسماء المتنافسين');
        return;
    }

    const matchData = {
        p1: {
            name: p1Name,
            nickname: p1Nickname || 'بدون لقب',
            club: p1Club || 'غير محدد',
            insta: p1Insta || '',
            age: p1AgeVal ? p1AgeVal : 'غير محدد',
            weight: p1WeightVal ? p1WeightVal + ' kg' : 'غير محدد',
            height: p1HeightVal ? p1HeightVal + ' cm' : 'غير محدد'
        },
        p2: {
            name: p2Name,
            nickname: p2Nickname || 'بدون لقب',
            club: p2Club || 'غير محدد',
            insta: p2Insta || '',
            age: p2AgeVal ? p2AgeVal : 'غير محدد',
            weight: p2WeightVal ? p2WeightVal + ' kg' : 'غير محدد',
            height: p2HeightVal ? p2HeightVal + ' cm' : 'غير محدد'
        }
    };

    processImagesAndSave(p1File, p2File, matchData);
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

        localStorage.setItem('ams_pro_db_v7', JSON.stringify(matchesDB));
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
    document.getElementById('p1Nickname').value = match.p1.nickname !== 'بدون لقب' ? match.p1.nickname : '';
    document.getElementById('p1Club').value = match.p1.club !== 'غير محدد' ? match.p1.club : '';
    document.getElementById('p1Insta').value = match.p1.insta || '';
    document.getElementById('p1Age').value = parseInt(match.p1.age) || '';
    document.getElementById('p1Weight').value = parseFloat(match.p1.weight) || '';
    document.getElementById('p1Height').value = parseInt(match.p1.height) || '';

    document.getElementById('p2Name').value = match.p2.name;
    document.getElementById('p2Nickname').value = match.p2.nickname !== 'بدون لقب' ? match.p2.nickname : '';
    document.getElementById('p2Club').value = match.p2.club !== 'غير محدد' ? match.p2.club : '';
    document.getElementById('p2Insta').value = match.p2.insta || '';
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
    document.querySelectorAll('#adminScreen input[type="url"]').forEach(input => input.value = '');
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

function renderInstagramIcon(instaUrl) {
    if (!instaUrl || instaUrl.trim() === "") return '';
    return `
        <a href="${instaUrl}" target="_blank" class="fighter-insta-badge" title="حساب إنستغرام" onclick="event.stopPropagation();">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
        </a>
    `;
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
                            <div class="nickname">${m.p1.nickname}</div>
                            <div class="info-line">النادي: <span>${m.p1.club}</span></div>
                            <div class="info-line">العمر: <span>${m.p1.age}</span></div>
                            <div class="info-line">الوزن: <span>${m.p1.weight}</span></div>
                            <div class="info-line">الطول: <span>${m.p1.height}</span></div>
                            ${renderInstagramIcon(m.p1.insta)}
                        </div>

                        <div class="details-fighter-info">
                            <div class="name">${m.p2.name}</div>
                            <div class="nickname">${m.p2.nickname}</div>
                            <div class="info-line">النادي: <span>${m.p2.club}</span></div>
                            <div class="info-line">العمر: <span>${m.p2.age}</span></div>
                            <div class="info-line">الوزن: <span>${m.p2.weight}</span></div>
                            <div class="info-line">الطول: <span>${m.p2.height}</span></div>
                            ${renderInstagramIcon(m.p2.insta)}
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
        localStorage.setItem('ams_pro_db_v7', JSON.stringify(matchesDB));
        renderMatches('adminMatchesContainer', true);
        showToast('تم حذف المواجهة بنجاح');
    }
}
