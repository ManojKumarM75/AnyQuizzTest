function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    updateButtonText("Logging in...");
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
            updateButtonText('Sign In');
            updateUIMessage('Login failed: ' + data.error);
        } else {
            updateUIMessage(data.email);
            updateButtonText('Sign Out');
            document.getElementById('login-button').onclick = handleSignOut;
        }
    } else if (data.action === 'logout') {
        updateButtonText(data.message);
        setTimeout(() => {
            updateUIMessage('');
            updateButtonText('Sign In');
            document.getElementById('login-button').onclick = handleSignIn;
        }, 2000);
    }
}

function updateUIMessage(message) {
    document.getElementById('user-info').textContent = message;
}

function updateButtonText(text) {
    document.getElementById('login-button').textContent = text;
}

function handleSignIn() {
    document.querySelector('.g_id_signin div[role=button]').click();
}

function handleSignOut() {
    google.accounts.id.disableAutoSelect();
    updateButtonText('Logging Out...');
    sendTokenToAppsScript('', 'logout');
}

window.onload = function() {
    google.accounts.id.initialize({
        client_id: "44063799736-jl9n0up9qa94t8imacu9r0g4djf81ej1.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
};
