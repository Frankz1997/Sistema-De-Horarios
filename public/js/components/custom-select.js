/**
 * Custom Select Component
 * Un dropdown personalizado con animaciones y control total sobre el diseño
 */

// Variable global para manejar z-index de dropdowns
let highestZIndex = 100;

export class CustomSelect {
    constructor(selectElement) {
        this.originalSelect = selectElement;
        this.options = Array.from(selectElement.options);
        this.selectedIndex = selectElement.selectedIndex;
        this.isOpen = false;
        this.baseZIndex = 100;
        
        this.createCustomSelect();
        this.attachEventListeners();
    }

    createCustomSelect() {
        // Crear el contenedor del custom select
        this.customSelect = document.createElement('div');
        this.customSelect.className = 'custom-select';
        
        // Crear el botón que muestra la opción seleccionada
        this.selectButton = document.createElement('button');
        this.selectButton.className = 'custom-select-button';
        this.selectButton.type = 'button';
        this.selectButton.innerHTML = `
            <span class="custom-select-value">${this.options[this.selectedIndex].text}</span>
            <svg class="custom-select-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;

        // Crear el dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'custom-select-dropdown';
        
        // Crear la lista de opciones
        this.optionsList = document.createElement('ul');
        this.optionsList.className = 'custom-select-options';
        
        this.options.forEach((option, index) => {
            if (option.value === '' && index === 0) {
                // Skip placeholder options
                return;
            }
            
            const li = document.createElement('li');
            li.className = 'custom-select-option';
            li.textContent = option.text;
            li.dataset.value = option.value;
            li.dataset.index = index;
            
            if (index === this.selectedIndex) {
                li.classList.add('selected');
            }
            
            this.optionsList.appendChild(li);
        });

        this.dropdown.appendChild(this.optionsList);
        this.customSelect.appendChild(this.selectButton);
        this.customSelect.appendChild(this.dropdown);

        // Guardar referencia a la instancia en el elemento DOM
        this.customSelect._customSelectInstance = this;

        // Ocultar el select original y insertar el custom select
        this.originalSelect.style.display = 'none';
        this.originalSelect.parentNode.insertBefore(this.customSelect, this.originalSelect.nextSibling);
    }

    attachEventListeners() {
        // Toggle dropdown
        this.selectButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Seleccionar opción
        this.optionsList.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-select-option');
            if (option) {
                this.selectOption(option);
            }
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.customSelect.contains(e.target)) {
                this.close();
            }
        });

        // Keyboard navigation
        this.selectButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.open();
                this.focusNextOption();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.open();
                this.focusPreviousOption();
            }
        });

        this.optionsList.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const focused = this.optionsList.querySelector('.custom-select-option:focus');
                if (focused) {
                    this.selectOption(focused);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.focusNextOption();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.focusPreviousOption();
            } else if (e.key === 'Escape') {
                this.close();
                this.selectButton.focus();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        // Cerrar otros dropdowns abiertos
        document.querySelectorAll('.custom-select.open').forEach(select => {
            if (select !== this.customSelect) {
                const instance = select._customSelectInstance;
                if (instance) {
                    instance.close();
                }
            }
        });

        this.isOpen = true;
        this.customSelect.classList.add('open');
        
        // Incrementar z-index para que este dropdown esté encima de todos
        highestZIndex++;
        this.customSelect.style.zIndex = highestZIndex;
        
        this.dropdown.style.display = 'block';
        
        // Animación
        setTimeout(() => {
            this.dropdown.classList.add('show');
        }, 10);
    }

    close() {
        this.isOpen = false;
        this.customSelect.classList.remove('open');
        this.dropdown.classList.remove('show');
        
        setTimeout(() => {
            this.dropdown.style.display = 'none';
            // Restaurar z-index base cuando se cierra
            this.customSelect.style.zIndex = this.baseZIndex;
        }, 200); // Duración de la animación
    }

    selectOption(optionElement) {
        const index = parseInt(optionElement.dataset.index);
        const value = optionElement.dataset.value;

        // Actualizar UI
        this.optionsList.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        optionElement.classList.add('selected');

        // Actualizar el botón
        this.selectButton.querySelector('.custom-select-value').textContent = optionElement.textContent;

        // Actualizar el select original
        this.originalSelect.selectedIndex = index;
        this.originalSelect.value = value;
        
        // Disparar evento change
        const event = new Event('change', { bubbles: true });
        this.originalSelect.dispatchEvent(event);

        this.selectedIndex = index;
        this.close();
    }

    focusNextOption() {
        const options = Array.from(this.optionsList.querySelectorAll('.custom-select-option'));
        const currentIndex = options.findIndex(opt => opt === document.activeElement);
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex].focus();
    }

    focusPreviousOption() {
        const options = Array.from(this.optionsList.querySelectorAll('.custom-select-option'));
        const currentIndex = options.findIndex(opt => opt === document.activeElement);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex].focus();
    }

    // Método para actualizar las opciones dinámicamente
    updateOptions() {
        this.options = Array.from(this.originalSelect.options);
        this.optionsList.innerHTML = '';
        
        this.options.forEach((option, index) => {
            if (option.value === '' && index === 0) {
                return;
            }
            
            const li = document.createElement('li');
            li.className = 'custom-select-option';
            li.textContent = option.text;
            li.dataset.value = option.value;
            li.dataset.index = index;
            li.tabIndex = 0;
            
            if (index === this.selectedIndex) {
                li.classList.add('selected');
            }
            
            this.optionsList.appendChild(li);
        });
    }

    // Método para destruir el custom select
    destroy() {
        this.customSelect.remove();
        this.originalSelect.style.display = '';
    }
}

// Función helper para inicializar todos los selects
export function initializeCustomSelects(selector = 'select') {
    const selects = document.querySelectorAll(selector);
    const customSelects = [];
    
    selects.forEach(select => {
        // No convertir si ya tiene un custom select o si tiene atributo data-native
        if (!select.dataset.customized && !select.hasAttribute('data-native')) {
            const customSelect = new CustomSelect(select);
            customSelects.push(customSelect);
            select.dataset.customized = 'true';
        }
    });
    
    return customSelects;
}
