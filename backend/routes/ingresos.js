const express = require('express');
const router = express.Router();
const pool = require('../bd');

// Obtener todos los ingresos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingresos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
});

// Agregar un ingreso
router.post('/', async (req, res) => {
  const { monto, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ingresos (monto, descripcion) VALUES ($1, $2) RETURNING *',
      [monto, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar ingreso' });
  }
});

// Eliminar todos los ingresos
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM ingresos');
    res.json({ message: 'Todos los ingresos eliminados' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ingresos' });
  }
});

module.exports = router;

// Aquí se implementarán las rutas de ingresos
