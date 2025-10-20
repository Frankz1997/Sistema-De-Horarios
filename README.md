# Sistema de Horarios UAS

Sistema web de gestión de horarios académicos con administración completa de maestros, materias, aulas y grupos.

## 🚀 Características

- ✅ Gestión de Maestros, Materias, Aulas y Grupos
- ✅ Asignación de horarios con validación automática
- ✅ Sistema de autenticación con roles (Administrador/Maestro)
- ✅ Logo institucional personalizable
- ✅ Modo oscuro
- ✅ Diseño responsive
- ✅ Validaciones de conflictos de horarios

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Deno + Hono
- **Base de datos:** Supabase (PostgreSQL + KV Store)
- **Deployment:** Deno Deploy

## 📦 Estructura del Proyecto

```
Sistema-De-Horarios/
├── public/              # Frontend (archivos estáticos)
│   ├── css/
│   ├── js/
│   └── index.html
├── server/              # Backend API
│   ├── api.js          # Rutas API originales
│   └── kv_store.js     # Operaciones KV
├── main.js             # Entry point para Deno Deploy
├── .env.example        # Plantilla de variables de entorno
└── SEGURIDAD.md        # Documentación de seguridad

```

## 🔧 Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Frankz1997/Sistema-De-Horarios.git
   cd Sistema-De-Horarios
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` y agrega tus credenciales de Supabase:
   ```
   SUPABASE_URL=tu_url_aqui
   SUPABASE_SERVICE_ROLE_KEY=tu_key_aqui
   ```

3. **Ejecutar el servidor:**
   ```bash
   deno run --allow-net --allow-read --allow-env main.js
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:8000
   ```

## 🚀 Deploy en Deno Deploy

### Paso 1: Conectar con GitHub
1. Ve a [dash.deno.com](https://dash.deno.com)
2. Click en "New Project"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `Sistema-De-Horarios`

### Paso 2: Configurar el Proyecto
- **Entry Point:** `main.js`
- **Production Branch:** `main`

### Paso 3: Variables de Entorno
Agrega en la configuración del proyecto:
```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Paso 4: Deploy
- Click en "Deploy"
- Tu proyecto estará disponible en: `https://tu-proyecto.deno.dev`

## 🔒 Seguridad

- ✅ Las API keys están protegidas con variables de entorno
- ✅ El archivo `.env` está en `.gitignore`
- ✅ Solo se expone la `ANON_KEY` en el frontend (diseñada para ser pública)
- ✅ La `SERVICE_ROLE_KEY` solo se usa en el backend

Ver [SEGURIDAD.md](./SEGURIDAD.md) para más detalles.

## 📚 Configuración Inicial

1. **Primer inicio:** Crea un usuario administrador
2. **Configuración:** Ve a la sección "Configuración" para establecer:
   - Límites de horarios
   - Logo institucional
   - Preferencias de interfaz

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👤 Autor

**Frankz**
- GitHub: [@Frankz1997](https://github.com/Frankz1997)

## 🌟 Soporte

Si este proyecto te fue útil, considera darle una ⭐ en GitHub.
