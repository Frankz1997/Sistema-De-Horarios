//**
// Maneja la UI: modales, sidebar, notificaciones
// */

import { state } from './state.js';
import { initializeCustomSelects } from './components/custom-select.js';

// Renderiza la pantalla de login

export function renderLogin() {
    return `
    <div id="login-view" class="view">
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <div class="logo-container"><i data-lucide="graduation-cap" class="logo-icon"></i></div>
                    <h1>Sistema de Horarios</h1>
                    <p>Facultad de Informática Mazatlán - UAS</p>
                </div>
                <div class="login-content">
                    <form id="login-form" novalidate>
                        <div id="register-fields" class="hidden">
                             <div class="form-group">
                                <label for="nombre">Nombre Completo</label>
                                <input type="text" id="nombre" name="nombre" placeholder="Ej: Juan Pérez">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="email">Correo Electrónico</label>
                            <div class="input-with-icon">
                                <i data-lucide="mail"></i>
                                <input type="email" id="email" name="email" placeholder="correo@uas.edu.mx" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <div class="input-with-icon">
                                <i data-lucide="lock"></i>
                                <input type="password" id="password" name="password" placeholder="••••••••" required>
                            </div>
                        </div>
                         <div id="role-field" class="form-group hidden">
                            <label for="role">Rol</label>
                            <select id="role" name="role">
                                <option value="maestro">Maestro</option>
                                <option value="administrador">Administrador</option>
                            </select>
                        </div>
                        <button type="submit" id="auth-button" class="btn btn-primary">Iniciar Sesión</button>
                        <div class="auth-toggle">
                            <a href="#" id="toggle-auth-mode">¿No tienes cuenta? Regístrate</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

// Renderiza el layout principal de la aplicación (navbar, sidebar, main container)
export function renderAppLayout() {
    // Obtener logo de la configuración
    const logoUrl = state.configuracion?.institucion?.logo_url;
    const logoHTML = logoUrl 
        ? `<img src="${logoUrl}" alt="Logo institucional" class="logo-institucional">`
        : `<i data-lucide="graduation-cap"></i>`;
    
    return `
    <div id="app-view" class="view">
        <nav class="navbar">
            <div class="container">
                <button id="mobile-menu-toggle" class="mobile-menu-toggle" aria-label="Abrir menú">
                    <i data-lucide="menu"></i>
                </button>
                <div class="navbar-brand">
                    <a href="#" id="brand-logo-link" class="brand-icon-wrapper" title="Ir al inicio">${logoHTML}</a>
                    <div class="navbar-brand-text">
                        <h1>Sistema de Horarios</h1>
                        <p>Facultad de Informática Mazatlán - UAS</p>
                    </div>
                </div>
                <div class="navbar-user">
                    <button id="theme-toggle-btn" class="theme-toggle-header" title="Cambiar tema">
                        <i data-lucide="sun" id="theme-icon"></i>
                    </button>
                    <div class="user-info">
                        <i data-lucide="user"></i>
                        <div>
                            <p id="user-name">${state.user.nombre}</p>
                            <p id="user-role" class="capitalize">${state.user.role}</p>
                        </div>
                    </div>
                    <button id="logout-button" class="btn btn-ghost"><i data-lucide="log-out"></i> <span class="btn-text">Salir</span></button>
                </div>
            </div>
        </nav>
        <div class="main-layout">
            <aside class="sidebar" id="sidebar"><div class="sidebar-menu"></div></aside>
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
            <main id="main-content" class="main-content"></main>
        </div>
    </div>`;
}

// Renderiza la barra lateral (sidebar)
export function renderSidebar() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (!sidebarMenu) return;

    const menuItems = [
        { id: 'dashboard', label: 'Inicio', icon: 'layout-dashboard', roles: ['administrador', 'maestro'] },
        { id: 'maestros', label: 'Maestros', icon: 'users', roles: ['administrador'] },
        { id: 'asignaturas', label: 'Asignaturas', icon: 'book-open', roles: ['administrador'] },
        { id: 'aulas', label: 'Aulas', icon: 'door-open', roles: ['administrador'] },
        { id: 'horarios', label: 'Horarios', icon: 'calendar', roles: ['administrador', 'maestro'] },
        { id: 'reportes', label: 'Reportes', icon: 'file-text', roles: ['administrador', 'maestro'] },
        { id: 'configuraciones', label: 'Configuración', icon: 'settings', roles: ['administrador'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(state.user.role));

    sidebarMenu.innerHTML = filteredItems.map(item => `
        <button class="sidebar-button ${state.activeView === item.id ? 'active' : ''}" data-view="${item.id}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
        </button>
    `).join('');
    lucide.createIcons();
}

// Lógica del Modal
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContainer = document.getElementById('modal-container');

export function openModal({ title, description, body }) {
    modalContainer.innerHTML = `
        <div class="modal-header">
            <div class="modal-header-content">
                <h2 id="modal-title">${title}</h2>
                <p id="modal-description">${description}</p>
            </div>
            <button type="button" class="modal-close-btn" id="modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div id="modal-body" class="modal-body">${body}</div>
    `;
    modalBackdrop.classList.remove('hidden');
    lucide.createIcons();
    
    // Inicializar custom selects en el modal
    initializeCustomSelects('#modal-container select:not([data-native])');
    
    // Agregar event listener al botón X
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Event listener para botones de días disponibles
    const toggleDiaBtns = document.querySelectorAll('.toggle-dia');
    toggleDiaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('selected');
        });
    });
    
    // Event listeners para gestión de horarios
    setupHorariosEventListeners();
}

function setupHorariosEventListeners() {
    // Array temporal para almacenar rangos
    let rangosTemporales = [];
    
    // Cargar rangos existentes al abrir el modal
    const rangosExistentes = document.querySelectorAll('.rango-item');
    rangosTemporales = Array.from(rangosExistentes).map(item => {
        const texto = item.querySelector('.rango-text').textContent;
        const [inicio, fin] = texto.split(' - ');
        return { inicio, fin };
    });
    
    // Botones de selección rápida
    const quickTimeBtns = document.querySelectorAll('.btn-quick-time');
    quickTimeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Definir los rangos de selección rápida
            const RANGOS_RAPIDOS = [
                { inicio: '07:00', fin: '14:00' }, // Matutino
                { inicio: '14:00', fin: '21:00' }, // Vespertino
                { inicio: '07:00', fin: '21:00' }  // Todo el día
            ];
            
            const inicio = btn.dataset.inicio;
            const fin = btn.dataset.fin;
            
            // Verificar si ya existe este rango exacto
            const rangoExiste = rangosTemporales.some(r => r.inicio === inicio && r.fin === fin);
            
            if (rangoExiste) {
                showToast.info('Este rango ya está agregado');
                return;
            }
            
            // Eliminar cualquier rango de selección rápida existente
            rangosTemporales = rangosTemporales.filter(r => {
                return !RANGOS_RAPIDOS.some(rr => rr.inicio === r.inicio && rr.fin === r.fin);
            });
            
            // Remover la clase 'selected' de todos los botones rápidos
            quickTimeBtns.forEach(b => b.classList.remove('selected'));
            
            // Agregar la clase 'selected' al botón clickeado
            btn.classList.add('selected');
            
            // Agregar el nuevo rango
            rangosTemporales.push({ inicio, fin });
            renderizarRangos();
            showToast.success('Rango agregado');
        });
    });
    
    // Botón de agregar rango personalizado
    const btnAddRango = document.getElementById('btn-add-rango');
    if (btnAddRango) {
        btnAddRango.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover la clase 'selected' de todos los botones rápidos al usar personalizado
            quickTimeBtns.forEach(btn => btn.classList.remove('selected'));
            
            const horaInicio = document.getElementById('hora-inicio').value;
            const horaFin = document.getElementById('hora-fin').value;
            
            if (!horaInicio || !horaFin) {
                showToast.error('Por favor selecciona hora de inicio y fin');
                return;
            }
            
            if (horaInicio >= horaFin) {
                showToast.error('La hora de inicio debe ser menor que la hora de fin');
                return;
            }
            
            agregarRango(horaInicio, horaFin);
        });
    }
    
    // Event listeners para los inputs de hora (remover selección al interactuar)
    const horaInicioInput = document.getElementById('hora-inicio');
    const horaFinInput = document.getElementById('hora-fin');
    
    [horaInicioInput, horaFinInput].forEach(input => {
        if (input) {
            input.addEventListener('focus', () => {
                // Remover selección de botones rápidos al interactuar con inputs
                quickTimeBtns.forEach(btn => btn.classList.remove('selected'));
            });
        }
    });
    
    // Función para agregar un rango personalizado
    function agregarRango(inicio, fin) {
        // Verificar si el rango ya existe
        const rangoExiste = rangosTemporales.some(r => r.inicio === inicio && r.fin === fin);
        if (rangoExiste) {
            showToast.info('Este rango ya está agregado');
            return;
        }
        
        rangosTemporales.push({ inicio, fin });
        renderizarRangos();
        showToast.success('Rango agregado');
    }
    
    // Función para eliminar un rango
    function eliminarRango(index) {
        rangosTemporales.splice(index, 1);
        renderizarRangos();
        showToast.info('Rango eliminado');
    }
    
    // Función para renderizar la lista de rangos
    function renderizarRangos() {
        const rangosList = document.getElementById('rangos-list');
        const rangosContainer = document.getElementById('rangos-container');
        
        if (!rangosList) return;
        
        if (rangosTemporales.length === 0) {
            // Colapsar con animación
            rangosContainer.classList.remove('expanded');
            rangosContainer.classList.add('collapsed');
            
            // Limpiar después de la animación
            setTimeout(() => {
                rangosList.innerHTML = '';
            }, 300);
            return;
        }
        
        // Expandir con animación
        rangosContainer.classList.remove('collapsed');
        rangosContainer.classList.add('expanded');
        
        rangosList.innerHTML = rangosTemporales.map((rango, index) => `
            <div class="rango-item" data-index="${index}">
                <span class="rango-text">${rango.inicio} - ${rango.fin}</span>
                <button type="button" class="btn-remove-rango" data-index="${index}">
                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                </button>
            </div>
        `).join('');
        
        lucide.createIcons();
    }
    
    // Delegación de eventos para los botones de eliminar (funciona con rangos existentes y nuevos)
    const rangosList = document.getElementById('rangos-list');
    if (rangosList) {
        rangosList.addEventListener('click', (e) => {
            const btnRemove = e.target.closest('.btn-remove-rango');
            if (btnRemove) {
                e.preventDefault();
                const index = parseInt(btnRemove.dataset.index);
                eliminarRango(index);
            }
        });
    }
}

export function closeModal() {
    // Agregar clase de cierre para activar animación
    modalBackdrop.classList.add('closing');
    
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
        modalBackdrop.classList.add('hidden');
        modalBackdrop.classList.remove('closing');
        modalContainer.innerHTML = '';
    }, 200); // Debe coincidir con la duración de la animación fadeOut
}

/**
 * Muestra un modal de confirmación personalizado
 * @param {string} message - Mensaje de confirmación
 * @returns {Promise<boolean>} - True si el usuario confirma, false si cancela
 */
export function showConfirmDialog(message) {
    return new Promise((resolve) => {
        const confirmBody = `
            <div style="text-align: center; padding: 0.5rem 0;">
                <div style="margin-bottom: 1rem;">
                    <i data-lucide="alert-triangle" style="width: 40px; height: 40px; color: #FFB71B; margin-bottom: 0.75rem;"></i>
                    <p style="font-size: 0.95rem; color: var(--foreground); margin: 0; line-height: 1.4;">${message}</p>
                </div>
                <div class="modal-footer" style="justify-content: center; gap: 0.75rem; padding-top: 0.5rem;">
                    <button type="button" class="btn btn-outline" id="confirm-cancel-btn" style="padding: 0.5rem 1.25rem; font-size: 0.9rem;">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn" style="padding: 0.5rem 1.25rem; font-size: 0.9rem;">Eliminar</button>
                </div>
            </div>
        `;

        modalContainer.innerHTML = `
            <div class="modal-header">
                <div class="modal-header-content">
                    <h2 id="modal-title">Confirmar Eliminación</h2>
                    <p id="modal-description">Esta acción no se puede deshacer.</p>
                </div>
                <button type="button" class="modal-close-btn" id="confirm-modal-close">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div id="modal-body" class="modal-body">${confirmBody}</div>
        `;
        
        modalBackdrop.classList.remove('hidden');
        lucide.createIcons();

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            // Agregar clase de cierre para activar animación
            modalBackdrop.classList.add('closing');
            
            // Remover event listeners inmediatamente
            document.getElementById('confirm-delete-btn')?.removeEventListener('click', handleConfirm);
            document.getElementById('confirm-cancel-btn')?.removeEventListener('click', handleCancel);
            document.getElementById('confirm-modal-close')?.removeEventListener('click', handleCancel);
            
            // Esperar a que termine la animación antes de ocultar
            setTimeout(() => {
                modalBackdrop.classList.add('hidden');
                modalBackdrop.classList.remove('closing');
                modalContainer.innerHTML = '';
            }, 200);
        };

        document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirm);
        document.getElementById('confirm-cancel-btn').addEventListener('click', handleCancel);
        document.getElementById('confirm-modal-close').addEventListener('click', handleCancel);
        
        // También permitir cancelar haciendo click en el backdrop
        const backdropHandler = (e) => {
            if (e.target === modalBackdrop) {
                modalBackdrop.removeEventListener('click', backdropHandler);
                handleCancel();
            }
        };
        modalBackdrop.addEventListener('click', backdropHandler);
    });
}

// Event listener para cerrar el modal
modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
        closeModal();
    }
});