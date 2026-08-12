let currentUser = null;
let currentQuestion = null;

// 1. Ingreso del usuario
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;

  try {
    const res = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido })
    });

    if (res.ok) {
      currentUser = await res.json();
      
      // Ocultar login y mostrar pantalla de 3 pasos de explicación
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('welcomeSection').classList.remove('hidden');
      document.getElementById('userNameDisplay').textContent = currentUser.nombre;
      document.getElementById('userInfo').textContent = `Estudiante: ${currentUser.nombre} ${currentUser.apellido}`;
    } else {
      alert('Por favor ingresa nombre y apellido.');
    }
  } catch (err) {
    console.error(err);
    alert('Error al conectar con el servidor.');
  }
});

// 2. Botón para comenzar el juego / preguntas
document.getElementById('btnStartGame').addEventListener('click', () => {
  document.getElementById('welcomeSection').classList.add('hidden');
  document.getElementById('quizSection').classList.remove('hidden');
  loadNewQuestion();
});

// 3. Cargar pregunta desde la API
async function loadNewQuestion() {
  document.getElementById('feedbackBox').classList.add('hidden');
  document.getElementById('userAnswer').value = '';
  document.getElementById('userAnswer').focus();

  try {
    const res = await fetch('/api/pregunta');
    currentQuestion = await res.json();
    document.getElementById('mathQuestion').textContent = currentQuestion.pregunta;
  } catch (err) {
    console.error(err);
  }
}

// 4. Enviar respuesta del alumno
document.getElementById('quizForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const userAnswerVal = parseInt(document.getElementById('userAnswer').value, 10);

  if (isNaN(userAnswerVal)) return;

  const esCorrecto = (userAnswerVal === currentQuestion.respuestaCorrecta);
  const feedbackBox = document.getElementById('feedbackBox');
  const feedbackText = document.getElementById('feedbackText');

  if (esCorrecto) {
    feedbackBox.className = 'feedback-box correct';
    feedbackText.textContent = `🎉 ¡Excelente! ${currentQuestion.pregunta} es igual a ${currentQuestion.respuestaCorrecta}.`;
  } else {
    feedbackBox.className = 'feedback-box incorrect';
    feedbackText.textContent = `❌ ¡Casi! Dijiste ${userAnswerVal}, pero la respuesta correcta de "${currentQuestion.pregunta}" es ${currentQuestion.respuestaCorrecta}.`;
  }

  feedbackBox.classList.remove('hidden');

  // Guardar resultado
  try {
    await fetch('/api/consultas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: currentUser.id,
        pregunta: currentQuestion.pregunta,
        respuestaUsuario: userAnswerVal,
        esCorrecto: esCorrecto
      })
    });
    loadHistory();
  } catch (err) {
    console.error(err);
  }
});

// 5. Botón para siguiente pregunta
document.getElementById('btnNextQuestion').addEventListener('click', loadNewQuestion);

// 6. Cargar historial
async function loadHistory() {
  if (!currentUser) return;
  try {
    const res = await fetch(`/api/consultas/${currentUser.id}`);
    const history = await res.json();
    const list = document.getElementById('historyList');
    list.innerHTML = '';

    history.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.pregunta}</strong> — <em>${item.respuesta}</em>`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}
