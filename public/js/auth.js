/**
 * Lógica de autenticación y sesión
 */

import { state, setUser } from './state.js';
import { initializeApp } from './main.js';
import { initializeCustomSelects } from './components/custom-select.js';
// This special import URL fetches the Supabase client library directly from a CDN.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
// These are your project's specific connection details.
const SUPABASE_URL = 'https://fbdazvqqbpzwenoyycuf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZGF6dnFxYnB6d2Vub3l5Y3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODgwNTYsImV4cCI6MjA3NjE2NDA1Nn0.rTAoG2KqrnRZedht3btfw_l0OdTuxfkT2e7SghfgROc';

// Initialize the Supabase client. This is the main object used to interact with Supabase.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// This variable keeps track of whether the user is on the login or register form.
let isRegistering = false;

// Caché en memoria para la verificación de admin (más rápido que localStorage)
let adminExistsCache = null;
let adminCacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 segundos

/**
 * Displays an error message using toast notification.
 * @param {string} message The error message to display.
 */
function showError(message) {
    // Usar toast en lugar de mostrar dentro del formulario
    window.showToast.error(message);
    
    // Opcional: También ocultar el elemento de error si existe
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.classList.add('hidden');
    }
}

/**
 * Verifica si ya existe un administrador en el sistema
 * Consulta la tabla usuarios de Supabase
 * @returns {Promise<boolean>} True si existe un administrador, false si no
 */
async function checkAdminExists() {
    try {
        // 🚀 Verificar caché en memoria primero (súper rápido)
        const now = Date.now();
        if (adminExistsCache !== null && adminCacheTimestamp && (now - adminCacheTimestamp < CACHE_DURATION)) {
            console.log('⚡ Usando caché en memoria:', adminExistsCache);
            return adminExistsCache;
        }
        
        console.log('🔍 Consultando base de datos...');
        
        // Consultar la tabla usuarios para ver si existe un administrador
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, role, email, nombre')
            .eq('role', 'administrador');
        
        console.log('📊 Respuesta de Supabase:', { data, error });
        
        if (error) {
            console.error('Error al verificar administrador:', error);
            return false;
        }
        
        const adminExists = data && data.length > 0;
        console.log('✅ Resultado: Admin existe =', adminExists);
        console.log('📝 Datos de admins encontrados:', data);
        
        // Guardar en caché en memoria (más rápido para próximas llamadas)
        adminExistsCache = adminExists;
        adminCacheTimestamp = now;
        
        // Guardar también en localStorage como respaldo
        localStorage.setItem('system_has_admin', adminExists ? 'true' : 'false');
        
        return adminExists;
    } catch (error) {
        console.error('Excepción al verificar administrador:', error);
        return false;
    }
}

/**
 * Bloquea o desbloquea el campo de rol según si existe un administrador
 * @param {boolean} adminExists Si existe un administrador en el sistema
 */
