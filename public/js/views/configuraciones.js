import { state } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../toast.js';
import { showConfirmDialog } from '../ui.js';

export function renderConfiguraciones() {
    const header = `
        <div class="view-header">
            <div>
                <h2>Configuración del Sistema</h2>
                <p>Personaliza el comportamiento del sistema académico.</p>
            </div>
        </div>
    `;

    // Obtener valores actuales de configuración
    const horarios = state.configuracion?.horarios || {
        duracion_bloque: 60,
        hora_inicio: '07:00',
        hora_fin: '21:00',
        intervalo_entre_bloques: 0
    };

    const validaciones = state.configuracion?.validaciones || {
        max_horas_maestro_dia: 8,
        permitir_solapamiento: false,
        tiempo_minimo_descanso: 0,
        max_alumnos_por_aula: 40
    };

    const institucion = state.configuracion?.institucion || {
        nombre: 'Universidad Autónoma de Sinaloa',
        logo_url: '',
        coordinador: '',
        email_contacto: ''
    };

    const interfaz = state.configuracion?.interfaz || {
        items_por_pagina: 12,
        tema: 'light',
        mostrar_tooltips: true
    };

    const content = `
        <div class="settings-container">
            <!-- Sección 1: Configuración de Horarios -->
            <div class="settings-section collapsed" data-section="horarios">
                <div class="settings-section-header" role="button" tabindex="0">
                    <div class="settings-icon-wrapper bg-gold">
                        <i data-lucide="clock"></i>
                    </div>
                    <div class="settings-header-text">
                        <h3>Configuración de Horarios</h3>
                        <p>Define la estructura temporal de las clases</p>
                    </div>
                    <i data-lucide="chevron-down" class="settings-toggle-icon"></i>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label for="duracion-bloque">Duración de bloques (minutos)</label>
                        <input type="number" id="duracion-bloque" value="${horarios.duracion_bloque}" min="15" max="240" step="5" class="config-input">
                        <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">Duración de cada bloque de clase (valores comunes: 50, 60, 90 minutos)</small>
                    </div>
                    <div class="grid-container grid-cols-2" style="gap: 1rem;">
                        <div class="form-group">
                            <label for="hora-inicio-config">Hora de inicio del día</label>
                            <input type="time" id="hora-inicio-config" value="${horarios.hora_inicio}" class="config-input">
                        </div>
                        <div class="form-group">
                            <label for="hora-fin-config">Hora de fin del día</label>
                            <input type="time" id="hora-fin-config" value="${horarios.hora_fin}" class="config-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="intervalo-bloques">Intervalo entre bloques (minutos)</label>
                        <input type="number" id="intervalo-bloques" value="${horarios.intervalo_entre_bloques}" min="0" max="30" class="config-input">
                        <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">Tiempo de descanso entre cada clase (0 = sin descanso)</small>
                    </div>
                </div>
            </div>

            <!-- Sección 2: Reglas de Validación -->
            <div class="settings-section collapsed" data-section="validaciones">
                <div class="settings-section-header" role="button" tabindex="0">
                    <div class="settings-icon-wrapper bg-blue">
                        <i data-lucide="shield-check"></i>
                    </div>
                    <div class="settings-header-text">
                        <h3>Reglas de Validación</h3>
                        <p>Establece límites y restricciones del sistema</p>
                    </div>
                    <i data-lucide="chevron-down" class="settings-toggle-icon"></i>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label for="max-horas-maestro">Máximo de horas por maestro al día</label>
                        <input type="number" id="max-horas-maestro" value="${validaciones.max_horas_maestro_dia}" min="1" max="12" class="config-input">
                        <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">Límite de horas que un maestro puede impartir en un solo día</small>
                    </div>
                    <div class="form-group">
                        <label for="tiempo-descanso-maestro">Tiempo mínimo de descanso del maestro (minutos)</label>
                        <input type="number" id="tiempo-descanso-maestro" value="${validaciones.tiempo_minimo_descanso}" min="0" max="120" class="config-input">
                        <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">Descanso mínimo entre clases del mismo maestro</small>
                    </div>
                    <div class="form-group">
                        <label for="max-alumnos-aula">Capacidad máxima por aula (alumnos)</label>
                        <input type="number" id="max-alumnos-aula" value="${validaciones.max_alumnos_por_aula}" min="10" max="100" class="config-input">
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="permitir-solapamiento" ${validaciones.permitir_solapamiento ? 'checked' : ''} class="config-input">
                            <span>Permitir solapamiento de horarios</span>
                        </label>
                        <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">Si está habilitado, permite asignar el mismo maestro, aula o asignatura en horarios simultáneos</small>
                    </div>
                </div>
            </div>

            <!-- Sección 3: Información Institucional -->
            <div class="settings-section collapsed" data-section="institucion">
                <div class="settings-section-header" role="button" tabindex="0">
                    <div class="settings-icon-wrapper bg-gold">
                        <i data-lucide="building-2"></i>
                    </div>
                    <div class="settings-header-text">
                        <h3>Información Institucional</h3>
                        <p>Datos generales de la institución</p>
                    </div>
                    <i data-lucide="chevron-down" class="settings-toggle-icon"></i>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label for="nombre-institucion">Nombre de la institución</label>
                        <input type="text" id="nombre-institucion" value="${institucion.nombre}" class="config-input">
                    </div>
                    
                    <!-- Campo para subir logo -->
                    <div class="form-group">
                        <label for="logo-institucion">Logo institucional</label>
                        <div class="logo-upload-container">
                            <div class="logo-preview" id="logo-preview">
                                ${institucion.logo_url 
                                    ? `<img src="${institucion.logo_url}" alt="Logo actual" class="logo-preview-img">`
                                    : `<div class="logo-placeholder">
                                        <i data-lucide="image"></i>
                                        <span>Sin logo</span>
                                       </div>`
                                }
                            </div>
                            <div class="logo-upload-controls">
                                <input type="file" id="logo-institucion" accept="image/*" style="display: none;">
                                <button type="button" class="btn btn-outline btn-sm" id="btn-seleccionar-logo">
                                    <i data-lucide="upload"></i>
                                    Seleccionar imagen
                                </button>
                                ${institucion.logo_url 
                                    ? `<button type="button" class="btn btn-outline btn-sm btn-danger" id="btn-eliminar-logo">
                                        <i data-lucide="trash-2"></i>
                                        Eliminar
                                       </button>`
                                    : ''
                                }
                                <small style="color: var(--muted-foreground); display: block; margin-top: 0.5rem;">
                                    Se recomienda una imagen cuadrada o rectangular con fondo transparente (PNG). Tamaño máximo: 2MB
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="direccion-institucion">Dirección</label>
                        <input type="text" id="direccion-institucion" value="${institucion.direccion || ''}" placeholder="Ingrese la dirección" class="config-input">
                    </div>
                    <div class="grid-container grid-cols-2" style="gap: 1rem;">
                        <div class="form-group">
                            <label for="telefono-institucion">Teléfono</label>
                            <input type="tel" id="telefono-institucion" value="${institucion.telefono || ''}" placeholder="(123) 456-7890" class="config-input">
                        </div>
                        <div class="form-group">
                            <label for="email-institucion">Correo electrónico</label>
                            <input type="email" id="email-institucion" value="${institucion.email_contacto}" placeholder="contacto@institución.edu" class="config-input">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección 4: Preferencias de Interfaz -->
            <div class="settings-section collapsed" data-section="interfaz">
                <div class="settings-section-header" role="button" tabindex="0">
                    <div class="settings-icon-wrapper bg-blue">
                        <i data-lucide="layout-dashboard"></i>
                    </div>
                    <div class="settings-header-text">
                        <h3>Preferencias de Interfaz</h3>
                        <p>Personaliza la apariencia y comportamiento</p>
                    </div>
                    <i data-lucide="chevron-down" class="settings-toggle-icon"></i>
                </div>
                <div class="settings-content">
                    <div class="form-group">
                        <label for="items-por-pagina">Elementos por página</label>
                        <select id="items-por-pagina" class="config-input">
                            <option value="6" ${interfaz.items_por_pagina === 6 ? 'selected' : ''}>6 elementos</option>
                            <option value="9" ${interfaz.items_por_pagina === 9 ? 'selected' : ''}>9 elementos</option>
                            <option value="12" ${interfaz.items_por_pagina === 12 ? 'selected' : ''}>12 elementos</option>
                            <option value="18" ${interfaz.items_por_pagina === 18 ? 'selected' : ''}>18 elementos</option>
                        </select>
                        <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">Cantidad de tarjetas mostradas en las vistas de maestros, asignaturas, etc.</small>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="mostrar-tooltips" ${interfaz.mostrar_tooltips ? 'checked' : ''} class="config-input">
                            <span>Mostrar tooltips de ayuda</span>
                        </label>
                        <small style="color: var(--muted-foreground); display: block; margin-top: 0.25rem;">Muestra información adicional al pasar el cursor sobre elementos</small>
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="settings-footer">
                <button type="button" id="btn-reset-config" class="btn btn-outline" style="margin-right: auto;">
                    <i data-lucide="refresh-ccw"></i>
                    Restaurar Valores por Defecto
                </button>
                <button type="button" id="btn-cancelar-config" class="btn btn-secondary">
                    Cancelar
                </button>
                <button type="button" id="btn-guardar-config" class="btn btn-primary">
                    Guardar Cambios
                </button>
            </div>
        </div>
    `;

    return header + content;
}

