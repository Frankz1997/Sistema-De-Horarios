/**
 * Main entry point for Deno Deploy
 * Serves static files from /public and API routes from /server
 */

import { Hono } from 'npm:hono';
import { serveStatic } from 'npm:hono/deno';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './server/kv_store.js';
import * as bcrypt from 'npm:bcryptjs';

const app = new Hono();

// CORS global
app.use('*', cors());

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

// ============================================
// API ROUTES (from server/api.js)
// ============================================

// Registro de usuario
app.post('/make-server-9aeea470/auth/signup', async (c) => {
  try {
    const { email, password, nombre, role } = await c.req.json();
    
    if (!email || !password || !nombre || !role) {
      return c.json({ error: 'Todos los campos son requeridos' }, 400);
    }

    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: 'El usuario ya existe' }, 400);
    }

    if (role === 'administrador') {
      const allUsers = await kv.getByPrefix('user:id:');
      const adminExists = allUsers.some((user) => user.role === 'administrador');
      if (adminExists) {
        return c.json({ error: 'Ya existe un administrador en el sistema. Solo se permite un administrador.' }, 400);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, role }
    });

    if (authError) {
      return c.json({ error: authError.message }, 400);
    }

    const userData = {
      id: authData.user.id,
      email,
      nombre,
      role,
      hashedPassword,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${email}`, userData);
    await kv.set(`user:id:${authData.user.id}`, userData);

    return c.json({ 
      success: true, 
      user: { id: authData.user.id, email, nombre, role } 
    });
  } catch (error) {
    console.error('Error en signup:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Login de usuario
app.post('/make-server-9aeea470/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email y contraseña son requeridos' }, 400);
    }

    const kvUser = await kv.get(`user:${email}`);
    if (!kvUser) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    const passwordMatch = await bcrypt.compare(password, kvUser.hashedPassword);
    if (!passwordMatch) {
      return c.json({ error: 'Contraseña incorrecta' }, 401);
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return c.json({ error: authError.message }, 400);
    }

    return c.json({ 
      success: true,
      user: { 
        id: authData.user.id, 
        email: kvUser.email, 
        nombre: kvUser.nombre, 
        role: kvUser.role 
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Error en login:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Obtener usuario por ID
app.get('/make-server-9aeea470/auth/user/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const kvUser = await kv.get(`user:id:${userId}`);
    
    if (!kvUser) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    const { hashedPassword, ...userWithoutPassword } = kvUser;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Obtener todos los usuarios
app.get('/make-server-9aeea470/auth/users', async (c) => {
  try {
    const users = await kv.getByPrefix('user:id:');
    const usersWithoutPasswords = users.map(({ hashedPassword, ...user }) => user);
    return c.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return c.json({ error: error.message }, 500);
  }
});

// CRUD genérico
app.get('/make-server-9aeea470/:entity', async (c) => {
  try {
    const entity = c.req.param('entity');
    const items = await kv.getByPrefix(`${entity}:id:`);
    return c.json({ [entity]: items });
  } catch (error) {
    console.error(`Error obteniendo ${c.req.param('entity')}:`, error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-9aeea470/:entity', async (c) => {
  try {
    const entity = c.req.param('entity');
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const item = { id, ...data, createdAt: new Date().toISOString() };
    await kv.set(`${entity}:id:${id}`, item);
    return c.json({ success: true, item });
  } catch (error) {
    console.error(`Error creando ${c.req.param('entity')}:`, error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-9aeea470/:entity/:id', async (c) => {
  try {
    const entity = c.req.param('entity');
    const id = c.req.param('id');
    const data = await c.req.json();
    const existingItem = await kv.get(`${entity}:id:${id}`);
    if (!existingItem) {
      return c.json({ error: 'Item no encontrado' }, 404);
    }
    const updatedItem = { ...existingItem, ...data, updatedAt: new Date().toISOString() };
    await kv.set(`${entity}:id:${id}`, updatedItem);
    return c.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error(`Error actualizando ${c.req.param('entity')}:`, error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-9aeea470/:entity/:id', async (c) => {
  try {
    const entity = c.req.param('entity');
    const id = c.req.param('id');
    const existingItem = await kv.get(`${entity}:id:${id}`);
    if (!existingItem) {
      return c.json({ error: 'Item no encontrado' }, 404);
    }
    await kv.del(`${entity}:id:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error eliminando ${c.req.param('entity')}:`, error);
    return c.json({ error: error.message }, 500);
  }
});

// Cleanup de usuarios huérfanos
app.post('/make-server-9aeea470/auth/cleanup', async (c) => {
  try {
    const kvUsers = await kv.getByPrefix('user:id:');
    const orphanedUsers = [];

    for (const kvUser of kvUsers) {
      const { data, error } = await supabase.auth.admin.getUserById(kvUser.id);
      if (error || !data.user) {
        orphanedUsers.push(kvUser.email);
        await kv.del(`user:${kvUser.email}`);
        await kv.del(`user:id:${kvUser.id}`);
      }
    }
    
    return c.json({ success: true, message: 'Limpieza completada', orphanedUsers });
  } catch (error) {
    console.error('Error en cleanup:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// STATIC FILES
// ============================================

// Serve static files from /public
app.use('/*', serveStatic({ root: './public' }));

// Fallback to index.html for SPA routing
app.get('*', serveStatic({ path: './public/index.html' }));

// ============================================
// START SERVER
// ============================================

Deno.serve(app.fetch);
