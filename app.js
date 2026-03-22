const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const usernameInput = document.getElementById("username")
const welcomeText = document.getElementById("welcomeText")

const loginScreen = document.getElementById('loginScreen')
const dashboard = document.getElementById('dashboard')

window.onload = function() {
    const savedUser = this.localStorage.getItem("user")
    if(savedUser) {
        showDasboard(savedUser)
    }
}


loginBtn.onclick = function() {
    const username = usernameInput.value

    if (username === "") {
        alert("Enter a username")
        return
    }

    localStorage.setItem("user", username)
    showDasboard(username)
}

function showDasboard(user) {
    loginScreen.style.display = "none"
    dashboard.style.display = "block"
    welcomeText.innerText = "Welcome, " + user
}

function showLogin() {
    dashboard.style.display = "none"
    loginScreen.style.display = "block"
}