// Variable global para almacenar el logo cargado
let logoBase64 = null;

// Función para inicializar los event listeners de configuraciones
export function initConfiguracionesListeners() {
    // Botón para seleccionar logo
    const btnSeleccionarLogo = document.getElementById('btn-seleccionar-logo');
    const inputLogo = document.getElementById('logo-institucion');
    const logoPreview = document.getElementById('logo-preview');
    const btnEliminarLogo = document.getElementById('btn-eliminar-logo');
    
    if (btnSeleccionarLogo && inputLogo) {
        btnSeleccionarLogo.addEventListener('click', () => {
            inputLogo.click();
        });
        
        inputLogo.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showToast.error('Por favor selecciona un archivo de imagen válido');
                return;
            }
            
            // Validar tamaño (2MB máximo)
            if (file.size > 2 * 1024 * 1024) {
                showToast.error('La imagen no debe superar los 2MB');
                return;
            }
            
            // Convertir a base64
            const reader = new FileReader();
            reader.onload = (event) => {
                logoBase64 = event.target.result;
                
                // Actualizar preview
                logoPreview.innerHTML = `<img src="${logoBase64}" alt="Preview del logo" class="logo-preview-img">`;
                
                // Agregar botón de eliminar si no existe
                if (!document.getElementById('btn-eliminar-logo')) {
                    const btnEliminar = document.createElement('button');
                    btnEliminar.type = 'button';
                    btnEliminar.className = 'btn btn-outline btn-sm btn-danger';
                    btnEliminar.id = 'btn-eliminar-logo';
                    btnEliminar.innerHTML = '<i data-lucide="trash-2"></i> Eliminar';
                    btnSeleccionarLogo.parentElement.insertBefore(btnEliminar, btnSeleccionarLogo.nextSibling);
                    
                    // Inicializar iconos de Lucide
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                    
                    // Agregar listener al nuevo botón
                    btnEliminar.addEventListener('click', eliminarLogo);
                }
                
                showToast.success('Logo cargado correctamente');
                
                // Inicializar iconos de Lucide
                if (window.lucide) {
                    lucide.createIcons();
                }
            };
            reader.onerror = () => {
                showToast.error('Error al cargar la imagen');
            };
            reader.readAsDataURL(file);
        });
    }
    
    if (btnEliminarLogo) {
        btnEliminarLogo.addEventListener('click', eliminarLogo);
    }
    
    function eliminarLogo() {
        logoBase64 = '';
        logoPreview.innerHTML = `
            <div class="logo-placeholder">
                <i data-lucide="image"></i>
                <span>Sin logo</span>
            </div>
        `;
        inputLogo.value = '';
        
        const btnEliminar = document.getElementById('btn-eliminar-logo');
        if (btnEliminar) {
            btnEliminar.remove();
        }
        
        showToast.info('Logo eliminado');
        
        // Inicializar iconos de Lucide
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

export async function handleGuardarConfiguracion() {
    try {
        // Recopilar datos de horarios
        const horariosData = {
            duracion_bloque: parseInt(document.getElementById('duracion-bloque').value),
            hora_inicio: document.getElementById('hora-inicio-config').value,
            hora_fin: document.getElementById('hora-fin-config').value,
            intervalo_entre_bloques: parseInt(document.getElementById('intervalo-bloques').value)
        };

        // Recopilar datos de validaciones
        const validacionesData = {
            max_horas_maestro_dia: parseInt(document.getElementById('max-horas-maestro').value),
            tiempo_minimo_descanso: parseInt(document.getElementById('tiempo-descanso-maestro').value),
            max_alumnos_por_aula: parseInt(document.getElementById('max-alumnos-aula').value),
            permitir_solapamiento: document.getElementById('permitir-solapamiento').checked
        };

        // Recopilar datos de institución
        const institucionData = {
            nombre: document.getElementById('nombre-institucion').value,
            direccion: document.getElementById('direccion-institucion').value,
            telefono: document.getElementById('telefono-institucion').value,
            email_contacto: document.getElementById('email-institucion').value,
            coordinador: document.getElementById('coordinador')?.value || '',
            // Si hay un nuevo logo cargado, usar ese; si no, mantener el actual o vacío si se eliminó
            logo_url: logoBase64 !== null ? logoBase64 : (state.configuracion?.institucion?.logo_url || '')
        };

        // Recopilar datos de interfaz
        // El tema ya no se modifica aquí, se controla desde el header
        const currentTheme = state.configuracion?.interfaz?.tema || 'light';
        const interfazData = {
            items_por_pagina: parseInt(document.getElementById('items-por-pagina').value),
            tema: currentTheme, // Mantener el tema actual
            mostrar_tooltips: document.getElementById('mostrar-tooltips').checked
        };

        // Validaciones básicas
        if (horariosData.hora_inicio >= horariosData.hora_fin) {
            showToast.error('La hora de inicio debe ser menor que la hora de fin');
            return;
        }

        // Guardar cada configuración
        console.log('Guardando horarios:', horariosData);
        await api.configuracion.update('horarios', horariosData);
        
        console.log('Guardando validaciones:', validacionesData);
        await api.configuracion.update('validaciones', validacionesData);
        
        console.log('Guardando institución:', institucionData);
        await api.configuracion.update('institucion', institucionData);
        
        console.log('Guardando interfaz:', interfazData);
        await api.configuracion.update('interfaz', interfazData);

        // Actualizar el estado global
        state.configuracion = {
            horarios: horariosData,
            validaciones: validacionesData,
            institucion: institucionData,
            interfaz: interfazData
        };

        // Aplicar el tema inmediatamente
        applyTheme(interfazData.tema);

        showToast.success('Configuración guardada correctamente');
        
        // Actualizar el logo en el navbar si cambió
        if (logoBase64 !== null) {
            actualizarLogoNavbar(institucionData.logo_url);
            logoBase64 = null; // Resetear la variable
        }
        
        // NUEVA FUNCIONALIDAD: Verificar conflictos en horarios existentes
        await notificarConflictosSiExisten();
        
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        console.error('Detalles del error:', error.message, error.details, error.hint);
        showToast.error(`Error al guardar la configuración: ${error.message || 'Error desconocido'}`);
    }
}

/**
 * Actualiza el logo en el navbar
 */
function actualizarLogoNavbar(logoUrl) {
    const brandIconWrapper = document.querySelector('.navbar-brand .brand-icon-wrapper');
    if (!brandIconWrapper) return;
    
    if (logoUrl) {
        brandIconWrapper.innerHTML = `<img src="${logoUrl}" alt="Logo institucional" class="logo-institucional">`;
    } else {
        brandIconWrapper.innerHTML = `<i data-lucide="graduation-cap"></i>`;
        // Inicializar iconos de Lucide
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

/**
 * Aplica el tema (claro u oscuro) al documento
 */
export function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        updateThemeIcon('light');
    }
}

/**
 * Actualiza el icono del toggle de tema (sol/luna)
 * Muestra LUNA en modo claro (para activar oscuro)
 * Muestra SOL en modo oscuro (para activar claro)
 */
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        // Invertido: luna en light (activar dark), sol en dark (activar light)
        themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        // Recrear el icono para que se actualice visualmente
        lucide.createIcons();
    }
}

