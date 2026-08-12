-- Creación de tablas básicas sin recolección de datos sensibles
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS consultas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id INT REFERENCES cursos(id) ON DELETE CASCADE,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de los cursos
INSERT INTO cursos (nombre, descripcion, categoria) 
SELECT 'Álgebra Básica', 'Ecuaciones de primer y segundo grado, factorización y funciones.', 'Álgebra'
WHERE NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Álgebra Básica');

INSERT INTO cursos (nombre, descripcion, categoria) 
SELECT 'Geometría Plana', 'Triángulos, Teorema de Pitágoras, áreas y perímetros.', 'Geometría'
WHERE NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Geometría Plana');

INSERT INTO cursos (nombre, descripcion, categoria) 
SELECT 'Pre-Cálculo y Funciones', 'Límites, trigonometría y análisis gráfico.', 'Cálculo'
WHERE NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Pre-Cálculo y Funciones');

INSERT INTO cursos (nombre, descripcion, categoria) 
SELECT 'Estadística Básica', 'Promedios, probabilidad simple y análisis de datos.', 'Estadística'
WHERE NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Estadística Básica');