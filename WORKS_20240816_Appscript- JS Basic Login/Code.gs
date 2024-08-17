function doGet(e) {
  var callback = e.parameter.callback;
  
  var token = e.parameter.token;
  if (!token) {
    return ContentService.createTextOutput(callback + '({"error": "No token provided"})').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  var response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token);
  var tokenInfo = JSON.parse(response.getContentText());
  
  if (tokenInfo.error) {
    return ContentService.createTextOutput(callback + '({"error": "Invalid token"})').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  var output = {
    message: 'Token verified',
    email: tokenInfo.email,
    name: tokenInfo.name
  };
  
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(output) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
