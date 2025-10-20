import { state, setEditingItem, loadData } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal, showConfirmDialog } from '../ui.js';
import { renderCurrentView } from '../main.js';

export function renderMaestros() {
    const header = `
        <div class="view-header">
            <div>
                <h2>Gestión de Maestros</h2>
                <p>Registra a los docentes del sistema.</p>
            </div>
            <button id="add-maestro-btn" class="btn btn-primary"><i data-lucide="plus"></i>Agregar Maestro</button>
        </div>
    `;

    if (state.maestros.length === 0) {
        return header + `<div class="card empty-state"><i data-lucide="user"></i><p>No hay maestros registrados</p></div>`;
    }

    const cards = state.maestros.map(m => {
        // dias_disponibles ya viene como array desde Supabase
        const diasDisponibles = Array.isArray(m.dias_disponibles) ? m.dias_disponibles : [];

        const diasHTML = diasDisponibles.length > 0 
            ? diasDisponibles.map(dia => `<span class="tag tag-small">${dia}</span>`).join('')
            : '<span style="color: var(--muted-foreground); font-size: 0.875rem;">No especificado</span>';

        // horas_disponibilidad viene como JSONB (array de objetos) desde Supabase
        const horasDisponibilidad = Array.isArray(m.horas_disponibilidad) ? m.horas_disponibilidad : [];
        
        const horasHTML = horasDisponibilidad.length > 0
            ? horasDisponibilidad.map(rango => `<span class="tag tag-small">${rango.inicio} - ${rango.fin}</span>`).join('')
            : '<span style="color: var(--muted-foreground); font-size: 0.875rem;">No especificado</span>';

        return `
            <div class="card">
                <div class="card-header bg-blue">
                    <div class="card-header-content">
                        <div class="card-title-group">
                            <div class="icon-wrapper bg-gold"><i data-lucide="user"></i></div>
                            <h3 class="card-title">${m.nombre}</h3>
                        </div>
                        <div class="card-actions">
                            <button class="edit-maestro-btn" data-id="${m.id}"><i data-lucide="edit"></i></button>
                            <button class="delete-maestro-btn delete" data-id="${m.id}"><i data-lucide="trash-2"></i></button>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="info-row"><i data-lucide="mail"></i><span>${m.email}</span></div>
                    <div class="info-row"><i data-lucide="book-open"></i><span>${m.especialidad}</span></div>
                    <div class="info-row">
                        <i data-lucide="calendar"></i>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; flex: 1;">
                            <span style="color: var(--muted-foreground); font-size: 0.875rem; width: 100%; margin-bottom: 0.25rem;">Días disponibles:</span>
                            ${diasHTML}
                        </div>
                    </div>
                    <div class="info-row">
                        <i data-lucide="clock"></i>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; flex: 1;">
                            <span style="color: var(--muted-foreground); font-size: 0.875rem; width: 100%; margin-bottom: 0.25rem;">Horarios:</span>
                            ${horasHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return header + `<div class="grid-container grid-cols-3 lg-grid-cols-3">${cards}</div>`;
}

function getMaestroFormBody(maestro = {}) {
    // dias_disponibles ya viene como array desde Supabase
    const diasDisponibles = Array.isArray(maestro.dias_disponibles) ? maestro.dias_disponibles : [];
    
    // horas_disponibilidad viene como JSONB desde Supabase
    const horasDisponibilidad = Array.isArray(maestro.horas_disponibilidad) ? maestro.horas_disponibilidad : [];
    
    // Generar HTML para rangos existentes
    const rangosExistentesHTML = horasDisponibilidad.map((rango, index) => `
        <div class="rango-item" data-index="${index}">
            <span class="rango-text">${rango.inicio} - ${rango.fin}</span>
            <button type="button" class="btn-remove-rango" data-index="${index}">
                <i data-lucide="x" style="width: 14px; height: 14px;"></i>
            </button>
        </div>
    `).join('');

    return `
        <form id="maestro-form">
            <div class="form-group">
                <label for="maestro-nombre">Nombre Completo</label>
                <input type="text" id="maestro-nombre" value="${maestro.nombre || ''}" placeholder="Ej: Juan Pérez García" required>
            </div>
            <div class="form-group">
                <label for="maestro-email">Correo Electrónico</label>
                <input type="email" id="maestro-email" value="${maestro.email || ''}" placeholder="Ej: juan.perez@uas.edu.mx" required>
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
                
                <!-- Rangos Predefinidos (Quick Select) -->
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
                
                <!-- Lista de Rangos Agregados -->
                <div id="rangos-container" class="${horasDisponibilidad.length > 0 ? 'expanded' : 'collapsed'}">
                    <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 0 0 0.5rem;">Rangos agregados:</p>
                    <div id="rangos-list" class="rangos-list">
                        ${rangosExistentesHTML}
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" id="cancel-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">${maestro.id ? 'Actualizar' : 'Guardar'}</button>
            </div>
        </form>
    `;
}

export async function handleAddMaestro() {
    openModal({
        title: 'Nuevo Maestro',
        description: 'Completa el formulario para agregar un nuevo maestro.',
        body: getMaestroFormBody()
    });
}

export async function handleEditMaestro(id) {
    const maestro = state.maestros.find(m => m.id === id);
    setEditingItem(maestro);
    openModal({
        title: 'Editar Maestro',
        description: 'Modifica la información del maestro.',
        body: getMaestroFormBody(maestro)
    });
}

export async function handleDeleteMaestro(id) {
    const maestro = state.maestros.find(m => m.id === id);
    const confirmed = await showConfirmDialog(`¿Estás seguro de eliminar al maestro "${maestro?.nombre || 'este maestro'}"?`);
    
    if (confirmed) {
        await api.maestros.delete(id);
        showToast.success('Maestro eliminado correctamente');
        const updatedMaestros = await api.maestros.getAll();
        loadData('maestros', updatedMaestros);
        renderCurrentView();
    }
}

export async function handleMaestroFormSubmit(e) {
    // Recolectar días seleccionados
    const diasSeleccionados = Array.from(document.querySelectorAll('.toggle-dia.selected'))
        .map(btn => btn.dataset.dia);

    // Recolectar rangos de horas agregados
    const rangosItems = document.querySelectorAll('.rango-item');
    const horasDisponibilidad = Array.from(rangosItems).map(item => {
        const texto = item.querySelector('.rango-text').textContent;
        const [inicio, fin] = texto.split(' - ');
        return { inicio, fin };
    });

    const formData = {
        nombre: document.getElementById('maestro-nombre').value,
        email: document.getElementById('maestro-email').value,
        especialidad: document.getElementById('maestro-especialidad').value,
        dias_disponibles: diasSeleccionados,
        horas_disponibilidad: horasDisponibilidad, // Array de objetos {inicio, fin}
    };

    if (state.editingItem) {
        await api.maestros.update(state.editingItem.id, formData);
        showToast.success('Maestro actualizado correctamente');
    } else {
        await api.maestros.add(formData);
        showToast.success('Maestro agregado correctamente');
    }

    setEditingItem(null);
    closeModal();
    const updatedMaestros = await api.maestros.getAll();
    loadData('maestros', updatedMaestros);
    renderCurrentView();
}