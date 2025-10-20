/**
 * Centraliza las llamadas al backend
 */

import { supabase } from './auth.js';

// Función helper para obtener el token de sesión
async function getAuthHeader() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No hay sesión activa');
    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
    };
}

// Objeto API que interactúa con la base de datos
export const api = {
    maestros: {
        getAll: async () => {
            const { data, error } = await supabase.from('maestros').select('*');
            if (error) throw error;
            return data;
        },
        add: async (maestroData) => {
            const { data, error } = await supabase.from('maestros').insert([maestroData]).select();
            if (error) throw error;
            return data[0];
        },
        update: async (id, maestroData) => {
            const { data, error } = await supabase.from('maestros').update(maestroData).eq('id', id).select();
            if (error) throw error;
            return data[0];
        },
        delete: async (id) => {
            const { error } = await supabase.from('maestros').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        },
    },
    asignaturas: {
        getAll: async () => {
            const { data, error } = await supabase.from('asignaturas').select('*');
            if (error) throw error;
            return data;
        },
        add: async (asignaturaData) => {
            const { data, error } = await supabase.from('asignaturas').insert([asignaturaData]).select();
            if (error) throw error;
            return data[0];
        },
        update: async (id, asignaturaData) => {
            const { data, error } = await supabase.from('asignaturas').update(asignaturaData).eq('id', id).select();
            if (error) throw error;
            return data[0];
        },
        delete: async (id) => {
            const { error } = await supabase.from('asignaturas').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        },
    },
    aulas: {
        getAll: async () => {
            const { data, error } = await supabase.from('aulas').select('*');
            if (error) throw error;
            return data;
        },
        add: async (aulaData) => {
            const { data, error } = await supabase.from('aulas').insert([aulaData]).select();
            if (error) throw error;
            return data[0];
        },
        update: async (id, aulaData) => {
            const { data, error } = await supabase.from('aulas').update(aulaData).eq('id', id).select();
            if (error) throw error;
            return data[0];
        },
        delete: async (id) => {
            const { error } = await supabase.from('aulas').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        },
    },
    carreras: {
        getAll: async () => {
            const { data, error } = await supabase.from('carreras').select('*').order('codigo', { ascending: true });
            if (error) throw error;
            return data;
        },
        add: async (carreraData) => {
            const { data, error } = await supabase.from('carreras').insert([carreraData]).select();
            if (error) throw error;
            return data[0];
        },
        update: async (id, carreraData) => {
            const { data, error } = await supabase.from('carreras').update(carreraData).eq('id', id).select();
            if (error) throw error;
            return data[0];
        },
        delete: async (id) => {
            const { error } = await supabase.from('carreras').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        },
    },
    horarios: {
        getAll: async () => {
            const { data, error } = await supabase.from('horarios').select('*');
            if (error) throw error;
            return data;
        },
        add: async (horarioData) => {
            const { data, error } = await supabase.from('horarios').insert([horarioData]).select();
            if (error) throw error;
            return data[0];
        },
        update: async (id, horarioData) => {
            const { data, error } = await supabase.from('horarios').update(horarioData).eq('id', id).select();
            if (error) throw error;
            return data[0];
        },
        delete: async (id) => {
            const { error } = await supabase.from('horarios').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        },
    },
    configuracion: {
        getAll: async () => {
            const { data, error } = await supabase.from('configuracion').select('*');
            if (error) throw error;
            return data;
        },
        get: async (clave) => {
            const { data, error } = await supabase.from('configuracion').select('*').eq('clave', clave).single();
            if (error) throw error;
            return data;
        },
        update: async (clave, valor) => {
            // Supabase maneja automáticamente la conversión a JSONB
            const { data, error } = await supabase
                .from('configuracion')
                .update({ valor })
                .eq('clave', clave)
                .select();
                
            if (error) {
                console.error('Error en API update:', error);
                throw error;
            }
            return data[0];
        },
    }
};