// Function to handle the response from Google Sign-In
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    
    // Decode the JWT token to get user information
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    // Update UI to show "Logging in" message
    updateUIAfterSignIn(payload.name + ": Logging in...");
    
    // Send the token to Apps Script for server-side validation
    sendTokenToAppsScript(response.credential, 'login');
}

// Function to send the token to Google Apps Script
function sendTokenToAppsScript(token, action) {
    var script = document.createElement('script');
    script.src = `https://script.google.com/macros/s/AKfycbzTh8e0tcyRVAEHj_g3bghsehc2E1q1X0Oa8JzKf48t-dAoBjO6p8vo5p_7kwkIJmhg/exec?callback=handleResponse&token=${encodeURIComponent(token)}&action=${action}`;
    document.body.appendChild(script);
}

// Callback function to handle the response from Apps Script
function handleResponse(data) {
    console.log('Response from Apps Script:', data);
    
    if (data.action === 'login') {
        // Update the user info with the confirmed username from Apps Script
        updateUIAfterSignIn(data.username);
    } else if (data.action === 'logout') {
        // Update the message to show "Logged Out"
        document.getElementById('message').textContent = data.message;
        
        // Reset the UI to the signed-out state
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('login-button').style.display = 'inline-block';
        document.getElementById('logout-button').style.display = 'none';
    }
}


// Function to update the UI after sign-in attempt
function updateUIAfterSignIn(message) {
    document.getElementById('user-info').textContent = message;
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('login-button').style.display = 'none';
    document.getElementById('logout-button').style.display = 'inline-block';
    document.getElementById('message').textContent = '';
}

// Function to handle the sign-in button click
function handleSignIn() {
    document.querySelector('.g_id_signin div[role=button]').click();
}

// Function to handle the sign-out process
function handleSignOut() {
    google.accounts.id.disableAutoSelect();
    
    // Show "Logging Out..." message
    document.getElementById('message').textContent = 'Logging Out...';
    
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
