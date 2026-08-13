const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const courseType = urlParams.get('type') || 'suma';
const username = localStorage.getItem('mante_user');

if (!username) window.location.href = 'index.html';

// Registrar presencia en socket
socket.emit('register_user', username);

let currentLevel = parseInt(localStorage.getItem(`mante_prog_${courseType}`)) || 0;
let currentProblem = null;

const courseInfo = {
  suma: {
    title: "Curso de Sumas",
    help: `
      <h3>¿Cómo funciona el curso de Suma?</h3>
      <p><b>Niveles 1–10:</b> Sumas básicas de un solo dígito (ej. $4 + 5$).</p>
      <p><b>Niveles 11–25:</b> Decenas y centenas (ej. $45 + 89$).</p>
      <p><b>Niveles 26–40:</b> Introducción a paréntesis: primero resuelve lo interno, $(10 + 5) + 20 = 35$.</p>
      <p><b>Niveles 41–60:</b> Miles y millones.</p>
      <p><b>Niveles 61–80:</b> Operaciones con decimales (ej. $4.5 + 2.3 = 6.8$).</p>
      <p><b>Niveles 81–100:</b> Expresiones avanzadas combinadas.</p>
      <hr style="margin: 10px 0;">
      <p><b>⚡ Circuito de Puntos:</b> +10 Puntos base por acierto (+ bonificación por nivel). ❌ -5 Puntos si respondes mal.</p>
    `
  },
  resta: {
    title: "Curso de Restas",
    help: `
      <h3>¿Cómo funciona el curso de Resta?</h3>
      <p><b>Niveles 1–10:</b> Restas sencillas sin llevar.</p>
      <p><b>Niveles 11–25:</b> Restas con dos y tres cifras.</p>
      <p><b>Niveles 26–40:</b> Paréntesis: $50 - (10 - 5) = 45$.</p>
      <p><b>Niveles 41–60:</b> Sustracción con miles y millones.</p>
      <p><b>Niveles 61–80:</b> Decimales.</p>
      <p><b>Niveles 81–100:</b> Problemas combinados.</p>
      <hr style="margin: 10px 0;">
      <p><b>⚡ Circuito de Puntos:</b> +10 Puntos base por acierto (+ bonificación por nivel). ❌ -5 Puntos si respondes mal.</p>
    `
  },
  multiplicacion: {
    title: "Curso de Multiplicación",
    help: `
      <h3>¿Cómo funciona el curso de Multiplicación?</h3>
      <p><b>Niveles 1–10:</b> Tablas básicas del 1 al 10.</p>
      <p><b>Niveles 11–25:</b> Multiplicación de 2 cifras.</p>
      <p><b>Niveles 26–40:</b> Uso de paréntesis: $(2 \\times 3) \\times 4 = 24$.</p>
      <p><b>Niveles 41–60:</b> Cifras de miles.</p>
      <p><b>Niveles 61–80:</b> Decimales.</p>
      <p><b>Niveles 81–100:</b> Jerarquía de operaciones mixtas.</p>
      <hr style="margin: 10px 0;">
      <p><b>⚡ Circuito de Puntos:</b> +10 Puntos base por acierto (+ bonificación por nivel). ❌ -5 Puntos si respondes mal.</p>
    `
  }
};

document.getElementById('courseTitle').innerText = courseInfo[courseType]?.title || "Curso";
document.getElementById('helpBody').innerHTML = courseInfo[courseType]?.help || "Explicación no disponible.";

if (currentLevel === 0 && !sessionStorage.getItem(`read_help_${courseType}`)) {
  showHelpModal();
  sessionStorage.setItem(`read_help_${courseType}`, 'true');
}

function showHelpModal() {
  document.getElementById('helpModal').classList.add('active');
}

function closeHelpModal() {
  document.getElementById('helpModal').classList.remove('active');
}

