// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyYourFirebaseAPIKeyHere",
    authDomain: "shwelucky4d.firebaseapp.com",
    projectId: "shwelucky4d",
    storageBucket: "shwelucky4d.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123:web:abc"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// App Global State
let currentUser = null;
let isRegisterMode = false;
let selectedChar = "က";
let currentCartCount = 1;

// Myanmar Characters (က မှ အ ထိ)
const myanmarChars = [
    "က", "ခ", "ဂ", "ဃ", "င", 
    "စ", "ဆ", "ဇ", "ဈ", "ည", 
    "ဋ", "ဌ", "ဍ", "ဎ", "ဏ", 
    "တ", "ထ", "ဒ", "ဓ", "န", 
    "ပ", "ဖ", "ဗ", "ဘ", "မ", 
    "ယ", "ရ", "လ", "ဝ", "သ", 
    "ဟ", "ဠ", "အ"
];

// --- AUTHENTICATION ---
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    let btn = document.getElementById('auth-btn');
    let label = document.getElementById('toggle-mode-label');
    if (isRegisterMode) {
        btn.innerText = "အသစ်စာရင်းသွင်းမည် (Register)";
        label.innerText = "အကောင့်ရှိပြီးသားလား? Login ဝင်ရန် နှိပ်ပါ";
    } else {
        btn.innerText = "Login ဝင်မည်";
        label.innerText = "အကောင့်မရှိသေးပါက ဤနေရာကိုနှိပ်ပါ (Register)";
    }
}

async function handleAuth(e) {
    e.preventDefault();
    let phone = document.getElementById('login-phone').value.trim();
    let pass = document.getElementById('login-password').value.trim();

    if (!phone || !pass) {
        alert("ဖုန်းနံပါတ်နှင့် Password ကို အပြည့်အစုံ ဖြည့်ပါ။");
        return;
    }

    // Master Admin Login
    if (phone === "admin" && pass === "admin123") {
        currentUser = { phone: "admin", name: "Super Admin", id: "79775188", role: "admin" };
        initDashboard();
        return;
    }

    try {
        let userRef = db.collection("users").doc(phone);
        let doc = await userRef.get();

        if (isRegisterMode) {
            if (doc.exists) {
                alert("⚠️ ဤဖုန်းနံပါတ်ဖြင့် အကောင့်ရှိပြီးသား ဖြစ်ပါသည်။");
                return;
            }
            let newUser = {
                phone: phone,
                pass: pass,
                name: "User_" + phone.slice(-4),
                id: Math.floor(10000000 + Math.random() * 90000000),
                role: "user"
            };
            await userRef.set(newUser);
            currentUser = newUser;
            alert("✅ အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။");
            initDashboard();
        } else {
            if (!doc.exists) {
                alert("❌ ဤဖုန်းနံပါတ်ဖြင့် အကောင့်မရှိသေးပါ။");
                return;
            }
            let userData = doc.data();
            if (userData.pass !== pass) {
                alert("❌ Password မှားယွင်းနေပါသည်။ ဆာဗာမှ မှတ်သားထားသော Password နှင့် ကိုက်ညီရပါမည်။");
                return;
            }
            currentUser = userData;
            initDashboard();
        }
    } catch (error) {
        console.error("Auth Error: ", error);
        alert("ဆာဗာချိတ်ဆက်မှု အမှားအယွင်း ရှိပါသည်။ (Local ဖြင့် ဆက်လက်စမ်းသပ်ရန် admin / admin123 ကို သုံးပါ)");
        // Fallback for offline testing
        if (phone === "admin" && pass === "admin123") {
            currentUser = { phone: "admin", name: "Super Admin", id: "79775188", role: "admin" };
            initDashboard();
        }
    }
}

function showForgotPassword() {
    let box = document.getElementById('forgot-msg');
    box.classList.remove('hidden');
    box.innerHTML = `Password မေ့ပါက <b>0976h277@gmail.com</b> ကို email ပို့ပါ။`;
}

