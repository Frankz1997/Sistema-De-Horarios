/**
 * Sistema de notificaciones Toast
 * Proporciona notificaciones visuales con iconos y bordes de color
 */

// Array para llevar control de los toasts activos
let activeToasts = [];
const MAX_TOASTS = 2;
const TOAST_SPACING = 10; // Espaciado entre toasts en px

/**
 * Detecta si el tema oscuro está activo
 * @returns {boolean} True si el tema oscuro está activo
 */
function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * Reposiciona todos los toasts activos para que los nuevos estén arriba
 * Empuja los toasts viejos hacia abajo
 */
function repositionToasts() {
    const toastElements = document.querySelectorAll('.toastify');
    
    // Empujar todos los toasts existentes hacia abajo
    toastElements.forEach((element, index) => {
        const position = (toastElements.length - 1 - index);
        const newTop = 15 + (position * (element.offsetHeight + TOAST_SPACING));
        element.style.top = newTop + 'px';
    });
}

/**
 * Gestiona el límite de toasts activos
 */
function manageToastLimit() {
    // Eliminar toasts excedentes inmediatamente
    while (activeToasts.length >= MAX_TOASTS) {
        const oldestToast = activeToasts.shift();
        if (oldestToast && oldestToast.hideToast) {
            oldestToast.hideToast();
        }
    }
}

/**
 * Obtiene los estilos del toast según el tema
 * @param {string} borderColor - Color del borde izquierdo
 * @returns {object} Objeto con los estilos del toast
 */
function getToastStyles(borderColor) {
    const darkMode = isDarkMode();
    return {
        background: darkMode ? "#1e293b" : "#ffffff",
        color: darkMode ? "#f1f5f9" : "#333",
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: "8px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: "12px 14px",
        paddingRight: "40px", // Espacio para el botón de cerrar
        boxShadow: darkMode ? "0 8px 24px rgba(0, 0, 0, 0.5)" : "0 4px 12px rgba(0, 0, 0, 0.15)",
        minWidth: "300px",
        display: "flex",
        alignItems: "center",
        position: "relative",
    };
}

/**
 * Obtiene los estilos del botón de cerrar según el tema
 * @returns {string} Estilos CSS inline para el botón de cerrar
 */
function getCloseButtonStyles() {
    const darkMode = isDarkMode();
    return `
        position: absolute !important;
        right: 8px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        background: transparent !important;
        border: none !important;
        color: ${darkMode ? '#94a3b8' : '#666'} !important;
        font-size: 20px !important;
        cursor: pointer !important;
        padding: 4px !important;
        line-height: 1 !important;
        width: 24px !important;
        height: 24px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        opacity: 0.7 !important;
        transition: opacity 0.2s ease !important;
    `.trim();
}

/**
 * Muestra una notificación toast de éxito
 * @param {string} message - El mensaje a mostrar
 */
function showSuccessToast(message) {
    manageToastLimit();
    
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;align-items:center;gap:10px;height:100%;';
    
    const icon = document.createElement('div');
    icon.style.cssText = 'display:flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:18px;';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="#28a745"></circle><path d="M9 12l2 2 4-4" stroke="white"></path></svg>';
    
    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'flex:1;font-size:14px;line-height:18px;';
    
    container.appendChild(icon);
    container.appendChild(text);
    
    // Empujar toasts existentes hacia abajo ANTES de mostrar el nuevo
    const existingToasts = document.querySelectorAll('.toastify');
    existingToasts.forEach((element) => {
        const currentTop = parseInt(element.style.top) || 15;
        // Estimar altura de 60px para el nuevo toast
        element.style.top = (currentTop + 60 + TOAST_SPACING) + 'px';
    });
    
    const toast = Toastify({
        node: container,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        offset: {
            x: 15,
            y: 15  // Siempre comenzar en la posición superior
        },
        style: getToastStyles("#28a745"),
        onClick: function() {},
        callback: function() {
            // Remover del array cuando se cierre
            const index = activeToasts.indexOf(toast);
            if (index > -1) {
                activeToasts.splice(index, 1);
            }
            // Reposicionar toasts restantes con la altura correcta
            setTimeout(repositionToasts, 100);
        }
    });
    
    toast.showToast();
    activeToasts.push(toast);
    
    // Ajustar posiciones con alturas reales después del render
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            repositionToasts();
            
            // Aplicar estilos al botón de cerrar
            const toastElements = document.querySelectorAll('.toastify');
            const toastElement = toastElements[toastElements.length - 1];
            if (toastElement) {
                const closeButton = toastElement.querySelector('.toast-close');
                if (closeButton) {
                    closeButton.style.cssText = getCloseButtonStyles();
                    closeButton.addEventListener('mouseenter', () => {
                        closeButton.style.opacity = '1';
                    });
                    closeButton.addEventListener('mouseleave', () => {
                        closeButton.style.opacity = '0.7';
                    });
                }
            }
        });
    });
}

