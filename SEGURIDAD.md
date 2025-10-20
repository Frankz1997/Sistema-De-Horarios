# 🔒 Configuración de Seguridad

## ⚠️ ANTES DE SUBIR A GITHUB

### 1. Variables de Entorno del Servidor

El servidor (`server/api.js`) usa variables de entorno correctamente:
```javascript
Deno.env.get('SUPABASE_URL')
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
```

**✅ Cómo configurarlas:**
- Crea un archivo `.env` en la raíz (ya está en .gitignore)
- Copia `.env.example` y completa con tus valores
- En producción (Deno Deploy), configura las variables en el dashboard

### 2. ⚠️ PROBLEMA: API Keys en el Frontend

**UBICACIÓN DEL PROBLEMA:** `public/js/auth.js` (líneas 13-14)

Las siguientes keys están **hardcodeadas** en el código:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 3. Opciones de Solución

#### Opción A: Usar archivo de configuración (NO RECOMENDADO para producción)
Crear `public/js/config.js` y agregarlo a `.gitignore`

#### Opción B: Build process (RECOMENDADO)
Usar un bundler (Vite, Webpack) que reemplace las variables en build time

#### Opción C: Aceptar que SUPABASE_ANON_KEY es pública (ACEPTABLE)
- La `ANON_KEY` de Supabase **está diseñada** para ser pública
- Supabase usa Row Level Security (RLS) para proteger los datos
- **NUNCA expongas** la `SERVICE_ROLE_KEY` en el frontend

### 4. ✅ Estado Actual de Seguridad

**SEGURO:**
- ✅ `SERVICE_ROLE_KEY` solo en backend
- ✅ Backend usa variables de entorno
- ✅ `.gitignore` configurado

**REVISAR:**
- ⚠️ `ANON_KEY` visible en código (aceptable si RLS está configurado)
- ⚠️ Verificar que tengas RLS activado en Supabase

### 5. Checklist antes de GitHub

- [ ] Archivo `.gitignore` creado
- [ ] Archivo `.env.example` creado (sin valores reales)
- [ ] Variables de entorno configuradas localmente
- [ ] RLS (Row Level Security) activado en Supabase
- [ ] Políticas de seguridad configuradas en Supabase
- [ ] Nunca commitear archivos `.env`

### 6. Si ya commiteaste las keys

Si ya hiciste commit con las keys:

1. **Regenera las keys en Supabase Dashboard**
2. **Reescribe el historial de Git:**
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch public/js/auth.js" \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **O simplemente crea un nuevo repositorio**

## 📚 Más Información

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Environment Variables in Deno](https://deno.land/manual/basics/env_variables)
