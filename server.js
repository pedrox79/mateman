const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
    ? { rejectUnauthorized: false }
    : false
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializador de base de datos automático
async function initDB() {
  const fs = require('fs');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('Base de datos inicializada correctamente.');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }
}

// Rutas de la API

// 1. Registro simple (Solo Nombre y Apellido)
app.post('/api/registro', async (req, res) => {
  const { nombre, apellido } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Por favor ingresa tu nombre y apellido para comenzar.' });
  }

  try {
    let user;
    if (process.env.DATABASE_URL) {
      const result = await pool.query(
        'INSERT INTO usuarios (nombre, apellido) VALUES ($1, $2) RETURNING id, nombre, apellido',
        [nombre.trim(), apellido.trim()]
      );
      user = result.rows[0];
    } else {
      // Modo fallback sin base de datos activa localmente
      user = { id: Date.now(), nombre: nombre.trim(), apellido: apellido.trim() };
    }
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// 2. Generar pregunta matemática aleatoria
app.get('/api/pregunta', (req, res) => {
  const tipos = ['suma', 'resta', 'multiplicacion'];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  let num1, num2, respuestaCorrecta, textoPregunta;

  if (tipo === 'suma') {
    num1 = Math.floor(Math.random() * 20) + 1;
    num2 = Math.floor(Math.random() * 20) + 1;
    respuestaCorrecta = num1 + num2;
    textoPregunta = `¿Cuánto es ${num1} + ${num2}?`;
  } else if (tipo === 'resta') {
    num1 = Math.floor(Math.random() * 20) + 10;
    num2 = Math.floor(Math.random() * num1) + 1;
    respuestaCorrecta = num1 - num2;
    textoPregunta = `¿Cuánto es ${num1} - ${num2}?`;
  } else {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    respuestaCorrecta = num1 * num2;
    textoPregunta = `¿Cuánto es ${num1} × ${num2}?`;
  }

  res.json({
    pregunta: textoPregunta,
    respuestaCorrecta: respuestaCorrecta,
    tipo: tipo
  });
});

// 3. Guardar intento/consulta
app.post('/api/consultas', async (req, res) => {
  const { usuarioId, pregunta, respuestaUsuario, esCorrecto } = req.body;

  if (!usuarioId || !pregunta) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  const respuestaTexto = esCorrecto 
    ? `¡Correcto! Tu respuesta (${respuestaUsuario}) es acertada.`
    : `Respuesta incorrecta. Dijiste ${respuestaUsuario}. ¡Sigue intentando!`;

  try {
    if (process.env.DATABASE_URL) {
      const result = await pool.query(
        'INSERT INTO consultas (usuario_id, pregunta, respuesta) VALUES ($1, $2, $3) RETURNING *',
        [usuarioId, pregunta, respuestaTexto]
      );
      res.status(201).json(result.rows[0]);
    } else {
      res.status(201).json({ id: Date.now(), pregunta, respuesta: respuestaTexto });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar la respuesta' });
  }
});

// 4. Obtener el historial del estudiante
app.get('/api/consultas/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  try {
    if (process.env.DATABASE_URL) {
      const result = await pool.query(
        `SELECT c.id, c.pregunta, c.respuesta, c.creado_en 
         FROM consultas c 
         WHERE c.usuario_id = $1 
         ORDER BY c.creado_en DESC LIMIT 10`,
        [usuarioId]
      );
      res.json(result.rows);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
  if (process.env.DATABASE_URL) {
    await initDB();
  }
});
