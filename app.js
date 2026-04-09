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
        if (link.dataset.page === 'projectionPage') renderGoals()
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
        transactions[index] = { desc, amount, date, rawDate, icon, category, id: editingId }
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

    const regularAccounts = accounts.filter(a => a.subtype !== 'credit card && a.type !== credit')
    const creditAccounts = accounts.filter(a => a.subtype === 'credit card || a.type === credit')

    function accountRowHTML(a) {
        const iconHTML = a.icon
            ? `<img src = "${a.icon}" style="width:36px;height:36px;border-radius:10px;object-fit:cover;">`
            : `<div style = "width:36px;height:36px;border-radius:10px;background:#e8e8e8;display:flex;align-items:center;justify-content:center;font-size:14px;color:#888;">?</div>`
        return `<div class="account-row" onclick="openAccountModal(${a.id})" style="cursor:pointer;">
            <div style="display:flex;align-items:center;gap:10px;">
                ${iconHTML}
                <span>${a.name}</span>
            </div>
            <span class="${a.amount >= 0 ? 'pos' : 'neg'}">
                ${a.amount >= 0 ? '+$' : '-$'}${Math.abs(a.amount).toFixed(2)}
            </span>
        </div>`
    }

    let html = ''
    if(regularAccounts.length > 0) {
        html += `<div class="account-group-label">Accounts</div>`
        html += regularAccounts.map(accountRowHTML).join('')
    }
    if (creditAccounts.length > 0) {
        html += `<div class="account-group-label">Credit Cards</div>`
        html += creditAccounts.map(accountRowHTML).join('')
    }

    document.getElementById('accountList').innerHTML = html
        
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
    { name: 'Fun', color: '#d4f0e0', items: ['Dining Out', 'Entertainment', 'Shopping']},
    { name: 'Savings', color: '#f0f0d4', items: ['Emergency Fund', 'Travel Fund', 'Investments']}
]

let budgetData = JSON.parse(localStorage.getItem('budgetData')) || {}
let budgetIncome = JSON.parse(localStorage.getItem('budgetIncome')) || {}
let breakdownMode = 'expected'
let overviewMode = 'expected'

function saveBudget() {
    localStorage.setItem('budgetData', JSON.stringify(budgetData)) 
    localStorage.setItem('budgetIncome', JSON.stringify(budgetIncome))
}

function getMonthKey(monthStr) {
    return monthStr
}

