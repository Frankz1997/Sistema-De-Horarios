/**
 * Vista de Mi Perfil - Para usuarios con rol maestro
 * Permite editar su disponibilidad y datos personales
 */
import { state, loadData } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal } from '../ui.js';

/**
 * Obtiene los datos del maestro actual basándose en el email del usuario logueado
 */
async function getMaestroActual() {
    // Buscar el maestro por email
    const maestro = state.maestros.find(m => m.email === state.user.email);
    
    if (!maestro) {
        console.error('No se encontró registro de maestro para:', state.user.email);
        window.showToast.error('No se encontró tu perfil de maestro');
        return null;
    }
    
    return maestro;
}

/**
 * Renderiza la vista completa de Mi Perfil
 */
export function renderMiPerfil() {
    const maestro = state.maestros.find(m => m.email === state.user.email);
    
    if (!maestro) {
        return `
            <div class="view-header">
                <h2>Mi Perfil</h2>
                <p>Configura tu disponibilidad y datos personales</p>
            </div>
            <div class="empty-state">
                <i data-lucide="alert-circle" style="width: 64px; height: 64px;"></i>
                <h3>Perfil no encontrado</h3>
                <p>No se encontró tu registro de maestro. Contacta al administrador.</p>
            </div>
        `;
    }
    
    // Días disponibles
    const diasDisponibles = Array.isArray(maestro.dias_disponibles) ? maestro.dias_disponibles : [];
    
    // Horas de disponibilidad
    const horasDisponibilidad = Array.isArray(maestro.horas_disponibilidad) ? maestro.horas_disponibilidad : [];
    
    // Calcular estadísticas
    const misHorarios = state.horarios.filter(h => h.maestro_id === maestro.id);
    const totalHorasAsignadas = misHorarios.reduce((total, h) => {
        const inicio = h.hora_inicio.split(':');
        const fin = h.hora_fin.split(':');
        const duracion = (parseInt(fin[0]) * 60 + parseInt(fin[1])) - (parseInt(inicio[0]) * 60 + parseInt(inicio[1]));
        return total + (duracion / 60);
    }, 0);
    
    return `
        <div class="view-header">
            <div>
                <h2>Mi Perfil</h2>
                <p>Configura tu disponibilidad y datos personales</p>
            </div>
            <button id="edit-perfil-btn" class="btn btn-primary">
                <i data-lucide="edit"></i>Editar Disponibilidad
            </button>
        </div>
        
        <!-- Tarjetas de estadísticas -->
        <div class="grid-container grid-cols-3 lg-grid-cols-3" style="margin-bottom: 1.5rem;">
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
                    <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 0.5rem 0 0;">
                        ${misHorarios.length === 1 ? 'clase programada' : 'clases programadas'}
                    </p>
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
                    <div class="stat-card-value">${totalHorasAsignadas.toFixed(1)}<span style="font-size: 0.6em;">hrs</span></div>
                    <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 0.5rem 0 0;">
                        de carga académica
                    </p>
                </div>
            </div>
            <div class="card dashboard-stat-card">
                <div class="card-header">
                    <div class="stat-card-header">
                        <h3 class="stat-card-title">Disponibilidad</h3>
                        <div class="icon-wrapper bg-uas-blue-light">
                            <i data-lucide="calendar-days" class="text-white"></i>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="stat-card-value">${diasDisponibles.length}<span style="font-size: 0.6em;">/5</span></div>
                    <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 0.5rem 0 0;">
                        ${diasDisponibles.length === 1 ? 'día configurado' : 'días configurados'}
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Información Personal -->
        <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-header">
                <h3><i data-lucide="user"></i> Información Personal</h3>
            </div>
            <div class="card-content">
                <div class="grid-container grid-cols-3 lg-grid-cols-3">
                    <div style="padding: 1rem; background: var(--background); border-radius: 8px; border: 1px solid var(--border);">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--uas-blue); display: flex; align-items: center; justify-content: center;">
                                <i data-lucide="user" style="width: 20px; height: 20px; color: white;"></i>
                            </div>
                            <div>
                                <p style="font-size: 0.75rem; color: var(--muted-foreground); margin: 0;">Nombre Completo</p>
                                <strong style="font-size: 1rem; color: var(--foreground);">${maestro.nombre}</strong>
                            </div>
                        </div>
                    </div>
                    <div style="padding: 1rem; background: var(--background); border-radius: 8px; border: 1px solid var(--border);">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--uas-gold); display: flex; align-items: center; justify-content: center;">
                                <i data-lucide="mail" style="width: 20px; height: 20px; color: var(--uas-blue);"></i>
                            </div>
                            <div>
                                <p style="font-size: 0.75rem; color: var(--muted-foreground); margin: 0;">Correo Electrónico</p>
                                <strong style="font-size: 0.9rem; color: var(--foreground);">${maestro.email}</strong>
                            </div>
                        </div>
                    </div>
                    <div style="padding: 1rem; background: var(--background); border-radius: 8px; border: 1px solid var(--border);">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--uas-blue-light); display: flex; align-items: center; justify-content: center;">
                                <i data-lucide="briefcase" style="width: 20px; height: 20px; color: white;"></i>
                            </div>
                            <div>
                                <p style="font-size: 0.75rem; color: var(--muted-foreground); margin: 0;">Especialidad</p>
                                <strong style="font-size: 1rem; color: var(--foreground);">${maestro.especialidad || 'Sin especificar'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Disponibilidad -->
        <div class="grid-container grid-cols-2 lg-grid-cols-2">
            <!-- Días Disponibles -->
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, var(--uas-blue), var(--uas-blue-light)); border-radius: 12px 12px 0 0;">
                    <h3 style="color: white; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                        <i data-lucide="calendar-days"></i> Días Disponibles
                    </h3>
                </div>
                <div class="card-content" style="min-height: 150px; display: flex; align-items: center; justify-content: center;">
                    ${diasDisponibles.length > 0 ? `
                        <div class="tags" style="gap: 0.75rem;">
                            ${diasDisponibles.map(dia => `
                                <span class="tag tag-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem; font-weight: 500;">
                                    ${dia}
                                </span>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 2rem;">
                            <i data-lucide="calendar-x" style="width: 48px; height: 48px; color: var(--muted-foreground); margin-bottom: 1rem;"></i>
                            <p style="color: var(--muted-foreground); margin: 0; font-size: 0.95rem;">
                                No has configurado días disponibles
                            </p>
                            <p style="color: var(--muted-foreground); margin: 0.5rem 0 0; font-size: 0.85rem;">
                                Haz clic en "Editar Disponibilidad" para comenzar
                            </p>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Horarios de Disponibilidad -->
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, var(--uas-gold), var(--uas-gold-dark)); border-radius: 12px 12px 0 0;">
                    <h3 style="color: var(--uas-blue); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                        <i data-lucide="clock"></i> Horarios de Disponibilidad
                    </h3>
                </div>
                <div class="card-content" style="min-height: 150px; display: flex; align-items: center; justify-content: center;">
                    ${horasDisponibilidad.length > 0 ? `
                        <div class="rangos-list" style="width: 100%; gap: 0.5rem;">
                            ${horasDisponibilidad.map(rango => `
                                <div class="rango-item" style="justify-content: center; cursor: default; padding: 0.75rem 1rem; background: var(--background); border: 2px solid var(--uas-gold); border-radius: 8px;">
                                    <i data-lucide="clock" style="width: 18px; height: 18px; color: var(--uas-gold); margin-right: 0.5rem;"></i>
                                    <span class="rango-text" style="font-weight: 500; color: var(--foreground);">${rango.inicio} - ${rango.fin}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 2rem;">
                            <i data-lucide="clock-off" style="width: 48px; height: 48px; color: var(--muted-foreground); margin-bottom: 1rem;"></i>
                            <p style="color: var(--muted-foreground); margin: 0; font-size: 0.95rem;">
                                No has configurado horarios disponibles
                            </p>
                            <p style="color: var(--muted-foreground); margin: 0.5rem 0 0; font-size: 0.85rem;">
                                Configura tus rangos horarios para que el administrador pueda asignarte clases
                            </p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

/**
 * Abre el modal de edición de disponibilidad
 */
export async function handleEditPerfil() {
    const maestro = await getMaestroActual();
    if (!maestro) return;
    
    const diasDisponibles = Array.isArray(maestro.dias_disponibles) ? maestro.dias_disponibles : [];
    const horasDisponibilidad = Array.isArray(maestro.horas_disponibilidad) ? maestro.horas_disponibilidad : [];
    
    const rangosExistentesHTML = horasDisponibilidad.map((rango, index) => `
        <div class="rango-item" data-index="${index}">
            <span class="rango-text">${rango.inicio} - ${rango.fin}</span>
            <button type="button" class="btn-remove-rango" data-index="${index}">
                <i data-lucide="x" style="width: 14px; height: 14px;"></i>
            </button>
        </div>
    `).join('');
    
    openModal({
        title: 'Editar Mi Disponibilidad',
        description: 'Actualiza tus días y horarios disponibles para impartir clases',
        body: `
            <form id="perfil-form">
                <div class="form-group">
                    <label for="maestro-nombre">Nombre Completo</label>
                    <input type="text" id="maestro-nombre" value="${maestro.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label for="maestro-especialidad">Especialidad / Área</label>
                    <input type="text" id="maestro-especialidad" value="${maestro.especialidad || ''}" placeholder="Ej: Matemáticas, Programación, Física..." required>
                </div>
                <div class="form-group">
                    <label>Días Disponibles</label>
                    <div class="tags">
                        ${state.config.diasSemana.map(dia => `
                            <button type="button" class="toggle-dia ${diasDisponibles.includes(dia) ? 'selected' : ''}" data-dia="${dia}">${dia}</button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Sección de Horarios de Disponibilidad -->
                <div class="form-group">
                    <label>Horarios de Disponibilidad</label>
                    
                    <!-- Rangos Predefinidos -->
                    <div style="margin-bottom: 0.75rem;">
                        <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 0 0 0.5rem;">Selección rápida:</p>
                        <div class="tags">
                            <button type="button" class="btn-quick-time" data-inicio="07:00" data-fin="14:00">Matutino (07:00-14:00)</button>
                            <button type="button" class="btn-quick-time" data-inicio="14:00" data-fin="21:00">Vespertino (14:00-21:00)</button>
                            <button type="button" class="btn-quick-time" data-inicio="07:00" data-fin="21:00">Todo el día (07:00-21:00)</button>
                        </div>
                    </div>
                    
                    <!-- Input Personalizado -->
                    <div style="margin-bottom: 0.75rem;">
                        <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 0 0 0.5rem;">O crea un rango personalizado:</p>
                        <div class="grid-container grid-cols-2" style="gap: 0.5rem; align-items: end;">
                            <div class="form-group" style="margin: 0;">
                                <label for="hora-inicio" style="font-size: 0.85rem;">Hora Inicio</label>
                                <input type="time" id="hora-inicio" value="07:00" step="3600">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label for="hora-fin" style="font-size: 0.85rem;">Hora Fin</label>
                                <input type="time" id="hora-fin" value="14:00" step="3600">
                            </div>
                        </div>
                        <button type="button" id="btn-add-rango" class="btn btn-outline" style="margin-top: 0.5rem; width: 100%; font-size: 0.9rem;">
                            <i data-lucide="plus" style="width: 16px; height: 16px;"></i> Agregar Rango
                        </button>
                    </div>
                    
                    <!-- Lista de Rangos -->
                    <div id="rangos-container" class="${horasDisponibilidad.length > 0 ? 'expanded' : 'collapsed'}">
                        <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 0 0 0.5rem;">Rangos agregados:</p>
                        <div id="rangos-list" class="rangos-list">
                            ${rangosExistentesHTML}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" id="cancel-btn">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Actualizar</button>
                </div>
            </form>
        `
    });
}

/**
 * Maneja el envío del formulario de perfil
 */
export async function handlePerfilFormSubmit(e) {
    e.preventDefault();
    
    const maestro = await getMaestroActual();
    if (!maestro) return;
    
    // Recolectar días seleccionados
    const diasSeleccionados = Array.from(document.querySelectorAll('.toggle-dia.selected'))
        .map(btn => btn.dataset.dia);
    
    // Recolectar rangos de horas
    const rangosItems = document.querySelectorAll('#rangos-list .rango-item');
    const horasDisponibilidad = Array.from(rangosItems).map(item => {
        const text = item.querySelector('.rango-text').textContent.trim();
        const [inicio, fin] = text.split(' - ');
        return { inicio, fin };
    });
    
    const nombre = document.getElementById('maestro-nombre').value.trim();
    const especialidad = document.getElementById('maestro-especialidad').value.trim();
    
    if (!nombre || !especialidad) {
        window.showToast.error('Por favor completa todos los campos');
        return;
    }
    
    if (diasSeleccionados.length === 0) {
        window.showToast.error('Selecciona al menos un día disponible');
        return;
    }
    
    if (horasDisponibilidad.length === 0) {
        window.showToast.error('Agrega al menos un rango de horario disponible');
        return;
    }
    
    const formData = {
        nombre,
        especialidad,
        dias_disponibles: diasSeleccionados,
        horas_disponibilidad: horasDisponibilidad
    };
    
    try {
        await api.maestros.update(maestro.id, formData);
        window.showToast.success('Perfil actualizado correctamente');
        
        // Recargar datos
        const updatedMaestros = await api.maestros.getAll();
        loadData('maestros', updatedMaestros);
        
        closeModal();
        
        // Re-renderizar vista
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = renderMiPerfil();
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        window.showToast.error('Error al actualizar el perfil');
    }
}
