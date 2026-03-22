<!DOCTYPE html>
<html>
<head>
    <title>Star Coins</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div id="app">
        <!-- LOGIN SCREEN -->
        <div id="loginScreen">
            <h1>Star Coins</h1>
            <input id="username" placeholder="Username">
            <input id="password" type="password" placeholder="Password">
            <button id="loginBtn">Login</button>
        </div>
        <!-- HOMEPAGE-->
         <div id="dashboard" style="display:none;">
            <nav id="navbar">
                <span class="nav-brand">★ Star Coins</span>
                <div class="nav-links">
                    <span>Dashboard</span>
                </div>
                <div class="nav-right">
                    <span id="welcomMsg"></span>
                    <button id="logoutBtn">Logout</button>
                </div>
            </nav>
            
            <div class="main-grid">

                <div class="panel" id="accountsPanel">
                    <p class="panel-title">Accounts</p>
                    <div class="net-worth-card">
                        <p class="nw-label">Net worth</p>
                        <p class="nw-amount" id="netWorth">$0.00</p>
                    </div>
                    <div id="accountList"></div>
                    <button id="addAccountBtn">+ Add account</button>
                </div>

                <div class="panel" id="txPanel">
                    <p class="panel-title">Transactions</p>
                    <button id="addTxBtn">+ Add Transaction</button>
                    <div id="txList"></div>
                </div>
            </div>
         </div>

    </div>

    <script src="app.js"></script>
</body>

</html>
