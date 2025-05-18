const express = require('express');
const router = express.Router();
const pool = require('../bd');

// Obtener todos los gastos semanales
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gastos_semanales ORDER BY semana, id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener gastos semanales' });
  }
});

// Agregar un gasto semanal
router.post('/', async (req, res) => {
  const { semana, descripcion, monto, fecha } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO gastos_semanales (semana, descripcion, monto, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
      [semana, descripcion, monto, fecha]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar gasto semanal' });
  }
});

module.exports = router;
