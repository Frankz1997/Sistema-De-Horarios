import { state } from '../state.js';

export function renderDashboard() {
    const stats = {
        maestros: state.maestros.length,
        asignaturas: state.asignaturas.length,
        aulas: state.aulas.length,
        horarios: state.horarios.length
    };

    const cards = [
        { title: 'Maestros', value: stats.maestros, icon: 'users', colorClass: 'bg-uas-blue', show: state.user.role === 'administrador', action: 'maestros' },
        { title: 'Asignaturas', value: stats.asignaturas, icon: 'book-open', colorClass: 'bg-uas-gold', show: state.user.role === 'administrador', action: 'asignaturas' },
        { title: 'Aulas', value: stats.aulas, icon: 'building-2', colorClass: 'bg-uas-blue-light', show: state.user.role === 'administrador', action: 'aulas' },
        { title: 'Horarios Asignados', value: stats.horarios, icon: 'calendar', colorClass: 'bg-uas-gold-dark', show: true, action: 'horarios' },
    ];

    const statsCardsHtml = cards.filter(c => c.show).map(card => `
        <div class="card dashboard-stat-card" data-card-action="${card.action}" style="cursor: pointer;">
            <div class="card-header">
                <div class="stat-card-header">
                    <h3 class="stat-card-title">${card.title}</h3>
                    <div class="icon-wrapper ${card.colorClass}">
                        <i data-lucide="${card.icon}" class="${card.colorClass === 'bg-uas-gold' ? 'text-uas-blue' : 'text-white'}"></i>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="stat-card-value">${card.value}</div>
            </div>
        </div>
    `).join('');

    const resumenSemanalHtml = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Resumen Semanal</h3>
            </div>
            <div class="card-content">
                <div class="summary-list">
                    ${state.config.diasSemana.map(dia => {
                        const clasesDelDia = state.horarios.filter(h => h.dia === dia).length;
                        return `<div class="summary-item"><span>${dia}</span><span class="summary-value">${clasesDelDia} ${clasesDelDia === 1 ? 'clase' : 'clases'}</span></div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    let accesosRapidosHtml = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Accesos Rápidos</h3>
            </div>
            <div class="card-content quick-access-list">
                <button class="quick-access-btn bg-uas-blue" data-quick-action="horarios"><i data-lucide="calendar"></i> Ver Calendario de Horarios</button>
    `;
    
    if (state.user.role === 'administrador') {
        accesosRapidosHtml += `
                <button class="quick-access-btn bg-uas-gold text-uas-blue" data-quick-action="maestros"><i data-lucide="users"></i> Gestionar Maestros</button>
                <button class="quick-access-btn bg-uas-blue-light" data-quick-action="asignaturas"><i data-lucide="book-open"></i> Gestionar Asignaturas</button>
        `;
    }
    
    accesosRapidosHtml += `
            </div>
        </div>
    `;

    return `
        <div class="view-header">
          <div>
              <h2>Panel de Control</h2>
              <p>Bienvenido al sistema de gestión de horarios - Facultad de Informática Mazatlán</p>
          </div>
        </div>
        <div class="grid-container grid-cols-4 lg-grid-cols-4 dashboard-stats-grid">
            ${statsCardsHtml}
        </div>
        <div class="grid-container grid-cols-2 lg-grid-cols-2 dashboard-summary-grid">
            ${resumenSemanalHtml}
            ${accesosRapidosHtml}
        </div>
    `;
}