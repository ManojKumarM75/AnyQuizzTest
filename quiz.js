const USER_NAME = 'Manoj';
const USER_EMAIL = 'Manoj75.Code@gmail.com';

let quizMetadata;
let currentQuestionIndex = 0;
let totalQuestions = 0;
let cachedQuestions = {};
const preloadSize = 5;
let userScore = 0;

// Replace with your actual Web App URL
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzcvLLJunWssFH2AXGfiWvWMIBqYW2xpuK42FpioJzMhX2J15hpod5lEn9A6of8cVkm/exec';

// Override google.script.run to use our Web App URL
const googleScriptRun = new Proxy({}, {
  get: (target, prop) => {
    return (args) => {
      return new Promise((resolve, reject) => {
        fetch(`${WEBAPP_URL}?function=${prop}`, {
          method: 'POST',
          body: JSON.stringify(args),
          headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(resolve)
        .catch(reject);
      });
    };
  }
});



function loadQuizMetadata() {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(function(result) {
        try {
          console.log('Raw result:', result);
          quizMetadata = JSON.parse(result);
          console.log('Parsed quizMetadata:', quizMetadata);
          if (!Array.isArray(quizMetadata.combinedData)) {
            throw new Error('combinedData is missing or not an array in quizMetadata');
          }
          if (!quizMetadata.history) {
            quizMetadata.history = {};
          }
          totalQuestions = quizMetadata.totalQuestions;
          console.log('Total questions:', totalQuestions);
          displayQuestionIndex();
          resolve();
        } catch (error) {
          console.error('Error parsing quiz metadata:', error);
          reject(error);
        }
      })
      .withFailureHandler(function(error) {
        console.error('Error loading quiz metadata:', error);
        reject(error);
      })
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
      .withFailureHandler(function(error) {
        console.error('Server error:', error);
        reject(error);
      })
      .getQuestions(startIndex, preloadSize);
  });
}

function displayQuestion(question) {
  console.log('Displaying question:', question);
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';
  
  const questionDiv = document.createElement('div');
  questionDiv.className = 'question';
  questionDiv.innerHTML = `<h3>Question ${currentQuestionIndex + 1}</h3>`;

  switch(question.Type) {
    case 'Blanks':
      questionDiv.innerHTML += `
        <p>${question.Question}</p>
        <input type="text" id="answer" placeholder="Your answer">
      `;
      document.getElementById('submitBtn').style.display = 'inline-block';
      break;
    case 'Match':
      const options = question.Options.split(';');
      questionDiv.innerHTML += `
        <p>${question.Question}</p>
        <select id="answer" onchange="handleAutoSubmit()">
          <option value="">Select an answer</option>
          ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      `;
      document.getElementById('submitBtn').style.display = 'none';
      break;
    case 'MCQ':
      const mcqOptions = question.Options.split(';');
      questionDiv.innerHTML += `
        <p>${question.Question}</p>
        ${mcqOptions.map((opt, optIndex) => `
          <label>
            <input type="radio" name="answer" value="${opt}" onchange="handleAutoSubmit()">
            ${opt}
          </label><br>
        `).join('')}
      `;
      document.getElementById('submitBtn').style.display = 'none';
      break;
    case 'True/False':
      questionDiv.innerHTML += `
        <p>${question.Question}</p>
        <label><input type="radio" name="answer" value="True" onchange="handleAutoSubmit()"> True</label><br>
        <label><input type="radio" name="answer" value="False" onchange="handleAutoSubmit()"> False</label>
      `;
      document.getElementById('submitBtn').style.display = 'none';
      break;
    default:
      questionDiv.innerHTML += `<p>Unsupported question type: ${question.Type}</p>`;
  }

  const metadataQuestion = quizMetadata.combinedData[currentQuestionIndex];
  const feedbackStatus = metadataQuestion.Feedback || 'Not rated';
  console.log('Feedback status from metadata:', feedbackStatus);

  questionDiv.innerHTML += `
    <p>Feedback: ${feedbackStatus}</p>
    <div id="feedback-section">
      <span>Flag Question as:</span>
      <label><input type="radio" name="feedback" value="important" onchange="provideFeedback('important')">Important</label>
      <label><input type="radio" name="feedback" value="wrong" onchange="provideFeedback('wrong')">Wrong</label>
      <label><input type="radio" name="feedback" value="ok" onchange="provideFeedback('ok')">OK</label>
    </div>
  `;

  container.appendChild(questionDiv);

  if (metadataQuestion.Feedback) {
    const feedbackRadio = document.querySelector(`input[name="feedback"][value="${metadataQuestion.Feedback}"]`);
    console.log('Found feedback radio button:', feedbackRadio);
    if (feedbackRadio) {
      feedbackRadio.checked = true;
      console.log('Set radio button to checked:', metadataQuestion.Feedback);
    }
  } else {
    console.log('No feedback data available for this question in metadata');
  }
}

