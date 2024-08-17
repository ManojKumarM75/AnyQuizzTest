var questionAnswerSheetId = '1lxJcL-tL4HX_FOtyZD2l6k72lm1zxUDOn6tSxSVIHAM' //GSheet
var userAnswersSheetId = '1LAFfFu6JR89I459gsM3oPNrKfJROVZPPnIwA_Es9BoM'; // Replace with your new sheet's ID
var feedbackSheetId = '1XjpW4IfOCeAc87ZqKKJleZTpRanK0uHbr4vIgfJIQ8o'; // Replace with your new feedback spreadsheet ID

var userEmail = Session.getActiveUser().getEmail();
Logger.log("User email: " + userEmail);

function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  template.isSignedIn = isUserSignedIn();
  return template.evaluate()
    .setTitle('Quiz Application')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
function isUserSignedIn() {
  return Session.getActiveUser().getEmail() !== "";
}

function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

function getQuizMetadata() {
  try {
    var userEmail = Session.getActiveUser().getEmail();
    Logger.log("User email: " + userEmail);
    
    // Access question metadata
    var qaSpreadsheet = SpreadsheetApp.openById(questionAnswerSheetId);
    var qaSheet = qaSpreadsheet.getSheetByName("QA");
    if (!qaSheet) {
      throw new Error("Sheet 'QA' not found in the spreadsheet");
    }
    
    var qaData = qaSheet.getDataRange().getValues();
    Logger.log("Number of rows in QA sheet: " + qaData.length);
    
    var qaHeaders = qaData[0];
    var qaIdIndex = qaHeaders.indexOf("QA_ID");
    var chunkIdIndex = qaHeaders.indexOf("Chunk_ID");
    
    if (qaIdIndex === -1 || chunkIdIndex === -1) {
      throw new Error("Required columns 'QA_ID' or 'Chunk_ID' not found");
    }
    
    // Create a map of QA_ID to Chunk_ID
    var qaMap = {};
    qaData.slice(1).forEach(row => {
      qaMap[row[qaIdIndex]] = {
        QA_ID: row[qaIdIndex],
        Chunk_ID: row[chunkIdIndex],
        IncorrectAnswers: 0,
        CorrectAnswers: 0,
        LastAnswer: null,
        LastTime: null,
        Feedback: null
      };
    });
    Logger.log("Number of QA entries: " + Object.keys(qaMap).length);
    
    // Access user's answer history
    var uaSpreadsheet = SpreadsheetApp.openById(userAnswersSheetId);
    var uaSheet = uaSpreadsheet.getSheetByName("User_Answers");
    if (!uaSheet) {
      throw new Error("Sheet 'User_Answers' not found in the user answers spreadsheet");
    }
    
    var uaData = uaSheet.getDataRange().getValues();
    Logger.log("Number of rows in User_Answers sheet: " + uaData.length);
    
    var uaHeaders = uaData[0];
    var uaUserIndex = uaHeaders.indexOf("User");
    var uaQaIdIndex = uaHeaders.indexOf("QA_ID");
    var uaResultIndex = uaHeaders.indexOf("Result");
    var uaDateIndex = uaHeaders.indexOf("DateTime");
    
    if (uaUserIndex === -1 || uaQaIdIndex === -1 || uaResultIndex === -1 || uaDateIndex === -1) {
      throw new Error("Required columns 'User', 'QA_ID', 'Result', or 'DateTime' not found");
    }
    
    // Process user's answer history
    uaData.slice(1).forEach(row => {
      if (row[uaUserIndex] === userEmail) {
        var qaId = row[uaQaIdIndex];
        if (qaMap[qaId]) {
          if (row[uaResultIndex] === "Incorrect") {
            qaMap[qaId].IncorrectAnswers++;
          } else if (row[uaResultIndex] === "Correct") {
            qaMap[qaId].CorrectAnswers++;
          }
          qaMap[qaId].LastAnswer = row[uaResultIndex];
          qaMap[qaId].LastTime = row[uaDateIndex];
        }
      }
    });
    
    // Process feedback
    var spreadsheet = SpreadsheetApp.openById(feedbackSheetId);
    var feedbackSheet = spreadsheet.getSheetByName("feedback");
    if (feedbackSheet) {
      var feedbackData = feedbackSheet.getDataRange().getValues();
      var fbHeaders = feedbackData[0];
      var fbUserIndex = fbHeaders.indexOf("User");
      var fbQaIdIndex = fbHeaders.indexOf("QA_ID");
      var fbTypeIndex = fbHeaders.indexOf("Feedback");

      feedbackData.slice(1).forEach(row => {
        if (row[fbUserIndex] === userEmail) {
          var qaId = row[fbQaIdIndex];
          if (qaMap[qaId]) {
            qaMap[qaId].Feedback = row[fbTypeIndex];
          }
        }
      });
    }
    
    // Convert the qaMap object to an array
    var resultArray = Object.values(qaMap);
    
    // Calculate totalQuestions
    var totalQuestions = resultArray.length;
    
    var result = JSON.stringify({
      combinedData: resultArray,
      totalQuestions: totalQuestions
    });
    
    Logger.log("Final result prepared. combinedData length: " + resultArray.length);
    Logger.log("Total questions: " + totalQuestions);
    return result;
  } catch (error) {
    Logger.log("Error in getQuizMetadata: " + error.toString());
    Logger.log("Error stack: " + error.stack);
    throw new Error("getQuizMetadata failed: " + error.message);
  }
}





