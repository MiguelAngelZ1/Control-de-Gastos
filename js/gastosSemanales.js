// Contenido de gastosSemanales.js (se completará con contenido real luego)
document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('gastosSemanalesContainer');
  if (!container) return;

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

  function renderSemanas() {
    container.innerHTML = '';
    const presupuesto = getPresupuestoSemanal();
    for (let i = 0; i < 4; i++) {
      const gastosSemana = gastosSem[i] || [];
      const gastado = gastosSemana.reduce((acc, g) => acc + Number(g.monto), 0);
      const porcentaje = presupuesto ? Math.max(0, Math.min(100, 100 - (gastado / presupuesto) * 100)) : 0;
      let color = 'green';
      if (porcentaje < 60) color = 'yellow';
      if (porcentaje < 30) color = 'red';
      container.innerHTML += `
        <div class="semana-bar-container">
          <span class="semana-bar-label">Semana ${i+1}</span>
          <div class="semana-bar-bg">
            <div class="semana-bar-fill ${color}" style="width:${100 - porcentaje}%;">
              $${gastado.toLocaleString('es-AR', {minimumFractionDigits:2})}
            </div>
          </div>
          <button class="btn btn-add" onclick="agregarGastoSemana(${i})"><i class="fa-solid fa-plus"></i> Agregar Gasto</button>
          <ul>
            ${gastosSemana.map(g => `<li>${g.descripcion} - $${Number(g.monto).toLocaleString('es-AR', {minimumFractionDigits:2})} <span style="color:#888;font-size:0.95em;">(${g.fecha})</span></li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  window.agregarGastoSemana = function(idx) {
    const descripcion = prompt('Descripción del gasto:');
    if (!descripcion) return;
    const montoRaw = prompt('Monto:');
    if (!montoRaw) return;
    const monto = parseFloat(montoRaw.replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.'));
    if (isNaN(monto) || monto <= 0) return alert('Monto inválido');
    const fecha = new Date().toISOString().slice(0,10);
    gastosSem[idx] = gastosSem[idx] || [];
    gastosSem[idx].push({ descripcion, monto, fecha });
    localStorage.setItem('gastosSemanales', JSON.stringify(gastosSem));
    renderSemanas();
  };

  renderSemanas();
});
