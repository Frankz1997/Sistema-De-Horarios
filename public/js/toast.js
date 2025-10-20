/**
 * Sistema de notificaciones Toast
 * Proporciona notificaciones visuales con iconos y bordes de color
 */

/**
 * Detecta si el tema oscuro está activo
 * @returns {boolean} True si el tema oscuro está activo
 */
function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
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
        boxShadow: darkMode ? "0 8px 24px rgba(0, 0, 0, 0.5)" : "0 4px 12px rgba(0, 0, 0, 0.15)",
        minWidth: "300px",
        display: "flex",
        alignItems: "center",
    };
}

/**
 * Muestra una notificación toast de éxito
 * @param {string} message - El mensaje a mostrar
 */
function showSuccessToast(message) {
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
    
    Toastify({
        node: container,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: getToastStyles("#28a745")
    }).showToast();
}

/**
 * Muestra una notificación toast de error
 * @param {string} message - El mensaje a mostrar
 * @param {object} options - Opciones adicionales (duration)
 */
function showErrorToast(message, options = {}) {
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
    
    Toastify({
        node: container,
        duration: options.duration || 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: getToastStyles("#dc3545")
    }).showToast();
}

/**
 * Muestra una notificación toast informativa
 * @param {string} message - El mensaje a mostrar
 */
function showInfoToast(message) {
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
    
    Toastify({
        node: container,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: getToastStyles("#17a2b8")
    }).showToast();
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
