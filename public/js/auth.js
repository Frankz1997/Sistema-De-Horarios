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
    // --- THIS IS THE FIX ---
    // Manually check if the name is provided during registration.
    if (!nombre || nombre.trim() === '') {
        showError('El nombre completo es obligatorio para el registro.');
        return; // Stop the function if the name is missing
    }

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
        showError(error.message);
        return;
    }

    if (data.user) {
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
 * Checks if there is an active session stored in the browser.
 * @returns {boolean} True if a session exists, false otherwise.
 */
export async function checkSession() {
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
        toggleAuthModeLink.addEventListener('click', (e) => {
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
                // Mostrar campos con animación
                registerFields.classList.remove('hidden', 'slide-up');
                registerFields.classList.add('slide-down');
                roleField.classList.remove('hidden', 'slide-up');
                roleField.classList.add('slide-down');
                
                // Inicializar custom select para el campo de rol después de que sea visible
                setTimeout(() => {
                    initializeCustomSelects('#role-field select:not([data-native])');
                }, 350); // Esperar a que termine la animación
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