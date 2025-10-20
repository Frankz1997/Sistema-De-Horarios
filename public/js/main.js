/**
 * Punto de entrada principal del frontend
 */
import { state, setActiveView, loadData, setHorariosViewMode } from './state.js';
import { checkSession, setupAuthEventListeners, setupLogoutListener, supabase } from './auth.js';
import { renderAppLayout, renderLogin, renderSidebar, closeModal, loadAppVersion, initUserDropdown } from './ui.js';
import { showToast } from './toast.js';
import { api } from './api.js'; 
import { renderDashboard } from './views/dashboard.js';
import { renderMaestros, handleAddMaestro, handleEditMaestro, handleDeleteMaestro, handleMaestroFormSubmit } from './views/maestros.js';
import { renderAsignaturas, handleAddAsignatura, handleEditAsignatura, handleDeleteAsignatura, handleAsignaturaFormSubmit } from './views/asignaturas.js';
import { renderAulas, handleAddAula, handleEditAula, handleDeleteAula, handleAulaFormSubmit } from './views/aulas.js';
import { renderCarreras, handleAddCarrera, handleEditCarrera, handleDeleteCarrera, handleCarreraFormSubmit } from './views/carreras.js';
import { renderHorarios, renderHorariosContent, initAccordionListeners, handleAddHorario, handleEditHorario, handleDeleteHorario, handleHorarioFormSubmit } from './views/horarios.js';
import { renderReportes, handleReportesClick, handleReportesChange } from './views/reportes.js';
import { renderConfiguraciones, handleGuardarConfiguracion, handleResetConfiguracion, applyTheme, setupThemeToggle, setupHeaderThemeToggle, setupSettingsDropdowns, initConfiguracionesListeners } from './views/configuraciones.js';
import { renderMiPerfil, handleEditPerfil, handlePerfilFormSubmit } from './views/mi-perfil.js';
import { initializeCustomSelects } from './components/custom-select.js';

const appRoot = document.getElementById('app-root');

const viewRenderers = {
    dashboard: renderDashboard,
    maestros: renderMaestros,
    asignaturas: renderAsignaturas,
    aulas: renderAulas,
    carreras: renderCarreras,
    horarios: renderHorarios,
    reportes: renderReportes,
    configuraciones: renderConfiguraciones,
    'mi-perfil': renderMiPerfil,
};

export function renderCurrentView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const renderer = viewRenderers[state.activeView];
    if (renderer) {
        mainContent.innerHTML = renderer();
        lucide.createIcons();
        
        // Inicializar custom selects en la vista
        initializeCustomSelects('select:not([data-native])');
        
        // Configurar dropdowns si estamos en la vista de configuraciones
        if (state.activeView === 'configuraciones') {
            setupSettingsDropdowns();
            initConfiguracionesListeners(); // Inicializar listeners del logo
        }
        
        // Inicializar event listeners de acordeones si estamos en vista de horarios en modo lista
        if (state.activeView === 'horarios' && state.horariosViewMode === 'lista') {
            initAccordionListeners();
        }
    }
}

export function navigateTo(viewId) {
    setActiveView(viewId);
    renderCurrentView();
    renderSidebar();
}

// Función para actualizar solo el contenido de horarios sin tocar el header
function updateHorariosContent() {
    const contentContainer = document.getElementById('horarios-content-container');
    if (contentContainer) {
        // Agregar clase de animación
        contentContainer.style.opacity = '0';
        contentContainer.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            contentContainer.innerHTML = renderHorariosContent();
            lucide.createIcons();
            initializeCustomSelects('select:not([data-native])');
            
            // Inicializar event listeners de acordeones si estamos en vista lista
            if (state.horariosViewMode === 'lista') {
                initAccordionListeners();
            }
            
            // Actualizar los botones del toggle
            document.getElementById('view-calendario-btn').classList.toggle('active', state.horariosViewMode === 'calendario');
            document.getElementById('view-lista-btn').classList.toggle('active', state.horariosViewMode === 'lista');
            
            // Animar la entrada
            contentContainer.style.opacity = '1';
            contentContainer.style.transform = 'translateY(0)';
        }, 150);
    }
}

