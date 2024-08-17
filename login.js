// Function to handle the response from Google Sign-In
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    
    // Update UI to show "Logging in" message
    updateUIMessage("Logging in...");
    
    // Send the token to Apps Script for server-side validation
    sendTokenToAppsScript(response.credential, 'login');
}

// Function to send the token to Google Apps Script
function sendTokenToAppsScript(token, action) {
    var script = document.createElement('script');
    script.src = `https://script.google.com/macros/s/AKfycbyNWApSCRW-EFJ7SNyU3_YzM4obGzRJkbzkvpG-pItc0oPvl8GEzEpm9SIcIErcI1dM/exec?callback=handleResponse&token=${encodeURIComponent(token)}&action=${action}`;
    document.body.appendChild(script);
}

// Callback function to handle the response from Apps Script
function handleResponse(data) {
    console.log('Response from Apps Script:', data);
    
    if (data.action === 'login') {
        if (data.error) {
            // Handle login error
            updateUIMessage('Login failed: ' + data.error);
            resetUI();
        } else {
            // Update the user info with the confirmed username from Apps Script
            updateUIMessage(data.username);
            document.getElementById('logout-button').style.display = 'inline-block';
        }
    } else if (data.action === 'logout') {
        // Update the message to show "Logged Out"
        updateUIMessage(data.message);
        resetUI();
    }
}

// Function to update the UI message
function updateUIMessage(message) {
    document.getElementById('user-info').textContent = message;
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('login-button').style.display = 'none';
}

// Function to reset the UI to the initial state
function resetUI() {
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('login-button').style.display = 'inline-block';
    document.getElementById('logout-button').style.display = 'none';
}

// Function to handle the sign-in button click
function handleSignIn() {
    document.querySelector('.g_id_signin div[role=button]').click();
}

// Function to handle the sign-out process
function handleSignOut() {
    google.accounts.id.disableAutoSelect();
    
    // Show "Logging Out..." message
    updateUIMessage('Logging Out...');
    
    // Send a logout request to Apps Script
    sendTokenToAppsScript('', 'logout');
}

// Initialize Google Sign-In when the page loads
window.onload = function() {
    google.accounts.id.initialize({
        client_id: "44063799736-jl9n0up9qa94t8imacu9r0g4djf81ej1.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
};