function updateButtons(disabled = false) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  prevBtn.style.display = 'inline-block';
  nextBtn.style.display = 'inline-block';
  submitBtn.style.display = 'inline-block';

  prevBtn.disabled = disabled || currentQuestionIndex === 0;
  nextBtn.disabled = disabled || currentQuestionIndex >= totalQuestions - 1;
  submitBtn.disabled = disabled;

  const currentQuestion = cachedQuestions[currentQuestionIndex];
  if (currentQuestion && ['Match', 'MCQ', 'True/False'].includes(currentQuestion.Type)) {
    submitBtn.style.display = 'none';
  }
}

async function showNext() {
  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    await ensureQuestionsLoaded(currentQuestionIndex);
    displayQuestion(cachedQuestions[currentQuestionIndex]);
    updateButtons();
    ensureQuestionsLoaded(currentQuestionIndex + preloadSize);
  } else {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h2>Quiz Completed!</h2>
      <p>Your final score: ${userScore}/${totalQuestions}</p>`;
    document.getElementById('submitBtn').style.display = 'none';
  }
}

async function showPrevious() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    await ensureQuestionsLoaded(currentQuestionIndex);
    displayQuestion(cachedQuestions[currentQuestionIndex]);
    updateButtons();
  }
}

async function submitAnswer() {
  console.log('Submitting answer for question:', currentQuestionIndex);
  
  if (!quizMetadata) {
    console.error('quizMetadata is undefined. Attempting to reinitialize...');
    try {
      await loadQuizMetadata();
    } catch (error) {
      console.error('Failed to reinitialize quizMetadata:', error);
      alert('An error occurred. Please refresh the page and try again.');
      return;
    }
  }
  const rawUserAnswer = getUserAnswer();
  if (rawUserAnswer === null || rawUserAnswer === undefined || rawUserAnswer === '') {
    alert('Please provide an answer before submitting.');
    return;
  }

  updateButtons(true);

  const question = cachedQuestions[currentQuestionIndex];
  const correctAnswer = cleanAnswer(question.Answer);
  const userAnswer = cleanAnswer(rawUserAnswer);
  let isCorrect = false;

  switch(question.Type) {
    case 'Blanks':
    case 'Match':
    case 'MCQ':
      isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
      break;
    case 'True/False':
      isCorrect = userAnswer === correctAnswer;
      break;
  }

  updateHistory(question, userAnswer, isCorrect);
  console.log('Updating history for question:', question);
  const resultDiv = document.getElementById('result');
  if (isCorrect) {
    resultDiv.innerHTML = '<p class="correct">Correct!</p>';
    userScore++;
  } else {
    resultDiv.innerHTML = `<p class="incorrect">Incorrect. The correct answer is: ${correctAnswer}</p>`;
  }
  resultDiv.innerHTML += `<p>Your current score: ${userScore}/${currentQuestionIndex + 1}</p>`;

  await new Promise(resolve => setTimeout(resolve, 1000));
  resultDiv.innerHTML = '';
  
  if (currentQuestionIndex < totalQuestions - 1) {
    await showNext();
  } else {
    resultDiv.innerHTML = `<h2>Quiz Completed!</h2>
      <p>Your final score: ${userScore}/${totalQuestions}</p>`;
    document.getElementById('submitBtn').style.display = 'none';
  }

  updateButtons(false);

  try {
    if (!quizMetadata) {
      console.error('quizMetadata is undefined');
      quizMetadata = { history: {} };
    }
    if (!quizMetadata.history) {
      console.warn('quizMetadata.history is undefined, initializing it');
      quizMetadata.history = {};
    }
    if (question.QA_ID) {
      quizMetadata.history[question.QA_ID] = isCorrect ? 'Correct' : 'Incorrect';
    } else {
      console.warn('Question QA_ID is undefined');
    }
  } catch (error) {
    console.error('Error updating quizMetadata history:', error);
  }
}

function updateHistory(question, userAnswer, isCorrect) {
  const historyBody = document.getElementById('historyBody');
  const row = historyBody.insertRow(0);
  
  const now = new Date();
  const dateTime = now.toLocaleString();
  
  const cells = [
    dateTime,
    currentQuestionIndex + 1,
    question.QA_ID || 'N/A',
    question.Chunk_ID || 'N/A',
    question.Question,
    question.Answer,
    userAnswer,
    isCorrect ? 'Correct' : 'Incorrect',
    isCorrect ? '1' : '0'
  ];

  cells.forEach((cell, index) => {
    const td = row.insertCell(index);
    td.textContent = cell;
    if (index === 6 && !isCorrect) {
      td.classList.add('incorrect-answer');
    }
  });

  const historyDiv = document.getElementById('history');
  historyDiv.scrollTop = 0;

  const button = document.querySelector(`#question-index button:nth-child(${currentQuestionIndex + 1})`);
  if (button) {
    button.style.backgroundColor = isCorrect ? 'green' : 'red';
  }

  quizMetadata.history[question.QA_ID] = isCorrect ? 'Correct' : 'Incorrect';

  console.log('Attempting to write to Google Sheet...');
  google.script.run
    .withSuccessHandler(function(result) {
      console.log("Data successfully written to sheet:", result);
    })
    .withFailureHandler(function(error) {
      console.error("Error writing to sheet:", error);
      alert("Failed to save answer to Google Sheet. Please check your connection and try again.");
    })
    .writeToUserAnswers({
      dateTime: dateTime,
      questionNumber: currentQuestionIndex + 1,
      qaId: question.QA_ID || 'N/A',
      chunkId: question.Chunk_ID || 'N/A',
      question: question.Question,
      correctAnswer: question.Answer,
      userAnswer: userAnswer,
      result: isCorrect ? 'Correct' : 'Incorrect',
      marks: isCorrect ? '1' : '0',
      user: USER_EMAIL
    });
}