export async function loadInitialData() {
    const [maestros, asignaturas, aulas, carreras, horarios, configuraciones] = await Promise.all([
        api.maestros.getAll(),
        api.asignaturas.getAll(),
        api.aulas.getAll(),
        api.carreras.getAll(),
        api.horarios.getAll(),
        api.configuracion.getAll(),
    ]);
    loadData('maestros', maestros);
    loadData('asignaturas', asignaturas);
    loadData('aulas', aulas);
    loadData('carreras', carreras);
    loadData('horarios', horarios);
    
    // Procesar configuraciones en un objeto más accesible
    const configObj = {};
    configuraciones.forEach(config => {
        configObj[config.clave] = config.valor;
    });
    state.configuracion = configObj;
    
    // Aplicar el tema guardado
    const savedTheme = configObj.interfaz?.tema || 'light';
    applyTheme(savedTheme);
    
    // Actualizar el logo en el navbar si existe
    const logoUrl = configObj.institucion?.logo_url;
    if (logoUrl) {
        const brandIconWrapper = document.querySelector('.navbar-brand .brand-icon-wrapper');
        if (brandIconWrapper) {
            brandIconWrapper.innerHTML = `<img src="${logoUrl}" alt="Logo institucional" class="logo-institucional">`;
        }
    }
}

// Configurar listener para el logo (redirige al dashboard)
function setupBrandLogoListener() {
    const brandLogo = document.getElementById('brand-logo-link');
    if (brandLogo) {
        brandLogo.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('dashboard');
        });
    }
}

export async function initializeApp() {
    // Agregar clase para animaciones de carga inicial
    document.body.classList.add('initial-load');
    
    appRoot.innerHTML = renderAppLayout();
    setupAppEventListeners();
    setupLogoutListener(); // Configurar listener para el botón de cerrar sesión
    setupHeaderThemeToggle(); // Configurar el toggle de tema en el header
    setupBrandLogoListener(); // Configurar listener para el logo
    initUserDropdown(); // Inicializar dropdown del usuario
    await loadInitialData(); // Ahora esto funcionará
    renderSidebar(); // Y esto se ejecutará
    navigateTo('dashboard'); // Y esto también
    loadAppVersion(); // Cargar versión en el footer
    
    // Remover la clase después de que terminen las animaciones (1 segundo)
    setTimeout(() => {
        document.body.classList.remove('initial-load');
    }, 1000);
}

