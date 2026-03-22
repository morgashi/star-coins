const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const loginScreen = document.getElementById('loginScreen')
const dashboard = document.getElementById('dashboard')

let accounts = []
let transactions = []

window.onload = function() {
    const savedUser = localStorage.getItem("user")
    if(savedUser) {
        showDashboard(savedUser)
    }
}


loginBtn.onclick = function() {
    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()
    if (!username || !password) return alert('Please fill in both fields.')
    localStorage.setItem('user', username)
    document.getElementById('welcomeMsg').textContent = 'Hi, ' + username
    loginScreen.style.display = 'none'
    dashboard.style.display = 'block'
    renderAll()
}

logoutBtn.onclick = function() {
    dashboard.style.display = 'none'
    loginScreen.style.display = 'flex'
}

document.getElementById('addAccountButton').onclick = function() {
    const name = prompt('Account name (e.g. Checking):')
    if (!name) return
    const amount = parseFloat(prompt('Current balance:'))
    if (isNaN(amount)) return
    accounts.push({ name, amount})
    renderAll()
}

document.getElementById('addTxBtn').onclick = function () {
    const desc = prompt('Description (e.g. Groceries):')
    if (!desc) return
    const amount = parseFloat(prompt('Amount (negative for expense, e.g. -54.30):'))
    if (isNaN(amount)) return
    const date = new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric' })
    transactions.unshift({ desc, amount, date })
    renderAll()
}

function renderAll() {
    const accountList = document.getElementById('accountList')
    const txList = document.getElementById('txList')
    const netWorth = document.getElementById('netWorth')

    const total = accounts.reduce((sum, a) => sum + a.amount, 0)
    netWorth.textContent = '$' + total.toFixed(2)

    accountList.innerHTML = accounts.map(a =>
        `<div class="account-row"
            <span>${a.name}</span>
            <span class="${a.amount >= 0 ? 'pos' : 'neg'}">
                ${a.amount >= 0 ? '+' : ''}$${a.amount.toFixed(2)}
            </span>
        </div>`
    ).join('')

    txList.innerHTML = transactions.length === 0
    ? '<p style="color:#555;font-size:13px;">No transactions yet.</p>'
    : transactions.map(t =>
        `<div class="tx-row">
            <div>
                <div>${t.desc}</div>
                <div class="tx-meta">${t.date}</div>
            </div>
            <span class="${t.amount >= 0 ? 'pos' : 'neg'}">
                ${t.amount >= 0 ? '+' : ''}$${t.amount.toFixed(2)}
            </span>
        </div>`
    ).join('')
}


