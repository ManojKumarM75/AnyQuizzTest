20240816 3.	Hello World – login with google- jsonp – WORKS
1.	Create a new Google Cloud Platform (GCP) project:
  o	Go to the Google Cloud Console (https://console.cloud.google.com/)
  o	Click on the project dropdown at the top of the page
  o	Click "New Project"
Give your project a name and click "Create" : project-anyquizz-20240812

2.	Enable the necessary APIs in your GCP project:
  o	In the GCP Console, go to "APIs & Services" > "Library"
  o	Search for and enable the following APIs:
    	Apps Script API
    	Google Sheets API
    	Google Drive API
3.	Create credentials for your project:
  o	In the GCP Console, go to "APIs & Services" > "Credentials"
  o	Click "Create Credentials" and select "OAuth client ID"
Oauth consent screen: authorized page: manojkumarm75.github.io
Project number : 44063799736 (from GCP dashboard), put it to appscript project.

1.	Create or Select your GCP Project:
  o	Go to https://console.cloud.google.com/
  o	Create a new project or select an existing one from the top dropdown menu
2.	Enable necessary APIs:
  o	In the left sidebar, go to "APIs & Services" > "Library"
  o	Search for and enable these APIs:
    	Google Sheets API
    	Apps Script API
    	Google Drive API
3.	Set up the OAuth Consent Screen:
  o	Go to "APIs & Services" > "OAuth consent screen"
  o	Choose "External" user type (unless this is for internal use only)
  o	Fill in the required fields:
    	App name: (e.g., "AnyQuizzTest")
    	User support email: (manoj75.code@gmail.com)
    	Developer contact information: (manoj75.code@gmail.com)
  o	Click "Save and Continue"
  o	In the "Scopes" section, add these scopes:
    	.../auth/userinfo.email
    	.../auth/spreadsheets
  o	Click "Save and Continue"
  o	In the "Test users" section, add your Google account email (kottaram & Manoj75.code)
  o	Click "Save and Continue"
4.	Add Authorized Domain:
  o	Still in the OAuth consent screen, find "Authorized domains"
  o	Add: manojkumarm75.github.io
  o	Click "Save"
5.	Create OAuth 2.0 Client ID:
  o	Go to "APIs & Services" > "Credentials"
  o	Click "Create Credentials" > "OAuth client ID"
  o	Choose "Web application" as the application type
  o	Name: (e.g., "AnyQuizzTest-Web Client")
  o	Under "Authorized JavaScript origins", add:
    https://manojkumarm75.github.io
  o	Under "Authorized redirect URIs", add:
    https://manojkumarm75.github.io/AnyQuizzTest/
  o	Click "Create"
    Downloaded json. (Note down the Client ID and Client Secret)
    {"web": {"client_id":
    "44063799736-jl9n0up9qa94t8imacu9r0g4djf81ej1.apps.googleusercontent.com",
    "project_id":"project-anyquizz-20240812",
    "auth_uri":"https://accounts.google.com/o/oauth2/auth",
    "token_uri":"https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
    "client_secret":"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",
    "redirect_uris":["https://manojkumarm75.github.io/AnyQuizzTest/"],
    "javascript_origins":["https://manojkumarm75.github.io"]}}
6.	Update your Apps Script project:
  o	Open your Apps Script project
  o	Go to "Project Settings" (gear icon)
  o	Under "Google Cloud Platform (GCP) Project", click "Change project"
  o	Enter your GCP project number (found in GCP Console > Home)
  o	Click "Set project"
7.	Deploy as API Executable:
  o	In Apps Script, click "Deploy" > "New deployment"
  o	Select "API Executable" as the deployment type
  o	Description: (e.g., "AnyQuizz API")
  o	Execute as: "Me"
  o	Who has access: "Anyone"
  o	Click "Deploy"
    Version 1 on Aug 12, 2024, 4:15 PM
  o	Copy the "Deployment ID"  AKfycbyfZ90h6Rs64WO9PBYmxkPEgOPPqnTcS8HVuBvuqCyj4ONyBUiE9s4gEip3Ld2unA0t
8.	Update your HTML/JS code:
  o	Replace the old script URL with:
  o	const API_URL = 'https://script.googleapis.com/v1/scripts/YOUR_DEPLOYMENT_ID:run';
  o	Update the client ID in your Google Sign-In code:
  o	gapi.auth2.init({
  	    client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
    })
Login with js, pass token to appscript, appscript then connects with google to get the details of the user of the token. Worked as a charm , codes from cody/claude.
Cody/Claude

Let's break down the process to ensure we're on the same page:
1.	Client-Side (Your HTML/JavaScript):
  o	The user signs in using Google Sign-In (Google Identity Services).
  o	Upon successful sign-in, the client receives a JWT (JSON Web Token) from Google.
  o	This token is then sent to your Apps Script web app.
2.	Server-Side (Your Apps Script):
  o	Receives the token from the client.
  o	Verifies the token by sending it to Google's tokeninfo endpoint.
  o	Decodes the token information returned by Google.
  o	Extracts relevant user information (like email and name) from the decoded token.
  o	Sends this information back to the client.
Here's a more detailed step-by-step breakdown:
1.	User clicks "Sign In with Google" on your webpage.
2.	Google's authentication process occurs (handled by Google Identity Services).
3.	Upon successful authentication, Google provides a JWT to your client-side JavaScript.
4.	Your JavaScript sends this token to your Apps Script web app.
5.	Apps Script receives the token.
6.	Apps Script sends this token to Google's tokeninfo endpoint for verification.
7.	Google verifies the token and returns the decoded information.
8.	Apps Script processes this information, extracting relevant details.
9.	Apps Script sends the extracted user information back to your client-side JavaScript.
10.	Your JavaScript receives this information and can now use it (e.g., display a welcome message).
This process ensures that:
  •	The authentication is handled securely by Google.
  •	The token is verified on your server-side (Apps Script) rather than trusting the client-side data.
  •	You're working with verified user information.
Your understanding is correct, and this is a secure and recommended way to handle Google authentication in your setup. The client (browser) never decodes the token itself; all sensitive operations are performed server-side in your Apps Script, which adds an important layer of security to your application.



