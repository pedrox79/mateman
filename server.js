const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.static('public'));

// Base de datos en memoria para el ranking mundial
let leaderboard = {};

io.on('connection', (socket) => {
  // Enviar ranking actual al conectarse
  socket.emit('update_ranking', Object.values(leaderboard));

  // Actualizar puntaje de un usuario
  socket.on('submit_progress', (data) => {
    const { username, course, level } = data;
    if (!username) return;

    if (!leaderboard[username]) {
      leaderboard[username] = { username, totalScore: 0, courses: {} };
    }

    leaderboard[username].courses[course] = level;
    
    // El puntaje total es la suma de los niveles alcanzados en todos los cursos
    leaderboard[username].totalScore = Object.values(leaderboard[username].courses)
      .reduce((a, b) => a + b, 0);

    // Emitir a TODOS los usuarios conectados en tiempo real
    io.emit('update_ranking', Object.values(leaderboard));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