function setupAppEventListeners() {
    appRoot.addEventListener('click', (e) => {
        const target = e.target;
        const view = state.activeView;

        // 📱 Manejar botón hamburguesa móvil
        const mobileMenuToggle = target.closest('#mobile-menu-toggle');
        if (mobileMenuToggle) {
            toggleMobileSidebar();
            return;
        }

        // 📱 Cerrar sidebar al hacer click en el overlay
        const sidebarOverlay = target.closest('#sidebar-overlay');
        if (sidebarOverlay) {
            closeMobileSidebar();
            return;
        }

        const sidebarButton = target.closest('.sidebar-button');
        if (sidebarButton) {
            navigateTo(sidebarButton.dataset.view);
            // 📱 Cerrar sidebar en móvil después de navegar
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
            return;
        }

        // Manejar botones de accesos rápidos en el dashboard
        const quickActionBtn = target.closest('[data-quick-action]');
        if (quickActionBtn) {
            const action = quickActionBtn.dataset.quickAction;
            if (action === 'horarios') {
                // Ir a la vista de horarios en modo calendario
                setHorariosViewMode('calendario');
                navigateTo('horarios');
            } else if (action === 'maestros') {
                navigateTo('maestros');
            } else if (action === 'asignaturas') {
                navigateTo('asignaturas');
            } else if (action === 'mi-perfil') {
                navigateTo('mi-perfil');
            } else if (action === 'reportes') {
                navigateTo('reportes');
            }
            return;
        }

        // Manejar click en tarjetas de estadísticas del dashboard
        const statCard = target.closest('[data-card-action]');
        if (statCard) {
            const action = statCard.dataset.cardAction;
            if (action === 'horarios') {
                // Ir a la vista de horarios en modo calendario
                setHorariosViewMode('calendario');
                navigateTo('horarios');
            } else {
                navigateTo(action);
            }
            return;
        }

        if (view === 'maestros') {
            if (target.id === 'add-maestro-btn') handleAddMaestro();
            if (target.closest('.edit-maestro-btn')) handleEditMaestro(target.closest('.edit-maestro-btn').dataset.id);
            if (target.closest('.delete-maestro-btn')) handleDeleteMaestro(target.closest('.delete-maestro-btn').dataset.id);
        }
        else if (view === 'mi-perfil') {
            if (target.id === 'edit-perfil-btn') handleEditPerfil();
        }
        else if (view === 'asignaturas') {
            if (target.id === 'add-asignatura-btn') handleAddAsignatura();
            if (target.closest('.edit-asignatura-btn')) handleEditAsignatura(target.closest('.edit-asignatura-btn').dataset.id);
            if (target.closest('.delete-asignatura-btn')) handleDeleteAsignatura(target.closest('.delete-asignatura-btn').dataset.id);
        }
        else if (view === 'aulas') {
            if (target.id === 'add-aula-btn') handleAddAula();
            if (target.closest('.edit-aula-btn')) handleEditAula(target.closest('.edit-aula-btn').dataset.id);
            if (target.closest('.delete-aula-btn')) handleDeleteAula(target.closest('.delete-aula-btn').dataset.id);
        }
        else if (view === 'carreras') {
            if (target.id === 'add-carrera-btn') handleAddCarrera();
            if (target.closest('.edit-carrera-btn')) handleEditCarrera(target.closest('.edit-carrera-btn').dataset.id);
            if (target.closest('.delete-carrera-btn')) handleDeleteCarrera(target.closest('.delete-carrera-btn').dataset.id);
        }
        else if (view === 'horarios') {
            if (target.id === 'view-calendario-btn') { 
                setHorariosViewMode('calendario'); 
                updateHorariosContent();
            }
            if (target.id === 'view-lista-btn') { 
                setHorariosViewMode('lista'); 
                updateHorariosContent();
            }
            if (target.id === 'add-horario-btn') handleAddHorario();
            if (target.closest('.edit-horario-btn')) handleEditHorario(target.closest('.edit-horario-btn').dataset.id);
            if (target.closest('.delete-horario-btn')) handleDeleteHorario(target.closest('.delete-horario-btn').dataset.id);
        }
        else if (view === 'reportes') {
            handleReportesClick(e);
        }
        else if (view === 'configuraciones') {
            if (target.id === 'btn-guardar-config') handleGuardarConfiguracion();
            if (target.id === 'btn-cancelar-config') {
                // Recargar la vista de configuraciones para resetear los valores
                renderCurrentView();
            }
            if (target.id === 'btn-reset-config') handleResetConfiguracion();
        }
    });

    appRoot.addEventListener('change', (e) => {
        const view = state.activeView;
        if (view === 'reportes') {
            handleReportesChange(e);
        }
    });

    const modalContainer = document.getElementById('modal-container');
    modalContainer.addEventListener('submit', (e) => {
        e.preventDefault();
        if (e.target.id === 'maestro-form') handleMaestroFormSubmit(e);
        if (e.target.id === 'asignatura-form') handleAsignaturaFormSubmit(e);
        if (e.target.id === 'aula-form') handleAulaFormSubmit(e);
        if (e.target.id === 'carrera-form') handleCarreraFormSubmit(e);
        if (e.target.id === 'horario-form') handleHorarioFormSubmit(e);
        if (e.target.id === 'perfil-form') handlePerfilFormSubmit(e);
        if (e.target.id === 'account-settings-form') handleAccountSettingsFormSubmit(e);
    });

    modalContainer.addEventListener('click', (e) => {
        if (e.target.id === 'cancel-btn') closeModal();
    });
}

// 📱 Funciones para manejar el sidebar móvil
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
}

/**
 * Maneja el envío del formulario de configuración de cuenta
 */