// --- DASHBOARD INIT ---
function initDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('user-dashboard').classList.remove('hidden');
    document.getElementById('user-info-header').classList.remove('hidden');
    
    document.getElementById('header-username').innerText = currentUser.name;
    document.getElementById('header-random-id').innerText = "ID: " + currentUser.id;

    if (currentUser.role === 'admin' || currentUser.role === 'sub-admin') {
        document.getElementById('admin-nav-btn').classList.remove('hidden');
    }
    switchTab('bet');
}

// --- NAVIGATION ---
function switchTab(tabName) {
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    let contentArea = document.getElementById('tab-content');

    if (tabName === 'bet') {
        renderBettingView(contentArea);
    } else if (tabName === 'winners') {
        contentArea.innerHTML = `<div class="card"><h3>ဆုပေါက်ထားသူများ</h3><p style="margin-top:10px;">ပထမဆု - ဦးအောင် (က-၁၂၃၄)</p></div>`;
    } else if (tabName === 'results') {
        contentArea.innerHTML = `<div class="card"><h3>ထီပေါက်စဉ်</h3><p style="margin-top:10px;">ယခုအပတ် ထီပေါက်စဉ် - ခ-၅၆၇၈</p></div>`;
    } else if (tabName === 'history') {
        renderHistoryView(contentArea);
    } else if (tabName === 'about') {
        contentArea.innerHTML = `<div class="card"><h3>Shwe4Dအကြောင်း</h3><p style="margin-top:10px;">Shwe Lucky 4D သည် အကောင်းဆုံးနှင့် ယုံကြည်စိတ်ချရဆုံးသော 4D ဝန်ဆောင်မှု ဖြစ်ပါသည်။</p></div>`;
    } else if (tabName === 'admin') {
        renderAdminPanel(contentArea);
    }
}

// --- BETTING VIEW ---
function renderBettingView(container) {
    let charsHtml = myanmarChars.map(c => `<div class="char-btn ${selectedChar === c ? 'selected' : ''}" onclick="selectChar('${c}')">${c}</div>`).join('');

    container.innerHTML = `
        <div class="price-display-box">
            <span id="total-ticket-count">${currentCartCount}</span> စောင် × 500 MMK = <span id="total-price-val">${currentCartCount * 500}</span> MMK
        </div>

        <div class="card">
            <h3 style="margin-bottom:10px; color:var(--primary-gold);">ယခုထိုးမည်</h3>
            <div style="font-size:12px; color:#ddd; margin-bottom:6px;">မြန်မာအက္ခရာ တစ်လုံး (က မှ အ ထိ)</div>
            <div class="char-grid">${charsHtml}</div>

            <div style="font-size:12px; color:#ddd; margin-bottom:6px;">ဂဏန်း 4 လုံး</div>
            <div class="digit-boxes">
                <input type="text" maxlength="1" class="digit-box" id="d1" oninput="moveFocus(this, 'd2')">
                <input type="text" maxlength="1" class="digit-box" id="d2" oninput="moveFocus(this, 'd3')">
                <input type="text" maxlength="1" class="digit-box" id="d3" oninput="moveFocus(this, 'd4')">
                <input type="text" maxlength="1" class="digit-box" id="d4">
            </div>

            <button class="btn" style="background:#5a1818; color:white; margin-bottom:15px;" onclick="addAnotherTicket()"><i class="fas fa-plus"></i> နောက်ထပ် တစ်စောင် ရွေးချယ်မည်</button>
        </div>

        <div class="card">
            <div class="payment-box-title">ငွေလွှဲရန် အကောင့်များ</div>
            <div class="bank-info-card">
                <div>
                    <div style="font-size:12px; color:#f3e0aa;">Kpay</div>
                    <div style="font-weight:bold;" id="disp-bank-name">HeinMinZaw</div>
                    <div style="font-size:13px; color:#ddd;" id="disp-bank-no">09688135852</div>
                </div>
            </div>

            <div class="payment-box-title" style="margin-top:15px;">ငွေလွှဲပြီးပါက Transaction ID ထည့်ပါ</div>
            <div class="form-group"><label>နာမည် *</label><input type="text" id="pay-name" value="${currentUser.name}"></div>
            <div class="form-group"><label>ဖုန်းနံပါတ် *</label><input type="text" id="pay-phone" value="${currentUser.phone}"></div>
            <div class="form-group"><label>Transaction ID *</label><input type="text" id="pay-tranid" placeholder="Transaction ID"></div>
            
            <button class="btn success-btn" onclick="submitBet()"><i class="fas fa-check"></i> Submit / ထိုးမည်</button>
        </div>`;
}

