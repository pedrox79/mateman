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

// Base de datos de jugadores y ranking mundial en memoria
let leaderboard = {};

io.on('connection', (socket) => {
  // Enviar la tabla de posiciones actual al conectarse
  socket.emit('update_ranking', getSortedLeaderboard());

  // Registrar / Iniciar usuario
  socket.on('register_user', (username) => {
    if (!username) return;
    if (!leaderboard[username]) {
      leaderboard[username] = {
        username: username,
        totalScore: 0,
        coursesProgress: { suma: 0, resta: 0, multiplicacion: 0 }
      };
    }
    io.emit('update_ranking', getSortedLeaderboard());
  });

  // Procesar circuito de puntuaciones (Aciertos y Penalizaciones)
  socket.on('update_score', (data) => {
    const { username, course, level, isCorrect } = data;
    if (!username) return;

    if (!leaderboard[username]) {
      leaderboard[username] = {
        username: username,
        totalScore: 0,
        coursesProgress: { suma: 0, resta: 0, multiplicacion: 0 }
      };
    }

    if (course && level !== undefined) {
      leaderboard[username].coursesProgress[course] = level;
    }

    if (isCorrect) {
      // Sumar puntos base + bono por dificultad del nivel
      const pointsGained = 10 + (level * 2);
      leaderboard[username].totalScore += pointsGained;
    } else {
      // Restar puntos por equivocarse (penalización) sin bajar de 0
      leaderboard[username].totalScore = Math.max(0, leaderboard[username].totalScore - 5);
    }

    // Emitir el ranking actualizado a todos los clientes en tiempo real
    io.emit('update_ranking', getSortedLeaderboard());
  });
});

function getSortedLeaderboard() {
  return Object.values(leaderboard).sort((a, b) => b.totalScore - a.totalScore);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Mante ejecutándose en el puerto ${PORT}`);
});
