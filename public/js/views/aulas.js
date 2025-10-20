import { state, setEditingItem, loadData } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal, showConfirmDialog } from '../ui.js';
import { renderCurrentView } from '../main.js';
import { showToast } from '../toast.js';

export function renderAulas() {
    const header = `
        <div class="view-header">
            <div>
                <h2>Gestión de Aulas</h2>
                <p>Administra las aulas y espacios disponibles.</p>
            </div>
            <button id="add-aula-btn" class="btn btn-primary"><i data-lucide="plus"></i>Agregar Aula</button>
        </div>
    `;

    if (state.aulas.length === 0) {
        return header + `<div class="card empty-state"><i data-lucide="door-open"></i><p>No hay aulas registradas</p></div>`;
    }

    const cards = state.aulas.map(a => `
        <div class="card">
            <div class="card-header bg-blue">
                <div class="card-header-content">
                    <div class="card-title-group">
                        <div class="icon-wrapper bg-gold"><i data-lucide="door-open"></i></div>
                        <h3 class="card-title">${a.nombre}</h3>
                    </div>
                    <div class="card-actions">
                        <button class="edit-aula-btn" data-id="${a.id}"><i data-lucide="edit"></i></button>
                        <button class="delete-aula-btn delete" data-id="${a.id}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="info-row"><i data-lucide="building"></i><span>${a.edificio}</span></div>
                <div class="info-row"><i data-lucide="users"></i><span>Capacidad: ${a.capacidad}</span></div>
                <div class="tags-container"><span class="tag">${a.tipo}</span></div>
            </div>
        </div>
    `).join('');

    return header + `<div class="grid-container grid-cols-4 lg-grid-cols-4">${cards}</div>`;
}

function getAulaFormBody(aula = {}) {
    const tipos = ['Salón', 'Laboratorio', 'Auditorio', 'Taller', 'Sala de Cómputo'];
    const maxAlumnosPorAula = state.configuracion?.validaciones?.max_alumnos_por_aula || 40;
    
    return `
        <form id="aula-form">
            <div class="form-group">
                <label for="aula-nombre">Nombre del Aula</label>
                <input type="text" id="aula-nombre" value="${aula.nombre || ''}" placeholder="Ej: Aula 101, Lab Cómputo A" required>
            </div>
            <div class="form-group">
                <label for="aula-edificio">Edificio</label>
                <input type="text" id="aula-edificio" value="${aula.edificio || ''}" placeholder="Ej: Edificio A, Torre Norte" required>
            </div>
            <div class="form-group">
                <label for="aula-capacidad">Capacidad</label>
                <input type="number" id="aula-capacidad" value="${aula.capacidad || 30}" placeholder="Ej: 30, 45, 60" required min="1" max="${maxAlumnosPorAula}">
                <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">
                    Límite máximo configurado: ${maxAlumnosPorAula} alumnos
                </small>
            </div>
            <div class="form-group">
                <label for="aula-tipo">Tipo de Aula</label>
                <select id="aula-tipo" required>
                    ${tipos.map(t => `<option value="${t}" ${aula.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" id="cancel-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">${aula.id ? 'Actualizar' : 'Guardar'}</button>
            </div>
        </form>
    `;
}

export async function handleAddAula() {
    openModal({ title: 'Nueva Aula', description: 'Crea un nuevo espacio.', body: getAulaFormBody() });
}

export async function handleEditAula(id) {
    const aula = state.aulas.find(a => a.id === id);
    setEditingItem(aula);
    openModal({ title: 'Editar Aula', description: 'Modifica la información del aula.', body: getAulaFormBody(aula) });
}

export async function handleDeleteAula(id) {
    const aula = state.aulas.find(a => a.id === id);
    const confirmed = await showConfirmDialog(`¿Estás seguro de eliminar el aula "${aula?.nombre || 'esta aula'}"?`);
    
    if (confirmed) {
        await api.aulas.delete(id);
        showToast.success('Aula eliminada correctamente');
        loadData('aulas', await api.aulas.getAll());
        renderCurrentView();
    }
}

export async function handleAulaFormSubmit(e) {
    const formData = {
        nombre: document.getElementById('aula-nombre').value,
        edificio: document.getElementById('aula-edificio').value,
        capacidad: parseInt(document.getElementById('aula-capacidad').value),
        tipo: document.getElementById('aula-tipo').value,
    };

    // Validar contra el límite de alumnos por aula configurado
    const maxAlumnosPorAula = state.configuracion?.validaciones?.max_alumnos_por_aula || 40;
    
    if (formData.capacidad > maxAlumnosPorAula) {
        showToast.error(
            `La capacidad del aula (${formData.capacidad}) excede el límite máximo configurado de ${maxAlumnosPorAula} alumnos por aula.\n\n` +
            `Puedes cambiar este límite en la sección de Configuración.`
        );
        return;
    }

    if (state.editingItem) {
        await api.aulas.update(state.editingItem.id, formData);
        showToast.success('Aula actualizada correctamente');
    } else {
        await api.aulas.add(formData);
        showToast.success('Aula agregada correctamente');
    }

    setEditingItem(null);
    closeModal();
    loadData('aulas', await api.aulas.getAll());
    renderCurrentView();
}