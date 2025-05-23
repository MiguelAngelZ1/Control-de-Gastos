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

// Asegura que API_BASE_URL esté disponible globalmente sin redundancia
if (typeof API_BASE_URL === 'undefined') {
  if (window.API_BASE_URL) {
    window.API_BASE_URL = window.API_BASE_URL;
  } else if (window.parent && window.parent.API_BASE_URL) {
    window.API_BASE_URL = window.parent.API_BASE_URL;
  } else {
    throw new Error('API_BASE_URL no está definida. Asegúrate de incluir config.js antes que main.js');
  }
}

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

// 1. Validación visual en formularios de ingreso
function marcarInputError(input, mensaje) {
  input.classList.add('input-error');
  let msg = input.parentElement.querySelector('.input-error-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.className = 'input-error-msg';
    input.parentElement.appendChild(msg);
  }
  msg.innerText = mensaje;
}
function limpiarInputError(input) {
  input.classList.remove('input-error');
  let msg = input.parentElement.querySelector('.input-error-msg');
  if (msg) msg.remove();
}

// 2. Barra de progreso visual en el dashboard
function renderBarraProgresoDashboard() {
  let ingresoTotal = parseFloat(localStorage.getItem('ingresoTotal')) || 0;
  let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
  let totalGastado = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);
  let porcentaje = ingresoTotal > 0 ? Math.min(100, (totalGastado / ingresoTotal) * 100) : 0;
  let barra = document.getElementById('barraProgresoDashboard');
  if (!barra) {
    barra = document.createElement('div');
    barra.id = 'barraProgresoDashboard';
    barra.innerHTML = `<div class="barra-progreso-bg"><div class="barra-progreso-fill"></div></div><span class="barra-progreso-label"></span>`;
    const resumen = document.getElementById('resumen-financiero');
    if (resumen) resumen.appendChild(barra);
  }
  barra.querySelector('.barra-progreso-fill').style.width = porcentaje + '%';
  barra.querySelector('.barra-progreso-label').innerText = `Gasto: ${porcentaje.toFixed(1)}% del ingreso`;
}

// 3. Opción para reiniciar todos los datos
function agregarBotonReiniciar() {
  let btn = document.getElementById('btnReiniciarDatos');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'btnReiniciarDatos';
    btn.className = 'btn btn-clear';
    btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reiniciar Todo';
    const nav = document.querySelector('.main-nav');
    if (nav) nav.appendChild(btn);
  }
  btn.onclick = function() {
    showModalConfirm('¿Seguro que deseas borrar todos los datos? Esta acción no se puede deshacer.', function(ok) {
      if (ok) {
        // Llamar primero al backend para eliminar datos en la base de datos
        fetch(`${API_BASE_URL}/reiniciar-todos`, {
          method: 'DELETE',
        })
        .then(response => {
          if (!response.ok) throw new Error('Error al reiniciar datos en el backend');
          // Si el backend responde OK, limpiar localStorage y recargar
          localStorage.clear();
          showModalAlert('Todos los datos han sido eliminados correctamente.', 'success');
          setTimeout(() => window.location.reload(), 1200);
        })
        .catch(err => {
          showModalAlert('No se pudo reiniciar los datos en el backend. Intenta nuevamente.', 'error');
        });
      }
    });
  };
}

// 4. Mejorar accesibilidad en modales
function mejorarAccesibilidadModales() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
  });
}

// 5. Animaciones suaves para modales y valores
// (Ya hay animación en .modal-content, pero puedes agregar más si lo deseas)

// 6. Exportar datos a CSV
function exportarDatosCSV() {
  let btn = document.getElementById('btnExportarCSV');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'btnExportarCSV';
    btn.className = 'btn btn-nav-main';
    btn.innerHTML = '<i class="fa-solid fa-file-csv"></i> Exportar CSV';
    const nav = document.querySelector('.main-nav');
    if (nav) nav.appendChild(btn);
  }
  btn.onclick = function() {
    let ingresos = parseFloat(localStorage.getItem('ingresoTotal')) || 0;
    let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    let csv = 'Tipo,Descripción,Monto,Fecha\n';
    csv += `Ingreso Total,,${ingresos},\n`;
    gastos.forEach(g => {
      csv += `Gasto,${g.descripcion || ''},${g.monto || 0},${g.fecha || ''}\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'control_gastos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
}

// 7. Historial de movimientos (ingresos y gastos)
function renderHistorialMovimientos() {
  let cont = document.getElementById('historialMovimientos');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'historialMovimientos';
    cont.innerHTML = '<h3>Historial de Movimientos</h3><ul class="historial-list"></ul>';
    const main = document.querySelector('.site-main');
    if (main) main.appendChild(cont);
  }
  let ul = cont.querySelector('.historial-list');
  ul.innerHTML = '';
  let ingresos = parseFloat(localStorage.getItem('ingresoTotal')) || 0;
  let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
  if (ingresos > 0) {
    ul.innerHTML += `<li><span class="historial-tipo ingreso">Ingreso Total</span> <span class="historial-monto">$${ingresos.toLocaleString('es-AR', {minimumFractionDigits:2})}</span></li>`;
  }
  gastos.forEach(g => {
    ul.innerHTML += `<li><span class="historial-tipo gasto">Gasto</span> <span class="historial-desc">${g.descripcion || ''}</span> <span class="historial-monto">$${g.monto || 0}</span> <span class="historial-fecha">${g.fecha || ''}</span></li>`;
  });
}

// 8. Sincronizar dashboard al agregar gastos fijos/semanales
window.addEventListener('storage', function() {
  if (typeof updateDashboard === 'function') updateDashboard();
  if (typeof renderBarraProgresoDashboard === 'function') renderBarraProgresoDashboard();
  if (typeof renderHistorialMovimientos === 'function') renderHistorialMovimientos();
});

// 9. Inicialización de mejoras al cargar
window.addEventListener('DOMContentLoaded', function() {
  agregarBotonReiniciar();
  exportarDatosCSV();
  renderBarraProgresoDashboard();
  renderHistorialMovimientos();
  mejorarAccesibilidadModales();
});