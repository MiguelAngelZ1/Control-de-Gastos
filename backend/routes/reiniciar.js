// Ruta para reiniciar (eliminar) todos los datos de la base de datos
// Elimina ingresos, gastos fijos y gastos semanales
const express = require('express');
const router = express.Router();
const pool = require('../bd');

/**
 * DELETE /api/reiniciar-todos
 * Elimina todos los datos de las tablas principales
 */
router.delete('/', async (req, res) => {
  try {
    // Eliminar primero los gastos semanales (si hay FK)
    await pool.query('DELETE FROM gastos_semanales');
    await pool.query('DELETE FROM gastos_fijos');
    await pool.query('DELETE FROM ingresos');
    // Si tienes una tabla de presupuesto, también puedes vaciarla aquí
    res.json({ message: 'Todos los datos han sido eliminados correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al reiniciar todos los datos.' });
  }
});

module.exports = router;
