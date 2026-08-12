let currentUser = null;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;

  const res = await fetch('/api/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido })
  });

  if (res.ok) {
    currentUser = await res.json();
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    document.getElementById('userInfo').textContent = `Estudiante: ${currentUser.nombre} ${currentUser.apellido}`;
    loadCourses();
    loadHistory();
  }
});

async function loadCourses() {
  const res = await fetch('/api/cursos');
  const courses = await res.json();
  const grid = document.getElementById('coursesGrid');
  grid.innerHTML = '';

  courses.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-item';
    card.innerHTML = `<h3>${course.nombre}</h3><p>${course.descripcion}</p>`;
    card.onclick = () => selectCourse(course);
    grid.appendChild(card);
  });
}

function selectCourse(course) {
  document.getElementById('doubtCard').classList.remove('hidden');
  document.getElementById('selectedCourseTitle').textContent = course.nombre;
  document.getElementById('selectedCourseDesc').textContent = course.descripcion;
  document.getElementById('selectedCourseId').value = course.id;
  document.getElementById('responseArea').classList.add('hidden');
}

document.getElementById('doubtForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cursoId = document.getElementById('selectedCourseId').value;
  const pregunta = document.getElementById('pregunta').value;

  const res = await fetch('/api/consultas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuarioId: currentUser.id,
      cursoId: cursoId,
      pregunta: pregunta
    })
  });

  if (res.ok) {
    const data = await res.json();
    document.getElementById('responseText').textContent = data.respuesta;
    document.getElementById('responseArea').classList.remove('hidden');
    document.getElementById('pregunta').value = '';
    loadHistory();
  }
});

async function loadHistory() {
  if (!currentUser) return;
  const res = await fetch(`/api/consultas/${currentUser.id}`);
  const history = await res.json();
  const list = document.getElementById('historyList');
  list.innerHTML = '';

  history.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>[${item.curso}]</strong> ${item.pregunta}<br><em>R: ${item.respuesta}</em>`;
    list.appendChild(li);
  });
}