function provideFeedback(feedbackType) {
  const feedbackSection = document.getElementById('feedback-section');
  const question = cachedQuestions[currentQuestionIndex];

  feedbackSection.innerHTML = `Flagging as ${feedbackType}...`;
  feedbackSection.style.color = 'blue';
  feedbackSection.style.fontStyle = 'italic';

  google.script.run
    .withSuccessHandler(function(result) {
      feedbackSection.innerHTML = `Flagged as ${feedbackType}`;
      feedbackSection.style.color = 'green';
      
      question.feedback = feedbackType;
      quizMetadata.combinedData[currentQuestionIndex].feedback = feedbackType;

      updateIndexButtonStyle(currentQuestionIndex);
      
      setTimeout(() => {
        showNext();
      }, 1000);
    })
    .withFailureHandler(function(error) {
      console.error('Error submitting feedback:', error);
      feedbackSection.innerHTML = 'Error flagging question';
      feedbackSection.style.color = 'red';
    })
    .submitQuestionFeedback(question.QA_ID, feedbackType);
}

async function initializeQuiz() {
  await loadQuizMetadata();
  totalQuestions = quizMetadata.totalQuestions;
  displayQuestionIndex();
  await loadQuestions(0);
  displayQuestion(cachedQuestions[0]);
  updateButtons();
  ensureQuestionsLoaded(preloadSize);
}

// Add any other utility functions you have (e.g., cleanAnswer, getUserAnswer, etc.)

// Event Listeners
document.getElementById('prevBtn').addEventListener('click', showPrevious);
document.getElementById('nextBtn').addEventListener('click', showNext);
document.getElementById('submitBtn').addEventListener('click', submitAnswer);
document.getElementById('showMetadataBtn').addEventListener('click', showQuizMetadata);

// Initialize the quiz
initializeQuiz();