/**
 * Muestra una notificación toast de error
 * @param {string} message - El mensaje a mostrar
 * @param {object} options - Opciones adicionales (duration)
 */
function showErrorToast(message, options = {}) {
    manageToastLimit();
    
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;align-items:center;gap:10px;height:100%;';
    
    const icon = document.createElement('div');
    icon.style.cssText = 'display:flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:18px;';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="#dc3545"></circle><path d="M15 9l-6 6M9 9l6 6" stroke="white"></path></svg>';
    
    const text = document.createElement('span');
    text.innerHTML = message.replace(/\n/g, '<br>'); // Convertir saltos de línea a <br>
    text.style.cssText = 'flex:1;font-size:14px;line-height:18px;';
    
    container.appendChild(icon);
    container.appendChild(text);
    
    // Empujar toasts existentes hacia abajo ANTES de mostrar el nuevo
    const existingToasts = document.querySelectorAll('.toastify');
    existingToasts.forEach((element) => {
        const currentTop = parseInt(element.style.top) || 15;
        // Estimar altura de 60px para el nuevo toast
        element.style.top = (currentTop + 60 + TOAST_SPACING) + 'px';
    });
    
    const toast = Toastify({
        node: container,
        duration: options.duration || 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        offset: {
            x: 15,
            y: 15  // Siempre comenzar en la posición superior
        },
        style: getToastStyles("#dc3545"),
        onClick: function() {},
        callback: function() {
            // Remover del array cuando se cierre
            const index = activeToasts.indexOf(toast);
            if (index > -1) {
                activeToasts.splice(index, 1);
            }
            // Reposicionar toasts restantes con la altura correcta
            setTimeout(repositionToasts, 100);
        }
    });
    
    toast.showToast();
    activeToasts.push(toast);
    
    // Ajustar posiciones con alturas reales después del render
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            repositionToasts();
            
            // Aplicar estilos al botón de cerrar
            const toastElements = document.querySelectorAll('.toastify');
            const toastElement = toastElements[toastElements.length - 1];
            if (toastElement) {
                const closeButton = toastElement.querySelector('.toast-close');
                if (closeButton) {
                    closeButton.style.cssText = getCloseButtonStyles();
                    closeButton.addEventListener('mouseenter', () => {
                        closeButton.style.opacity = '1';
                    });
                    closeButton.addEventListener('mouseleave', () => {
                        closeButton.style.opacity = '0.7';
                    });
                }
            }
        });
    });
}

/**
 * Muestra una notificación toast informativa
 * @param {string} message - El mensaje a mostrar
 */
function showInfoToast(message) {
    manageToastLimit();
    
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;align-items:center;gap:10px;height:100%;';
    
    const icon = document.createElement('div');
    icon.style.cssText = 'display:flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:18px;';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#17a2b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="#17a2b8"></circle><path d="M12 16v-4M12 8h.01" stroke="white"></path></svg>';
    
    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'flex:1;font-size:14px;line-height:18px;';
    
    container.appendChild(icon);
    container.appendChild(text);
    
    // Empujar toasts existentes hacia abajo ANTES de mostrar el nuevo
    const existingToasts = document.querySelectorAll('.toastify');
    existingToasts.forEach((element) => {
        const currentTop = parseInt(element.style.top) || 15;
        // Estimar altura de 60px para el nuevo toast
        element.style.top = (currentTop + 60 + TOAST_SPACING) + 'px';
    });
    
    const toast = Toastify({
        node: container,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        offset: {
            x: 15,
            y: 15  // Siempre comenzar en la posición superior
        },
        style: getToastStyles("#17a2b8"),
        onClick: function() {},
        callback: function() {
            // Remover del array cuando se cierre
            const index = activeToasts.indexOf(toast);
            if (index > -1) {
                activeToasts.splice(index, 1);
            }
            // Reposicionar toasts restantes con la altura correcta
            setTimeout(repositionToasts, 100);
        }
    });
    
    toast.showToast();
    activeToasts.push(toast);
    
    // Ajustar posiciones con alturas reales después del render
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            repositionToasts();
            
            // Aplicar estilos al botón de cerrar
            const toastElements = document.querySelectorAll('.toastify');
            const toastElement = toastElements[toastElements.length - 1];
            if (toastElement) {
                const closeButton = toastElement.querySelector('.toast-close');
                if (closeButton) {
                    closeButton.style.cssText = getCloseButtonStyles();
                    closeButton.addEventListener('mouseenter', () => {
                        closeButton.style.opacity = '1';
                    });
                    closeButton.addEventListener('mouseleave', () => {
                        closeButton.style.opacity = '0.7';
                    });
                }
            }
        });
    });
}

// Objeto global para acceder a las notificaciones
window.showToast = {
    success: showSuccessToast,
    error: showErrorToast,
    info: showInfoToast
};

// Exportar para uso con módulos ES6
export const showToast = {
    success: showSuccessToast,
    error: showErrorToast,
    info: showInfoToast
};
