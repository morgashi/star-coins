document.addEventListener('DOMContentLoaded', function() {

const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const loginScreen = document.getElementById('loginScreen')
const dashboard = document.getElementById('dashboard')

let accounts = JSON.parse(localStorage.getItem('accounts')) || []
let transactions = JSON.parse(localStorage.getItem('transactions')) || []
let editingId = null

function save() {
    localStorage.setItem('accounts', JSON.stringify(accounts))
    localStorage.setItem('transactions', JSON.stringify(transactions))
}

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
        if (link.dataset.page === 'budgetPage') renderBudget()
    }
})

// --- ACCOUNTS ---
document.getElementById('addAccountBtn').onclick = function() {
    const name = prompt('Account name (e.g. Checking):')
    if (!name) return
    const amount = parseFloat(prompt('Current balance:'))
    if (isNaN(amount)) return
    accounts.push({ name, amount })
    save()
    renderAll()
}

// --- MODAL ---
function openModal() {
    editingId = null
    document.getElementById('txDesc').value = ''
    document.getElementById('txAmount').value = ''
    document.getElementById('txDate').value = ''
    document.getElementById('txMerchant').value = ''
    document.getElementById('txCategory').value = ''
    document.getElementById('txIconPreview').style.display = 'none'
    document.getElementById('txIconPreview').src = ''
    document.getElementById('txIconUpload').value = ''
    document.getElementById('txModal').style.display = 'flex'
    document.getElementById('txDeleteBtn').style.display = 'none'
}

document.getElementById('addTxBtn').onclick = openModal
document.getElementById('addTxBtn2').onclick = openModal




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
    const category = document.getElementById('txCategory').value.trim()

    if (!desc) return alert('Please enter a description.')
    if (isNaN(amount)) return alert('Please enter a valid amount.')
    if (!rawDate) return alert('Please select a date.')

    const date = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    if(editingId !== null) {
        const index = transactions.findIndex(t => t.id === editingId)
        transactions[index] = { desc, amount, date, rawDate, icon, id: editingId }
        editingId = null
    } else {
        transactions.unshift({ desc, amount, date, rawDate, icon, id: Date.now() })
    }

    save()
    document.getElementById('txModal').style.display = 'none'
    renderAll()
}
    document.getElementById('txDeleteBtn').onclick = function() {
    transactions = transactions.filter(t => t.id !== editingId)
    editingId = null
    save()
    document.getElementById('txModal').style.display = 'none'
    renderAll()
}
    document.getElementById('txCancelBtn').onclick = function() {
        document.getElementById('txModal').style.display = 'none'
        editingId = null
}


// --- FILTERS ---
document.getElementById('txSearch').oninput = renderTxFullList
document.getElementById('txFilterFrom').onchange = renderTxFullList
document.getElementById('txFilterTo').onchange = renderTxFullList

// --- RENDER ---
function renderAll() {
    renderAccounts()
    renderTxList()
    renderTxFullList()
}

