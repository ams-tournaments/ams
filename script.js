const ADMIN_EMAIL = "jadkoudmani100@gmail.com";
const ADMIN_PASS = "Jadkoudmani572010";

// قاعدة بيانات موحدة وحصينة ضد الضياع ومحدثة بالكامل
let appStorage = JSON.parse(localStorage.getItem('AMS_ELITE_ARENA_V10')) || {
    matches: [],
    customLogo: '',
    votes: {},
    userVotes: {}
};

let matchesDB = appStorage.matches;
let currentCustomLogo = appStorage.customLogo;
let editingMatchIndex = -1;

function persistDB() {
    appStorage.matches = matchesDB;
    appStorage.customLogo = currentCustomLogo;
    try {
        localStorage.setItem('AMS_ELITE_ARENA_V10', JSON.stringify(appStorage));
    } catch (e) {
        showToast('تنبيه: مساحة التخزين ممتلئة! يرجى تصغير حجم الصور');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    applyGlobalLogo();
    const savedRole = localStorage.getItem('ams_current_role');

    if (savedRole === 'admin') {
        switchView('admin');
    } else if (savedRole === 'user') {
        switchView('public');
    } else {
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
    
    toast.innerText = message;
    toast.className = 'toast show';
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 2700);
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
        showToast('أهلاً بك في لوحة تحكم AMS ✨');
    } else {
        localStorage.setItem('ams_current_role', 'user');
        switchView('public');
        showToast('أهلاً بك في حلبة AMS الرسمية ✨');
    }
}

function logoutAdmin() {
    localStorage.removeItem('ams_current_role');
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
        if (backBtn) backBtn.style.display = (role === 'admin') ? 'inline-block' : 'none';
        renderMatches('publicMatchesContainer', false);
    }
}

function compressImage(file, maxWidth, quality, callback) {
    if (!file) {
        callback(null);
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            callback(dataUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function uploadSiteLogo(event) {
    const file = event.target.files[0];
    if (!file) return;

    compressImage(file, 300, 0.75, (compressedData) => {
        if (compressedData) {
            currentCustomLogo = compressedData;
            persistDB();
            applyGlobalLogo();
            showToast('تم تحديث شعار البطولة بنجاح');
        }
    });
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

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ams_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير النسخة الاحتياطية بنجاح 💾');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.matches) {
                appStorage = parsed;
                matchesDB = appStorage.matches;
                currentCustomLogo = appStorage.customLogo || '';
                localStorage.setItem('AMS_ELITE_ARENA_V10', JSON.stringify(appStorage));
                applyGlobalLogo();
                showToast('تم استعادة البيانات بنجاح ✨');
                setTimeout(() => location.reload(), 800);
            } else {
                showToast('ملف النسخ الاحتياطي غير صالح!');
            }
        } catch (err) {
            showToast('خطأ في قراءة الملف!');
        }
    };
    reader.readAsText(file);
}

function voteMatch(matchIndex, fighterNum) {
    if (!appStorage.votes) appStorage.votes = {};
    if (!appStorage.userVotes) appStorage.userVotes = {};

    let votes = appStorage.votes[matchIndex] || { p1: 0, p2: 0 };
    let previousVote = appStorage.userVotes[matchIndex];

    if (previousVote) {
        if (parseInt(previousVote) === fighterNum) {
            showToast('لقد قمت بالتصويت لهذا المقاتل مسبقاً! 🥊');
            return;
        } else {
            if (previousVote === '1') votes.p1 = Math.max(0, votes.p1 - 1);
            if (previousVote === '2') votes.p2 = Math.max(0, votes.p2 - 1);
        }
    }

    if (fighterNum === 1) votes.p1++;
    else votes.p2++;

    appStorage.votes[matchIndex] = votes;
    appStorage.userVotes[matchIndex] = fighterNum.toString();
    persistDB();

    updateVotingUI(matchIndex);
    showToast('تم تسجيل تصويتك بنجاح! 🥊');
}

