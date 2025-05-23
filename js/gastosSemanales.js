// Contenido de gastosSemanales.js (se completará con contenido real luego)
document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('gastosSemanalesContainer');
  if (!container) return;

  // Asegura que API_BASE_URL esté disponible globalmente
  if (typeof API_BASE_URL === 'undefined') {
    if (window.API_BASE_URL) {
      var API_BASE_URL = window.API_BASE_URL;
    } else if (window.parent && window.parent.API_BASE_URL) {
      var API_BASE_URL = window.parent.API_BASE_URL;
    } else {
      throw new Error('API_BASE_URL no está definida. Asegúrate de incluir config.js antes que gastosSemanales.js');
    }
  }

  // Calcula el presupuesto restante después de gastos fijos
  function getPresupuestoSemanal() {
    const ingresoTotal = parseFloat(localStorage.getItem('ingresoTotal')) || 0;
    const gastosFijos = JSON.parse(localStorage.getItem('gastosFijos')) || [];
    const totalFijos = gastosFijos.reduce((acc, g) => acc + Number(g.monto), 0);
    const restante = ingresoTotal - totalFijos;
    return Math.max(0, restante / 4);
  }

  // Cargar gastos semanales
  let gastosSem = JSON.parse(localStorage.getItem('gastosSemanales')) || [[],[],[],[]];

  const btnPresupuesto = document.getElementById('btnPresupuestoSemanal');
  const saldoDisponibleSpan = document.getElementById('saldoDisponibleSemanal');

  function getSaldoRestante() {
    const ingresoTotal = parseFloat(localStorage.getItem('ingresoTotal')) || 0;
    const gastosFijos = JSON.parse(localStorage.getItem('gastosFijos')) || [];
    const totalFijos = gastosFijos.reduce((acc, g) => acc + Number(g.monto), 0);
    return Math.max(0, ingresoTotal - totalFijos);
  }

  function mostrarSaldoDisponible() {
    const saldo = getSaldoRestante();
    saldoDisponibleSpan.innerText = saldo > 0 ? `Saldo disponible: $${saldo.toLocaleString('es-AR', {minimumFractionDigits:2})}` : '';
  }

  if (btnPresupuesto) {
    btnPresupuesto.onclick = function() {
      const saldo = getSaldoRestante();
      if (saldo <= 0) {
        showModalAlert('No hay saldo disponible para dividir en semanas.', 'error');
        return;
      }
      showModalPrompt('¿Cuánto presupuesto deseas dividir en 4 semanas?', saldo, function(valor) {
        if (!valor) return;
        const monto = parseFloat(valor.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.'));
        if (isNaN(monto) || monto <= 0) {
          showModalAlert('Monto inválido', 'error');
          return;
        }
        if (monto > saldo) {
          showModalAlert('No puedes asignar más que el saldo disponible.', 'error');
          return;
        }
        // Divide en 4 partes iguales
        const partes = [1,2,3,4].map(()=>Number((monto/4).toFixed(2)));
        localStorage.setItem('presupuestoSemanal', JSON.stringify({total: monto, partes}));
        showModalAlert('Presupuesto semanal cargado y dividido en 4 partes iguales.', 'success');
        renderSemanas();
        mostrarSaldoDisponible();
      });
    };
    mostrarSaldoDisponible();
  }

  window.agregarGastoSemana = function(idx) {
    showModalGastoSemana(function(data) {
      if (!data) return;
      const { descripcion, monto } = data;
      const montoNum = parseFloat(monto.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.'));
      if (!descripcion || isNaN(montoNum) || montoNum <= 0) {
        showModalAlert('Datos inválidos para el gasto semanal', 'error');
        return;
      }
      const fecha = new Date().toISOString().slice(0,10);
      // Guardar en backend
      fetch(`${API_BASE_URL}/semanas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semana: idx+1, descripcion, monto: montoNum, fecha })
      })
      .then(res => res.json())
      .then(gasto => {
        gastosSem[idx] = gastosSem[idx] || [];
        gastosSem[idx].push({ descripcion: gasto.descripcion, monto: gasto.monto, fecha: gasto.fecha });
        localStorage.setItem('gastosSemanales', JSON.stringify(gastosSem));
        renderSemanas();
        showModalAlert('Gasto semanal agregado correctamente', 'success');
      })
      .catch(() => showModalAlert('No se pudo guardar el gasto semanal en el backend.', 'error'));
    });
  };

  // Modal único para agregar gasto semanal (con formato de moneda)
  function showModalGastoSemana(callback) {
    let modal = document.getElementById('modalGastoSemana');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalGastoSemana';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h2>Agregar Gasto Semanal</h2>
          <label>Descripción</label>
          <input type="text" id="inputDescGastoSemana" placeholder="Ej: Supermercado" autocomplete="off" />
          <label>Monto</label>
          <input type="text" id="inputMontoGastoSemana" class="moneda" placeholder="$0" autocomplete="off" />
          <div style="text-align:right; margin-top:1.2rem;">
            <button class="btn btn-add" id="btnAceptarGastoSemana">Agregar</button>
            <button class="btn btn-clear" id="btnCancelarGastoSemana">Cancelar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    // Formato de moneda en el input
    setTimeout(() => {
      if (window.Cleave) new Cleave('#inputMontoGastoSemana', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        prefix: '$',
        noImmediatePrefix: false,
        rawValueTrimPrefix: true,
        delimiter: '.',
        numeralDecimalMark: ',',
        numeralDecimalScale: 2
      });
    }, 50);
    modal.style.display = 'flex';
    document.getElementById('inputDescGastoSemana').focus();
    document.getElementById('btnAceptarGastoSemana').onclick = () => {
      const descripcion = document.getElementById('inputDescGastoSemana').value.trim();
      const monto = document.getElementById('inputMontoGastoSemana').value.trim();
      modal.style.display = 'none';
      callback({ descripcion, monto });
    };
    document.getElementById('btnCancelarGastoSemana').onclick = () => {
      modal.style.display = 'none';
      callback(null);
    };
    modal.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
        callback(null);
      }
    };
  }

  // En renderSemanas(), usar presupuestoSemanal si existe
  function renderSemanas() {
    container.innerHTML = '';
    let presupuesto = getPresupuestoSemanal();
    const presupuestoObj = JSON.parse(localStorage.getItem('presupuestoSemanal'));
    if (presupuestoObj && presupuestoObj.partes) {
      presupuesto = presupuestoObj.partes[0];
    }
    for (let i = 0; i < 4; i++) {
      const gastosSemana = gastosSem[i] || [];
      const gastado = gastosSemana.reduce((acc, g) => acc + Number(g.monto), 0);
      const restante = Math.max(0, presupuesto - gastado);
      // Porcentaje gastado respecto al presupuesto semanal
      const porcentajeGastado = presupuesto ? Math.min(100, (gastado / presupuesto) * 100) : 0;
      const porcentajeBarra = 100 - porcentajeGastado;
      let color = 'green';
      if (porcentajeBarra <= 20) color = 'red';
      else if (porcentajeBarra <= 50) color = 'yellow';
      else if (porcentajeBarra <= 70) color = 'orange';
      else color = 'green';
      container.innerHTML += `
        <div class="semana-bar-container">
          <span class="semana-bar-label">Semana ${i+1}</span>
          <div class="semana-bar-bg">
            <div class="semana-bar-fill ${color}" style="width:${porcentajeBarra}%">
              <span class="presupuesto-barra">$${presupuesto.toLocaleString('es-AR', {minimumFractionDigits:2})}</span>
            </div>
          </div>
          <div class="semana-bar-info">
            <span class="gastado-info">Gastado: <b>$${gastado.toLocaleString('es-AR', {minimumFractionDigits:2})}</b></span>
            <span class="restante-info">Restante: <b>$${restante.toLocaleString('es-AR', {minimumFractionDigits:2})}</b></span>
          </div>
          <button class="btn btn-add" onclick="agregarGastoSemana(${i})"><i class="fa-solid fa-plus"></i> Agregar Gasto</button>
          <ul>
            ${gastosSemana.map((g, idx) => `<li>${g.descripcion} - $${Number(g.monto).toLocaleString('es-AR', {minimumFractionDigits:2})} <span style=\"color:#888;font-size:0.95em;\">(${g.fecha})</span> <button class='btn btn-clear btn-sm' title='Eliminar' onclick='eliminarGastoSemana(${i},${idx})'><i class='fa-solid fa-trash'></i></button></li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  window.eliminarGastoSemana = function(semanaIdx, gastoIdx) {
    showModalConfirm('¿Eliminar este gasto de la semana?', function(ok) {
      if (ok) {
        const gasto = gastosSem[semanaIdx][gastoIdx];
        // Eliminar en backend
        fetch(`${API_BASE_URL}/semanas`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ semana: semanaIdx+1, descripcion: gasto.descripcion, monto: gasto.monto, fecha: gasto.fecha })
        })
        .then(() => {
          gastosSem[semanaIdx].splice(gastoIdx, 1);
          localStorage.setItem('gastosSemanales', JSON.stringify(gastosSem));
          renderSemanas();
          showModalAlert('Gasto eliminado', 'success');
        })
        .catch(() => showModalAlert('No se pudo eliminar el gasto semanal en el backend.', 'error'));
      }
    });
  };

  // Sincronizar gastos semanales con backend al cargar la página
  fetch(`${API_BASE_URL}/semanas`)
    .then(res => res.json())
    .then(data => {
      // Agrupar por semana (1-4)
      gastosSem = [[],[],[],[]];
      data.forEach(g => {
        const idx = (g.semana || 1) - 1;
        if (gastosSem[idx]) gastosSem[idx].push({ descripcion: g.descripcion, monto: g.monto, fecha: g.fecha });
      });
      localStorage.setItem('gastosSemanales', JSON.stringify(gastosSem));
      renderSemanas();
    })
    .catch(() => {/* Si falla, usar localStorage */});

  // Formato de moneda en todos los inputs de modales al mostrarse
  function aplicarFormatoMonedaModales() {
    document.querySelectorAll('.modal input.moneda').forEach(function (input) {
      if (!input.cleave) {
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
      }
    });
  }
  document.addEventListener('click', aplicarFormatoMonedaModales);

  renderSemanas();
});
