// Contenido de gastosFunctions.js (se completará con contenido real luego)
document.addEventListener('DOMContentLoaded', function () {
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

  // Manejo de gastos fijos en localStorage
  const tabla = document.getElementById('tablaGastosFijos').querySelector('tbody');
  const form = document.getElementById('formGastoFijo');
  let gastosFijos = JSON.parse(localStorage.getItem('gastosFijos')) || [];

  function renderTabla() {
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
            <button class="btn btn-add" onclick="editarGastoFijo(${idx})"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-clear" onclick="borrarGastoFijo(${idx})"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    });
  }

  window.editarGastoFijo = function(idx) {
    const g = gastosFijos[idx];
    document.getElementById('descripcionFijo').value = g.descripcion;
    document.getElementById('montoFijo').value = g.monto;
    document.getElementById('estadoFijo').value = g.estado;
    document.getElementById('modalGastoFijo').style.display = 'block';
    form.setAttribute('data-edit', idx);
  };

  window.borrarGastoFijo = function(idx) {
    showModalConfirm('¿Seguro que deseas borrar este gasto fijo?', function(confirmado) {
      if (confirmado) {
        gastosFijos.splice(idx, 1);
        localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
        renderTabla();
        showModalAlert('Gasto fijo eliminado', 'success');
      }
    });
  };

  form.onsubmit = function(e) {
    e.preventDefault();
    const descripcion = document.getElementById('descripcionFijo').value.trim();
    const monto = document.getElementById('montoFijo').value.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.');
    const estado = document.getElementById('estadoFijo').value;
    if (!descripcion || !monto || !estado) return;
    const idx = form.getAttribute('data-edit');
    if (idx !== null) {
      gastosFijos[idx] = { descripcion, monto: parseFloat(monto), estado };
      form.removeAttribute('data-edit');
    } else {
      gastosFijos.push({ descripcion, monto: parseFloat(monto), estado });
    }
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    renderTabla();
    form.reset();
    document.getElementById('modalGastoFijo').style.display = 'none';
  };

  // MODAL de confirmación reutilizable
  function showModalConfirm(mensaje, callback) {
    let modal = document.getElementById('modalConfirm');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalConfirm';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h2>Confirmar</h2>
          <p id="modalConfirmMsg"></p>
          <div style="text-align:right; margin-top:1.2rem;">
            <button class="btn btn-add" id="btnAceptarModalConfirm">Sí</button>
            <button class="btn btn-clear" id="btnCancelarModalConfirm">No</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    document.getElementById('modalConfirmMsg').innerText = mensaje;
    modal.style.display = 'flex';
    document.getElementById('btnAceptarModalConfirm').onclick = () => {
      modal.style.display = 'none';
      callback(true);
    };
    document.getElementById('btnCancelarModalConfirm').onclick = () => {
      modal.style.display = 'none';
      callback(false);
    };
    modal.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
        callback(false);
      }
    };
  }

  renderTabla();
});
