const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Rutas de ejemplo (puedes reemplazar por tus rutas reales)
app.get('/api', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.get('/', (req, res) => {
  res.send('Backend de Control de Gastos funcionando');
});

// Requiere y usa las rutas reales
const ingresosRoutes = require('./routes/ingresos');
const gastosFijosRoutes = require('./routes/gastosFijos');
const semanasRoutes = require('./routes/semanas');
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/gastos-fijos', gastosFijosRoutes);
app.use('/api/semanas', semanasRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
