import { state, setEditingItem, loadData, setHorariosViewMode } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal, showConfirmDialog } from '../ui.js';
import { renderCurrentView } from '../main.js';

// --- Funciones de Renderizado (SIN CAMBIOS) ---
export function renderHorarios() {
    // ... (esta función no cambia)
    const header = `
        <div class="view-header">
            <div class="view-header-content">
                <div>
                    <h2>Gestión de Horarios</h2>
                    <p>Asigna maestros, materias y aulas en el calendario.</p>
                    <div class="view-toggle">
                        <button id="view-calendario-btn" class="${state.horariosViewMode === 'calendario' ? 'active' : ''}">Calendario</button>
                        <button id="view-lista-btn" class="${state.horariosViewMode === 'lista' ? 'active' : ''}">Lista</button>
                    </div>
                </div>
                <button id="add-horario-btn" class="btn btn-primary"><i data-lucide="plus"></i>Agregar Horario</button>
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
    
    console.log('Renderizando calendario con horarios:', state.horarios);
    
    // Función helper para normalizar horas (quitar segundos si existen)
    const normalizeTime = (time) => {
        if (!time) return '';
        return time.substring(0, 5); // Toma solo HH:MM
    };
    
    // Función corregida para obtener horarios por día y hora
    const getHorarios = (dia, hora) => {
        return state.horarios.filter(h => {
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
                                return `
                                <div class="horario-card" style="height: ${calculateCardHeight(h.hora_inicio, h.hora_fin)}px">
                                    <div class="asignatura">${asignatura?.nombre || 'N/A'}</div>
                                    <div class="maestro">${maestro?.nombre || 'N/A'}</div>
                                    <div class="aula">${aula?.nombre || 'N/A'}</div>
                                    <div class="card-actions">
                                        <button class="edit-horario-btn" data-id="${h.id}"><i data-lucide="edit"></i></button>
                                        <button class="delete-horario-btn delete" data-id="${h.id}"><i data-lucide="trash-2"></i></button>
                                    </div>
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
    // ... (esta función no cambia)
    if (state.horarios.length === 0) {
        return `<div class="card empty-state"><i data-lucide="calendar"></i><p>No hay horarios asignados</p></div>`;
    }
    return `<div class="grid-container grid-cols-1 list-view">
        ${state.horarios.map(h => `
            <div class="card"><div class="card-content">
                <div class="info-grid">
                    <div class="info-row"><i data-lucide="calendar"></i><div><p>Día</p>${h.dia}</div></div>
                    <div class="info-row"><i data-lucide="clock"></i><div><p>Hora</p>${h.hora_inicio} - ${h.hora_fin}</div></div>
                    <div class="info-row"><i data-lucide="user"></i><div><p>Maestro</p>${state.maestros.find(m => m.id === h.maestro_id)?.nombre || 'N/A'}</div></div>
                    <div class="info-row"><i data-lucide="book-open"></i><div><p>Asignatura</p>${state.asignaturas.find(a => a.id === h.asignatura_id)?.nombre || 'N/A'}</div></div>
                    <div class="info-row"><i data-lucide="building-2"></i><div><p>Aula</p>${state.aulas.find(a => a.id === h.aula_id)?.nombre || 'N/A'}</div></div>
                </div>
                <div class="card-actions">
                    <button class="edit-horario-btn" data-id="${h.id}"><i data-lucide="edit"></i></button>
                    <button class="delete-horario-btn delete" data-id="${h.id}"><i data-lucide="trash-2"></i></button>
                </div>
            </div></div>
        `).join('')}
    </div>`;
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