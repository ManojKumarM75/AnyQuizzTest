// login.js

// Function to handle the response from Google Sign-In
function handleCredentialResponse(response) {
    // Log the encoded JWT ID token
    console.log("Encoded JWT ID token: " + response.credential);
    
    // Send the token to Apps Script for server-side validation
    sendTokenToAppsScript(response.credential, 'login');
    
    // Update the UI to reflect the signed-in state
    updateUIAfterSignIn(response.credential);
}

// Function to send the token to Google Apps Script
function sendTokenToAppsScript(token, action) {
    // Create a new script element
    var script = document.createElement('script');
    
    // Set the src of the script to call the Apps Script web app
    // Include the token and action as URL parameters
    script.src = `https://script.google.com/macros/s/AKfycbz5LKXzUYGqnBWthl9VdVyZEmwZ5mugenRFOV-VE8DIvtR-DC4U0acnqW0fh0taKshz/exec?callback=handleResponse&token=${encodeURIComponent(token)}&action=${action}`;
    
    // Append the script to the body to execute it
    document.body.appendChild(script);
}

// Callback function to handle the response from Apps Script
function handleResponse(data) {
    // Log the response from Apps Script
    console.log('Response from Apps Script:', data);
    
    // Update the message div with the response message
    document.getElementById('message').textContent = data.message;
}

// Function to update the UI after successful sign-in
function updateUIAfterSignIn(token) {
    // Decode the JWT token to get user information
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Update the user info display
    document.getElementById('user-info').textContent = payload.name;
    document.getElementById('user-info').style.display = 'block';
    
    // Hide the login button and show the logout button
    document.getElementById('login-button').style.display = 'none';
    document.getElementById('logout-button').style.display = 'inline-block';
}

// Function to handle the sign-in button click
function handleSignIn() {
    // Programmatically click the hidden Google Sign-In button
    document.querySelector('.g_id_signin div[role=button]').click();
}

// Function to handle the sign-out process
function handleSignOut() {
    // Disable auto-select for Google Sign-In
    google.accounts.id.disableAutoSelect();
    
    // Send a logout request to Apps Script
    sendTokenToAppsScript('', 'logout');
    
    // Reset the UI to the signed-out state
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('login-button').style.display = 'inline-block';
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('message').textContent = '';
}

// Initialize Google Sign-In when the page loads
window.onload = function() {
    google.accounts.id.initialize({
        client_id: "44063799736-jl9n0up9qa94t8imacu9r0g4djf81ej1.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
};
