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

// Eliminar todos los gastos semanales
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM gastos_semanales');
    res.json({ message: 'Todos los gastos semanales eliminados' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar gastos semanales' });
  }
});

// Eliminar un gasto semanal por semana, descripción, monto y fecha
router.delete('/', async (req, res) => {
  const { semana, descripcion, monto, fecha } = req.body;
  try {
    await pool.query('DELETE FROM gastos_semanales WHERE semana = $1 AND descripcion = $2 AND monto = $3 AND fecha = $4', [semana, descripcion, monto, fecha]);
    res.json({ message: 'Gasto semanal eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar gasto semanal' });
  }
});

module.exports = router;
