import { state } from '../state.js';

export function renderDashboard() {
    // Si es maestro, mostrar dashboard personalizado
    if (state.user.role === 'maestro') {
        return renderMaestroDashboard();
    }
    
    // Dashboard de administrador
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

/**
 * Dashboard personalizado para maestros
 */
function renderMaestroDashboard() {
    // Obtener datos del maestro actual
    const maestro = state.maestros.find(m => m.email === state.user.email);
    
    if (!maestro) {
        return `
            <div class="view-header">
                <h2>Panel de Control</h2>
                <p>Bienvenido, ${state.user.nombre}</p>
            </div>
            <div class="empty-state">
                <i data-lucide="alert-circle" style="width: 64px; height: 64px;"></i>
                <h3>Perfil incompleto</h3>
                <p>No se encontró tu registro de maestro. Por favor contacta al administrador.</p>
            </div>
        `;
    }
    
    // Filtrar solo los horarios de este maestro
    const misHorarios = state.horarios.filter(h => h.maestro_id === maestro.id);
    
    // Calcular horas totales asignadas
    const totalHorasAsignadas = misHorarios.reduce((total, h) => {
        const inicio = h.hora_inicio.split(':');
        const fin = h.hora_fin.split(':');
        const duracion = (parseInt(fin[0]) * 60 + parseInt(fin[1])) - (parseInt(inicio[0]) * 60 + parseInt(inicio[1]));
        return total + (duracion / 60);
    }, 0);
    
    // Contar materias únicas que imparte
    const materiasUnicas = [...new Set(misHorarios.map(h => h.asignatura_id))];
    
    // Días con clases
    const diasDisponibles = Array.isArray(maestro.dias_disponibles) ? maestro.dias_disponibles : [];
    
    // Próximas clases (ordenadas por día y hora)
    const diasOrden = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5 };
    const proximasClases = misHorarios
        .sort((a, b) => {
            const diaComp = diasOrden[a.dia] - diasOrden[b.dia];
            if (diaComp !== 0) return diaComp;
            return a.hora_inicio.localeCompare(b.hora_inicio);
        })
        .slice(0, 5);
    
    // Tarjetas de estadísticas
    const statsHtml = `
        <div class="card dashboard-stat-card">
            <div class="card-header">
                <div class="stat-card-header">
                    <h3 class="stat-card-title">Clases Asignadas</h3>
                    <div class="icon-wrapper bg-uas-blue">
                        <i data-lucide="calendar-check" class="text-white"></i>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="stat-card-value">${misHorarios.length}</div>
            </div>
        </div>
        <div class="card dashboard-stat-card">
            <div class="card-header">
                <div class="stat-card-header">
                    <h3 class="stat-card-title">Horas Semanales</h3>
                    <div class="icon-wrapper bg-uas-gold">
                        <i data-lucide="clock" class="text-uas-blue"></i>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="stat-card-value">${totalHorasAsignadas.toFixed(1)}h</div>
            </div>
        </div>
        <div class="card dashboard-stat-card">
            <div class="card-header">
                <div class="stat-card-header">
                    <h3 class="stat-card-title">Materias</h3>
                    <div class="icon-wrapper bg-uas-blue-light">
                        <i data-lucide="book-open" class="text-white"></i>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="stat-card-value">${materiasUnicas.length}</div>
            </div>
        </div>
        <div class="card dashboard-stat-card">
            <div class="card-header">
                <div class="stat-card-header">
                    <h3 class="stat-card-title">Días Disponibles</h3>
                    <div class="icon-wrapper bg-uas-gold-dark">
                        <i data-lucide="calendar-days" class="text-white"></i>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="stat-card-value">${diasDisponibles.length}/5</div>
            </div>
        </div>
    `;
    
    // Mis próximas clases
    const proximasClasesHtml = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Mis Próximas Clases</h3>
            </div>
            <div class="card-content">
                ${proximasClases.length > 0 ? `
                    <div class="summary-list">
                        ${proximasClases.map(h => {
                            const asignatura = state.asignaturas.find(a => a.id === h.asignatura_id);
                            const aula = state.aulas.find(a => a.id === h.aula_id);
                            return `
                                <div class="summary-item" style="flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                                    <div style="display: flex; justify-content: space-between; width: 100%;">
                                        <strong>${h.dia}</strong>
                                        <span class="summary-value">${h.hora_inicio} - ${h.hora_fin}</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: var(--muted-foreground);">
                                        ${asignatura?.nombre || 'N/A'} - ${aula?.nombre || 'N/A'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <p style="text-align: center; color: var(--muted-foreground); padding: 1rem;">
                        No tienes clases asignadas todavía
                    </p>
                `}
            </div>
        </div>
    `;
    
    // Accesos rápidos para maestros
    const accesosRapidosHtml = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Accesos Rápidos</h3>
            </div>
            <div class="card-content quick-access-list">
                <button class="quick-access-btn bg-uas-blue" data-quick-action="mi-perfil">
                    <i data-lucide="user-circle"></i> Editar Mi Perfil
                </button>
                <button class="quick-access-btn bg-uas-gold text-uas-blue" data-quick-action="horarios">
                    <i data-lucide="calendar"></i> Ver Mi Calendario
                </button>
                <button class="quick-access-btn bg-uas-blue-light" data-quick-action="reportes">
                    <i data-lucide="file-text"></i> Generar Mi Reporte
                </button>
            </div>
        </div>
    `;
    
    return `
        <div class="view-header">
            <div>
                <h2>Mi Panel de Control</h2>
                <p>Bienvenido, ${maestro.nombre}</p>
            </div>
        </div>
        <div class="grid-container grid-cols-4 lg-grid-cols-4 dashboard-stats-grid">
            ${statsHtml}
        </div>
        <div class="grid-container grid-cols-2 lg-grid-cols-2 dashboard-summary-grid">
            ${proximasClasesHtml}
            ${accesosRapidosHtml}
        </div>
    `;
}