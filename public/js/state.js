//** 
// Gestiona el estado de la aplicación
// */

// El estado inicial de la aplicación.
export const state = {
    user: null, // { email, nombre, role }
    activeView: 'dashboard',
    maestros: [],
    asignaturas: [],
    aulas: [],
    horarios: [],
    configuracion: {
        horarios: null,
        validaciones: null,
        institucion: null,
        interfaz: null
    },
    config: {
        diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        horaInicio: '07:00',
        horaFin: '22:00',
        carreras: ['Licenciatura en Informática', 'Ingeniería en Sistemas de la Información'],
        modalidades: ['Presencial', 'Virtual']
    },
    editingItem: null,
    horariosViewMode: 'calendario',
};

// Funciones para modificar el estado de forma segura.
export function setUser(user) {
    state.user = user;
}

export function setActiveView(view) {
    state.activeView = view;
}

export function setEditingItem(item) {
    state.editingItem = item;
}

export function setHorariosViewMode(mode) {
    state.horariosViewMode = mode;
}

// Funciones para cargar datos en el estado
export function loadData(key, data) {
    if (state.hasOwnProperty(key)) {
        state[key] = data;
    }
}