import { state, setEditingItem, loadData, setHorariosViewMode } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal, showConfirmDialog } from '../ui.js';
import { renderCurrentView } from '../main.js';

// --- Función para toggle del acordeón ---
export function toggleDiaAccordion(dia) {
    const section = document.querySelector(`.dia-section[data-dia="${dia}"]`);
    const content = document.getElementById(`clases-${dia}`);
    
    if (!section || !content) return;
    
    const isExpanded = section.getAttribute('data-expanded') === 'true';
    
    if (isExpanded) {
        // Colapsar
        section.setAttribute('data-expanded', 'false');
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        content.style.marginTop = '0';
    } else {
        // Expandir
        section.setAttribute('data-expanded', 'true');
        content.style.maxHeight = '5000px';
        content.style.opacity = '1';
        content.style.marginTop = '1rem';
    }
    
    // Re-renderizar íconos de Lucide después de la animación
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

// Función para auto-expandir el primer día
function autoExpandFirstDay() {
    setTimeout(() => {
        const firstSection = document.querySelector('.dia-section');
        if (firstSection) {
            const dia = firstSection.getAttribute('data-dia');
            toggleDiaAccordion(dia);
        }
    }, 100);
}

// Función para inicializar los event listeners de acordeones
export function initAccordionListeners() {
    // Event delegation para los headers de acordeón
    document.querySelectorAll('.dia-header-accordion').forEach(header => {
        header.addEventListener('click', function() {
            const diaSection = this.closest('.dia-section');
            const dia = diaSection?.getAttribute('data-dia');
            if (dia) {
                toggleDiaAccordion(dia);
            }
        });
    });
    
    // NO auto-expandir ningún día - todo debe iniciar cerrado
}

// --- Funciones de Renderizado ---
export function renderHorarios() {
    // Determinar si el usuario es maestro
    const esMaestro = state.user.role === 'maestro';
    
    // Header diferente según el rol
    const titulo = esMaestro ? 'Mi Horario de Clases' : 'Gestión de Horarios';
    const descripcion = esMaestro ? 'Consulta tu calendario de clases asignadas.' : 'Asigna maestros, materias y aulas en el calendario.';
    
    // Botón de agregar solo para administradores
    const addButton = esMaestro ? '' : '<button id="add-horario-btn" class="btn btn-primary"><i data-lucide="plus"></i>Agregar Horario</button>';
    
    const header = `
        <div class="view-header">
            <div class="view-header-content">
                <div>
                    <h2>${titulo}</h2>
                    <p>${descripcion}</p>
                    <div class="view-toggle">
                        <button id="view-calendario-btn" class="${state.horariosViewMode === 'calendario' ? 'active' : ''}">Calendario</button>
                        <button id="view-lista-btn" class="${state.horariosViewMode === 'lista' ? 'active' : ''}">Lista</button>
                    </div>
                </div>
                ${addButton}
            </div>
        </div>`;

    const viewContent = `<div id="horarios-content-container">${renderHorariosContent()}</div>`;
    return header + viewContent;
}

// Función para renderizar solo el contenido dinámico (calendario o lista)
export function renderHorariosContent() {
    return state.horariosViewMode === 'calendario' ? renderCalendario() : renderLista();
}
function renderCalendario() {
    // Determinar si el usuario es maestro y filtrar horarios
    const esMaestro = state.user.role === 'maestro';
    let horariosAMostrar = state.horarios;
    
    if (esMaestro) {
        // Obtener el ID del maestro actual
        const maestroActual = state.maestros.find(m => m.email === state.user.email);
        if (maestroActual) {
            // Filtrar solo los horarios de este maestro
            horariosAMostrar = state.horarios.filter(h => h.maestro_id === maestroActual.id);
        } else {
            horariosAMostrar = [];
        }
    }
    
    // Obtener configuración de horarios
    const horariosConfig = state.configuracion?.horarios || {
        duracion_bloque: 60,
        hora_inicio: '07:00',
        hora_fin: '21:00',
        intervalo_entre_bloques: 0
    };
    
    // Generar bloques de tiempo según la configuración
    const horas = [];
    const [horaInicio, minutoInicio] = horariosConfig.hora_inicio.split(':').map(Number);
    const [horaFin, minutoFin] = horariosConfig.hora_fin.split(':').map(Number);
    
    const minutosInicio = horaInicio * 60 + minutoInicio;
    const minutosFin = horaFin * 60 + minutoFin;
    const duracionBloque = horariosConfig.duracion_bloque;
    const intervalo = horariosConfig.intervalo_entre_bloques;
    
    for (let minutos = minutosInicio; minutos < minutosFin; minutos += duracionBloque + intervalo) {
        const horas24 = Math.floor(minutos / 60);
        const mins = minutos % 60;
        const horaStr = `${horas24.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        horas.push(horaStr);
    }
    
    const dias = state.config.diasSemana;
    
    console.log('Renderizando calendario con horarios:', horariosAMostrar);
    
    // Función helper para normalizar horas (quitar segundos si existen)
    const normalizeTime = (time) => {
        if (!time) return '';
        return time.substring(0, 5); // Toma solo HH:MM
    };
    
    // Función corregida para obtener horarios por día y hora
    const getHorarios = (dia, hora) => {
        return horariosAMostrar.filter(h => {
            // Verificar que el día coincida
            if (h.dia !== dia) return false;
            
            // Normalizar las horas para comparación
            const horaInicio = normalizeTime(h.hora_inicio);
            const horaFin = normalizeTime(h.hora_fin);
            
            // Comparar las horas como strings en formato HH:MM
            return horaInicio <= hora && horaFin > hora;
        });
    };

    return `
        <div class="calendar-view"><table class="calendar-table">
            <thead><tr>
                <th>Hora</th>
                ${dias.map(dia => `<th>${dia}</th>`).join('')}
            </tr></thead>
            <tbody>
                ${horas.map(hora => `
                    <tr>
                        <td class="calendar-time-col">${hora}</td>
                        ${dias.map(dia => {
                            const horariosEnCelda = getHorarios(dia, hora);
                            // Solo mostrar la tarjeta en la primera celda del horario
                            const horariosAMostrar = horariosEnCelda.filter(h => normalizeTime(h.hora_inicio) === hora);
                            return `<td>${horariosAMostrar.map(h => {
                                const asignatura = state.asignaturas.find(a => a.id === h.asignatura_id);
                                const maestro = state.maestros.find(m => m.id === h.maestro_id);
                                const aula = state.aulas.find(a => a.id === h.aula_id);
                                // Mostrar botones de acción solo para administradores
                                const botonesAccion = esMaestro ? '' : `
                                    <div class="card-actions">
                                        <button class="edit-horario-btn" data-id="${h.id}"><i data-lucide="edit"></i></button>
                                        <button class="delete-horario-btn delete" data-id="${h.id}"><i data-lucide="trash-2"></i></button>
                                    </div>
                                `;
                                return `
                                <div class="horario-card" style="height: ${calculateCardHeight(h.hora_inicio, h.hora_fin)}px">
                                    <div class="asignatura">${asignatura?.nombre || 'N/A'}</div>
                                    <div class="maestro">${maestro?.nombre || 'N/A'}</div>
                                    <div class="aula">${aula?.nombre || 'N/A'}</div>
                                    ${botonesAccion}
                                </div>
                            `}).join('')}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table></div>`;
}
function calculateCardHeight(start, end) {
    // ... (esta función no cambia)
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
    const duration = endMinutes - startMinutes;
    const height = (duration / 60) * 80 - 4;
    return Math.max(height, 40);
}
function renderLista() {
    // Determinar si el usuario es maestro y filtrar horarios
    const esMaestro = state.user.role === 'maestro';
    let horariosAMostrar = state.horarios;
    
    if (esMaestro) {
        const maestroActual = state.maestros.find(m => m.email === state.user.email);
        if (maestroActual) {
            horariosAMostrar = state.horarios.filter(h => h.maestro_id === maestroActual.id);
        } else {
            horariosAMostrar = [];
        }
    }
    
    if (horariosAMostrar.length === 0) {
        return `
            <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                <i data-lucide="calendar-x" style="width: 64px; height: 64px; color: var(--muted-foreground); margin-bottom: 1.5rem;"></i>
                <h3 style="color: var(--foreground); margin: 0 0 0.5rem;">No hay horarios asignados</h3>
                <p style="color: var(--muted-foreground); margin: 0;">
                    ${esMaestro ? 'Aún no tienes clases programadas' : 'Comienza agregando horarios al sistema'}
                </p>
            </div>
        `;
    }
    
    // Agrupar horarios por día
    const horariosPorDia = {};
    state.config.diasSemana.forEach(dia => {
        horariosPorDia[dia] = horariosAMostrar
            .filter(h => h.dia === dia)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    });
    
    return `
        <div class="horarios-lista-container" style="display: flex; flex-direction: column; gap: 1rem;">
            ${state.config.diasSemana.map((dia, index) => {
                const horariosDelDia = horariosPorDia[dia];
                
                if (horariosDelDia.length === 0) return '';
                
                return `
                    <div class="dia-section" data-dia="${dia}">
                        <!-- Header del día (clickeable para expandir/colapsar) -->
                        <div class="dia-header-accordion" 
                             style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: linear-gradient(135deg, var(--uas-blue), var(--uas-blue-light)); border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 51, 102, 0.1); cursor: pointer; transition: all 0.3s ease;"
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0, 51, 102, 0.2)'"
                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0, 51, 102, 0.1)'">
                            
                            <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i data-lucide="calendar" style="width: 20px; height: 20px; color: white;"></i>
                            </div>
                            <div style="flex: 1;">
                                <h3 style="margin: 0; color: white; font-size: 1.1rem; font-weight: 600;">${dia}</h3>
                                <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 0.85rem;">
                                    ${horariosDelDia.length} ${horariosDelDia.length === 1 ? 'clase' : 'clases'} programadas
                                </p>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="background: rgba(255, 255, 255, 0.2); padding: 0.5rem 1rem; border-radius: 20px;">
                                    <span style="color: white; font-weight: 600; font-size: 0.9rem;">${horariosDelDia.length}</span>
                                </div>
                                <div class="accordion-icon" id="accordion-icon-${dia}" style="transition: transform 0.3s ease;">
                                    <i data-lucide="chevron-down" style="width: 24px; height: 24px; color: white;"></i>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Clases del día (colapsable) -->
                        <div class="clases-content" id="clases-${dia}" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease, margin-top 0.3s ease; opacity: 0; margin-top: 0;">
                            <div class="clases-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; padding-top: 1rem;">
                            ${horariosDelDia.map(h => {
                                const asignatura = state.asignaturas.find(a => a.id === h.asignatura_id);
                                const maestro = state.maestros.find(m => m.id === h.maestro_id);
                                const aula = state.aulas.find(a => a.id === h.aula_id);
                                
                                // Calcular duración
                                const inicio = h.hora_inicio.split(':');
                                const fin = h.hora_fin.split(':');
                                const duracionMinutos = (parseInt(fin[0]) * 60 + parseInt(fin[1])) - (parseInt(inicio[0]) * 60 + parseInt(inicio[1]));
                                const duracionHoras = Math.floor(duracionMinutos / 60);
                                const duracionMins = duracionMinutos % 60;
                                const duracionTexto = duracionHoras > 0 
                                    ? `${duracionHoras}h ${duracionMins}min`
                                    : `${duracionMins} min`;
                                
                                // Normalizar horas (quitar segundos)
                                const horaInicioFormato = h.hora_inicio.substring(0, 5);
                                const horaFinFormato = h.hora_fin.substring(0, 5);
                                
                                // Botones de acción solo para administradores
                                const botonesAccion = esMaestro ? '' : `
                                    <div class="clase-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                        <button class="edit-horario-btn btn btn-outline" data-id="${h.id}" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;">
                                            <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                                            Editar
                                        </button>
                                        <button class="delete-horario-btn btn btn-outline" data-id="${h.id}" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; color: var(--destructive); border-color: var(--destructive);">
                                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                                            Eliminar
                                        </button>
                                    </div>
                                `;
                                
                                return `
                                    <div class="clase-card" style="background: var(--card); border: 2px solid var(--border-color); border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; position: relative; overflow: hidden;">
                                        <!-- Barra de color lateral -->
                                        <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(to bottom, var(--uas-blue), var(--uas-gold));"></div>
                                        
                                        <!-- Horario principal -->
                                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                                            <div style="background: var(--uas-blue); padding: 0.75rem; border-radius: 10px; min-width: 60px; text-align: center;">
                                                <i data-lucide="clock" style="width: 20px; height: 20px; color: white; margin-bottom: 0.25rem;"></i>
                                                <div style="color: white; font-size: 0.7rem; font-weight: 600; line-height: 1;">
                                                    ${horaInicioFormato}
                                                </div>
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;">
                                                    ${horaInicioFormato} - ${horaFinFormato}
                                                </div>
                                                <div style="font-size: 0.85rem; color: var(--uas-gold); font-weight: 600;">
                                                    <i data-lucide="timer" style="width: 14px; height: 14px; vertical-align: middle;"></i>
                                                    ${duracionTexto}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Asignatura -->
                                        <div style="margin-bottom: 1rem;">
                                            <h4 style="margin: 0 0 0.5rem; color: var(--uas-blue); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                                                <i data-lucide="book-open" style="width: 18px; height: 18px;"></i>
                                                ${asignatura?.nombre || 'N/A'}
                                            </h4>
                                            ${asignatura?.codigo ? `
                                                <div style="display: inline-block; background: var(--uas-gold); color: var(--uas-blue); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                                    ${asignatura.codigo}
                                                </div>
                                            ` : ''}
                                        </div>
                                        
                                        <!-- Detalles en grid -->
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: ${esMaestro ? '0' : '0'};">
                                            <!-- Maestro -->
                                            <div style="background: var(--background); padding: 0.75rem; border-radius: 8px; border-left: 3px solid var(--uas-blue);">
                                                <div style="font-size: 0.7rem; color: var(--muted-foreground); margin-bottom: 0.25rem; text-transform: uppercase; font-weight: 600;">
                                                    Maestro
                                                </div>
                                                <div style="font-size: 0.85rem; color: var(--foreground); font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                                                    <i data-lucide="user" style="width: 14px; height: 14px; color: var(--uas-blue);"></i>
                                                    ${maestro?.nombre || 'N/A'}
                                                </div>
                                            </div>
                                            
                                            <!-- Aula -->
                                            <div style="background: var(--background); padding: 0.75rem; border-radius: 8px; border-left: 3px solid var(--uas-gold);">
                                                <div style="font-size: 0.7rem; color: var(--muted-foreground); margin-bottom: 0.25rem; text-transform: uppercase; font-weight: 600;">
                                                    Aula
                                                </div>
                                                <div style="font-size: 0.85rem; color: var(--foreground); font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                                                    <i data-lucide="building-2" style="width: 14px; height: 14px; color: var(--uas-gold);"></i>
                                                    ${aula?.nombre || 'N/A'}
                                                </div>
                                                ${aula?.edificio ? `
                                                    <div style="font-size: 0.7rem; color: var(--muted-foreground); margin-top: 0.25rem;">
                                                        Edificio ${aula.edificio}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                        
                                        ${botonesAccion}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <style>
            .clase-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 51, 102, 0.15) !important;
                border-color: var(--uas-blue) !important;
            }
            
            .clase-actions button:hover {
                transform: scale(1.02);
            }
            
            .dia-section[data-expanded="true"] .clases-content {
                max-height: 5000px !important;
                opacity: 1 !important;
                margin-top: 1rem !important;
            }
            
            .dia-section[data-expanded="true"] .accordion-icon {
                transform: rotate(180deg);
            }
        </style>
    `;
    
    return html;
}
function getHorarioFormBody(horario = {}) {
    // Normalizar las horas del horario (quitar segundos si existen)
    const normalizarHora = (hora) => {
        if (!hora) return '';
        return hora.substring(0, 5); // Tomar solo HH:MM
    };
    
    const horaInicioNormalizada = normalizarHora(horario.hora_inicio);
    const horaFinNormalizada = normalizarHora(horario.hora_fin);
    
    // Obtener configuración de horarios para generar opciones
    const horariosConfig = state.configuracion?.horarios || {
        duracion_bloque: 60,
        hora_inicio: '07:00',
        hora_fin: '21:00',
        intervalo_entre_bloques: 0
    };
    
    // Generar bloques de tiempo disponibles
    const bloquesTiempo = [];
    const [horaInicio, minutoInicio] = horariosConfig.hora_inicio.split(':').map(Number);
    const [horaFin, minutoFin] = horariosConfig.hora_fin.split(':').map(Number);
    
    const minutosInicio = horaInicio * 60 + minutoInicio;
    const minutosFin = horaFin * 60 + minutoFin;
    const duracionBloque = horariosConfig.duracion_bloque;
    const intervalo = horariosConfig.intervalo_entre_bloques;
    
    for (let minutos = minutosInicio; minutos <= minutosFin; minutos += duracionBloque + intervalo) {
        const horas24 = Math.floor(minutos / 60);
        const mins = minutos % 60;
        const horaStr = `${horas24.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        bloquesTiempo.push(horaStr);
    }
    
    return `
        <form id="horario-form">
            <div class="form-group">
                <label for="horario-maestro">Maestro</label>
                <select id="horario-maestro">
                    <option value="">Selecciona un maestro</option>
                    ${state.maestros.map(m => `<option value="${m.id}" ${horario.maestro_id === m.id ? 'selected' : ''}>${m.nombre}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="horario-asignatura">Asignatura</label>
                <select id="horario-asignatura">
                    <option value="">Selecciona una asignatura</option>
                    ${state.asignaturas.map(a => `<option value="${a.id}" ${horario.asignatura_id === a.id ? 'selected' : ''}>${a.codigo} - ${a.nombre}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="horario-aula">Aula</label>
                <select id="horario-aula">
                     <option value="">Selecciona un aula</option>
                    ${state.aulas.map(a => `<option value="${a.id}" ${horario.aula_id === a.id ? 'selected' : ''}>${a.nombre} - ${a.edificio}</option>`).join('')}
                </select>
            </div>
             <div class="form-group">
                <label for="horario-dia">Día</label>
                <select id="horario-dia">
                    ${state.config.diasSemana.map(d => `<option value="${d}" ${horario.dia === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
            </div>
            <div class="grid-container grid-cols-2">
                 <div class="form-group">
                    <label for="horario-inicio">Hora Inicio</label>
                    <select id="horario-inicio">
                        <option value="">Selecciona hora</option>
                        ${bloquesTiempo.slice(0, -1).map(hora => 
                            `<option value="${hora}" ${horaInicioNormalizada === hora ? 'selected' : ''}>${hora}</option>`
                        ).join('')}
                    </select>
                </div>
                 <div class="form-group">
                    <label for="horario-fin">Hora Fin</label>
                    <select id="horario-fin">
                        <option value="">Selecciona hora</option>
                        ${bloquesTiempo.slice(1).map(hora => 
                            `<option value="${hora}" ${horaFinNormalizada === hora ? 'selected' : ''}>${hora}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" id="cancel-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">${horario.id ? 'Actualizar' : 'Guardar'}</button>
            </div>
        </form>
    `;
}

// --- Lógica CRUD (CON CAMBIOS) ---

export async function handleAddHorario() {
    openModal({ title: 'Nuevo Horario', description: 'Asigna una nueva clase en el calendario.', body: getHorarioFormBody() });
    setupHoraAutoComplete();
}

export async function handleEditHorario(id) {
    const horario = state.horarios.find(h => h.id === id);
    setEditingItem(horario);
    openModal({ title: 'Editar Horario', description: 'Modifica la información de la clase.', body: getHorarioFormBody(horario) });
    setupHoraAutoComplete();
}

/**
 * Configura el auto-completado de hora fin cuando se selecciona hora inicio
 * También sincroniza los custom selects con los valores pre-seleccionados
 */
function setupHoraAutoComplete() {
    // Esperar a que el DOM y los custom selects estén listos
    setTimeout(() => {
        const horaInicioSelect = document.getElementById('horario-inicio');
        const horaFinSelect = document.getElementById('horario-fin');
        
        if (!horaInicioSelect || !horaFinSelect) {
            console.warn('No se encontraron los selects de hora');
            return;
        }
        
        // Función para sincronizar el custom select con el valor del select original
        const sincronizarCustomSelect = (select) => {
            if (!select.value) return; // Si no hay valor, no hacer nada
            
            const customSelectWrapper = select.parentElement?.querySelector('.custom-select');
            if (customSelectWrapper && customSelectWrapper._customSelectInstance) {
                const customSelectInstance = customSelectWrapper._customSelectInstance;
                
                // Actualizar el texto del botón
                const button = customSelectInstance.selectButton.querySelector('.custom-select-value');
                if (button) {
                    const opcionSeleccionada = Array.from(select.options).find(opt => opt.value === select.value);
                    if (opcionSeleccionada) {
                        button.textContent = opcionSeleccionada.textContent;
                        console.log(`Custom select sincronizado: ${select.id} = ${opcionSeleccionada.textContent}`);
                    }
                }
                
                // Actualizar las opciones seleccionadas visualmente
                const options = customSelectInstance.optionsList.querySelectorAll('.custom-select-option');
                options.forEach(opt => {
                    if (opt.dataset.value === select.value) {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });
            }
        };
        
        // Sincronizar valores pre-seleccionados (modo edición)
        sincronizarCustomSelect(horaInicioSelect);
        sincronizarCustomSelect(horaFinSelect);
        
        // Obtener configuración
        const horariosConfig = state.configuracion?.horarios || {
            duracion_bloque: 60,
            intervalo_entre_bloques: 0
        };
        
        // Función para actualizar hora fin
        const actualizarHoraFin = () => {
            const horaInicio = horaInicioSelect.value;
            console.log('🔄 actualizarHoraFin ejecutada, horaInicio:', horaInicio);
            
            if (!horaInicio) {
                console.log('⚠️ No hay hora inicio, abortando');
                return;
            }
            
            console.log('✅ Hora inicio seleccionada:', horaInicio);
            console.log('📊 Duración del bloque:', horariosConfig.duracion_bloque, 'minutos');
            
            // Calcular hora fin automáticamente
            const [horas, minutos] = horaInicio.split(':').map(Number);
            const minutosInicio = horas * 60 + minutos;
            const minutosFin = minutosInicio + horariosConfig.duracion_bloque;
            
            const horasFin = Math.floor(minutosFin / 60);
            const minsFin = minutosFin % 60;
            const horaFinStr = `${horasFin.toString().padStart(2, '0')}:${minsFin.toString().padStart(2, '0')}`;
            
            console.log('🎯 Hora fin calculada:', horaFinStr);
            
            // Verificar que la opción existe
            const opcionExiste = Array.from(horaFinSelect.options).some(opt => opt.value === horaFinStr);
            if (!opcionExiste) {
                console.warn('La hora fin calculada no existe en las opciones:', horaFinStr);
                return;
            }
            
            // Actualizar el select original
            horaFinSelect.value = horaFinStr;
            console.log('✅ Select original actualizado');
            
            // Actualizar el custom select si existe
            const customSelectWrapper = horaFinSelect.parentElement?.querySelector('.custom-select');
            console.log('🔍 Custom select wrapper encontrado:', !!customSelectWrapper);
            
            if (customSelectWrapper && customSelectWrapper._customSelectInstance) {
                console.log('✅ Custom select instance encontrada');
                const customSelectInstance = customSelectWrapper._customSelectInstance;
                
                // Actualizar el texto del botón
                const button = customSelectInstance.selectButton.querySelector('.custom-select-value');
                if (button) {
                    const opcionSeleccionada = Array.from(horaFinSelect.options).find(opt => opt.value === horaFinStr);
                    if (opcionSeleccionada) {
                        button.textContent = opcionSeleccionada.textContent;
                        console.log('✅ Texto del botón actualizado:', opcionSeleccionada.textContent);
                    }
                } else {
                    console.warn('⚠️ No se encontró el botón del custom select');
                }
                
                // Actualizar las opciones seleccionadas visualmente
                const options = customSelectInstance.optionsList.querySelectorAll('.custom-select-option');
                options.forEach(opt => {
                    if (opt.dataset.value === horaFinStr) {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });
                console.log('✅ Opciones actualizadas visualmente');
            } else {
                console.warn('⚠️ No se encontró el custom select wrapper o su instance');
            }
        };
        
        // Escuchar cambios en el select original (disparado por custom select)
        console.log('👂 Agregando listener de change a horario-inicio');
        horaInicioSelect.addEventListener('change', actualizarHoraFin);
        
        // También ejecutar al cargar si ya hay un valor (modo edición)
        if (horaInicioSelect.value) {
            console.log('📝 Modo edición detectado, ejecutando auto-completado');
            actualizarHoraFin();
        }
        
        console.log('✅ Auto-completado de hora configurado correctamente');
    }, 300); // Aumentar timeout para asegurar que los custom selects estén listos
}

export async function handleDeleteHorario(id) {
    const horario = state.horarios.find(h => h.id === id);
    const maestro = state.maestros.find(m => m.id === horario?.maestro_id);
    const asignatura = state.asignaturas.find(a => a.id === horario?.asignatura_id);
    const dia = horario?.dia || 'día no especificado';
    const horaInicio = horario?.hora_inicio?.substring(0, 5) || '';
    const horaFin = horario?.hora_fin?.substring(0, 5) || '';
    const horarioTexto = horaInicio && horaFin ? ` el ${dia} de ${horaInicio} a ${horaFin}` : '';
    
    const mensaje = `¿Estás seguro de eliminar la materia de "${asignatura?.nombre || 'esta clase'}" con ${maestro?.nombre || 'el maestro'}${horarioTexto}?`;
    
    const confirmed = await showConfirmDialog(mensaje);
    
    if (confirmed) {
        await api.horarios.delete(id);
        showToast.success('Horario eliminado correctamente');
        loadData('horarios', await api.horarios.getAll());
        renderCurrentView();
    }
}

export async function handleHorarioFormSubmit(e) {
    // 1. Recolectar datos del formulario (sigue en camelCase)
    const formData = {
        maestroId: document.getElementById('horario-maestro').value,
        asignaturaId: document.getElementById('horario-asignatura').value,
        aulaId: document.getElementById('horario-aula').value,
        dia: document.getElementById('horario-dia').value,
        horaInicio: document.getElementById('horario-inicio').value,
        horaFin: document.getElementById('horario-fin').value,
    };
    
    // Validar que todos los campos estén llenos
    if (!formData.maestroId) {
        showToast.error('Por favor selecciona un maestro');
        return;
    }
    if (!formData.asignaturaId) {
        showToast.error('Por favor selecciona una asignatura');
        return;
    }
    if (!formData.aulaId) {
        showToast.error('Por favor selecciona un aula');
        return;
    }
    if (!formData.dia) {
        showToast.error('Por favor selecciona un día');
        return;
    }
    if (!formData.horaInicio) {
        showToast.error('Por favor selecciona una hora de inicio');
        return;
    }
    if (!formData.horaFin) {
        showToast.error('Por favor selecciona una hora de fin');
        return;
    }
    
    // VALIDAR DISPONIBILIDAD DEL MAESTRO
    const maestro = state.maestros.find(m => m.id === formData.maestroId);
    if (maestro) {
        // Verificar día disponible
        const diasDisponibles = Array.isArray(maestro.dias_disponibles) ? maestro.dias_disponibles : [];
        if (diasDisponibles.length > 0 && !diasDisponibles.includes(formData.dia)) {
            showToast.error(`❌ El maestro ${maestro.nombre} no está disponible los días ${formData.dia}.\n\nDías disponibles: ${diasDisponibles.join(', ')}`);
            return;
        }
        
        // Verificar horas disponibles
        const horasDisponibilidad = Array.isArray(maestro.horas_disponibilidad) ? maestro.horas_disponibilidad : [];
        if (horasDisponibilidad.length > 0) {
            // Convertir horas a minutos para comparación
            const convertirAMinutos = (hora) => {
                const [h, m] = hora.split(':').map(Number);
                return h * 60 + m;
            };
            
            const inicioClaseMinutos = convertirAMinutos(formData.horaInicio);
            const finClaseMinutos = convertirAMinutos(formData.horaFin);
            
            // Verificar si el horario de la clase está dentro de algún rango de disponibilidad
            const dentroDeDisponibilidad = horasDisponibilidad.some(rango => {
                const inicioDisponible = convertirAMinutos(rango.inicio);
                const finDisponible = convertirAMinutos(rango.fin);
                
                // La clase debe estar completamente dentro del rango de disponibilidad
                return inicioClaseMinutos >= inicioDisponible && finClaseMinutos <= finDisponible;
            });
            
            if (!dentroDeDisponibilidad) {
                const rangosTexto = horasDisponibilidad.map(r => `${r.inicio} - ${r.fin}`).join(', ');
                showToast.error(`❌ El maestro ${maestro.nombre} no está disponible en el horario ${formData.horaInicio} - ${formData.horaFin}.\n\nHorarios disponibles: ${rangosTexto}`);
                return;
            }
        }
    }
    
    // 2. Crear un objeto "payload" con los nombres correctos para la base de datos (snake_case)
    const payload = {
        maestro_id: formData.maestroId,
        asignatura_id: formData.asignaturaId,
        aula_id: formData.aulaId,
        dia: formData.dia,
        hora_inicio: formData.horaInicio,
        hora_fin: formData.horaFin,
    };
    
    // Payload para validación (incluye id si está editando)
    const payloadValidacion = {
        ...payload,
        id: state.editingItem?.id
    };

    // NUEVA FUNCIONALIDAD: Validar contra las reglas de configuración
    // Importar la función de validación dinámicamente
    const { validarHorarioContraReglas } = await import('./configuraciones.js');
    const validacion = validarHorarioContraReglas(payloadValidacion);
    
    // Mostrar errores críticos
    if (!validacion.esValido) {
        showToast.error('❌ ' + validacion.errores.join('\n'));
        return;
    }
    
    // Mostrar advertencias pero permitir continuar
    if (validacion.advertencias.length > 0) {
        const { showConfirmDialog } = await import('../ui.js');
        const continuar = await showConfirmDialog(
            'Se detectaron advertencias',
            '⚠️ ' + validacion.advertencias.join('\n\n') + '\n\n¿Deseas continuar de todos modos?',
            'Continuar',
            'Cancelar'
        );
        
        if (!continuar) return;
    }

    // 3. (Opcional) Lógica de validación de conflictos (sin cambios)
    const conflicto = state.horarios.find(h => {
        if (state.editingItem && h.id === state.editingItem.id) return false;
        return h.dia === payload.dia && 
               (payload.hora_inicio < h.hora_fin && payload.hora_fin > h.hora_inicio) && 
               (h.maestro_id === payload.maestro_id || h.aula_id === payload.aula_id);
    });

    if (conflicto) {
        showToast.error('Conflicto de horario detectado. El maestro o el aula ya están ocupados.');
        return;
    }

    // 4. Enviar el payload con los nombres correctos a la API
    try {
        if (state.editingItem) {
            await api.horarios.update(state.editingItem.id, payload);
            showToast.success('Horario actualizado correctamente');
        } else {
            await api.horarios.add(payload);
            showToast.success('Horario agregado correctamente');
        }

        setEditingItem(null);
        closeModal();
        loadData('horarios', await api.horarios.getAll());
        renderCurrentView();
    } catch (error) {
        console.error("Error al guardar el horario:", error);
        showToast.error("No se pudo guardar el horario. Revisa la consola para más detalles.");
    }
}