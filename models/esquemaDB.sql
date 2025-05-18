// Contenido de esquemaDB.sql (se completará con contenido real luego)

CREATE TABLE IF NOT EXISTS ingresos (
  id SERIAL PRIMARY KEY,
  monto NUMERIC(12,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gastos_fijos (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  observaciones TEXT,
  estado VARCHAR(20),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gastos_semanales (
  id SERIAL PRIMARY KEY,
  semana INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha DATE NOT NULL
);