function populateMonthSelect() {
    const select = document.getElementById('budgetMonthSelect')
    select.innerHTML = ''
    const now = new Date()
    
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        
        const opt = document.createElement('option')
            opt.value = label
            opt.textContent = label

            if (i === 0) opt.selected = true
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
            <span class="budget-category-pill" style="background:${cat.color}22;color:${cat.color}">${cat.name}</span>
        </div>`

        cat.items.forEach(item => {
            const expected = budgetData[month][cat.name][item] || 0
            const current = spending[item] || 0
            const pct = expected !==0 ? Math.abs((current / expected) * 100).toFixed(2) + '%' : '0%'
            html += `<div class="budget-row">
                <span class="budget-row-name">${item}</span>
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


let donutExpectedChart = null
let donutActualChart = null
let moneyInOutExpectedChart = null
let moneyInOutActualChart = null
let weeklySpendingChart = null

function renderOverview(month, spending) {
    const income = budgetIncome[month] || 0

    document.getElementById('budgetIncomeInput').value = income !==0 ? income : ''

    document.getElementById('budgetIncomeInput').onchange = function() {
        budgetIncome[month] = parseFloat(this.value) || 0
        saveBudget()
        renderBudget()
    }

    const catColors = ['#b8b4f0', '#f0d48c', '#f0b4c8', '#f0c8a0']
    const catLabels = BUDGET_CATEGORIES.map(c => c.name)

    const expectedTotals = []
    const actualTotals = []

    BUDGET_CATEGORIES.forEach(cat => {
        let exp = 0
        let cur = 0

        if(budgetData[month] && budgetData[month][cat.name]) {
            Object.values(budgetData[month][cat.name]).forEach(v => exp += Math.abs(v))
        }

        cat.items.forEach(item => {
            cur += Math.abs(spending[item] || 0)
        })

        expectedTotals.push(exp)
        actualTotals.push(cur)
    })

    if(donutExpectedChart) donutExpectedChart.destroy()
    if(donutActualChart) donutActualChart.destroy()
    
    donutExpectedChart = new Chart(document.getElementById('donutExpected'), {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                data: expectedTotals,
                backgroundColor: catColors,
                borderWidth: 0
            }]
        },
        options: {
            cutout: '65%',
            plugins: { legend: {display: false }},
            responsive: false
        }
    })
    //--- DONUT CHARTS ---
    donutActualChart = new Chart(document.getElementById('donutActual'), {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                data: actualTotals,
                backgroundColor: catColors,
                borderWidth: 0
            }]
        },
        options: {
            cutout: '65%',
            plugins: { legend: { display:false }},
            responsive: false
        }
    })


    // Legend
    document.getElementById('donutLegend').innerHTML = catLabels.map((label, i) => {
        const expPct = expectedTotals.reduce((a,b)=>a+b,0) > 0
            ? ((expectedTotals[i] / expectedTotals.reduce((a,b)=>a+b,0)) * 100).toFixed(1)
            : '0.0'
        return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;">
            <div style="display:flex;align-items:center;gap:6px;">
                <div style="width:10px;height:10px;border-radius:50%;background:${catColors[i]};"></div>
                <span style="color:#555;">${label}</span>
            </div>
            <span style="color:#888;">${expPct}%</span>
        </div>`
    }).join('')

    // --- MONEY IN / OUT ---
    const totalExpectedSpend = expectedTotals.reduce((a,b)=>a+b,0)
    const totalActualSpend = actualTotals.reduce((a,b)=>a+b,0)

    if (moneyInOutExpectedChart) moneyInOutExpectedChart.destroy()
    if (moneyInOutActualChart) moneyInOutActualChart.destroy()
 
    moneyInOutExpectedChart = new Chart(document.getElementById('moneyInOutExpected'), {
        type: 'bar',
        data: {
            labels: ['IN', 'OUT'],
            datasets: [{data: [income, totalExpectedSpend] }]
        }
    })

    moneyInOutActualChart = new Chart(document.getElementById('moneyInOutActual'), {
        type: 'bar',
        data: {
            labels: ['IN', 'OUT'],
            datasets: [{ data: [income, totalActualSpend] }]
        }
    })

    // --- WEEKLY SPENDING ---
    const now = new Date()
    const year = now.getFullYear()
    const monthIndex = now.getMonth()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    // Build weeks
    const weeks = []
    let weekStart = 1
    
    while (weekStart <= daysInMonth) {
        const weekEnd = Math.min(weekStart + 6, daysInMonth)
        const monthName = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        weeks.push({
            label: `${monthName} ${weekStart}-${weekEnd}`,
            start: weekStart,
            end: weekEnd,
            total: 0
        })
        weekStart += 7
    }

    // Sum spending per week from transactions
    transactions.forEach(t => {
        if (!t.rawDate) return
        const d = new Date(t.rawDate)
        const tLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        if (tLabel !== month) return
        if (t.amount >= 0) return // skip income
        const day = d.getDate()
        const week = weeks.find(w => day >= w.start && day <= w.end)
        if (week) week.total += Math.abs(t.amount)
    })

    const weeklyTotals = weeks.map(w => w.total)
    const monthToDate = weeklyTotals.reduce((a,b)=>a+b,0)
    const weeksWithSpending = weeks.filter(w => w.total > 0).length || 1
    const avgPerWeek = monthToDate / weeksWithSpending

    if (weeklySpendingChart) weeklySpendingChart.destroy()
    weeklySpendingChart = new Chart(document.getElementById('weeklySpending'), {
        type: 'bar',
        data: {
            labels: weeks.map(w => w.label),
            datasets: [{
                data: weeklyTotals,
                backgroundColor: '#f0b4c8',

            }]
        }
    })

    document.getElementById('weeklySpendingStats').textContent =
        `Month to date: $${monthToDate.toFixed(2)} · Avg/week: $${avgPerWeek.toFixed(2)}`
}
    
  


populateMonthSelect()
renderBudget()
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
document.getElementById('overviewExpectedBtn').onclick = function() {
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


// --- PLAID ---
const SERVER_URL = 'https://star-coins-server-production.up.railway.app'

async function connectBank() {
    try {
        const res = await fetch(`${SERVER_URL}/create-link-token`, { method: 'POST' })
        const data = await res.json()
        const linkToken = data.link_token

        const handler = Plaid.create({
            token: linkToken,
            onSuccess: async function(public_token) {
                const exchangeRes = await fetch(`${SERVER_URL}/exchange-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ public_token })
                })
                const exchangeData = await exchangeRes.json()
                const access_token = exchangeData.access_token
                localStorage.setItem('plaid_access_token', access_token)
                await fetchBankAccounts(access_token)
            },
            onExit: function(err) {
                if (err) console.error('Plaid exit error:', err)
            }
        })
        handler.open()
    } catch (err) {
        console.error('Error connecting bank:', err)
        alert('Error connecting bank. Please try again.')
    }
}