function updateVotingUI(matchIndex) {
    const votes = (appStorage.votes && appStorage.votes[matchIndex]) || { p1: 0, p2: 0 };
    const userVoted = appStorage.userVotes && appStorage.userVotes[matchIndex];
    const total = votes.p1 + votes.p2;
    
    const p1Percent = total === 0 ? 50 : Math.round((votes.p1 / total) * 100);
    const p2Percent = total === 0 ? 50 : 100 - p1Percent;

    const bar1 = document.getElementById(`voteBar1_${matchIndex}`);
    const bar2 = document.getElementById(`voteBar2_${matchIndex}`);
    const txt1 = document.getElementById(`voteText1_${matchIndex}`);
    const txt2 = document.getElementById(`voteText2_${matchIndex}`);
    const totalTxt = document.getElementById(`voteTotal_${matchIndex}`);
    const btn1 = document.getElementById(`voteBtn1_${matchIndex}`);
    const btn2 = document.getElementById(`voteBtn2_${matchIndex}`);

    if (bar1 && bar2 && txt1 && txt2) {
        bar1.style.width = `${p1Percent}%`;
        bar2.style.width = `${p2Percent}%`;
        txt1.innerText = `${p1Percent}%`;
        txt2.innerText = `${p2Percent}%`;
        
        if (totalTxt) totalTxt.innerText = `إجمالي الأصوات: ${total}`;

        if (btn1 && btn2) {
            btn1.classList.remove('active-voted');
            btn2.classList.remove('active-voted');
            if (userVoted === '1') btn1.classList.add('active-voted');
            if (userVoted === '2') btn2.classList.add('active-voted');
        }
    }
}

function saveMatchResult(index) {
    const winnerSelect = document.getElementById(`winnerSelect_${index}`);
    const methodSelect = document.getElementById(`methodSelect_${index}`);
    
    if (!winnerSelect || !methodSelect) return;

    const winner = winnerSelect.value;
    const method = methodSelect.value;

    if (!winner) {
        showToast('يرجى تحديد الفائز أولاً');
        return;
    }

    matchesDB[index].result = { winner, method };
    persistDB();
    showToast('تم حفظ نتيجة النزال بنجاح 🏆');
    renderMatches('adminMatchesContainer', true);
}

