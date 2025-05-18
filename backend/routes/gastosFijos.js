const express = require('express');
const router = express.Router();
const pool = require('../bd');

// Obtener todos los gastos fijos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gastos_fijos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener gastos fijos' });
  }
});

// Agregar un gasto fijo
router.post('/', async (req, res) => {
  const { descripcion, monto, observaciones, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO gastos_fijos (descripcion, monto, observaciones, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [descripcion, monto, observaciones, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar gasto fijo' });
  }
});

module.exports = router;
