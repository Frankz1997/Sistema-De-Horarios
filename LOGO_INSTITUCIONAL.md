# 🎓 Funcionalidad de Logo Institucional

## ✨ Características Implementadas

### 1. **Carga de Logo Personalizado**
- Panel de configuración → Información Institucional
- Botón "Seleccionar imagen" para subir logo
- Previsualización en tiempo real
- Soporte para formatos: JPG, PNG, GIF, SVG, etc.
- Tamaño máximo: 2MB
- Almacenamiento en Base64 en la base de datos

### 2. **Visualización Dinámica**
- Logo se muestra automáticamente en el header/navbar
- Fallback al icono de gorro académico si no hay logo
- Ajuste automático al contenedor (40x40px)
- Compatible con cualquier proporción de imagen
- `object-fit: contain` para preservar aspect ratio

### 3. **Gestión del Logo**
- **Cargar**: Click en "Seleccionar imagen" → elegir archivo
- **Preview**: Vista previa inmediata de 120x120px
- **Eliminar**: Botón "Eliminar" para quitar el logo actual
- **Guardar**: Click en "Guardar Cambios" para persistir
- **Resetear**: Restaurar valores por defecto elimina el logo

### 4. **Persistencia**
- Logo almacenado en `configuracion.institucion.logo_url`
- Formato Base64 Data URI (`data:image/png;base64,...`)
- Se mantiene después de cerrar sesión
- Se carga automáticamente al iniciar la aplicación

---

## 📝 Cómo Usar

### Paso 1: Cargar Logo
1. Ir a **Configuraciones** (menú lateral)
2. Expandir **Información Institucional**
3. Click en **"Seleccionar imagen"**
4. Elegir archivo de imagen (PNG recomendado con fondo transparente)
5. Ver preview en tiempo real

### Paso 2: Guardar
1. Click en **"Guardar Cambios"** al final de la página
2. Esperar mensaje de confirmación
3. Logo aparece inmediatamente en el header

### Paso 3: Eliminar (Opcional)
1. Click en botón **"Eliminar"** (icono de basura)
2. Logo se quita del preview
3. Click en **"Guardar Cambios"** para persistir
4. El icono por defecto (🎓) vuelve a aparecer

---

## 🎨 Estilos CSS Aplicados

### Logo en Navbar
```css
.navbar-brand .brand-icon-wrapper {
    width: 2.55rem;
    height: 2.55rem;
    background-color: var(--uas-gold);
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
}

.navbar-brand .brand-icon-wrapper img.logo-institucional {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
}
```

### Preview en Configuración
```css
.logo-preview {
    width: 120px;
    height: 120px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 8px;
}
```

---

## 🔧 Detalles Técnicos

### Archivos Modificados
1. **configuraciones.js**
   - Agregado campo de carga de logo
   - `initConfiguracionesListeners()` para eventos
   - `actualizarLogoNavbar()` para actualizar UI
   - Variable `logoBase64` para almacenamiento temporal

2. **ui.js**
   - `renderAppLayout()` renderiza logo dinámicamente
   - Usa `state.configuracion.institucion.logo_url`

3. **main.js**
   - Importa `initConfiguracionesListeners`
   - Llama función al renderizar configuraciones
   - Actualiza logo al cargar datos iniciales

4. **style.css**
   - Estilos para `.logo-upload-container`
   - Estilos para `.logo-preview` y `.logo-placeholder`
   - Estilos para `.logo-institucional` en navbar
   - Soporte para tema oscuro

### Validaciones Implementadas
- ✅ Tipo de archivo (solo imágenes)
- ✅ Tamaño máximo (2MB)
- ✅ Conversión a Base64
- ✅ Manejo de errores
- ✅ Mensajes de toast informativos

### Base de Datos
```json
{
  "clave": "institucion",
  "valor": {
    "nombre": "Universidad Autónoma de Sinaloa",
    "direccion": "...",
    "telefono": "...",
    "email_contacto": "...",
    "coordinador": "...",
    "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
  }
}
```

---

## ⚠️ Consideraciones

### Recomendaciones
- **Formato**: PNG con fondo transparente
- **Tamaño**: Imagen cuadrada (1:1) o rectangular horizontal
- **Resolución**: 200x200px mínimo, 500x500px óptimo
- **Colores**: Contrastar con fondo dorado (#FFB71B)

### Limitaciones
- Tamaño máximo: 2MB
- No hay compresión automática (considerar implementar)
- Base64 aumenta tamaño en ~33%
- Imágenes muy grandes pueden afectar performance

### Posibles Mejoras Futuras
- [ ] Compresión automática de imágenes
- [ ] Recorte/crop de imagen
- [ ] Almacenamiento en servidor (en lugar de Base64)
- [ ] Múltiples variantes (light/dark theme)
- [ ] Favicon dinámico

---

## 🐛 Troubleshooting

### El logo no aparece después de guardar
1. Verificar que la imagen sea menor a 2MB
2. Abrir consola del navegador (F12)
3. Revisar errores en la pestaña Console
4. Verificar que se guardó en la BD (tab Network)

### El logo se ve distorsionado
- Usar imágenes cuadradas o con padding uniforme
- Probar con fondo transparente (PNG)
- Verificar que la imagen original sea de buena calidad

### El logo desaparece al recargar
- Verificar que se hizo click en "Guardar Cambios"
- Revisar que la BD tenga el campo `logo_url`
- Limpiar caché del navegador (Ctrl + Shift + R)

---

## ✅ Testing Checklist

- [x] Cargar imagen PNG
- [x] Cargar imagen JPG
- [x] Validación de tamaño (>2MB rechazada)
- [x] Validación de tipo (archivos no-imagen rechazados)
- [x] Preview actualizado correctamente
- [x] Logo aparece en navbar después de guardar
- [x] Botón eliminar funciona
- [x] Logo persiste después de logout/login
- [x] Logo se mantiene después de recargar página
- [x] Responsive design (móvil/tablet/desktop)
- [x] Tema oscuro compatible
- [x] Restaurar valores por defecto elimina logo

---

**Implementado por:** GitHub Copilot
**Fecha:** Octubre 19, 2025
**Versión:** 1.0
