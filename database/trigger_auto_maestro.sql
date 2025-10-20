-- ============================================
-- TRIGGER: Auto-registro de maestros
-- ============================================
-- Este trigger se ejecuta cuando un nuevo usuario se registra
-- Si el rol es 'maestro', automáticamente crea un registro en la tabla maestros

-- Primero, modificar la función handle_new_user para agregar lógica de maestros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar en la tabla usuarios (esto ya existía)
    INSERT INTO public.usuarios (id, email, nombre, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'maestro'),
        NOW(),
        NOW()
    );
    
    -- 🆕 NUEVO: Si el rol es 'maestro', también insertar en la tabla maestros
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'maestro') = 'maestro' THEN
        INSERT INTO public.maestros (
            email,
            nombre,
            especialidad,
            dias_disponibles,
            horas_disponibilidad,
            created_at,
            updated_at
        )
        VALUES (
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
            'Sin especificar', -- El maestro puede actualizarlo después
            ARRAY[]::text[], -- Sin días disponibles inicialmente
            ARRAY[]::jsonb[], -- Sin horas disponibles inicialmente
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que el trigger esté conectado (debería estar ya, pero por si acaso)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase
-- ============================================
