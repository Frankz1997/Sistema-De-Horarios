import { state } from '../state.js';
import { api } from '../api.js';

let tipoReporte = 'maestro'; // Valor inicial
let maestroSeleccionado = '';
let aulaSeleccionada = '';

// --- Funciones Helper ---
function getMaestroNombre(id) {
    const maestro = state.maestros.find(m => m.id === id);
    return maestro?.nombre || 'N/A';
}
function getAsignaturaNombre(id) {
    const asignatura = state.asignaturas.find(a => a.id === id);
    return asignatura ? `${asignatura.codigo} - ${asignatura.nombre}` : 'N/A';
}
function getAulaNombre(id) {
    const aula = state.aulas.find(a => a.id === id);
    return aula ? `${aula.nombre} (${aula.edificio})` : 'N/A';
}

// --- Funciones de Generación de Reporte (HTML para Imprimir) ---

function generarReportePorMaestro(maestroId) {
    const horariosDelMaestro = state.horarios.filter(h => h.maestro_id === maestroId);
    const maestro = state.maestros.find(m => m.id === maestroId);
    if (!maestro) return;

    const contenido = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Horario - ${maestro.nombre}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#333}
        .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #003366;padding-bottom:20px}
        .header h1{color:#003366;margin:0} .header h2{color:#FFB71B;margin:5px 0}
        .info{margin:20px 0;background:#F8F9FA;padding:15px;border-radius:8px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th{background:#003366;color:white;padding:12px;text-align:left;border:1px solid #FFB71B}
        td{padding:10px;border:1px solid #ddd} tr:nth-child(even){background:#F8F9FA}
        .footer{margin-top:30px;text-align:center;color:#666;font-size:12px}
      </style></head><body>
        <div class="header"><h1>Facultad de Informática Mazatlán - UAS</h1><h2>Sistema de Horarios</h2></div>
        <div class="info"><h3 style="color:#003366;margin-top:0;">Horario del Maestro</h3>
          <p><strong>Nombre:</strong> ${maestro.nombre}</p>
          <p><strong>Especialidad:</strong> ${maestro.especialidad}</p>
          <p><strong>Email:</strong> ${maestro.email}</p>
        </div>
        <table><thead><tr><th>Día</th><th>Hora</th><th>Asignatura</th><th>Aula</th></tr></thead><tbody>
          ${horariosDelMaestro.sort((a, b) => {
            const diaA = state.config.diasSemana.indexOf(a.dia);
            const diaB = state.config.diasSemana.indexOf(b.dia);
            if (diaA !== diaB) return diaA - diaB;
            return a.hora_inicio.localeCompare(b.hora_inicio);
          }).map(h => `
            <tr><td>${h.dia}</td><td>${h.hora_inicio} - ${h.hora_fin}</td>
            <td>${getAsignaturaNombre(h.asignatura_id)}</td><td>${getAulaNombre(h.aula_id)}</td></tr>
          `).join('')}
        </tbody></table>
        <div class="footer"><p>Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
      </body></html>`;

    const ventana = window.open('', '_blank');
    if (ventana) {
        ventana.document.write(contenido);
        ventana.document.close();
        setTimeout(() => ventana.print(), 500);
    }
}

function generarReportePorAula(aulaId) {
    const horariosDelAula = state.horarios.filter(h => h.aula_id === aulaId);
    const aula = state.aulas.find(a => a.id === aulaId);
    if (!aula) return;

    const contenido = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Horario - ${aula.nombre}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#333}
        .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #004f99;padding-bottom:20px}
        .header h1{color:#003366;margin:0} .header h2{color:#FFB71B;margin:5px 0}
        .info{margin:20px 0;background:#F8F9FA;padding:15px;border-radius:8px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th{background:#004f99;color:white;padding:12px;text-align:left;border:1px solid #FFB71B}
        td{padding:10px;border:1px solid #ddd} tr:nth-child(even){background:#F8F9FA}
        .footer{margin-top:30px;text-align:center;color:#666;font-size:12px}
      </style></head><body>
        <div class="header"><h1>Facultad de Informática Mazatlán - UAS</h1><h2>Sistema de Horarios</h2></div>
        <div class="info"><h3 style="color:#003366;margin-top:0;">Horario del Aula</h3>
          <p><strong>Aula:</strong> ${aula.nombre}</p><p><strong>Edificio:</strong> ${aula.edificio}</p>
          <p><strong>Capacidad:</strong> ${aula.capacidad} personas</p><p><strong>Tipo:</strong> ${aula.tipo}</p>
        </div>
        <table><thead><tr><th>Día</th><th>Hora</th><th>Asignatura</th><th>Maestro</th></tr></thead><tbody>
          ${horariosDelAula.sort((a, b) => {
            const diaA = state.config.diasSemana.indexOf(a.dia);
            const diaB = state.config.diasSemana.indexOf(b.dia);
            if (diaA !== diaB) return diaA - diaB;
            return a.hora_inicio.localeCompare(b.hora_inicio);
          }).map(h => `
            <tr><td>${h.dia}</td><td>${h.hora_inicio} - ${h.hora_fin}</td>
            <td>${getAsignaturaNombre(h.asignatura_id)}</td><td>${getMaestroNombre(h.maestro_id)}</td></tr>
          `).join('')}
        </tbody></table>
        <div class="footer"><p>Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
      </body></html>`;

    const ventana = window.open('', '_blank');
    if (ventana) {
        ventana.document.write(contenido);
        ventana.document.close();
        setTimeout(() => ventana.print(), 500);
    }
}

// --- Renderizado de la Vista ---

export function renderReportes() {
    const isAdmin = state.user.role === 'administrador';

    // Opciones para los selectores
    const maestroOptions = state.maestros.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
    const aulaOptions = state.aulas.map(a => `<option value="${a.id}">${a.nombre} - ${a.edificio}</option>`).join('');

    // HTML condicional para los selectores según el rol
    let selectorsHtml = '';
    if (isAdmin) {
        selectorsHtml = `
            <div class="form-group">
              <label>Tipo de Reporte</label>
              <div class="report-type-options">
                <button class="report-type-btn ${tipoReporte === 'maestro' ? 'active' : ''}" data-tipo="maestro">
                  <i data-lucide="user"></i> Por Maestro
                </button>
                <button class="report-type-btn ${tipoReporte === 'aula' ? 'active' : ''}" data-tipo="aula">
                  <i data-lucide="building-2"></i> Por Aula
                </button>
              </div>
            </div>

            <div id="selector-maestro" class="form-group ${tipoReporte === 'maestro' ? '' : 'hidden'}">
              <label for="maestro-select">Selecciona Maestro</label>
              <select id="maestro-select">
                <option value="">Selecciona un maestro</option>
                ${maestroOptions}
              </select>
            </div>

            <div id="selector-aula" class="form-group ${tipoReporte === 'aula' ? '' : 'hidden'}">
              <label for="aula-select">Selecciona Aula</label>
              <select id="aula-select">
                <option value="">Selecciona un aula</option>
                ${aulaOptions}
              </select>
            </div>
        `;
    } else { // Si es maestro
        tipoReporte = 'maestro'; // Forzar tipo maestro
        const maestroActual = state.maestros.find(m => m.email === state.user.email);
        maestroSeleccionado = maestroActual?.id || ''; // Preseleccionar su propio ID
        
        selectorsHtml = `
            <div class="info-card" style="background: var(--info-light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="margin: 0; color: var(--info); font-size: 0.9rem;">
                    <i data-lucide="info" style="width: 16px; height: 16px; vertical-align: middle;"></i>
                    Solo puedes generar tu propio reporte de horarios
                </p>
            </div>
            <div class="form-group">
                <label>Tu Horario</label>
                <div style="background: var(--background); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
                    <p style="margin: 0; font-weight: 500; color: var(--foreground);">
                        ${maestroActual?.nombre || 'Maestro'}
                    </p>
                    <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--muted-foreground);">
                        ${maestroActual?.especialidad || 'Sin especialidad'}
                    </p>
                </div>
                <input type="hidden" id="maestro-select" value="${maestroSeleccionado}">
            </div>
        `;
    }

    const titulo = isAdmin ? 'Reportes' : 'Mi Reporte de Horarios';
    const descripcion = isAdmin ? 'Genera e imprime reportes de horarios.' : 'Consulta y genera tu reporte de horarios.';
    
    return `
        <div class="view-header">
            <div>
                <h2>${titulo}</h2>
                <p>${descripcion}</p>
            </div>
        </div>
        <div class="grid-container grid-cols-3 lg-grid-cols-3">
            <div class="card lg-col-span-1 report-config-card">
                <div class="card-header bg-blue">
                    <h3 class="card-title text-white"><i data-lucide="file-text"></i> Configurar Reporte</h3>
                </div>
                <div class="card-content">
                    ${selectorsHtml}
                    <button id="generate-report-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                        <i data-lucide="printer"></i> Generar e Imprimir
                    </button>
                </div>
            </div>
            <div class="card lg-col-span-2 report-preview-card">
                 <div class="card-header report-preview-header">
                    <h3 class="card-title text-blue"><i data-lucide="calendar"></i> Vista Previa</h3>
                </div>
                <div class="card-content">
                    <div id="report-preview" class="report-preview-area">
                        ${renderPreview()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Renderizado de la Vista Previa ---

function renderPreview() {
    if (tipoReporte === 'maestro' && maestroSeleccionado) {
        const maestro = state.maestros.find(m => m.id === maestroSeleccionado);
        if (!maestro) return '<p class="text-center text-muted">Selecciona un maestro válido.</p>';
        const horarios = state.horarios.filter(h => h.maestro_id === maestroSeleccionado)
            .sort((a, b) => state.config.diasSemana.indexOf(a.dia) - state.config.diasSemana.indexOf(b.dia) || a.hora_inicio.localeCompare(b.hora_inicio));

        return `
            <h3 class="preview-title">Horario de ${maestro.nombre}</h3>
            ${horarios.length === 0 ? '<p class="text-center text-muted">No hay horarios asignados para este maestro.</p>' :
            `<div class="preview-list">
                ${horarios.map(h => `
                    <div class="preview-item">
                        <div><strong>Día:</strong> ${h.dia}</div>
                        <div><strong>Hora:</strong> ${h.hora_inicio} - ${h.hora_fin}</div>
                        <div><strong>Asignatura:</strong> ${getAsignaturaNombre(h.asignatura_id)}</div>
                        <div><strong>Aula:</strong> ${getAulaNombre(h.aula_id)}</div>
                    </div>
                `).join('')}
            </div>`
            }`;
    } else if (tipoReporte === 'aula' && aulaSeleccionada) {
        const aula = state.aulas.find(a => a.id === aulaSeleccionada);
        if (!aula) return '<p class="text-center text-muted">Selecciona un aula válida.</p>';
        const horarios = state.horarios.filter(h => h.aula_id === aulaSeleccionada)
            .sort((a, b) => state.config.diasSemana.indexOf(a.dia) - state.config.diasSemana.indexOf(b.dia) || a.hora_inicio.localeCompare(b.hora_inicio));
        
        return `
            <h3 class="preview-title">Horario del Aula ${aula.nombre} (${aula.edificio})</h3>
             ${horarios.length === 0 ? '<p class="text-center text-muted">No hay horarios asignados para esta aula.</p>' :
            `<div class="preview-list">
                ${horarios.map(h => `
                    <div class="preview-item">
                        <div><strong>Día:</strong> ${h.dia}</div>
                        <div><strong>Hora:</strong> ${h.hora_inicio} - ${h.hora_fin}</div>
                        <div><strong>Asignatura:</strong> ${getAsignaturaNombre(h.asignatura_id)}</div>
                        <div><strong>Maestro:</strong> ${getMaestroNombre(h.maestro_id)}</div>
                    </div>
                `).join('')}
            </div>`
            }`;
    } else {
        return '<p class="text-center text-muted">Selecciona las opciones para ver la vista previa.</p>';
    }
}

// --- Manejadores de Eventos ---

function handleTipoChange(nuevoTipo) {
    tipoReporte = nuevoTipo;
    maestroSeleccionado = '';
    aulaSeleccionada = '';
    // Re-renderizar solo la parte de configuración y vista previa
    document.querySelector('.report-config-card .card-content').innerHTML = renderConfigContent();
    document.getElementById('report-preview').innerHTML = renderPreview();
    lucide.createIcons(); // Re-crear iconos en el contenido actualizado
}

function handleSelectionChange(event) {
    if (event.target.id === 'maestro-select') {
        maestroSeleccionado = event.target.value;
    } else if (event.target.id === 'aula-select') {
        aulaSeleccionada = event.target.value;
    }
    // Re-renderizar solo la vista previa
    document.getElementById('report-preview').innerHTML = renderPreview();
}

function handleGenerateClick() {
    if (tipoReporte === 'maestro' && maestroSeleccionado) {
        generarReportePorMaestro(maestroSeleccionado);
    } else if (tipoReporte === 'aula' && aulaSeleccionada) {
        generarReportePorAula(aulaSeleccionada);
    } else {
        window.showToast.error('Por favor, selecciona un maestro o aula para generar el reporte.');
    }
}

// Función para renderizar solo el contenido de configuración (usado al cambiar tipo)
function renderConfigContent() {
    const isAdmin = state.user.role === 'administrador';
    const maestroOptions = state.maestros.map(m => `<option value="${m.id}" ${maestroSeleccionado === m.id ? 'selected': ''}>${m.nombre}</option>`).join('');
    const aulaOptions = state.aulas.map(a => `<option value="${a.id}" ${aulaSeleccionada === a.id ? 'selected': ''}>${a.nombre} - ${a.edificio}</option>`).join('');
    let selectorsHtml = '';

    if (isAdmin) {
         selectorsHtml = `
            <div class="form-group">
              <label>Tipo de Reporte</label>
              <div class="report-type-options">
                <button class="report-type-btn ${tipoReporte === 'maestro' ? 'active' : ''}" data-tipo="maestro">
                  <i data-lucide="user"></i> Por Maestro
                </button>
                <button class="report-type-btn ${tipoReporte === 'aula' ? 'active' : ''}" data-tipo="aula">
                  <i data-lucide="building-2"></i> Por Aula
                </button>
              </div>
            </div>
            <div id="selector-maestro" class="form-group ${tipoReporte === 'maestro' ? '' : 'hidden'}">
              <label for="maestro-select">Selecciona Maestro</label>
              <select id="maestro-select">
                <option value="">Selecciona un maestro</option>
                ${maestroOptions}
              </select>
            </div>
            <div id="selector-aula" class="form-group ${tipoReporte === 'aula' ? '' : 'hidden'}">
              <label for="aula-select">Selecciona Aula</label>
              <select id="aula-select">
                <option value="">Selecciona un aula</option>
                ${aulaOptions}
              </select>
            </div>
        `;
    } else {
         maestroSeleccionado = state.maestros.find(m => m.email === state.user.email)?.id || '';
         selectorsHtml = `
            <div class="form-group">
                <label>Tipo de Reporte</label>
                <div class="report-type-options">
                    <button class="report-type-btn active" data-tipo="maestro">
                        <i data-lucide="user"></i> Tu Horario
                    </button>
                </div>
                <input type="hidden" id="maestro-select" value="${maestroSeleccionado}">
            </div>
        `;
    }

     return `
        ${selectorsHtml}
        <button id="generate-report-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
            <i data-lucide="printer"></i> Generar e Imprimir
        </button>
    `;
}


// --- Exportar los handlers para usarlos en main.js ---
// (Estos se llamarán desde el event listener central en main.js)
export function handleReportesClick(e) {
    if (e.target.closest('.report-type-btn')) {
        handleTipoChange(e.target.closest('.report-type-btn').dataset.tipo);
    }
    if (e.target.id === 'generate-report-btn') {
        handleGenerateClick();
    }
}
export function handleReportesChange(e) {
     if (e.target.id === 'maestro-select' || e.target.id === 'aula-select') {
        handleSelectionChange(e);
    }
}