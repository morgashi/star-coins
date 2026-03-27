const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const loginScreen = document.getElementById('loginScreen')
const dashboard = document.getElementById('dashboard')

let accounts = []
let transactions = []

// --- AUTH ---
window.onload = function() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) showDashboard(savedUser)
}

function showDashboard(username) {
    document.getElementById('welcomeMsg').textContent = 'Hi, ' + username
    loginScreen.style.display = 'none'
    dashboard.style.display = 'block'
    renderAll()
}

loginBtn.onclick = function() {
    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()
    if (!username || !password) return alert('Please fill in both fields.')
    localStorage.setItem('user', username)
    showDashboard(username)
}

logoutBtn.onclick = function() {
    localStorage.removeItem('user')
    dashboard.style.display = 'none'
    loginScreen.style.display = 'flex'
}

// --- NAV ---
document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = function() {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'))
        link.classList.add('active')
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none')
        document.getElementById(link.dataset.page).style.display = 'block'
    }
})

// --- ACCOUNTS ---
document.getElementById('addAccountBtn').onclick = function() {
    const name = prompt('Account name (e.g. Checking):')
    if (!name) return
    const amount = parseFloat(prompt('Current balance:'))
    if (isNaN(amount)) return
    accounts.push({ name, amount })
    renderAll()
}

// --- TRANSACTIONS MODAL ---
document.getElementById('addTxBtn').onclick = openModal
document.getElementById('addTxBtn2').onclick = openModal

function openModal(){
    document.getElementById('txDesc').value = ''
    document.getElementById('txAmount').value = ''
    document.getElementById('txDate').value = ''
    document.getElementById('txIconPreview').style.display = 'none'
    document.getElementById('txIconPreview').src = ''
    document.getElementById('txIconUpload').value = ''
    document.getElementById('txModal').style.display = 'flex'
}
document.getElementById('txCancelBtn').onclick = function() {
    document.getElementById('txModal').style.display = 'none'
}

document.getElementById('txIconUpload').onchange = function() {
    const file = this.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function(e) {
        const preview = document.getElementById('txIconPreview')
        preview.src = e.target.result
        preview.style.display = 'block'
    }
    reader.readAsDataURL(file)
}

document.getElementById('txSaveBtn').onclick = function() {
    const desc = document.getElementById('txDesc').value.trim()
    const amount = parseFloat(document.getElementById('txAmount').value)
    const rawDate = document.getElementById('txDate').value
    const preview = document.getElementById('txIconPreview')
    const icon = preview.style.display !== 'none' ? preview.src : ''

    if (!desc) return alert('Please enter a description.')
    if (isNaN(amount)) return alert('Please enter a valid amount')
    if (!rawDate) return alert('Please select a date.')

    const date = new Date(rawDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
    transactions.unshift({ desc, amount, date, icon })
    transactions.unshift({ desc, amount, date, rawDate, icon})
    document.getElementById('txModal').style.display = 'none'
    renderAll()
}

// --- FILTERS ---
function renderAll() {
    renderAccounts()
    renderTxList()
    renderTxFullList()
}

function renderAccounts() {
    const total = accounts.reduce((sum, a) => sum + a.amount, 0)
    document.getElementById('netWorth').textContent = '$' + total.toFixed(2)
    document.getElementById('accountList').innerHTML = accounts.map(a =>
        `<div class = "account-row">
            <span>${a.name}</span>
            <span class="${a.amount >= 0 ? 'pos' : 'neg'}">
                ${a.amount >= 0 ? '+' : ''}$${Math.abs(a.amount).toFixed(2)}
            </span>
        </div>`
    ).join('')
}

function renderTxList() {
    const txList = document.getElementById('txList')
    txList.innerHTML = transactions.length === 0
        ? '<p style="color:#555;font-size:13px;">No transactions yet.</p>'
        : transactions.slice(0, 5).map(t => txCardHTML(t)).join('')
}

function renderTxFullList() {
    const search = document.getElementById('txSearch').value.toLowerCase()
    const from = document.getElementById('txFilterFrom').value
    const to = document.getElementById('txFilterTo').value

    let filtered = transactions.filter(t => {
        if (search && !t.desc.toLowerCase().includes(search)) return false
        if (from && new Date(t.rawDate) < new Date(from)) return false
        if (to && new Date(t.rawDate) > new Date(to)) return false
    })

    if (filtered.length === 0) {
        document.getElementById('txFullList').innerHTML =
        '<p style="color:#555;font-size:13px;">No transactions found.</p>'
        return
    }

    const groups = {}
    filtered.forEach(t => {
        if (!groups[t.date]) groups[t.date] = []
            groups[t.date].push(t)
        
    })

    document.getElementById('txFullList').innerHTML = Object.entries(groups).map(([date, txs]) =>
    `<div class="tx-date-group">
      <p class="tx-date-label">${date}</p>
      ${txs.map(t => txCardHTML(t)).join('')}
    </div>`
  ).join('')
}

function txCardHTML(t) {
    const iconHTML = t.icon
      ? `<img class="tx-card-icon" src="${t.icon}">`
      : `<div class="tx-card-icon-placeholder">💳</div>`
    return `<div class="tx-card">
      <div class="tx-card-left">
        ${iconHTML}
        <div>
          <div class="tx-card-name">${t.desc}</div>
          <div class="tx-card-desc">${t.date}</div>
        </div>
      </div>
        <span class="${t.amount >= 0 ? 'pos' : 'neg'} tx-card-amount">
      ${t.amount >= 0 ? '+' : ''}$${Math.abs(t.amount).toFixed(2)}
        </span>
      </div>`
}