/**
 * Configura el event listener para cambio inmediato de tema (en configuraciones)
 */
export function setupThemeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            showToast.info(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado (recuerda guardar para persistir)`);
        });
    }
}

/**
 * Configura el toggle de tema en el header
 */
export function setupHeaderThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', async () => {
            // Obtener tema actual
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Aplicar el tema
            applyTheme(newTheme);
            
            // Guardar en la base de datos en segundo plano
            try {
                const interfazData = state.configuracion?.interfaz || {};
                interfazData.tema = newTheme;
                
                await api.configuracion.update('interfaz', interfazData);
                state.configuracion.interfaz = interfazData;
                
                // No mostrar toast - el cambio visual es suficiente feedback
            } catch (error) {
                console.error('Error al guardar el tema:', error);
                // Solo mostrar error si falla el guardado
                showToast.error('No se pudo guardar el tema');
            }
        });
    }
}

/**
 * Configura los dropdowns colapsables de las secciones de configuración
 */
export function setupSettingsDropdowns() {
    const sections = document.querySelectorAll('.settings-section');
    
    sections.forEach(section => {
        const header = section.querySelector('.settings-section-header');
        
        if (header) {
            header.addEventListener('click', () => {
                // Toggle la clase collapsed
                section.classList.toggle('collapsed');
                
                // Recrear iconos de Lucide para actualizar el chevron
                lucide.createIcons();
            });
            
            // También permitir toggle con Enter o Space
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    section.classList.toggle('collapsed');
                    lucide.createIcons();
                }
            });
        }
    });
}

/**
 * NUEVA FUNCIONALIDAD 1: Validar horarios en tiempo real según las reglas configuradas
 */
export function validarHorarioContraReglas(horario) {
    const validaciones = state.configuracion?.validaciones || {};
    const horarios = state.configuracion?.horarios || {};
    
    const errores = [];
    const advertencias = [];
    
    // 1. Validar que el horario esté dentro del rango permitido
    if (horario.hora_inicio < horarios.hora_inicio) {
        errores.push(`La hora de inicio (${horario.hora_inicio}) es antes del horario permitido (${horarios.hora_inicio})`);
    }
    
    if (horario.hora_fin > horarios.hora_fin) {
        errores.push(`La hora de fin (${horario.hora_fin}) es después del horario permitido (${horarios.hora_fin})`);
    }
    
    // 2. Validar máximo de horas del maestro en el día
    if (horario.maestro_id) {
        const horariosDelMaestroEnDia = state.horarios.filter(h => 
            h.maestro_id === horario.maestro_id && 
            h.dia === horario.dia &&
            h.id !== horario.id // Excluir el horario actual en edición
        );
        
        // Calcular total de horas
        let totalHoras = 0;
        horariosDelMaestroEnDia.forEach(h => {
            const inicio = new Date(`2000-01-01T${h.hora_inicio}`);
            const fin = new Date(`2000-01-01T${h.hora_fin}`);
            totalHoras += (fin - inicio) / (1000 * 60 * 60); // Convertir a horas
        });
        
        // Agregar las horas del nuevo horario
        const inicioNuevo = new Date(`2000-01-01T${horario.hora_inicio}`);
        const finNuevo = new Date(`2000-01-01T${horario.hora_fin}`);
        totalHoras += (finNuevo - inicioNuevo) / (1000 * 60 * 60);
        
        if (totalHoras > validaciones.max_horas_maestro_dia) {
            errores.push(`El maestro excedería el máximo de ${validaciones.max_horas_maestro_dia} horas por día (Total: ${totalHoras.toFixed(1)} horas)`);
        }
    }
    
    // 3. Validar tiempo mínimo de descanso entre clases del mismo maestro
    if (horario.maestro_id && validaciones.tiempo_minimo_descanso > 0) {
        const horariosDelMaestroEnDia = state.horarios.filter(h => 
            h.maestro_id === horario.maestro_id && 
            h.dia === horario.dia &&
            h.id !== horario.id
        );
        
        for (const h of horariosDelMaestroEnDia) {
            const inicioActual = new Date(`2000-01-01T${horario.hora_inicio}`);
            const finActual = new Date(`2000-01-01T${horario.hora_fin}`);
            const inicioOtro = new Date(`2000-01-01T${h.hora_inicio}`);
            const finOtro = new Date(`2000-01-01T${h.hora_fin}`);
            
            // Calcular descanso entre clases
            let descanso = 0;
            if (finOtro <= inicioActual) {
                descanso = (inicioActual - finOtro) / (1000 * 60); // minutos
            } else if (finActual <= inicioOtro) {
                descanso = (inicioOtro - finActual) / (1000 * 60);
            }
            
            if (descanso > 0 && descanso < validaciones.tiempo_minimo_descanso) {
                advertencias.push(`El maestro tendría solo ${descanso} minutos de descanso (mínimo recomendado: ${validaciones.tiempo_minimo_descanso} minutos)`);
            }
        }
    }
    
    // 4. Validar solapamiento si no está permitido
    if (!validaciones.permitir_solapamiento) {
        const conflictos = state.horarios.filter(h => {
            if (h.id === horario.id) return false;
            if (h.dia !== horario.dia) return false;
            
            // Verificar solapamiento de horarios
            const solapa = (horario.hora_inicio < h.hora_fin && horario.hora_fin > h.hora_inicio);
            if (!solapa) return false;
            
            // Conflicto si comparten maestro, aula o asignatura
            return h.maestro_id === horario.maestro_id || 
                   h.aula_id === horario.aula_id ||
                   h.asignatura_id === horario.asignatura_id;
        });
        
        if (conflictos.length > 0) {
            const conflicto = conflictos[0];
            const maestro = state.maestros.find(m => m.id === conflicto.maestro_id);
            const aula = state.aulas.find(a => a.id === conflicto.aula_id);
            const asignatura = state.asignaturas.find(a => a.id === conflicto.asignatura_id);
            
            if (conflicto.maestro_id === horario.maestro_id) {
                errores.push(`El maestro ${maestro?.nombre || ''} ya tiene clase en este horario`);
            }
            if (conflicto.aula_id === horario.aula_id) {
                errores.push(`El aula ${aula?.nombre || ''} ya está ocupada en este horario`);
            }
            if (conflicto.asignatura_id === horario.asignatura_id) {
                advertencias.push(`La asignatura ${asignatura?.nombre || ''} ya está programada en este horario`);
            }
        }
    }
    
    return { errores, advertencias, esValido: errores.length === 0 };
}

/**
 * NUEVA FUNCIONALIDAD 2: Detectar conflictos en horarios existentes después de cambiar configuración
 */
export async function detectarConflictosEnHorariosExistentes() {
    const conflictos = [];
    
    for (const horario of state.horarios) {
        const validacion = validarHorarioContraReglas(horario);
        
        if (!validacion.esValido || validacion.advertencias.length > 0) {
            const maestro = state.maestros.find(m => m.id === horario.maestro_id);
            const asignatura = state.asignaturas.find(a => a.id === horario.asignatura_id);
            const aula = state.aulas.find(a => a.id === horario.aula_id);
            
            conflictos.push({
                horario: {
                    ...horario,
                    maestro: maestro?.nombre || 'N/A',
                    asignatura: asignatura?.nombre || 'N/A',
                    aula: aula?.nombre || 'N/A'
                },
                errores: validacion.errores,
                advertencias: validacion.advertencias
            });
        }
    }
    
    return conflictos;
}

/**
 * NUEVA FUNCIONALIDAD 3: Mostrar notificación de conflictos después de guardar
 */
export async function notificarConflictosSiExisten() {
    const conflictos = await detectarConflictosEnHorariosExistentes();
    
    if (conflictos.length > 0) {
        const totalErrores = conflictos.filter(c => c.errores.length > 0).length;
        const totalAdvertencias = conflictos.filter(c => c.advertencias.length > 0 && c.errores.length === 0).length;
        
        let mensaje = '⚠️ Se detectaron conflictos en los horarios existentes:\n\n';
        
        if (totalErrores > 0) {
            mensaje += `❌ ${totalErrores} horario(s) con errores críticos\n`;
        }
        if (totalAdvertencias > 0) {
            mensaje += `⚠️ ${totalAdvertencias} horario(s) con advertencias\n`;
        }
        
        mensaje += '\nRevisa la sección de Horarios para corregirlos.';
        
        showToast.error(mensaje, { duration: 8000 });
        
        // Log detallado en consola
        console.log('Conflictos detectados:', conflictos);
    } else {
        showToast.success('✅ Todos los horarios cumplen con las nuevas reglas');
    }
}

/**
 * NUEVA FUNCIONALIDAD 4: Restaurar valores por defecto
 */
export async function handleResetConfiguracion() {
    const confirmar = await showConfirmDialog(
        '¿Restaurar valores por defecto?',
        'Esto restablecerá toda la configuración a los valores originales. Esta acción no se puede deshacer.',
        'Restaurar',
        'Cancelar'
    );
    
    if (!confirmar) return;
    
    try {
        // Valores por defecto
        const defaultHorarios = {
            duracion_bloque: 60,
            hora_inicio: '07:00',
            hora_fin: '21:00',
            intervalo_entre_bloques: 0
        };
        
        const defaultValidaciones = {
            max_horas_maestro_dia: 8,
            permitir_solapamiento: false,
            tiempo_minimo_descanso: 0,
            max_alumnos_por_aula: 40
        };
        
        const defaultInstitucion = {
            nombre: 'Universidad Autónoma de Sinaloa',
            direccion: '',
            telefono: '',
            email_contacto: '',
            coordinador: '',
            logo_url: ''
        };
        
        const defaultInterfaz = {
            items_por_pagina: 12,
            tema: 'light',
            mostrar_tooltips: true
        };
        
        // Guardar valores por defecto
        await api.configuracion.update('horarios', defaultHorarios);
        await api.configuracion.update('validaciones', defaultValidaciones);
        await api.configuracion.update('institucion', defaultInstitucion);
        await api.configuracion.update('interfaz', defaultInterfaz);
        
        // Actualizar estado
        state.configuracion = {
            horarios: defaultHorarios,
            validaciones: defaultValidaciones,
            institucion: defaultInstitucion,
            interfaz: defaultInterfaz
        };
        
        // Aplicar tema por defecto
        applyTheme(defaultInterfaz.tema);
        
        showToast.success('Configuración restaurada a valores por defecto');
        
        // Recargar la vista para mostrar los nuevos valores
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error al restaurar configuración:', error);
        showToast.error('Error al restaurar la configuración');
    }
}