function selectChar(c) {
    selectedChar = c;
    renderBettingView(document.getElementById('tab-content'));
}

function moveFocus(current, nextId) {
    if (current.value.length >= 1) {
        document.getElementById(nextId).focus();
    }
}

function addAnotherTicket() {
    currentCartCount++;
    document.getElementById('total-ticket-count').innerText = currentCartCount;
    document.getElementById('total-price-val').innerText = currentCartCount * 500;
}

async function submitBet() {
    let d1 = document.getElementById('d1').value;
    let d2 = document.getElementById('d2').value;
    let d3 = document.getElementById('d3').value;
    let d4 = document.getElementById('d4').value;
    let tranId = document.getElementById('pay-tranid').value.trim();

    if (!d1 || !d2 || !d3 || !d4 || !tranId) {
        alert("ဂဏန်း 4 လုံးနှင့် Transaction ID ကို အပြည့်အစုံ ဖြည့်ပါ။");
        return;
    }

    let ticketCode = `${selectedChar}-${d1}${d2}${d3}${d4}`;

    let newTicket = {
        id: "TICK-" + Math.floor(100000 + Math.random() * 900000),
        userId: currentUser.id,
        userName: currentUser.name,
        phone: currentUser.phone,
        ticket: ticketCode,
        count: currentCartCount,
        totalPrice: currentCartCount * 500,
        tranId: tranId,
        status: "pending",
        date: new Date().toLocaleString()
    };

    // Save locally and try server
    let localTickets = JSON.parse(localStorage.getItem('shwe4d_tickets')) || [];
    localTickets.push(newTicket);
    localStorage.setItem('shwe4d_tickets', JSON.stringify(localTickets));

    alert("✅ လက်မှတ်တင်သွင်းခြင်း အောင်မြင်ပါသည်။ Admin အတည်ပြုမှုကို စောင့်ပါ။");
    switchTab('history');
}

