import { state, setEditingItem, loadData } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal, showConfirmDialog } from '../ui.js';
import { renderCurrentView } from '../main.js';

// Renderiza el contenido de la vista de Asignaturas
export function renderAsignaturas() {
    const header = `
        <div class="view-header">
            <div>
                <h2>Gestión de Asignaturas</h2>
                <p>Registra las materias del plan de estudios.</p>
            </div>
            <button id="add-asignatura-btn" class="btn btn-secondary"><i data-lucide="plus"></i>Agregar Asignatura</button>
        </div>
    `;

    if (state.asignaturas.length === 0) {
        return header + `<div class="card empty-state"><i data-lucide="book-open"></i><p>No hay asignaturas registradas</p></div>`;
    }

    const cards = state.asignaturas.map(a => `
        <div class="card">
            <div class="card-header bg-gold">
                <div class="card-header-content">
                    <div class="card-title-group">
                        <div class="icon-wrapper bg-white"><i data-lucide="book-open" class="text-gold"></i></div>
                        <div>
                            <h3 class="card-title">${a.codigo}</h3>
                            <span class="tag tag-nivel">${a.modalidad || ''}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="edit-asignatura-btn" data-id="${a.id}"><i data-lucide="edit"></i></button>
                        <button class="delete-asignatura-btn delete" data-id="${a.id}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <h3 style="margin-top:0;">${a.nombre}</h3>
                <div class="info-row"><i data-lucide="award"></i><span>${a.carrera}</span></div>
            </div>
        </div>
    `).join('');

    return header + `<div class="grid-container grid-cols-3 lg-grid-cols-3">${cards}</div>`;
}

function getAsignaturaFormBody(asignatura = {}) {
    // Filtrar solo carreras activas y ordenar por código
    const carrerasActivas = state.carreras.filter(c => c.activo).sort((a, b) => a.codigo.localeCompare(b.codigo));
    
    return `
        <form id="asignatura-form">
            <div class="form-group">
                <label for="asignatura-codigo">Código</label>
                <input type="text" id="asignatura-codigo" value="${asignatura.codigo || ''}" placeholder="Ej: MAT101, PROG205" required>
            </div>
            <div class="form-group">
                <label for="asignatura-nombre">Nombre de la Materia</label>
                <input type="text" id="asignatura-nombre" value="${asignatura.nombre || ''}" placeholder="Ej: Cálculo Diferencial, Programación Web" required>
            </div>
            <div class="form-group">
                <label for="asignatura-carrera">Carrera</label>
                <select id="asignatura-carrera" required>
                    <option value="">Selecciona una carrera</option>
                    ${carrerasActivas.map(c => `<option value="${c.nombre}" ${asignatura.carrera === c.nombre ? 'selected' : ''}>${c.codigo} - ${c.nombre}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="asignatura-modalidad">Modalidad</label>
                <select id="asignatura-modalidad" required>
                    <option value="">Selecciona una modalidad</option>
                    ${state.config.modalidades.map(m => `<option value="${m}" ${asignatura.modalidad === m ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" id="cancel-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">${asignatura.id ? 'Actualizar' : 'Guardar'}</button>
            </div>
        </form>
    `;
}

export async function handleAddAsignatura() {
    openModal({
        title: 'Nueva Asignatura',
        description: 'Completa el formulario para agregar una nueva asignatura.',
        body: getAsignaturaFormBody()
    });
}

export async function handleEditAsignatura(id) {
    const asignatura = state.asignaturas.find(a => a.id === id);
    setEditingItem(asignatura);
    openModal({
        title: 'Editar Asignatura',
        description: 'Modifica la información de la asignatura.',
        body: getAsignaturaFormBody(asignatura)
    });
}

export async function handleDeleteAsignatura(id) {
    const asignatura = state.asignaturas.find(a => a.id === id);
    const confirmed = await showConfirmDialog(`¿Estás seguro de eliminar la asignatura "${asignatura?.nombre || 'esta asignatura'}"?`);
    
    if (confirmed) {
        await api.asignaturas.delete(id);
        showToast.success('Asignatura eliminada correctamente');
        loadData('asignaturas', await api.asignaturas.getAll());
        renderCurrentView();
    }
}

export async function handleAsignaturaFormSubmit(e) {
    const formData = {
        codigo: document.getElementById('asignatura-codigo').value,
        nombre: document.getElementById('asignatura-nombre').value,
        carrera: document.getElementById('asignatura-carrera').value,
        modalidad: document.getElementById('asignatura-modalidad').value,
    };

    if (state.editingItem) {
        await api.asignaturas.update(state.editingItem.id, formData);
        showToast.success('Asignatura actualizada correctamente');
    } else {
        await api.asignaturas.add(formData);
        showToast.success('Asignatura agregada correctamente');
    }

    setEditingItem(null);
    closeModal();
    loadData('asignaturas', await api.asignaturas.getAll());
    renderCurrentView();
}