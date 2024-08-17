const USER_NAME = 'Manoj';
const USER_EMAIL = 'Manoj75.Code@gmail.com';

let quizMetadata;
let currentQuestionIndex = 0;
let totalQuestions = 0;
let cachedQuestions = {};
const preloadSize = 5;
let userScore = 0;

function loadQuizMetadata() {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(function(result) {
        try {
          quizMetadata = JSON.parse(result);
          totalQuestions = quizMetadata.totalQuestions;
          displayQuestionIndex();
          resolve();
        } catch (error) {
          console.error('Error parsing quiz metadata:', error);
          reject(error);
        }
      })
      .withFailureHandler(reject)
      .getQuizMetadata();
  });
}

function loadQuestions(startIndex, isPreload = false) {
  return new Promise((resolve, reject) => {
    if (!isPreload) {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('quiz-container').style.display = 'none';
    }

    google.script.run
      .withSuccessHandler(function(result) {
        try {
          const data = JSON.parse(result);
          data.questions.forEach((q, i) => {
            cachedQuestions[startIndex + i] = q;
          });
          if (!isPreload) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('quiz-container').style.display = 'block';
          }
          resolve();
        } catch (error) {
          console.error('Error parsing result:', error);
          reject(error);
        }
      })
      .withFailureHandler(reject)
      .getQuestions(startIndex, preloadSize);
  });
}

// Include all your existing functions here (displayQuestion, updateButtons, showNext, showPrevious, submitAnswer, etc.)
// Remember to replace any references to user email or authentication with the constant USER_EMAIL

function writeToUserAnswers(data) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .writeToUserAnswers({
        ...data,
        user: USER_EMAIL
      });
  });
}

async function initializeQuiz() {
  await loadQuizMetadata();
  await loadQuestions(0);
  displayQuestion(cachedQuestions[0]);
  updateButtons();
  ensureQuestionsLoaded(preloadSize);
}

// Event Listeners
document.getElementById('prevBtn').addEventListener('click', showPrevious);
document.getElementById('nextBtn').addEventListener('click', showNext);
document.getElementById('submitBtn').addEventListener('click', submitAnswer);
document.getElementById('showMetadataBtn').addEventListener('click', showQuizMetadata);

// Initialize the quiz
initializeQuiz();
