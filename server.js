const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
    ? { rejectUnauthorized: false }
    : false
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

app.post('/api/registro', async (req, res) => {
  const { nombre, apellido } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Por favor ingresa nombre y apellido.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, apellido) VALUES ($1, $2) RETURNING id, nombre, apellido',
      [nombre.trim(), apellido.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

app.get('/api/cursos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cursos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
});

app.post('/api/consultas', async (req, res) => {
  const { usuarioId, cursoId, pregunta } = req.body;

  if (!usuarioId || !cursoId || !pregunta) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  let respuesta = 'Guía paso a paso: ';
  const textoPregunta = pregunta.toLowerCase();

  if (textoPregunta.includes('pitagoras') || textoPregunta.includes('hipotenusa')) {
    respuesta += 'Aplica la fórmula c² = a² + b². Eleva los catetos al cuadrado, súmalos y extrae la raíz cuadrada.';
  } else if (textoPregunta.includes('ecuacion') || textoPregunta.includes('x')) {
    respuesta += 'Despeja la variable X dejando las incógnitas de un lado de la igualdad y los números del otro.';
  } else if (textoPregunta.includes('area') || textoPregunta.includes('perimetro')) {
    respuesta += 'Recuerda que el área mide la superficie interna y el perímetro la suma de todos sus lados externos.';
  } else {
    respuesta += 'Identifica los datos dados, plantea la ecuación matemática correspondiente y despeja la incógnita paso a paso.';
  }

  try {
    const result = await pool.query(
      'INSERT INTO consultas (usuario_id, curso_id, pregunta, respuesta) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuarioId, cursoId, pregunta, respuesta]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar la consulta' });
  }
});

app.get('/api/consultas/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.id, c.pregunta, c.respuesta, c.creado_en, cu.nombre AS curso 
       FROM consultas c 
       JOIN cursos cu ON c.curso_id = cu.id 
       WHERE c.usuario_id = $1 
       ORDER BY c.creado_en DESC`,
      [usuarioId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

app.listen(PORT, async () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
  if (process.env.DATABASE_URL) {
    await initDB();
  }
});