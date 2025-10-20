-- Tabla de Carreras
-- Ejecutar este script en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.carreras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    nivel_academico VARCHAR(50) NOT NULL CHECK (nivel_academico IN ('Licenciatura', 'Ingeniería', 'Maestría', 'Doctorado')),
    departamento VARCHAR(200),
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_carreras_codigo ON public.carreras(codigo);
CREATE INDEX IF NOT EXISTS idx_carreras_activo ON public.carreras(activo);
CREATE INDEX IF NOT EXISTS idx_carreras_nivel ON public.carreras(nivel_academico);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_carreras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_carreras_updated_at
    BEFORE UPDATE ON public.carreras
    FOR EACH ROW
    EXECUTE FUNCTION update_carreras_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.carreras ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer
CREATE POLICY "Permitir lectura a todos los usuarios autenticados"
    ON public.carreras
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Solo admins pueden insertar
CREATE POLICY "Solo admins pueden insertar carreras"
    ON public.carreras
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.role = 'admin'
        )
    );

-- Política: Solo admins pueden actualizar
CREATE POLICY "Solo admins pueden actualizar carreras"
    ON public.carreras
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.role = 'admin'
        )
    );

-- Política: Solo admins pueden eliminar
CREATE POLICY "Solo admins pueden eliminar carreras"
    ON public.carreras
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.role = 'admin'
        )
    );

-- Insertar datos de ejemplo
INSERT INTO public.carreras (codigo, nombre, nivel_academico, departamento, activo) VALUES
    ('ISC', 'Ingeniería en Sistemas Computacionales', 'Ingeniería', 'Facultad de Ingeniería', true),
    ('LAE', 'Licenciatura en Administración de Empresas', 'Licenciatura', 'Facultad de Negocios', true),
    ('MED', 'Medicina General', 'Licenciatura', 'Facultad de Ciencias de la Salud', true),
    ('DER', 'Licenciatura en Derecho', 'Licenciatura', 'Facultad de Derecho y Ciencias Sociales', true),
    ('ARQ', 'Arquitectura', 'Licenciatura', 'Facultad de Ingeniería y Arquitectura', true),
    ('PSI', 'Licenciatura en Psicología', 'Licenciatura', 'Facultad de Ciencias Sociales', true),
    ('IND', 'Ingeniería Industrial', 'Ingeniería', 'Facultad de Ingeniería', true),
    ('MCTI', 'Maestría en Ciencias en Tecnologías de Información', 'Maestría', 'Facultad de Ingeniería', true);

COMMENT ON TABLE public.carreras IS 'Catálogo de carreras o programas académicos ofrecidos';
COMMENT ON COLUMN public.carreras.codigo IS 'Código único de la carrera (ej: ISC, LAE)';
COMMENT ON COLUMN public.carreras.nombre IS 'Nombre completo de la carrera';
COMMENT ON COLUMN public.carreras.nivel_academico IS 'Nivel académico: Licenciatura, Ingeniería, Maestría, Doctorado';
COMMENT ON COLUMN public.carreras.departamento IS 'Facultad o departamento al que pertenece';
COMMENT ON COLUMN public.carreras.activo IS 'Indica si la carrera está activa o ya no se oferta';
