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
        // Eliminar en backend si existe
        const gasto = gastosFijos[idx];
        fetch('http://localhost:3000/api/gastos-fijos', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ descripcion: gasto.descripcion, monto: gasto.monto, estado: gasto.estado })
        })
        .then(() => {
          gastosFijos.splice(idx, 1);
          localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
          renderTabla();
          showModalAlert('Gasto fijo eliminado', 'success');
          if (typeof window.updateDashboard === 'function') window.updateDashboard();
        })
        .catch(() => showModalAlert('No se pudo eliminar el gasto fijo en el backend.', 'error'));
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
    // Si es edición, solo local, si es nuevo, enviar al backend
    if (idx !== null) {
      gastosFijos[idx] = { descripcion, monto: parseFloat(monto), estado };
      form.removeAttribute('data-edit');
      // Aquí podrías agregar lógica para actualizar en backend si lo deseas
    } else {
      // Guardar en backend
      fetch('http://localhost:3000/api/gastos-fijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, monto: parseFloat(monto), observaciones: '', estado })
      })
      .then(res => res.json())
      .then(gasto => {
        gastosFijos.push({ descripcion: gasto.descripcion, monto: gasto.monto, estado: gasto.estado });
        localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
        renderTabla();
        form.reset();
        document.getElementById('modalGastoFijo').style.display = 'none';
        // Actualizar dashboard
        if (typeof window.updateDashboard === 'function') window.updateDashboard();
      })
      .catch(() => showModalAlert('No se pudo guardar el gasto fijo en el backend.', 'error'));
      return;
    }
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    renderTabla();
    form.reset();
    document.getElementById('modalGastoFijo').style.display = 'none';
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
  };

  // Botón para limpiar solo la tabla de gastos fijos
  let btnLimpiarFijos = document.getElementById('btnLimpiarGastosFijos');
  if (!btnLimpiarFijos) {
    btnLimpiarFijos = document.createElement('button');
    btnLimpiarFijos.id = 'btnLimpiarGastosFijos';
    btnLimpiarFijos.className = 'btn btn-clear';
    btnLimpiarFijos.innerHTML = '<i class="fa-solid fa-eraser"></i> Limpiar Gastos Fijos';
    tabla.parentElement.insertBefore(btnLimpiarFijos, tabla);
  }
  btnLimpiarFijos.onclick = function() {
    showModalConfirm('¿Seguro que deseas borrar todos los gastos fijos?', function(confirmado) {
      if (confirmado) {
        // Llamar al backend para eliminar todos los gastos fijos
        fetch('http://localhost:3000/api/gastos-fijos', { method: 'DELETE' })
          .then(response => {
            if (!response.ok) throw new Error('Error al limpiar gastos fijos en el backend');
            gastosFijos = [];
            localStorage.setItem('gastosFijos', '[]');
            renderTabla();
            showModalAlert('Todos los gastos fijos han sido eliminados.', 'success');
          })
          .catch(() => showModalAlert('No se pudo limpiar los gastos fijos en el backend.', 'error'));
      }
    });
  };

  // Sincronizar gastos fijos con backend al cargar la página
  fetch('http://localhost:3000/api/gastos-fijos')
    .then(res => res.json())
    .then(data => {
      gastosFijos = data.map(g => ({ descripcion: g.descripcion, monto: g.monto, estado: g.estado }));
      localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
      renderTabla();
    })
    .catch(() => {/* Si falla, usar localStorage */});

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