function updateRoleFieldState(adminExists) {
    const roleSelect = document.getElementById('role');
    if (!roleSelect) return;

    if (adminExists) {
        // Bloquear el campo en "maestro"
        roleSelect.value = 'maestro';
        roleSelect.disabled = true;
        
        // Bloquear también el custom select si existe
        const customSelect = roleSelect.nextElementSibling;
        if (customSelect && customSelect.classList.contains('custom-select')) {
            customSelect.classList.add('disabled');
            
            // Actualizar el texto visible del custom select
            const customSelectValue = customSelect.querySelector('.custom-select-value');
            if (customSelectValue) {
                customSelectValue.textContent = 'Maestro';
            }
        }
        
        // Agregar mensaje informativo
        let infoMessage = document.getElementById('role-info-message');
        if (!infoMessage) {
            infoMessage = document.createElement('small');
            infoMessage.id = 'role-info-message';
            infoMessage.style.cssText = 'display: block; margin-top: 0.5rem; color: var(--muted-foreground); font-size: 0.875rem;';
            infoMessage.innerHTML = '<i data-lucide="info" style="width: 14px; height: 14px; display: inline; vertical-align: middle;"></i> El sistema ya tiene un administrador. Solo puedes registrarte como maestro.';
            
            const roleField = document.getElementById('role-field');
            if (roleField) {
                roleField.appendChild(infoMessage);
                // Inicializar el icono de Lucide
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }
    } else {
        // Desbloquear el campo
        roleSelect.disabled = false;
        
        // Desbloquear también el custom select si existe
        const customSelect = roleSelect.nextElementSibling;
        if (customSelect && customSelect.classList.contains('custom-select')) {
            customSelect.classList.remove('disabled');
        }
        
        // Remover mensaje informativo si existe
        const infoMessage = document.getElementById('role-info-message');
        if (infoMessage) {
            infoMessage.remove();
        }
    }
}

/**
 * Handles the user login process using Supabase Auth.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 */
async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        showError(error.message);
        return;
    }

    if (data.user) {
        // Create a user profile object from the Supabase user data.
        const userProfile = {
            id: data.user.id,
            email: data.user.email,
            nombre: data.user.user_metadata.nombre,
            role: data.user.user_metadata.role
        };
        setUser(userProfile); // Update the global state
        
        // Guardar en localStorage si este usuario es admin
        if (userProfile.role === 'administrador') {
            localStorage.setItem('system_has_admin', 'true');
        }
        
        // Mostrar toast de éxito
        window.showToast.success(`¡Bienvenido ${userProfile.nombre}!`);
        
        // Inicializar la aplicación después de un breve delay para que se vea el toast
        setTimeout(() => {
            initializeApp(); // Start the main application
        }, 500);
    }
}

/**
 * Handles the user registration process using Supabase Auth.
 * @param {string} email The new user's email.
 * @param {string} password The new user's password.
 * @param {string} nombre The new user's full name.
 * @param {string} role The new user's role ('maestro' or 'administrador').
 */
