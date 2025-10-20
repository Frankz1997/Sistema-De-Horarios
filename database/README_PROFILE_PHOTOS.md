# Configuración de Fotos de Perfil

## Pasos para configurar el Storage en Supabase

### 1. Agregar columna en la tabla usuarios
Ejecuta el script SQL:
```bash
database/add_profile_photo_column.sql
```

### 2. Crear bucket de Storage
1. Ve a tu proyecto en Supabase
2. Navega a **Storage** en el menú lateral
3. Click en **"Create a new bucket"**
4. Configuración del bucket:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Activar (para que las URLs sean públicas)
   - Click en **Create bucket**

### 3. Configurar políticas de seguridad (RLS)
Ejecuta el script SQL en el **SQL Editor** de Supabase:
```bash
database/setup_storage_profile_photos.sql
```

### 4. Verificar configuración
- Las fotos se guardarán en la carpeta `avatars/` dentro del bucket
- Los usuarios pueden subir, actualizar y eliminar sus propias fotos
- Las fotos son visibles públicamente mediante URL

## Funcionalidades implementadas

### En el frontend:
- ✅ Dropdown del usuario con opción "Opciones de Cuenta"
- ✅ Modal para editar perfil con:
  - Foto de perfil (subir/eliminar)
  - Nombre completo
  - Correo electrónico
  - Cambio de contraseña
- ✅ Preview de la foto antes de guardar
- ✅ Validación de tamaño (máx 2MB) y tipo de archivo
- ✅ Foto redonda en el navbar (32px desktop, 24px móvil)
- ✅ Icono por defecto cuando no hay foto

### Flujo de uso:
1. Usuario hace clic en su avatar/nombre
2. Se despliega dropdown con "Opciones de Cuenta"
3. Se abre modal con formulario
4. Usuario puede:
   - Seleccionar nueva foto (se muestra preview)
   - Eliminar foto actual
   - Cambiar nombre y credenciales
5. Al guardar:
   - Se sube la foto a Supabase Storage
   - Se actualiza la URL en la tabla usuarios
   - Se actualiza el avatar en el navbar
   - Se muestra notificación de éxito

## Limitaciones
- Tamaño máximo de foto: **2MB**
- Formatos aceptados: **Todos los tipos de imagen** (jpg, png, gif, webp, etc.)
- La foto se redimensiona automáticamente en el CSS para mantener el tamaño del navbar
