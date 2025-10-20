# Validación de Administrador Único

## Problema
Actualmente se pueden registrar múltiples administradores en el sistema, cuando solo debería permitirse uno.

## Solución

### Opción 1: Usar Database Trigger (RECOMENDADO)

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Crear una función que verifique si ya existe un administrador
CREATE OR REPLACE FUNCTION check_single_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Si el nuevo usuario es administrador
    IF (NEW.raw_user_meta_data->>'role') = 'administrador' THEN
        -- Contar cuántos administradores existen
        SELECT COUNT(*)
        INTO admin_count
        FROM auth.users
        WHERE (raw_user_meta_data->>'role') = 'administrador'
        AND id != NEW.id; -- Excluir el usuario actual

        -- Si ya existe un admin, lanzar error
        IF admin_count > 0 THEN
            RAISE EXCEPTION 'Ya existe un administrador en el sistema. Solo se permite un administrador.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que ejecute la función antes de insertar
CREATE TRIGGER enforce_single_admin
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION check_single_admin();
```

### Opción 2: Verificación desde el Backend

El archivo `main.js` del servidor ya tiene esta validación en las líneas 54-60:

```javascript
if (role === 'administrador') {
  const allUsers = await kv.getByPrefix('user:id:');
  const adminExists = allUsers.some((user) => user.role === 'administrador');
  if (adminExists) {
    return c.json({ error: 'Ya existe un administrador en el sistema. Solo se permite un administrador.' }, 400);
  }
}
```

## Implementación Actual

El sistema actualmente:
1. ✅ Frontend bloquea el campo de rol en "Maestro" cuando detecta un admin
2. ✅ Backend (main.js) valida que no exista admin antes de crear
3. ❌ El registro directo con Supabase Auth bypasea estas validaciones

## Acción Requerida

**Ejecuta el SQL de la Opción 1 en Supabase** para agregar un trigger a nivel de base de datos que impida físicamente el registro de múltiples administradores, sin importar desde dónde se haga el registro.

### Pasos:
1. Ve a tu proyecto en Supabase Dashboard
2. Click en "SQL Editor"
3. Copia y pega el script SQL de arriba
4. Click en "Run"

Esto asegurará que **nunca** se puedan registrar múltiples administradores, incluso si alguien intenta hacerlo directamente con la API de Supabase.