async function handleRegister(email, password, nombre, role) {
    // Validar que el nombre esté presente
    if (!nombre || nombre.trim() === '') {
        showError('El nombre completo es obligatorio para el registro.');
        return;
    }

    // ⚠️ VALIDACIÓN IMPORTANTE: Si el rol es administrador, verificar que no exista otro
    if (role === 'administrador') {
        console.log('🔒 Verificando si existe un administrador...');
        localStorage.setItem('debug_last_check', 'Iniciando verificación de admin para: ' + email);
        
        const adminExists = await checkAdminExists();
        
        console.log('🔒 Administrador existe:', adminExists);
        localStorage.setItem('debug_admin_exists', adminExists.toString());
        localStorage.setItem('debug_last_check', 'Verificación completada. Admin existe: ' + adminExists);
        
        if (adminExists) {
            console.log('❌ BLOQUEANDO registro - Ya existe un admin');
            localStorage.setItem('debug_last_check', 'BLOQUEADO - Ya existe admin');
            showError('Ya existe un administrador en el sistema. Solo se permite un administrador por sistema.');
            return; // DETENER el registro
        }
        
        console.log('✅ No hay admin - Permitiendo registro');
        localStorage.setItem('debug_last_check', 'Permitido - No hay admin existente');
    }

    // Registrar usando Supabase directamente
    console.log('📝 Procediendo con registro en Supabase...');
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                nombre: nombre,
                role: role
            }
        }
    });

    if (error) {
        console.error('❌ Error en registro:', error);
        localStorage.setItem('debug_last_error', error.message);
        // Verificar si el error es porque ya existe un admin
        if (error.message && error.message.includes('administrador')) {
            showError('Ya existe un administrador en el sistema. Solo se permite un administrador por sistema.');
        } else {
            showError(error.message);
        }
        return;
    }

    if (data.user) {
        console.log('✅ Usuario registrado exitosamente');
        localStorage.setItem('debug_last_check', 'Usuario registrado: ' + email + ' como ' + role);
        window.showToast.success('¡Registro exitoso! Por favor, inicia sesión con tus nuevas credenciales.');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

/**
 * Signs the user out and reloads the page to show the login screen.
 */
async function handleLogout() {
    try {
        // Intentar cerrar sesión en Supabase
        await supabase.auth.signOut();
    } catch (error) {
        // Si hay un error, lo registramos pero continuamos con el cierre de sesión local
        console.error('Error al cerrar sesión en Supabase:', error);
    } finally {
        // Guardar la preferencia del tema antes de limpiar localStorage
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        // Siempre limpiar el estado local y recargar, incluso si hay error
        setUser(null);
        
        // Limpiar cualquier sesión almacenada localmente
        localStorage.clear();
        sessionStorage.clear();
        
        // Restaurar la preferencia del tema
        if (currentTheme) {
            localStorage.setItem('user-theme-preference', currentTheme);
        }
        
        // Mostrar mensaje de cierre de sesión exitoso
        window.showToast.success('Sesión cerrada exitosamente');
        
        // Recargar la página después de un delay para que el usuario vea el toast
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}

/**
 * Checks for an existing Supabase auth session. If found, restores the user state.
 * @returns {Promise<boolean>} True if a session exists, false otherwise.
 */
export async function checkSession() {
    // 🚀 PRE-CARGAR verificación de admin en paralelo (no bloqueante)
    // Esto hace que el caché esté listo cuando el usuario haga clic en "Regístrate"
    checkAdminExists().catch(err => console.warn('⚠️ Error precargando admin check:', err));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // If a session is found, create the user profile and update the state.
        const userProfile = {
            id: session.user.id,
            email: session.user.email,
            nombre: session.user.user_metadata.nombre,
            role: session.user.user_metadata.role
        };
        setUser(userProfile);
        return true;
    }
    return false;
}

// Replace the existing function in public/js/auth.js with this one

/**
 * Sets up all event listeners for the authentication form (login, register, toggle).
 */
export function setupAuthEventListeners() {
    const loginForm = document.getElementById('login-form');
    const toggleAuthModeLink = document.getElementById('toggle-auth-mode');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;

            if (isRegistering) {
                const nombre = e.target.nombre.value;
                const role = e.target.role.value;
                handleRegister(email, password, nombre, role);
            } else {
                handleLogin(email, password);
            }
        });
    }

    if (toggleAuthModeLink) {
        toggleAuthModeLink.addEventListener('click', async (e) => {
            e.preventDefault();
            isRegistering = !isRegistering;
            
            const authButton = document.getElementById('auth-button');
            const registerFields = document.getElementById('register-fields');
            const roleField = document.getElementById('role-field');
            const nombreInput = document.getElementById('nombre'); // Get the name input

            // --- THIS IS THE FIX ---
            // The 'nombre' field is only required when registering.
            nombreInput.required = isRegistering;

            // Update the UI to switch between login and register modes with animations
            authButton.textContent = isRegistering ? 'Registrarse' : 'Iniciar Sesión';
            toggleAuthModeLink.textContent = isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
            
            if (isRegistering) {
                // ⚡ Verificar admin INMEDIATAMENTE antes de mostrar el formulario
                const adminExists = await checkAdminExists();
                
                // Mostrar campos con animación
                registerFields.classList.remove('hidden', 'slide-up');
                registerFields.classList.add('slide-down');
                roleField.classList.remove('hidden', 'slide-up');
                roleField.classList.add('slide-down');
                
                // Inicializar custom select inmediatamente (sin setTimeout)
                // Esperar un micro-delay para que el DOM se actualice
                requestAnimationFrame(() => {
                    initializeCustomSelects('#role-field select:not([data-native])');
                    // Aplicar el estado bloqueado INMEDIATAMENTE
                    updateRoleFieldState(adminExists);
                });
            } else {
                // Ocultar campos con animación
                registerFields.classList.remove('slide-down');
                registerFields.classList.add('slide-up');
                roleField.classList.remove('slide-down');
                roleField.classList.add('slide-up');
                
                // Ocultar después de la animación
                setTimeout(() => {
                    registerFields.classList.add('hidden');
                    roleField.classList.add('hidden');
                }, 300); // Duración de la animación slideUp
            }
        });
    }
}

/**
 * Sets up the logout button event listener for authenticated users.
 * This should be called after the app is initialized.
 */
export function setupLogoutListener() {
    // This listener handles the logout button, which only exists after the app is initialized.
    document.addEventListener('click', (e) => {
        // Usar closest para capturar clicks en el botón o sus elementos internos (SVG, texto)
        const logoutBtn = e.target.closest('#logout-button');
        if (logoutBtn) {
            console.log('Logout button clicked'); // Debug
            handleLogout();
        }
    });
}