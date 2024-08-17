function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    updateUIMessage("Logging in...");
    sendTokenToAppsScript(response.credential, 'login');
}

function sendTokenToAppsScript(token, action) {
    var script = document.createElement('script');
    script.src = `https://script.google.com/macros/s/AKfycbyNWApSCRW-EFJ7SNyU3_YzM4obGzRJkbzkvpG-pItc0oPvl8GEzEpm9SIcIErcI1dM/exec?callback=handleResponse&token=${encodeURIComponent(token)}&action=${action}`;
    document.body.appendChild(script);
}

function handleResponse(data) {
    console.log('Response from Apps Script:', data);
    
    if (data.action === 'login') {
        if (data.error) {
            updateUIMessage('Login failed: ' + data.error);
            resetUI();
        } else {
            updateUIMessage('Logged in as: ' + data.email);
            document.getElementById('logout-button').style.display = 'inline-block';
        }
    } else if (data.action === 'logout') {
        updateUIMessage(data.message);
        setTimeout(resetUI, 2000);  // Reset UI after 2 seconds
    }
}

function updateUIMessage(message) {
    document.getElementById('user-info').textContent = message;
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('login-button').style.display = 'none';
}

function resetUI() {
    document.getElementById('user-info').textContent = '';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('login-button').style.display = 'inline-block';
    document.getElementById('logout-button').style.display = 'none';
}

function handleSignIn() {
    document.querySelector('.g_id_signin div[role=button]').click();
}

function handleSignOut() {
    google.accounts.id.disableAutoSelect();
    updateUIMessage('Logging Out...');
    sendTokenToAppsScript('', 'logout');
}

window.onload = function() {
    google.accounts.id.initialize({
        client_id: "44063799736-jl9n0up9qa94t8imacu9r0g4djf81ej1.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
};