function renderAccounts() {
    const total = accounts.reduce((sum, a) => sum + a.amount, 0)
    document.getElementById('netWorth').textContent = '$' + total.toFixed(2)
    document.getElementById('accountList').innerHTML = accounts.map(a =>
        `<div class="account-row">
            <span>${a.name}</span>
            <span class="${a.amount >= 0 ? 'pos' : 'neg'}">
                ${a.amount >= 0 ? '+' : ''}${Math.abs(a.amount).toFixed(2)}
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
        return true
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
    if (viewMode === 'table') {
        document.getElementById('txFullList').innerHTML =
            `<table class="tx-table">
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(t => `
                    <tr>
                        <td>${t.icon ? `<img class="tx-card-icon" src="${t.icon}">` : '💳'}</td>
                        <td>${t.desc}</td>
                        <td>${t.date}</td>
                        <td class="${t.amount >= 0 ? 'pos' : 'neg'}">
                            ${t.amount >= 0 ? '+$' : '-$'}${Math.abs(t.amount).toFixed(2)}
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>`
    } else {
        document.getElementById('txFullList').innerHTML = Object.entries(groups).map(([date, txs]) =>
            `<div class="tx-date-group">
                <p class="tx-date-label">${date}</p>
                ${txs.map(t => txCardHTML(t)).join('')}
            </div>`
        ).join('')
}
    
}

function txCardHTML(t) {
    const iconHTML = t.icon
        ? `<img class="tx-card-icon" src="${t.icon}">`
        : `<div class="tx-card-icon-placeholder">💳</div>`
    return `<div class="tx-card" onclick="editTransaction(${t.id})" style="cursor:pointer;">
        <div class="tx-card-left">
            ${iconHTML}
            <div>
                <div class="tx-card-name">${t.desc}</div>
                <div class="tx-card-desc">${t.date}</div>
            </div>
        </div>
        <span class="${t.amount >= 0 ? 'pos' : 'neg'} tx-card-amount">
            ${t.amount >= 0 ? '+$' : '-$'}${Math.abs(t.amount).toFixed(2)}
        </span>
    </div>`
}

function editTransaction(id) {
    const t = transactions.find(t => t.id === id)
    if (!t) return
    editingId = id
    document.getElementById('txDesc').value = t.desc
    document.getElementById('txAmount').value = t.amount
    document.getElementById('txDate').value = t.rawDate
    const preview = document.getElementById('txIconPreview')
    if (t.icon) {
        preview.src = t.icon
        preview.style.display = 'block'
    } else {
        preview.style.display = 'none'
        preview.src = ''
    }
    document.getElementById('txModal').style.display = 'flex'
    document.getElementById('txDeleteBtn').style.display = 'block'
}

// --- TOGGLE VIEW (table vs list) ---
let viewMode = 'list'
document.getElementById('toggleViewBtn').onclick = function() {
    viewMode = viewMode === 'list' ? 'table' : 'list'
    this.textContent = viewMode === 'list' ? 'Table view' : 'List view'
    renderTxFullList()
}
window.editTransaction = editTransaction

// --- BUDGET ---
const BUDGET_CATEGORIES = [
    { name: 'Housing + Utilities', color: '#b8d4f0', items: ['Rent + Fees', 'Utilities', 'Internet Bill', 'Renter\'s Insurance']},
    { name: 'Necessities', color: '#f0d4f0', items: ['Groceries', 'Personal Care', 'Healthcare', 'Gas']},
    { name: 'Fun', color: 'd4f0e0', items: ['Dining Out', 'Entertainment', 'Shopping']},
    { name: 'Savings', color: '#f0f0d4', items: ['Emergency Fund', 'Travel Fund', 'Investments']}
]

let budgetData = JSON.parse(localStorage.getItem('budgetData')) || {}
let budgetIncome = JSON.parse(localStorage.getItem('budgetIncome')) || {}
let breakdownMode = 'expected'
let overviewMode = 'expected'

function saveBudget() {
    localStorage.setItem('budgetData', JSON.stringify('budgetData')) || {}
    localStorage.setItem('budgetIncome', JSON.stringify(budgetIncome))
}

function getMonthKey(monthStr) {
    return monthStr
}

function populateMonthSelect() {
    const select = document.getElementById('budgetMonthSelect')
    select.innerHTML = ''
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        const opt = document.createElement('option')
            opt.value = label
            opt.textContent = label
            select.appendChild(opt)      
    }
}

function getSelectedMonth() {
    return document.getElementById('budgetMonthSelect').value
}

function getCurrentSpendingForMonth(monthStr) {
    const spending = {}
    transactions.forEach(t => {
        if (!t.rawDate) return
        const d = new Date(t.rawDate)
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric'})
        if (label !== monthStr) return
        const cat = t.category || 'Uncategorized'
        spending[cat] = (spending[cat] || 0) + t.amount
    })
    return spending
}

function renderBudget() {
    const month = getSelectedMonth()
    if (!month) return
    if (!budgetData[month]) budgetData[month] = {}
    const spending = getCurrentSpendingForMonth(month)
    renderCategoryBreakdown(month, spending)
    renderOverview(month, spending)
}

function renderCategoryBreakdown(month, spending) {
    const container = document.getElementById('categoryBreakdown')
    let html = ''

    BUDGET_CATEGORIES.forEach(cat => {
        if (!budgetData[month][cat.name]) budgetData[month][cat.name] = {}
        html += `<div class="budget-category-header">
            <span class="budget-category-pill style="background:${cat.color}22;color:${cat.color}">${cat.name}</span>
        </div>`

        cat.items.forEach(item => {
            const expected = budgetData[month][cat.name][item] || 0
            const current = spending[item] || 0
            const pct = expected !==0 ? Math.abs((current / expected) * 100).toFixed(2) + '%' : '0%'
            html += `<div class="budget-row">
                <span class="budget-row-name">${item}</span
                <input type="number" class="budget-expected-input"
                    data-month="${month}" data-cat="${cat.name}" data-item="${item}"
                    value="${expected !== 0 ? expected : ''}" placeholder="$0">
                <span class="budget-row-current">${current !== 0 ? (current > 0 ? '+$' : '-$') + Math.abs(current).toFixed(2) : '$0'}</span>
                <span class="budget-row-pct">${pct}</span>
            </div>`
        })
    })

    container.innerHTML = html

    container.querySelectorAll('.budget-expected-input').forEach(input => {
        input.onchange = function() {
            const m = this.dataset.month
            const c = this.dataset.cat
            const i = this.dataset.item
            if (!budgetData[m][c]) budgetData[m][c] = {}
            budgetData[m][c][i] = parseFloat(this.value) || 0
            saveBudget()
            renderBudget()
        }
    })
}

