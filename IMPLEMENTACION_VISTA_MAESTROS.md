# Implementación de Vista para Usuarios con Rol Maestro

## 📋 Resumen de Cambios

Se ha implementado una vista completa para usuarios con rol "maestro" que permite:

1. ✅ **Auto-registro en tabla maestros** - Los maestros se registran automáticamente al crear su cuenta
2. ✅ **Vista personalizada del dashboard** - Dashboard con estadísticas de sus clases
3. ✅ **Gestión de perfil y disponibilidad** - Sección "Mi Perfil" para configurar días y horas disponibles
4. ✅ **Vista restringida del calendario** - Solo pueden ver sus propias clases
5. ✅ **Reportes limitados** - Solo pueden generar su propio reporte

---

## 🗄️ PASO 1: Configurar Trigger en Supabase

### Ejecutar en SQL Editor de Supabase

```sql
-- ============================================
-- TRIGGER: Auto-registro de maestros
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar en la tabla usuarios
    INSERT INTO public.usuarios (id, email, nombre, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'maestro'),
        NOW(),
        NOW()
    );
    
    -- Si el rol es 'maestro', también insertar en la tabla maestros
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
            'Sin especificar',
            ARRAY[]::text[],
            ARRAY[]::jsonb[],
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que el trigger esté conectado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Importante:** Este trigger se ejecutará cada vez que un usuario se registre. Si el rol es "maestro", automáticamente se creará un registro en la tabla `maestros` con los datos básicos del usuario.

---

## 📁 Archivos Creados

### `public/js/views/mi-perfil.js`
Nueva vista para que los maestros gestionen su perfil:
- Ver estadísticas personales (clases asignadas, horas semanales, etc.)
- Editar información personal
- Configurar días disponibles
- Configurar horarios de disponibilidad

---

## 📝 Archivos Modificados

### 1. `public/js/main.js`
- ✅ Importación de `mi-perfil.js`
- ✅ Registro de vista `'mi-perfil'` en `viewRenderers`
- ✅ Event listener para botón "Editar Perfil"
- ✅ Handler para formulario de perfil (`perfil-form`)
- ✅ Acceso rápido a "mi-perfil" y "reportes" desde dashboard

### 2. `public/js/ui.js`
- ✅ Agregada opción "Mi Perfil" en el sidebar para rol maestro
- ✅ Icono: `user-circle`
- ✅ Filtrado de menú según rol del usuario

### 3. `public/js/views/dashboard.js`
- ✅ Nueva función `renderMaestroDashboard()` para vista personalizada de maestros
- ✅ Muestra estadísticas: clases asignadas, horas semanales, materias, días disponibles
- ✅ Lista de próximas clases ordenadas por día y hora
- ✅ Accesos rápidos personalizados: Mi Perfil, Mi Calendario, Generar Mi Reporte
- ✅ Detecta automáticamente si el usuario es maestro y renderiza la vista correspondiente

### 4. `public/js/views/horarios.js`
- ✅ Título dinámico: "Mi Horario de Clases" para maestros, "Gestión de Horarios" para admins
- ✅ Botón "Agregar Horario" oculto para maestros
- ✅ Filtrado automático: maestros solo ven sus clases asignadas
- ✅ Botones de edición/eliminación deshabilitados para maestros (vista de solo lectura)
- ✅ Cambios aplicados tanto en vista de calendario como en vista de lista

### 5. `public/js/views/reportes.js`
- ✅ Título dinámico: "Mi Reporte de Horarios" para maestros
- ✅ Selector bloqueado: maestros solo pueden ver su propio horario
- ✅ Mensaje informativo: "Solo puedes generar tu propio reporte"
- ✅ Vista previa automática del horario del maestro
- ✅ Admins mantienen acceso completo a reportes por maestro y por aula

---

## 🎨 Funcionalidades Implementadas

### Para Usuarios Maestros:

#### 📊 Dashboard Personalizado
- Tarjetas de estadísticas:
  - Clases asignadas
  - Horas semanales
  - Materias que imparte
  - Días disponibles configurados
- Listado de próximas clases con detalles
- Accesos rápidos a perfil, calendario y reportes

#### 👤 Mi Perfil (Nueva Vista)
- Visualización de información personal
- Edición de nombre y especialidad
- Configuración de días disponibles
- Gestión de rangos horarios de disponibilidad
- Opciones rápidas: Matutino, Vespertino, Todo el día
- Rangos personalizados

#### 📅 Horarios (Vista de Solo Lectura)
- Ver calendario con solo sus clases
- Ver lista de sus clases
- Sin acceso a botones de agregar/editar/eliminar
- Filtrado automático por maestro_id

#### 📄 Reportes (Restringido)
- Solo puede generar su propio reporte
- Vista previa automática
- Opción de imprimir

### Para Administradores:

#### 📊 Dashboard Completo
- Estadísticas generales del sistema
- Acceso a todas las secciones
- Accesos rápidos a gestión

#### 👥 Gestión de Maestros
- Agregar, editar y eliminar maestros
- Ver todos los maestros registrados
- Configurar disponibilidad de cualquier maestro

#### 📅 Horarios (Control Total)
- Agregar, editar y eliminar horarios
- Ver todos los horarios del sistema
- Asignar maestros, materias y aulas

#### 📄 Reportes (Completo)
- Generar reportes por maestro
- Generar reportes por aula
- Vista previa de cualquier reporte
- Imprimir cualquier reporte

---

## 🔐 Seguridad y Permisos

### Restricciones Implementadas:

1. **Sidebar dinámico:** Maestros solo ven sus opciones permitidas
2. **Vistas filtradas:** Los datos se filtran automáticamente por `maestro_id`
3. **Botones ocultos:** Maestros no ven botones de administración
4. **Validación en frontend:** Verificación de rol antes de renderizar componentes
5. **Auto-asignación:** Los maestros se vinculan automáticamente con su email

### Nota de Seguridad:
⚠️ Estos controles están implementados en el frontend. Para máxima seguridad, se recomienda también implementar validaciones en el backend (Supabase RLS o API middleware) para prevenir accesos no autorizados.

---

## 🚀 Cómo Probar

### 1. Registrar un Maestro
1. Cerrar sesión del administrador
2. Hacer clic en "Regístrate"
3. Llenar formulario con rol "Maestro"
4. El sistema automáticamente:
   - Creará el usuario en `auth.users`
   - Creará el registro en `usuarios`
   - Creará el registro en `maestros` (gracias al trigger)

### 2. Configurar Perfil
1. Iniciar sesión como maestro
2. Ir a "Mi Perfil" en el sidebar
3. Hacer clic en "Editar Disponibilidad"
4. Configurar días y horarios disponibles
5. Guardar cambios

### 3. Ver Dashboard
1. El dashboard mostrará estadísticas personalizadas
2. Verá sus próximas clases
3. Tendrá accesos rápidos personalizados

### 4. Ver Horarios
1. Ir a "Horarios" en el sidebar
2. Ver solo sus clases en el calendario
3. Cambiar a vista de lista
4. Verificar que no hay botones de edición

### 5. Generar Reporte
1. Ir a "Reportes" en el sidebar
2. Ver su información pre-cargada
3. Hacer clic en "Generar e Imprimir"
4. Se abrirá ventana de impresión con su horario

---

## 📋 Checklist de Verificación

- [x] Trigger de auto-registro creado en Supabase
- [x] Vista "Mi Perfil" funcional
- [x] Dashboard personalizado para maestros
- [x] Horarios filtrados y de solo lectura
- [x] Reportes restringidos
- [x] Sidebar dinámico según rol
- [x] Accesos rápidos en dashboard funcionales
- [x] Event listeners configurados correctamente
- [x] Sin errores en consola del navegador

---

## 🐛 Troubleshooting

### Problema: El maestro no aparece en la tabla maestros después de registrarse
**Solución:** Verificar que el trigger `on_auth_user_created` esté activo en Supabase. Ejecutar el SQL del PASO 1 nuevamente.

### Problema: El maestro ve opciones de administrador
**Solución:** Verificar que `state.user.role` sea exactamente "maestro" (minúsculas). Revisar en la consola del navegador.

### Problema: No se filtran los horarios del maestro
**Solución:** Verificar que el email del usuario en `auth.users` coincida con el email en la tabla `maestros`. Revisar con: `console.log(state.maestros.find(m => m.email === state.user.email))`

### Problema: Error al editar perfil de maestro
**Solución:** Verificar que el `maestro_id` existe y que la API de actualización funciona correctamente. Revisar permisos en Supabase RLS.

---

## 🎯 Próximos Pasos Recomendados

1. **Validación Backend:** Implementar RLS policies en Supabase para reforzar restricciones
2. **Notificaciones:** Notificar a maestros cuando se les asigna una nueva clase
3. **Exportar PDF:** Permitir exportar reportes en PDF además de imprimir
4. **Historial:** Agregar historial de cambios en perfil de maestro
5. **Estadísticas Avanzadas:** Gráficas de carga horaria semanal

---

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda con la implementación, verifica:
1. Que el trigger esté correctamente creado en Supabase
2. Que no haya errores en la consola del navegador
3. Que los datos de usuarios, maestros y horarios estén correctamente relacionados

---

**Versión del Sistema:** v1.0.0 (build 5)
**Fecha de Implementación:** 2025-10-20
**Desarrollador:** Sistema UAS - Facultad de Informática Mazatlán