function generateProblem(type, levelIndex) {
  const level = levelIndex + 1;
  let a, b, c, prompt, answer;

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randDec = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

  if (type === 'suma') {
    if (level <= 10) {
      a = randInt(1, 9); b = randInt(1, 9);
      prompt = `${a} + ${b}`; answer = a + b;
    } else if (level <= 25) {
      a = randInt(10, 99); b = randInt(10, 99);
      prompt = `${a} + ${b}`; answer = a + b;
    } else if (level <= 40) {
      a = randInt(5, 30); b = randInt(5, 30); c = randInt(10, 40);
      prompt = `(${a} + ${b}) + ${c}`; answer = a + b + c;
    } else if (level <= 60) {
      a = randInt(1000, 50000); b = randInt(1000, 50000);
      prompt = `${a.toLocaleString()} + ${b.toLocaleString()}`; answer = a + b;
    } else if (level <= 80) {
      a = randDec(1, 50); b = randDec(1, 50);
      prompt = `${a} + ${b}`; answer = parseFloat((a + b).toFixed(1));
    } else {
      a = randInt(100000, 1000000); b = randInt(100000, 1000000); c = randDec(5, 50);
      prompt = `(${a.toLocaleString()} + ${b.toLocaleString()}) + ${c}`;
      answer = parseFloat((a + b + c).toFixed(1));
    }
  } else if (type === 'resta') {
    if (level <= 10) {
      a = randInt(5, 15); b = randInt(1, a);
      prompt = `${a} - ${b}`; answer = a - b;
    } else if (level <= 25) {
      a = randInt(30, 99); b = randInt(10, a);
      prompt = `${a} - ${b}`; answer = a - b;
    } else if (level <= 40) {
      b = randInt(5, 20); c = randInt(1, b); a = randInt(30, 60);
      prompt = `${a} - (${b} - ${c})`; answer = a - (b - c);
    } else if (level <= 60) {
      a = randInt(10000, 99999); b = randInt(1000, a);
      prompt = `${a.toLocaleString()} - ${b.toLocaleString()}`; answer = a - b;
    } else if (level <= 80) {
      a = randDec(20, 99); b = randDec(1, a);
      prompt = `${a} - ${b}`; answer = parseFloat((a - b).toFixed(1));
    } else {
      a = randInt(500000, 1000000); b = randInt(100000, a); c = randDec(1, 20);
      prompt = `(${a.toLocaleString()} - ${b.toLocaleString()}) - ${c}`;
      answer = parseFloat((a - b - c).toFixed(1));
    }
  } else {
    if (level <= 10) {
      a = randInt(2, 9); b = randInt(2, 9);
      prompt = `${a} × ${b}`; answer = a * b;
    } else if (level <= 25) {
      a = randInt(10, 30); b = randInt(2, 9);
      prompt = `${a} × ${b}`; answer = a * b;
    } else if (level <= 40) {
      a = randInt(2, 5); b = randInt(2, 5); c = randInt(2, 6);
      prompt = `(${a} × ${b}) × ${c}`; answer = a * b * c;
    } else if (level <= 60) {
      a = randInt(100, 999); b = randInt(10, 99);
      prompt = `${a} × ${b}`; answer = a * b;
    } else if (level <= 80) {
      a = randDec(1, 10); b = randInt(2, 5);
      prompt = `${a} × ${b}`; answer = parseFloat((a * b).toFixed(1));
    } else {
      a = randDec(1, 10); b = randDec(1, 5); c = randInt(2, 4);
      prompt = `(${a} × ${b}) × ${c}`; answer = parseFloat((a * b * c).toFixed(2));
    }
  }

  return { prompt, answer };
}

function loadNextQuestion() {
  if (currentLevel >= 100) {
    document.getElementById('expression').innerText = "🎉 ¡Felicidades! Completaste este curso.";
    document.getElementById('answerForm').style.display = 'none';
    return;
  }

  currentProblem = generateProblem(courseType, currentLevel);
  document.getElementById('expression').innerText = `${currentProblem.prompt} = ?`;
  document.getElementById('userAnswer').value = '';
  document.getElementById('feedback').innerText = '';

  document.getElementById('levelLabel').innerText = `Problema ${currentLevel + 1} / 100`;
  document.getElementById('courseProgressBar').style.width = `${currentLevel}%`;
}

document.getElementById('answerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const inputVal = parseFloat(document.getElementById('userAnswer').value);
  const feedback = document.getElementById('feedback');

  if (Math.abs(inputVal - currentProblem.answer) < 0.01) {
    feedback.innerText = "¡Correcto! +Puntos sumados a tu ranking. 👏";
    feedback.className = "feedback success";

    currentLevel++;
    localStorage.setItem(`mante_prog_${courseType}`, currentLevel);

    // Enviar acierto al circuito de puntuaciones
    socket.emit('update_score', {
      username: username,
      course: courseType,
      level: currentLevel,
      isCorrect: true
    });

    setTimeout(() => {
      loadNextQuestion();
    }, 700);

  } else {
    feedback.innerText = `❌ Incorrecto (-5 pts). La respuesta era ${currentProblem.answer}. ¡Inténtalo con el nuevo ejercicio!`;
    feedback.className = "feedback error";

    // Enviar penalización al circuito de puntuaciones
    socket.emit('update_score', {
      username: username,
      course: courseType,
      level: currentLevel,
      isCorrect: false
    });

    // Cargar nuevo problema aleatorio tras la equivocación
    setTimeout(() => {
      loadNextQuestion();
    }, 1200);
  }
});

loadNextQuestion();
