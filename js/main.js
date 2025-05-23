/* js/main.js */
/*
  Función global para:
  - Inicializar el formato de moneda en todos los inputs con la clase "moneda" usando Cleave.js.
  - Actualizar el resumen financiero global (ingreso, gasto y saldo) verificando que los elementos existan en la página.
*/

document.addEventListener('DOMContentLoaded', function () {
  // Inicializar Cleave.js en todos los inputs con la clase "moneda"
  document.querySelectorAll('.moneda').forEach(function (input) {
    new Cleave(input, {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      prefix: '$',
      noImmediatePrefix: false, // Muestra el prefijo de inmediato
      rawValueTrimPrefix: true,
      delimiter: '.',
      numeralDecimalMark: ',',
      numeralDecimalScale: 2
    });
  });

  // Función para actualizar el resumen financiero
  function updateDashboard() {
    // Recupera el ingreso total almacenado o lo usa como 0 si no existe.
    let ingresoTotal = parseFloat(localStorage.getItem('ingresoTotal')) || 0;
    // Recupera el arreglo de gastos almacenado en localStorage o usa un arreglo vacío.
    let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    // Calcula el total gastado sumando el monto de cada gasto.
    let totalGastado = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);
    let saldoRestante = ingresoTotal - totalGastado;

    // Obtener los elementos del DOM (si es que existen en esta página)
    const ingresoEl = document.getElementById('ingresoTotal');
    const totalGastadoEl = document.getElementById('totalGastado');
    const saldoRestanteEl = document.getElementById('saldoRestante');

    // Actualizar cada elemento solo si existe.
    if (ingresoEl) {
      ingresoEl.innerText =
        '$' + ingresoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (totalGastadoEl) {
      totalGastadoEl.innerText =
        '$' + totalGastado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (saldoRestanteEl) {
      saldoRestanteEl.innerText =
        '$' + saldoRestante.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  // Llamada a updateDashboard() al cargar la página.
  updateDashboard();
});

// MODAL de alerta reutilizable
function showModalAlert(mensaje, tipo = 'info') {
  let modal = document.getElementById('modalAlert');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalAlert';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" id="modalAlertContent">
        <h2 id="modalAlertTitle"></h2>
        <p id="modalAlertMsg"></p>
        <button class="btn btn-add" id="btnCerrarModalAlert">Aceptar</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('modalAlertTitle').innerText = tipo === 'error' ? 'Error' : (tipo === 'success' ? 'Éxito' : 'Aviso');
  document.getElementById('modalAlertMsg').innerText = mensaje;
  modal.style.display = 'flex';
  document.getElementById('btnCerrarModalAlert').onclick = () => {
    modal.style.display = 'none';
  };
  // Cierra modal al hacer click fuera
  modal.onclick = function(event) {
    if (event.target === modal) modal.style.display = 'none';
  };
}