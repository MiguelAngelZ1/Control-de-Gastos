DROP TABLE IF EXISTS gastos_semanales;
DROP TABLE IF EXISTS ingresos;
DROP TABLE IF EXISTS gastos_fijos;

CREATE TABLE IF NOT EXISTS ingresos (
  id SERIAL PRIMARY KEY,
  monto NUMERIC(12,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gastos_semanales (
  id SERIAL PRIMARY KEY,
  semana INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS gastos_fijos (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  observaciones TEXT,
  estado VARCHAR(20),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert de prueba (puedes eliminarlo en producción)
INSERT INTO gastos_fijos (descripcion, monto, observaciones, estado) VALUES ('Prueba Copilot', 123.45, '', 'Pagado');
