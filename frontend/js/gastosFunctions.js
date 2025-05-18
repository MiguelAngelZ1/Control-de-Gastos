// Asegúrate de tener API_BASE_URL definido en config.js

async function cargarGastosFijos() {
  const res = await fetch(`${API_BASE_URL}/gastos-fijos`);
  return await res.json();
}

async function agregarGastoFijo(gasto) {
  const res = await fetch(`${API_BASE_URL}/gastos-fijos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gasto)
  });
  return await res.json();
}

// Puedes implementar editar y borrar si tienes esos endpoints en el backend

document.addEventListener('DOMContentLoaded', async function () {
  // Formateo de moneda
  document.querySelectorAll('.moneda').forEach(function (input) {
    new Cleave(input, {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      prefix: '$',
      noImmediatePrefix: false,
      rawValueTrimPrefix: true,
      delimiter: '.',
      numeralDecimalMark: ',',
      numeralDecimalScale: 2
    });
  });

  const tabla = document.getElementById('tablaGastosFijos').querySelector('tbody');
  const form = document.getElementById('formGastoFijo');

  async function renderTabla() {
    const gastosFijos = await cargarGastosFijos();
    tabla.innerHTML = '';
    gastosFijos.forEach((g, idx) => {
      const icon = g.estado === 'Pagado'
        ? '<span class="estado-icon estado-pagado"><i class="fa-solid fa-circle-check"></i></span>'
        : '<span class="estado-icon estado-pendiente"><i class="fa-solid fa-circle-xmark"></i></span>';
      tabla.innerHTML += `
        <tr>
          <td>${g.descripcion}</td>
          <td>$${Number(g.monto).toLocaleString('es-AR', {minimumFractionDigits:2})}</td>
          <td>${icon} ${g.estado}</td>
          <td>
            <!-- Botones de editar/borrar si implementas en backend -->
          </td>
        </tr>
      `;
    });
  }

  form.onsubmit = async function(e) {
    e.preventDefault();
    const descripcion = document.getElementById('descripcionFijo').value.trim();
    const monto = document.getElementById('montoFijo').value.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const estado = document.getElementById('estadoFijo').value;
    if (!descripcion || !monto || !estado) return;
    await agregarGastoFijo({ descripcion, monto: parseFloat(monto), estado });
    form.reset();
    document.getElementById('modalGastoFijo').style.display = 'none';
    renderTabla();
  };

  renderTabla();
});
