const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const usernameInput = document.getElementById("username")
const welcomeText = document.getElementById("welcomeText")

const loginScreen = document.getElementById('loginScreen')
const dashboard = document.getElementById('dashboard')

// 🔁 Check login on page load
window.onload = function() {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
        showDashboard(savedUser)
    }
}

// 🔐 Login
loginBtn.onclick = function() {
    const username = usernameInput.value

    if (username === "") {
        alert("Enter a username")
        return
    }

    localStorage.setItem("user", username)
    showDashboard(username)
}

// 🚪 Logout
logoutBtn.onclick = function() {
    alert("clicked")
    localStorage.removeItem("user")
    showLogin()
}
}

// 📺 Show dashboard
function showDashboard(user) {
    loginScreen.style.display = "none"
    dashboard.style.display = "block"
    welcomeText.innerText = "Welcome, " + user
}

// 🔙 Show login
function showLogin() {
    dashboard.style.display = "none"
    loginScreen.style.display = "block"
}