function submitQuestionFeedback(qaId, feedbackType) {
  var userEmail = Session.getActiveUser().getEmail();
  var spreadsheet = SpreadsheetApp.openById(feedbackSheetId);
  var feedbackSheet = spreadsheet.getSheetByName("feedback");
  
  if (!feedbackSheet) {
    feedbackSheet = spreadsheet.insertSheet("feedback");
    feedbackSheet.appendRow(["Timestamp", "User", "QA_ID", "Feedback"]);
  }
  
  var timestamp = new Date();
  feedbackSheet.appendRow([timestamp, userEmail, qaId, feedbackType]);
  
  return "Feedback submitted successfully";
}


function getQuestions(startIndex, count) {
  try {
    Logger.log("Starting getQuestions function");
    Logger.log("startIndex: " + startIndex + ", count: " + count);

    var spreadsheet = SpreadsheetApp.openById(questionAnswerSheetId);
    Logger.log("Spreadsheet opened: " + spreadsheet.getName());

    var sheet = spreadsheet.getSheetByName("QA"); // Replace "QA" with your actual sheet name if different
    if (!sheet) {
      throw new Error("Sheet 'QA' not found in the spreadsheet");
    }
    Logger.log("Sheet found: " + sheet.getName());

    var data = sheet.getDataRange().getValues();
    Logger.log("Data retrieved. Total rows: " + data.length);

    var headers = data[0];
    var totalQuestions = data.length - 1; // Subtract 1 to account for header row

    // Ensure startIndex and count are within bounds
    startIndex = Math.max(0, Math.min(startIndex, totalQuestions - 1));
    count = Math.min(count, totalQuestions - startIndex);

    Logger.log("Adjusted startIndex: " + startIndex + ", count: " + count);

    var questions = data.slice(startIndex + 1, startIndex + count + 1).map(function(row) {
      var question = {};
      headers.forEach(function(header, index) {
        question[header] = row[index];
      });
      return question;
    });

    Logger.log("Questions processed. Number of questions: " + questions.length);

    return JSON.stringify({
      questions: questions,
      totalQuestions: totalQuestions
    });
  } catch (error) {
    Logger.log("Error in getQuestions: " + error.toString());
    Logger.log("Error stack: " + error.stack);
    throw new Error("getQuestions failed: " + error.message);
  }
}


function getStylesContent() {
  return HtmlService.createHtmlOutputFromFile('styles').getContent();
}

function writeToUserAnswers(data) {
  try {
    console.log('Received data to write:', JSON.stringify(data));
    
    // Open the specific spreadsheet by ID
    var ss = SpreadsheetApp.openById(userAnswersSheetId);
    if (!ss) {
      console.error('Spreadsheet not found with ID:', userAnswersSheetId);
      return 'Error: Spreadsheet not found';
    }
    
    console.log('Spreadsheet opened successfully');
    
    var sheet = ss.getSheetByName('User_Answers'); // Updated sheet name
    
    if (!sheet) {
      console.error('Sheet "User_Answers" not found');
      // List all sheet names for debugging
      var allSheets = ss.getSheets();
      console.log('Available sheets:', allSheets.map(s => s.getName()));
      return 'Error: Sheet not found';
    }
    
    console.log('Sheet "User_Answers" found');
    
    // Prepare the row data
    var rowData = [
      userEmail,
      data.dateTime,
      data.questionNumber,
      data.qaId,
      data.chunkId,
      data.question,
      data.correctAnswer,
      data.userAnswer,
      data.result,
      data.marks
    ];
    
    // Append the row to the sheet
    sheet.appendRow(rowData);
    
    console.log('Data written successfully');
    return 'Success';
  } catch (error) {
    console.error('Error in writeToUserAnswers:', error);
    return 'Error: ' + error.toString();
  }
}


function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

function getAuthorizationUrl() {
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  return authInfo.getAuthorizationUrl();
}