function renderHistoryView(container) {
    let localTickets = JSON.parse(localStorage.getItem('shwe4d_tickets')) || [];
    let userTickets = localTickets.filter(t => t.phone === currentUser.phone);

    let rows = "";
    userTickets.forEach(t => {
        rows += `<tr><td><b>${t.ticket}</b></td><td>${t.totalPrice} MMK</td><td><span style="color:${t.status==='confirmed'?'#2ecc71':'#f3e0aa'}">${t.status}</span></td></tr>`;
    });

    container.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-history"></i> ကျွန်ုပ်၏ မှတ်တမ်း</h3>
            <table class="data-table">
                <tr><th>လက်မှတ်</th><th>ကျသင့်ငွေ</th><th>အခြေအနေ</th></tr>
                ${rows || '<tr><td colspan="3" style="text-align:center; padding:10px;">မှတ်တမ်း မရှိသေးပါ။</td></tr>'}
            </table>
        </div>`;
}

// --- FULL ADMIN PANEL CONTROL ---
function renderAdminPanel(container) {
    let localTickets = JSON.parse(localStorage.getItem('shwe4d_tickets')) || [];
    let ticketRows = "";
    
    localTickets.forEach((t, idx) => {
        ticketRows += `<tr>
            <td><b>${t.userName}</b><br><span style="color:#aaa">${t.ticket}</span></td>
            <td>${t.tranId}<br><span style="color:#aaa">${t.phone}</span></td>
            <td><span style="color:${t.status==='confirmed'?'#2ecc71':'#f3e0aa'}">${t.status}</span></td>
            <td>
                <button onclick="adminAction(${idx}, 'confirmed')" style="background:#2ecc71; color:white; border:none; padding:3px 6px; border-radius:4px;">Confirm</button>
                <button onclick="adminAction(${idx}, 'rejected')" style="background:#e74c3c; color:white; border:none; padding:3px 6px; border-radius:4px; margin-top:2px;">Reject</button>
            </td>
        </tr>`;
    });

    container.innerHTML = `
        <div class="card">
            <h2><i class="fas fa-user-shield"></i> Admin Control Panel</h2>
            <p style="font-size:12px; color:#ddd; margin-bottom:15px;">အပလီကေးရှင်း တစ်ခုလုံးကို ဤနေရာမှ အပြည့်အစုံ ထိန်းချုပ်နိုင်ပါသည်။</p>

            <!-- 1. Payment Info -->
            <div class="form-group">
                <label>ငွေလွှဲအကောင့် ပြင်ရန်</label>
                <input type="text" id="adm-bank" value="Kpay: HeinMinZaw (09688135852)">
            </div>
            <button class="btn primary-btn" onclick="alert('ငွေလွှဲအကောင့် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ')">ငွေလွှဲအကောင့် သိမ်းမည်</button>

            <!-- 2. Tickets Review & Approval -->
            <h3 style="margin-top:20px; font-size:14px; color:var(--primary-gold);">User များ တင်ထားသော လက်မှတ်များ စစ်ဆေးရန်</h3>
            <div style="max-height: 200px; overflow-y: auto; margin-top: 8px;">
                <table class="data-table">
                    <tr><th>User / Ticket</th><th>TranID / Phone</th><th>Status</th><th>Action</th></tr>
                    ${ticketRows || '<tr><td colspan="4" style="text-align:center; padding:10px;">တင်ထားသော လက်မှတ် မရှိသေးပါ။</td></tr>'}
                </table>
            </div>
            <button class="btn danger-btn" style="margin-top:10px;" onclick="clearAllTickets()">လက်မှတ်အားလုံး ရှင်းလင်းဖျက်ဆီးမည် (15ရက်တစ်ကြိမ်)</button>

            <!-- 3. Search Data -->
            <h3 style="margin-top:20px; font-size:14px; color:var(--primary-gold);">အချက်အလက် ရှာဖွေရန် (Search)</h3>
            <div class="form-group"><input type="text" id="adm-search" placeholder="ဖုန်းနံပါတ် သို့မဟုတ် ဂဏန်းဖြင့် ရှာရန်"></div>
            <button class="btn primary-btn" onclick="adminSearch()">ရှာဖွေမည်</button>
            <div id="adm-search-result" style="font-size:12px; margin-top:8px; background:#2b0808; padding:8px; border-radius:6px;"></div>
        </div>`;
}

function adminAction(index, status) {
    let localTickets = JSON.parse(localStorage.getItem('shwe4d_tickets')) || [];
    if (localTickets[index]) {
        localTickets[index].status = status;
        localStorage.setItem('shwe4d_tickets', JSON.stringify(localTickets));
        alert(`လက်မှတ်အခြေအနေကို ${status} သို့ ပြောင်းလဲပြီးပါပြီ။`);
        switchTab('admin');
    }
}

function clearAllTickets() {
    if (confirm("လက်မှတ်အားလုံးကို ဖျက်မည်မှာ သေချာပါသလား?")) {
        localStorage.setItem('shwe4d_tickets', JSON.stringify([]));
        alert("ဖျက်ပြီးပါပြီ။");
        switchTab('admin');
    }
}

function adminSearch() {
    let q = document.getElementById('adm-search').value.trim();
    let localTickets = JSON.parse(localStorage.getItem('shwe4d_tickets')) || [];
    let found = localTickets.filter(t => t.phone.includes(q) || t.ticket.includes(q) || t.userName.includes(q));
    
    let res = document.getElementById('adm-search-result');
    if (found.length === 0) {
        res.innerHTML = "ရှာမတွေ့ပါ။";
        return;
    }
    let txt = "";
    found.forEach(t => {
        txt += `• ${t.userName} (${t.phone}) - ${t.ticket} [${t.status}]<br>`;
    });
    res.innerHTML = txt;
}