function saveMatchHandler() {
    const p1Name = document.getElementById('p1Name').value.trim();
    const p2Name = document.getElementById('p2Name').value.trim();

    if (!p1Name || !p2Name) {
        showToast('يرجى إدخال أسماء المتنافسين');
        return;
    }

    const matchData = {
        p1: {
            name: p1Name,
            nickname: document.getElementById('p1Nickname').value.trim() || 'بدون لقب',
            club: document.getElementById('p1Club').value.trim() || 'غير محدد',
            insta: document.getElementById('p1Insta').value.trim() || '',
            age: document.getElementById('p1Age').value.trim() || 'غير محدد',
            weight: (document.getElementById('p1Weight').value.trim() ? document.getElementById('p1Weight').value.trim() + ' kg' : 'غير محدد'),
            height: (document.getElementById('p1Height').value.trim() ? document.getElementById('p1Height').value.trim() + ' cm' : 'غير محدد')
        },
        p2: {
            name: p2Name,
            nickname: document.getElementById('p2Nickname').value.trim() || 'بدون لقب',
            club: document.getElementById('p2Club').value.trim() || 'غير محدد',
            insta: document.getElementById('p2Insta').value.trim() || '',
            age: document.getElementById('p2Age').value.trim() || 'غير محدد',
            weight: (document.getElementById('p2Weight').value.trim() ? document.getElementById('p2Weight').value.trim() + ' kg' : 'غير محدد'),
            height: (document.getElementById('p2Height').value.trim() ? document.getElementById('p2Height').value.trim() + ' cm' : 'غير محدد')
        },
        result: (editingMatchIndex > -1 && matchesDB[editingMatchIndex].result) ? matchesDB[editingMatchIndex].result : null
    };

    const file1 = document.getElementById('p1ImgFile').files[0];
    const file2 = document.getElementById('p2ImgFile').files[0];

    compressImage(file1, 400, 0.75, (img1Data) => {
        compressImage(file2, 400, 0.75, (img2Data) => {
            let defaultImg = 'https://via.placeholder.com/150';
            
            if (editingMatchIndex > -1) {
                matchData.p1.img = img1Data || matchesDB[editingMatchIndex].p1.img;
                matchData.p2.img = img2Data || matchesDB[editingMatchIndex].p2.img;
                matchesDB[editingMatchIndex] = matchData;
                showToast('تم حفظ التعديلات بنجاح');
            } else {
                matchData.p1.img = img1Data || defaultImg;
                matchData.p2.img = img2Data || defaultImg;
                matchesDB.push(matchData);
                showToast('تم نشر المواجهة بنجاح');
            }

            persistDB();
            resetMatchForm();
            renderMatches('adminMatchesContainer', true);
        });
    });
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
    document.querySelectorAll('#adminScreen input').forEach(input => { if(input.type !== 'file') input.value = ''; });
    document.getElementById('formBadgeText').innerText = '⚔️ إنشاء مواجهة جديدة';
    document.getElementById('formTitleText').innerText = 'بيانات النزال المرتقب (Red vs Silver)';
    document.getElementById('submitMatchBtn').innerText = '🚀 نشر النزال في الحلبة';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

function toggleMatchDetails(id) {
    const detailsDiv = document.getElementById(id);
    if (!detailsDiv) return;
    detailsDiv.classList.toggle('open');
}

function renderInstagramIcon(instaUrl) {
    if (!instaUrl || instaUrl.trim() === "") return '';
    return `
        <a href="${instaUrl}" target="_blank" class="fighter-insta-badge btn-ripple" title="حساب إنستغرام" onclick="event.stopPropagation();">
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
            <div style="text-align: center; color: var(--silver-muted); padding: 40px; background: var(--card-bg); border-radius: 16px; border: 1px dashed var(--card-border); grid-column: 1 / -1;">
                لا توجد مواجهات نشطة في الحلبة حالياً.
            </div>
        `;
        return;
    }

    matchesDB.forEach((m, index) => {
        const detailsId = `details_${containerId}_${index}`;
        const votes = (appStorage.votes && appStorage.votes[index]) || { p1: 0, p2: 0 };
        const userVoted = appStorage.userVotes && appStorage.userVotes[index];
        const totalVotes = votes.p1 + votes.p2;
        const p1Per = totalVotes === 0 ? 50 : Math.round((votes.p1 / totalVotes) * 100);
        const p2Per = totalVotes === 0 ? 50 : 100 - p1Per;

        const activeBtn1 = userVoted === '1' ? 'active-voted' : '';
        const activeBtn2 = userVoted === '2' ? 'active-voted' : '';

        let resultBadgeHtml = '';
        if (m.result) {
            let winnerName = m.result.winner === 'p1' ? m.p1.name : m.p2.name;
            resultBadgeHtml = `
                <div style="text-align: center; padding: 6px; background: rgba(255, 30, 39, 0.12); border-bottom: 1px solid rgba(255, 30, 39, 0.3);">
                    <span style="font-size: 11px; font-weight: bold; color: #fff;">🏆 بطل النزال: <span style="color: var(--red-ams);">${winnerName}</span></span>
                    <div class="win-method-badge">${m.result.method}</div>
                </div>
            `;
        }

        const adminResultControls = showActions ? `
            <div style="padding: 12px; background: #060609; border-top: 1px solid var(--card-border);">
                <div style="font-size: 10px; color: var(--silver-muted); margin-bottom: 6px; font-weight: bold;">تسجيل نتيجة النزال الرسمية:</div>
                <div class="end-match-controls">
                    <select id="winnerSelect_${index}">
                        <option value="">حدد الفائز...</option>
                        <option value="p1" ${m.result && m.result.winner === 'p1' ? 'selected' : ''}>${m.p1.name} (الركن الأحمر)</option>
                        <option value="p2" ${m.result && m.result.winner === 'p2' ? 'selected' : ''}>${m.p2.name} (الركن الفضي)</option>
                    </select>
                    <select id="methodSelect_${index}">
                        <option value="KO / TKO" ${m.result && m.result.method === 'KO / TKO' ? 'selected' : ''}>ضربة قاضية (KO / TKO)</option>
                        <option value="Submission" ${m.result && m.result.method === 'Submission' ? 'selected' : ''}>إخضاع (Submission)</option>
                        <option value="Decision" ${m.result && m.result.method === 'Decision' ? 'selected' : ''}>قرار الحكام (Decision)</option>
                    </select>
                    <button class="btn btn-danger btn-ripple" style="padding: 6px 12px; width: auto; font-size: 10px;" onclick="saveMatchResult(${index})">حفظ النتيجة</button>
                </div>
            </div>
        ` : '';

        const actionsHtml = showActions ? `
            <div class="card-actions-bar">
                <div class="action-buttons-group">
                    <button class="btn-card-action edit btn-ripple" onclick="editMatch(${index})">✏️ تعديل النزال</button>
                    <button class="btn-card-action delete btn-ripple" onclick="deleteMatch(${index})">🗑️ حذف</button>
                </div>
            </div>
        ` : '';

        container.innerHTML += `
            <div class="match-card">
                <div class="match-header-bar">AMS ARENA MATCH #${index + 1}</div>
                ${resultBadgeHtml}
                
                <div class="arena-flex" onclick="toggleMatchDetails('${detailsId}')">
                    <div class="fighter-profile">
                        <img src="${m.p1.img}" class="fighter-avatar-skew" alt="${m.p1.name}" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <div class="vs-divider"><div class="vs-badge-text">VS</div></div>
                    <div class="fighter-profile">
                        <img src="${m.p2.img}" class="fighter-avatar-skew" alt="${m.p2.name}" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                </div>

                <div class="voting-section" onclick="event.stopPropagation();">
                    <div class="voting-header">
                        <span class="voting-title">🥊 توقع فائز المعركة</span>
                        <span id="voteTotal_${index}" class="voting-total">إجمالي الأصوات: ${totalVotes}</span>
                    </div>
                    
                    <div class="voting-buttons">
                        <button id="voteBtn1_${index}" class="vote-btn corner-red-btn btn-ripple ${activeBtn1}" onclick="voteMatch(${index}, 1)">
                            ${m.p1.name} (<span id="voteText1_${index}">${p1Per}%</span>)
                        </button>
                        <button id="voteBtn2_${index}" class="vote-btn corner-silver-btn btn-ripple ${activeBtn2}" onclick="voteMatch(${index}, 2)">
                            ${m.p2.name} (<span id="voteText2_${index}">${p2Per}%</span>)
                        </button>
                    </div>
                    
                    <div class="vote-progress-bar">
                        <div id="voteBar1_${index}" class="vote-progress-red" style="width: ${p1Per}%;"></div>
                        <div id="voteBar2_${index}" class="vote-progress-silver" style="width: ${p2Per}%;"></div>
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

                ${adminResultControls}
                ${actionsHtml}
            </div>
        `;
    });
}

function deleteMatch(index) {
    if(confirm('هل أنت متأكد من حذف هذه المواجهة نهائياً؟')) {
        matchesDB.splice(index, 1);
        persistDB();
        renderMatches('adminMatchesContainer', true);
        showToast('تم حذف المواجهة بنجاح');
    }
}
