import { collection, addDoc, updateDoc, getDocs, query, where, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ===================== VARIABLES =====================
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
const winGold = document.getElementById("winGold");
const winBlue = document.getElementById("winBlue");
const winGreen = document.getElementById("winGreen");
const winPink = document.getElementById("winPink");

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
    nextBtn.disabled = false;
    alert("¡Correcto! Presiona 'Siguiente' para continuar o gira la ruleta.");
  } else alert("Incorrecto, inténtalo de nuevo.");
}

nextBtn.onclick = () => {
  currentQuestion++;
  if(currentQuestion < questions.length) loadQuestion();
  else {
    gameSection.classList.add("hidden");
    rouletteSection.classList.remove("hidden");
  }
}

// ===================== RULETA =====================
function drawRoulette() {
  ctx.clearRect(0,0,400,400);
  for(let i=0;i<numSectors;i++){
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
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial";
    ctx.fillText(prizes[i], 180, 0);
    ctx.restore();
  }

  // Indicador fijo arriba
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.moveTo(200-10,10);
  ctx.lineTo(200+10,10);
  ctx.lineTo(200,30);
  ctx.closePath();
  ctx.fill();
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
    startAngle = rotation % (2*Math.PI);

    drawRoulette();

    if(progress < 3000) requestAnimationFrame(animate);
    else {
      const index = Math.floor((2*Math.PI - startAngle + sectorAngle/2)/(2*Math.PI)*numSectors) % numSectors;
      const wonPrize = prizes[index];

      rouletteSection.classList.add("hidden");
      resultSection.classList.remove("hidden");
      rankingSection.classList.remove("hidden");
      prizeEl.textContent = `¡Tu premio es: ${wonPrize}!`;
      prizeEl.dataset.prize = wonPrize;

      let color="#FFD700", soundEl=winGold;
      if(wonPrize.includes("10%")) { color="#00f"; soundEl=winBlue; }
      else if(wonPrize.includes("2x1")) { color="#0f0"; soundEl=winGreen; }
      else if(wonPrize.includes("Copa")) { color="#ff69b4"; soundEl=winPink; }

      soundEl.play();
      confetti({ particleCount: 250, spread: 140, startVelocity: 60, gravity: 0.9, scalar: 1.7, colors: [color,"#fff"] });
      showRanking();
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(animate);
};

// ===================== GUARDAR CLIENTE =====================
const saveBtn = document.getElementById("saveBtn");
saveBtn.onclick = async () => {
  const name = document.getElementById("clientName").value.trim();
  const prize = prizeEl.dataset.prize;
  if(!name){ alert("Ingresa tu nombre"); return; }

  const db = window.db;
  const clientsRef = collection(db, "clientes");
  const q = query(clientsRef, where("name","==",name));
  const snapshot = await getDocs(q);

  if(snapshot.empty){
    await addDoc(clientsRef, { name, score:1, prizes:[prize], lastPrizeDate:new Date() });
  } else {
    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data();
    await updateDoc(docRef, { score: data.score+1, prizes:[...data.prizes, prize], lastPrizeDate:new Date() });
  }

  alert("Premio guardado y puntos actualizados!");
  showRanking();
};

// ===================== RANKING =====================
function showRanking() {
  const db = window.db;
  rankingList.innerHTML="";
  historyList.innerHTML="";

  const q = query(collection(db,"clientes"), orderBy("score","desc"), limit(10));
  onSnapshot(q, snapshot=>{
    rankingList.innerHTML="";
    snapshot.forEach(doc=>{
      const data=doc.data();
      const li=document.createElement("li");
      li.textContent=`${data.name} - ${data.score} puntos (${data.prizes.length} premios)`;
      rankingList.appendChild(li);
    });
  });

  const q2 = query(collection(db,"clientes"), orderBy("lastPrizeDate","desc"), limit(5));
  onSnapshot(q2, snapshot=>{
    historyList.innerHTML="";
    snapshot.forEach(doc=>{
      const data=doc.data();
      const lastPrize=data.prizes[data.prizes.length-1];
      const li=document.createElement("li");
      li.textContent=`${data.name} ganó: ${lastPrize}`;
      historyList.appendChild(li);
    });
  });
}

// ===================== RESTART =====================
function restartGame(){
  currentQuestion=0;
  gameSection.classList.remove("hidden");
  rouletteSection.classList.add("hidden");
  resultSection.classList.add("hidden");
  rankingSection.classList.add("hidden");
  loadQuestion();
}

// ===================== INICIAR =====================
loadQuestion();
