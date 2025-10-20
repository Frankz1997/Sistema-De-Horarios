# Crear Tabla de Usuarios en Supabase

## Problema Actual
Los usuarios solo se están guardando en `auth.users` (tabla interna de Supabase) pero no en una tabla personalizada `usuarios` que puedas consultar.

## Solución: Crear tabla usuarios con trigger

### Paso 1: Crear la tabla usuarios

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('maestro', 'administrador')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios autenticados pueden ver todos los usuarios
CREATE POLICY "Los usuarios pueden ver todos los usuarios"
ON public.usuarios
FOR SELECT
TO authenticated
USING (true);

-- Política: Solo administradores pueden insertar usuarios
CREATE POLICY "Solo admins pueden crear usuarios"
ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (
    auth.jwt() ->> 'role' = 'administrador'
);

-- Política: Solo administradores pueden actualizar usuarios
CREATE POLICY "Solo admins pueden actualizar usuarios"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'administrador'
);

-- Política: Solo administradores pueden eliminar usuarios
CREATE POLICY "Solo admins pueden eliminar usuarios"
ON public.usuarios
FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'administrador'
);
```

### Paso 2: Crear trigger para sincronización automática

Este trigger copiará automáticamente los usuarios de `auth.users` a tu tabla `usuarios`:

```sql
-- Función que se ejecuta cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nombre, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'nombre',
        NEW.raw_user_meta_data->>'role'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

### Paso 3: Validar único administrador (IMPORTANTE)

```sql
-- Función que valida que solo exista un administrador
CREATE OR REPLACE FUNCTION public.check_single_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Si el nuevo usuario es administrador
    IF NEW.role = 'administrador' THEN
        -- Contar cuántos administradores existen (excluyendo el actual)
        SELECT COUNT(*)
        INTO admin_count
        FROM public.usuarios
        WHERE role = 'administrador'
        AND id != NEW.id;

        -- Si ya existe un admin, lanzar error
        IF admin_count > 0 THEN
            RAISE EXCEPTION 'Ya existe un administrador en el sistema. Solo se permite un administrador.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que valida antes de insertar en la tabla usuarios
DROP TRIGGER IF EXISTS enforce_single_admin ON public.usuarios;
CREATE TRIGGER enforce_single_admin
BEFORE INSERT ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.check_single_admin();
```

### Paso 4: Migrar usuarios existentes (si ya tienes usuarios en auth.users)

Si ya tienes usuarios registrados en `auth.users`, cópialos a la nueva tabla:

```sql
-- Copiar usuarios existentes de auth.users a la tabla usuarios
INSERT INTO public.usuarios (id, email, nombre, role)
SELECT 
    id,
    email,
    raw_user_meta_data->>'nombre' as nombre,
    raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'nombre' IS NOT NULL
ON CONFLICT (id) DO NOTHING;
```

## Verificación

Después de ejecutar estos scripts, verifica:

```sql
-- Ver todos los usuarios en tu tabla personalizada
SELECT * FROM public.usuarios;

-- Ver usuarios en auth.users
SELECT id, email, raw_user_meta_data FROM auth.users;
```

## Actualizar el Frontend

Ahora puedes consultar la tabla `usuarios` directamente desde tu frontend:

```javascript
// En lugar de usar KV store o auth.admin
const { data: usuarios, error } = await supabase
  .from('usuarios')
  .select('*');
```

## Resumen

1. ✅ Creas tabla `usuarios` en Supabase
2. ✅ Configuras RLS (políticas de seguridad)
3. ✅ Creas trigger para sincronización automática
4. ✅ Creas trigger para validar único admin
5. ✅ Migras usuarios existentes
6. ✅ Ahora puedes consultar `usuarios` directamente

**Ejecuta estos scripts en orden en el SQL Editor de Supabase Dashboard.**
