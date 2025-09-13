const questions = [
  {
    question: "¿Cuál es el cóctel más famoso hecho con ron, menta y soda?",
    options: ["Caipirinha", "Mojito", "Margarita"],
    answer: "Mojito"
  },
  {
    question: "¿Qué bebida se prepara con tequila, triple sec y limón?",
    options: ["Piña Colada", "Margarita", "Negroni"],
    answer: "Margarita"
  },
  {
    question: "¿Qué país es famoso por la cerveza Guinness?",
    options: ["Alemania", "Irlanda", "México"],
    answer: "Irlanda"
  }
];

const prizes = [
  "🍺 Un trago gratis",
  "🍷 10% de descuento en tu cuenta",
  "🍹 2x1 en cócteles seleccionados",
  "🥂 Una copa de cortesía"
];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const resultSection = document.getElementById("result");
const gameSection = document.getElementById("game");
const prizeEl = document.getElementById("prize");

function loadQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option");
    btn.onclick = () => selectAnswer(option);
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(option) {
  const correct = questions[currentQuestion].answer;
  if (option === correct) {
    score++;
  }

  document.querySelectorAll(".option").forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.style.background = "#4CAF50";
      btn.style.color = "#fff";
    } else {
      btn.style.background = "#e74c3c";
      btn.style.color = "#fff";
    }
  });

  nextBtn.disabled = false;
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
    nextBtn.disabled = true;
  } else {
    endGame();
  }
};

function endGame() {
  gameSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  prizeEl.textContent = `Tu premio es: ${prize}`;
}

function restartGame() {
  currentQuestion = 0;
  score = 0;
  gameSection.classList.remove("hidden");
  resultSection.classList.add("hidden");
  nextBtn.disabled = true;
  loadQuestion();
}

// Iniciar juego
loadQuestion();
