import { state, setEditingItem, loadData } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal, showConfirmDialog } from '../ui.js';
import { renderCurrentView } from '../main.js';

// Renderiza el contenido de la vista de Carreras
export function renderCarreras() {
    const header = `
        <div class="view-header">
            <div>
                <h2>Gestión de Carreras</h2>
                <p>Registra los programas académicos y carreras profesionales.</p>
            </div>
            <button id="add-carrera-btn" class="btn btn-secondary"><i data-lucide="graduation-cap"></i>Agregar Carrera</button>
        </div>
    `;

    if (state.carreras.length === 0) {
        return header + `<div class="card empty-state"><i data-lucide="graduation-cap"></i><p>No hay carreras registradas</p></div>`;
    }

    const cards = state.carreras.map(c => `
        <div class="card">
            <div class="card-header bg-blue">
                <div class="card-header-content">
                    <div class="card-title-group">
                        <div class="icon-wrapper bg-gold"><i data-lucide="graduation-cap"></i></div>
                        <div>
                            <h3 class="card-title">${c.codigo}</h3>
                            <span class="tag tag-nivel">${c.nivel_academico || ''}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="edit-carrera-btn" data-id="${c.id}"><i data-lucide="edit"></i></button>
                        <button class="delete-carrera-btn delete" data-id="${c.id}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <h3 style="margin-top:0;">${c.nombre}</h3>
                <div class="info-row">
                    <i data-lucide="building-2"></i>
                    <span>${c.departamento || 'Sin departamento'}</span>
                </div>
                <div class="info-row status-row">
                    <i data-lucide="${c.activo ? 'check-circle' : 'x-circle'}" class="status-icon ${c.activo ? 'status-active' : 'status-inactive'}"></i>
                    <span class="status-text ${c.activo ? 'status-active' : 'status-inactive'}">
                        ${c.activo ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    return header + `<div class="grid-container grid-cols-3 lg-grid-cols-3">${cards}</div>`;
}

function getCarreraFormBody(carrera = {}) {
    const nivelesAcademicos = ['Licenciatura', 'Ingeniería', 'Maestría', 'Doctorado'];
    
    return `
        <form id="carrera-form">
            <div class="form-group">
                <label for="carrera-codigo">Código de Carrera</label>
                <input type="text" id="carrera-codigo" value="${carrera.codigo || ''}" placeholder="Ej: ISC, LAE, MED" required maxlength="20">
            </div>
            <div class="form-group">
                <label for="carrera-nombre">Nombre de la Carrera</label>
                <input type="text" id="carrera-nombre" value="${carrera.nombre || ''}" placeholder="Ej: Ingeniería en Sistemas Computacionales" required>
            </div>
            <div class="form-group">
                <label for="carrera-nivel">Nivel Académico</label>
                <select id="carrera-nivel" required>
                    <option value="">Selecciona un nivel</option>
                    ${nivelesAcademicos.map(n => `<option value="${n}" ${carrera.nivel_academico === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="carrera-departamento">Departamento / Facultad</label>
                <input type="text" id="carrera-departamento" value="${carrera.departamento || ''}" placeholder="Ej: Facultad de Ingeniería">
            </div>
            <div class="form-group">
                <label for="carrera-activo">Estado</label>
                <select id="carrera-activo" required>
                    <option value="true" ${carrera.activo !== false ? 'selected' : ''}>Activa</option>
                    <option value="false" ${carrera.activo === false ? 'selected' : ''}>Inactiva</option>
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" id="cancel-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">${carrera.id ? 'Actualizar' : 'Guardar'}</button>
            </div>
        </form>
    `;
}

export async function handleAddCarrera() {
    openModal({
        title: 'Nueva Carrera',
        description: 'Completa el formulario para agregar una nueva carrera o programa académico.',
        body: getCarreraFormBody()
    });
}

export async function handleEditCarrera(id) {
    const carrera = state.carreras.find(c => c.id === id);
    setEditingItem(carrera);
    openModal({
        title: 'Editar Carrera',
        description: 'Modifica la información de la carrera.',
        body: getCarreraFormBody(carrera)
    });
}

export async function handleDeleteCarrera(id) {
    const carrera = state.carreras.find(c => c.id === id);
    const confirmed = await showConfirmDialog(
        'Eliminar Carrera',
        `¿Estás seguro de eliminar la carrera "${carrera?.nombre || 'esta carrera'}"?\n\nEsta acción no se puede deshacer.`,
        'Eliminar',
        'Cancelar'
    );
    
    if (confirmed) {
        try {
            await api.carreras.delete(id);
            showToast.success('Carrera eliminada correctamente');
            loadData('carreras', await api.carreras.getAll());
            renderCurrentView();
        } catch (error) {
            console.error('Error al eliminar carrera:', error);
            showToast.error('Error al eliminar la carrera. Puede estar en uso.');
        }
    }
}

export async function handleCarreraFormSubmit(e) {
    const formData = {
        codigo: document.getElementById('carrera-codigo').value.trim().toUpperCase(),
        nombre: document.getElementById('carrera-nombre').value.trim(),
        nivel_academico: document.getElementById('carrera-nivel').value,
        departamento: document.getElementById('carrera-departamento').value.trim() || null,
        activo: document.getElementById('carrera-activo').value === 'true',
    };

    // Validaciones
    if (!formData.codigo) {
        showToast.error('El código de carrera es obligatorio');
        return;
    }

    if (!formData.nombre) {
        showToast.error('El nombre de la carrera es obligatorio');
        return;
    }

    if (!formData.nivel_academico) {
        showToast.error('Debes seleccionar un nivel académico');
        return;
    }

    try {
        if (state.editingItem) {
            await api.carreras.update(state.editingItem.id, formData);
            showToast.success('Carrera actualizada correctamente');
        } else {
            await api.carreras.add(formData);
            showToast.success('Carrera agregada correctamente');
        }

        setEditingItem(null);
        closeModal();
        loadData('carreras', await api.carreras.getAll());
        renderCurrentView();
    } catch (error) {
        console.error('Error al guardar carrera:', error);
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
            showToast.error(`El código "${formData.codigo}" ya está en uso`);
        } else {
            showToast.error('Error al guardar la carrera');
        }
    }
}
