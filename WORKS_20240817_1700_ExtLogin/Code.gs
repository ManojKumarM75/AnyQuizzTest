function doGet(e) {
  var callback = e.parameter.callback;
  var action = e.parameter.action;
  var token = e.parameter.token;
  
  var output = { action: action };
  
  if (action === 'logout') {
    output.message = 'Logged out successfully';
  } else if (action === 'login') {
    if (!token) {
      output.error = "No token provided";
    } else {
      try {
        var response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token);
        var tokenInfo = JSON.parse(response.getContentText());
        
        if (tokenInfo.error) {
          output.error = "Invalid token";
        } else {
          output.username = tokenInfo.name;
          output.email = tokenInfo.email;
        }
      } catch (error) {
        output.error = "Error verifying token: " + error.toString();
      }
    }
  }
  
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(output) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
