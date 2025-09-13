// ===================== TRIVIA =====================
const questions = [
  { question: "¿Cóctel famoso con ron, menta y soda?", options: ["Caipirinha","Mojito","Margarita"], answer: "Mojito" },
  { question: "Bebida con tequila, triple sec y limón?", options: ["Piña Colada","Margarita","Negroni"], answer: "Margarita" },
  { question: "País famoso por cerveza Guinness?", options: ["Alemania","Irlanda","México"], answer: "Irlanda" }
];

let currentQuestion = 0;
const prizes = ["🍺 Trago gratis","🍷 10% de descuento","🍹 2x1 cócteles","🥂 Copa de cortesía"];

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const gameSection = document.getElementById("game");
const rouletteSection = document.getElementById("rouletteSection");
const resultSection = document.getElementById("result");
const rankingSection = document.getElementById("rankingSection");
const prizeEl = document.getElementById("prize");
const rankingList = document.getElementById("rankingList");
const historyList = document.getElementById("historyList");

const spinBtn = document.getElementById("spinBtn");
const canvas = document.getElementById("rouletteCanvas");
const ctx = canvas.getContext("2d");

const spinSound = document.getElementById("spinSound");
const winSound = document.getElementById("winSound");

const numSectors = prizes.length;
const sectorAngle = 2 * Math.PI / numSectors;
let startAngle = 0;

// ===================== TRIVIA =====================
function loadQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  nextBtn.disabled = true;
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option");
    btn.onclick = () => selectAnswer(opt);
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(option) {
  const correct = questions[currentQuestion].answer;
  if(option === correct){
    gameSection.classList.add("hidden");
    rouletteSection.classList.remove("hidden");
  } else {
    alert("Incorrecto, inténtalo de nuevo.");
  }
}

nextBtn.onclick = () => {
  currentQuestion++;
  if(currentQuestion < questions.length){
    loadQuestion();
  } else {
    gameSection.classList.add("hidden");
    rouletteSection.classList.remove("hidden");
  }
}

// ===================== RULETA =====================
function drawRoulette() {
  for(let i=0; i<numSectors; i++){
    ctx.beginPath();
    ctx.moveTo(200,200);
    ctx.arc(200,200,200,startAngle + i*sectorAngle, startAngle + (i+1)*sectorAngle);
    ctx.fillStyle = i%2===0 ? "#ffcc00" : "#ff9900";
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(200,200);
    ctx.rotate(startAngle + i*sectorAngle + sectorAngle/2);
    ctx.textAlign = "right";
    ctx.fillStyle="#000";
    ctx.font = "18px Arial";
    ctx.fillText(prizes[i],190,0);
    ctx.restore();
  }
}
drawRoulette();

spinBtn.onclick = () => {
  spinBtn.disabled = true;
  spinSound.play();
  const spins = Math.random()*10 + 10;
  const finalAngle = startAngle + spins*2*Math.PI;
  let start = null;

  function animate(timestamp){
    if(!start) start = timestamp;
    const progress = timestamp - start;
    const rotation = startAngle + (finalAngle - startAngle)*(progress/3000);
    ctx.clearRect(0,0,400,400);
    startAngle = rotation % (2*Math.PI);
    drawRoulette();
    if(progress<3000){
      requestAnimationFrame(animate);
    } else {
      const index = Math.floor((2*Math.PI - startAngle + sectorAngle/2)/(2*Math.PI)*numSectors) % numSectors;
      const wonPrize = prizes[index];
      rouletteSection.classList.add("hidden");
      resultSection.classList.remove("hidden");
      rankingSection.classList.remove("hidden");
      prizeEl.textContent = `¡Tu premio es: ${wonPrize}!`;
      prizeEl.dataset.prize = wonPrize;
      winSound.play();
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      showRanking();
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame()
  }