async function handleAccountSettingsFormSubmit(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('edit-user-nombre').value.trim();
    const email = document.getElementById('edit-user-email').value.trim();
    const password = document.getElementById('edit-user-password').value.trim();
    const passwordConfirm = document.getElementById('edit-user-password-confirm').value.trim();
    const fileInput = document.getElementById('edit-user-photo');
    
    // Validación
    if (!nombre || !email) {
        showToast.error('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast.error('Por favor ingresa un correo válido');
        return;
    }
    
    // Si se está cambiando la contraseña, validar
    if (password || passwordConfirm) {
        if (password !== passwordConfirm) {
            showToast.error('Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 6) {
            showToast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
    }
    
    try {
        // Preparar datos a actualizar
        const updates = { nombre };
        let newPhotoUrl = state.user.foto_perfil;
        
        // Manejar foto de perfil
        if (fileInput && fileInput.hasAttribute('data-remove-photo')) {
            // Eliminar foto
            newPhotoUrl = null;
            updates.foto_perfil = null;
        } else if (fileInput && fileInput.hasAttribute('data-has-new-photo') && fileInput.files.length > 0) {
            // Subir nueva foto
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${state.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;
            
            // Subir archivo a Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('Error al subir foto:', uploadError);
                showToast.error('Error al subir la foto. Continuando con otros cambios...');
            } else {
                // Obtener URL pública
                const { data: urlData } = supabase.storage
                    .from('profile-photos')
                    .getPublicUrl(filePath);
                
                newPhotoUrl = urlData.publicUrl;
                updates.foto_perfil = newPhotoUrl;
            }
        }
        
        // Si cambió el email
        if (email !== state.user.email) {
            updates.email = email;
        }
        
        // Si se proporcionó una nueva contraseña
        if (password) {
            updates.password = password;
        }
        
        // Actualizar en la tabla usuarios
        const { error: userError } = await supabase
            .from('usuarios')
            .update({ nombre, foto_perfil: updates.foto_perfil || null })
            .eq('id', state.user.id);
        
        if (userError) throw userError;
        
        // Si se cambió email o contraseña, actualizar en Supabase Auth
        if (updates.email || updates.password) {
            const authUpdates = {};
            if (updates.email) authUpdates.email = updates.email;
            if (updates.password) authUpdates.password = updates.password;
            
            const { error: authError } = await supabase.auth.updateUser(authUpdates);
            if (authError) throw authError;
            
            if (updates.email) {
                showToast.info('Se ha enviado un correo de confirmación a tu nueva dirección');
            }
        }
        
        // Actualizar estado local
        state.user.nombre = nombre;
        state.user.foto_perfil = newPhotoUrl;
        if (updates.email) state.user.email = email;
        
        // Actualizar UI del nombre
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = nombre;
        }
        
        // Actualizar avatar en el navbar
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            // Buscar el elemento del avatar (puede ser un ícono o una imagen)
            const avatarIcon = userInfo.querySelector('#user-avatar-icon');
            const avatarImg = userInfo.querySelector('#user-avatar-img');
            
            if (newPhotoUrl) {
                // Si hay nueva foto, reemplazar lo que exista por imagen
                if (avatarIcon) {
                    avatarIcon.outerHTML = `<img src="${newPhotoUrl}" alt="Foto de perfil" class="user-avatar" id="user-avatar-img">`;
                } else if (avatarImg) {
                    avatarImg.src = newPhotoUrl;
                }
            } else {
                // Si se eliminó la foto, reemplazar por icono
                if (avatarImg) {
                    avatarImg.outerHTML = `<i data-lucide="user" id="user-avatar-icon"></i>`;
                    lucide.createIcons();
                }
            }
        }
        
        showToast.success('Cuenta actualizada exitosamente');
        closeModal();
        
    } catch (error) {
        console.error('Error al actualizar cuenta:', error);
        showToast.error('Error al actualizar la cuenta: ' + error.message);
    }
}

async function main() { // <--- 1. Hacer la función 'main' asíncrona
    // Aplicar tema guardado antes de mostrar cualquier cosa
    const savedTheme = localStorage.getItem('user-theme-preference');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // 2. Esperar a que checkSession termine y devuelva true o false
    if (await checkSession()) { 
        initializeApp();
    } else {
        appRoot.innerHTML = renderLogin();
        lucide.createIcons();
        initializeCustomSelects('#login-view select:not([data-native])');
        setupAuthEventListeners();
    }
}

// Ejecutar la aplicación
main();