function renderOverview(month, spending) {
    const container = document.getElementById('budgetOverview')
    const income = budgetIncome[month] || 0

    let totalExpectedSpend = 0
    let totalCurrentSpend = 0
    const catTotals = {}

    BUDGET_CATEGORIES.forEach(cat => {
        let expCat = 0
        let curCat = 0
        if (budgetData[month][cat.name]) {
            Object.values(budgetData[month][cat.name]).forEach(v => expCat += v)
        }
        cat.items.forEach(item => { curCat += spending[item] || 0})
        totalExpectedSpend += expCat
        totalCurrentSpend += curCat
        catTotals[cat.name] = { expected: expCat, current: curCat }
    })

    const expectedNet = income + totalExpectedSpend
    const currentNet = income + totalCurrentSpend

    let html = `
        <div class="budget-income-row">
            <span style="font-size:13px;color:#ccc;>Income</span>
            <input type="number" id="budgetIncomeInput" placeholder="$0"
                value="${income !== 0 ? income : ''}"
                style="background:transparent;border:none;border-bottom:1px solid #333;color:white;font-size:13px;width:100px;outline:none;text-align:right;">
            </div>
            <div class="overiew-row bold">
                <span class="overview-row-label">Total Usage</span>
                <span class="overview-row-val neg">-$${Math.abs(totalExpectedSpend).toFixed(2)}</span>
                <span class="overview-row-val neg">-$${Math.abs(totalCurrentSpend).toFixed(2)}</span>
            </div>
            <div class="overview-row bold">
                <span class="overview-row-label">Total Net</span>
                <span class="overview-row-val ${expectedNet >= 0 ? 'pos' : 'neg'}">${expectedNet >= 0 ? '+$' : '-$'}${Math.abs(expectedNet).toFixed(2)}</span>
                <span class="overview-row-val ${currentNet >= 0 ? 'pos' : 'neg'}">${currentNet >= 0 ? '+$' : '-$'}${Math.abs(currentNet).toFixed(2)}</span>
            </div>`

        BUDGET_CATEGORIES.forEach(cat => {
            const e = catTotals[cat.name].expected
            const c = catTotals[cat.name].current
            html += `<div class="overview-row>
                <span class="overview-row-label>${cat.name}</span>
                <span class="overview-row-val neg">-$${Math.abs(e).toFixed(2)}</span>
                <span class="overview-row-val neg">-$${Math.abs(c).toFixed(2)}</span>
            </div>`
        })

        container.innerHTML = html

        document.getElementById('budgetIncomeInput').onchage = function() {
            budgetIncome[month] = parseFloat(this.value) || 0
            saveBudget()
            renderBudget()
        }
}

populateMonthSelect()
document.getElementById('budgetMonthSelect').onchange = renderBudget

document.getElementById('breakdownExpectedBtn').onclick = function() {
    breakdownMode = 'expected'
    this.classList.add('active')
    document.getElementById('breakdownCurrentBtn').classList.remove('active')
    renderBudget()
}
document.getElementById('breakdownCurrentBtn').onclick = function() {
    breakdownMode = 'current'
    this.classList.add('active')
    document.getElementById('breakdownExpectedBtn').classList.remove('active')
    renderBudget()
}
document.getElementById('overviewExpectedbtn').onclick = function() {
    overviewMode = 'expected'
    this.classList.add('active')
    document.getElementById('overviewCurrentBtn').classList.remove('active')
    renderBudget()
}
document.getElementById('overviewCurrentBtn').onclick = function() {
    overviewMode = 'current'
    this.classList.add('active')
    document.getElementById('overviewExpectedBtn').classList.remove('active')
    renderBudget()
}

})