async function fetchBankAccounts(access_token) {
    try {
        const balanceRes = await fetch(`${SERVER_URL}/balances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token })
        })
        const balanceData = await balanceRes.json()

        balanceData.accounts.forEach(acc => {
            const exists = accounts.find(a => a.plaidId === acc.account_id)
            if (exists) {
                exists.amount = acc.balances.current
                exists.available = acc.balances.available
                exists.type = acc.type
                exists.subtype = acc.subtype
            } else {
                accounts.push({
                    name: acc.name,
                    amount: acc.balances.current,
                    available: acc.balances.available,
                    type: acc.type,
                    subtype: acc.subtype,
                    interestRate: null,
                    plaidId: acc.account_id,
                    id: Date.now() + Math.random()
                })
            }
        })

        save()
        renderAll()
        alert('Bank accounts synced!')
    } catch (err) {
        console.error('Error fetching accounts:', err)
        alert('Error fetching account data. Please try again.')
    }
}

const savedPlaidToken = localStorage.getItem('plaid_access_token')
if (savedPlaidToken) fetchBankAccounts(savedPlaidToken)

 // --- ACCOUNT DETAIL MODAL ---
let viewingAccountId = null

function openAccountModal(id) {
    const a = accounts.find(a => a.id === id)
    if (!a) return
    viewingAccountId = id
    document.getElementById('accountModalName').value = a.name
    document.getElementById('accountModalBalance').textContent = '$' + Math.abs(a.amount).toFixed(2)
    document.getElementById('accountModalType').textContent = a.subtype ? `${a.subtype} (${a.type})` : a.type || 'Manual'
    document.getElementById('accountModalInterest').value = a.interestRate || ''
    const preview = document.getElementById('accountIconPreview')
    if (a.icon) {
        preview.src = a.icon
        preview.style.display = 'block'
    } else {
        preview.style.display = 'none'
        preview.src = ''
    }
    document.getElementById('accountModal').style.display = 'flex'
}

document.getElementById('accountModalCancelBtn').onclick = function() {
    document.getElementById('accountModal').style.display = 'none'
    viewingAccountId = null
}

document.getElementById('accountModalSaveBtn').onclick = function() {
    const index = accounts.findIndex(a => a.id === viewingAccountId)
    if (index === -1) return
    accounts[index].interestRate = parseFloat(document.getElementById('accountModalInterest').value) || null
    const preview = document.getElementById('accountIconPreview')
    if (preview.style.display !== 'none') {
        accounts[index].icon = preview.src
    }
    save()
    document.getElementById('accountModal').style.display = 'none'
    renderAll()
}

document.getElementById('accountIconUpload').onchange = function() {
    const file = this.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function(e) {
        const preview = document.getElementById('accountIconPreview')
        preview.src = e.target.result
        preview.style.display = 'block'
    }
    reader.readAsDataURL(file)
}
window.openAccountModal = openAccountModal
document.getElementById('connectBankBtn').onclick = connectBank
    

})
