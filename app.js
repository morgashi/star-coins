const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')

const loginScreen = document.getElementById('loginScreen')
const dashboard = document.getElementById('dashboard')

loginBtn.onclick = function() {
    loginScreen.style.display = "none"
    dashboard.style.display = 'block'
}

logoutBtn.onclick = function() {
    dashboard.style.display = "none"
    loginScreen.style.display = 'block'
}

localStorage.setItem("user", username)