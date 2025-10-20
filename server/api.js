import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.js';
import * as bcrypt from 'npm:bcryptjs';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

// ============================================
// AUTENTICACIÓN
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
      console.log('Error en Supabase Auth:', authError);
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;
    const userData = {
      id: userId,
      email,
      password: hashedPassword,
      nombre,
      role,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${email}`, userData);
    await kv.set(`user:id:${userId}`, userData);

    if (role === 'maestro') {
      const maestroId = crypto.randomUUID();
      const maestroData = {
        id: maestroId,
        userId: userId,
        nombre: nombre,
        email: email,
        telefono: '',
        especialidad: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await kv.set(`maestro:${maestroId}`, maestroData);
    }

    return c.json({ 
      success: true, 
      user: { id: userId, email, nombre, role } 
    });
  } catch (error) {
    console.log('Error en signup:', error);
    return c.json({ error: 'Error al crear usuario: ' + error.message }, 500);
  }
});

// Middleware de autenticación
const requireAuth = async (c, next) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No autorizado' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ error: 'Token inválido' }, 401);
  }

  const userData = await kv.get(`user:id:${user.id}`);
  if (!userData) {
    return c.json({ error: 'Usuario no encontrado en el sistema' }, 401);
  }

  c.set('user', user);
  c.set('userData', userData);
  await next();
};

// Middleware de rol de Admin
const requireAdmin = async (c, next) => {
  const user = c.get('user');
  if (user.user_metadata?.role !== 'administrador') {
    return c.json({ error: 'Acceso denegado. Se requiere rol de administrador' }, 403);
  }
  await next();
};

// ============================================
// GESTIÓN DE MAESTROS
// ============================================

app.get('/make-server-9aeea470/maestros', requireAuth, async (c) => {
  const maestros = await kv.getByPrefix('maestro:');
  return c.json({ maestros });
});

app.get('/make-server-9aeea470/maestros/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const maestro = await kv.get(`maestro:${id}`);
  if (!maestro) return c.json({ error: 'Maestro no encontrado' }, 404);
  return c.json({ maestro });
});

app.post('/make-server-9aeea470/maestros', requireAuth, requireAdmin, async (c) => {
  const maestroData = await c.req.json();
  const id = crypto.randomUUID();
  const maestro = { id, ...maestroData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await kv.set(`maestro:${id}`, maestro);
  return c.json({ success: true, maestro });
});

app.put('/make-server-9aeea470/maestros/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const updateData = await c.req.json();
  const existingMaestro = await kv.get(`maestro:${id}`);
  if (!existingMaestro) return c.json({ error: 'Maestro no encontrado' }, 404);
  const maestro = { ...existingMaestro, ...updateData, updatedAt: new Date().toISOString() };
  await kv.set(`maestro:${id}`, maestro);
  return c.json({ success: true, maestro });
});

app.delete('/make-server-9aeea470/maestros/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  await kv.del(`maestro:${id}`);
  return c.json({ success: true });
});

// ============================================
// GESTIÓN DE ASIGNATURAS
// ============================================

app.get('/make-server-9aeea470/asignaturas', requireAuth, async (c) => {
  const asignaturas = await kv.getByPrefix('asignatura:');
  return c.json({ asignaturas });
});

app.post('/make-server-9aeea470/asignaturas', requireAuth, requireAdmin, async (c) => {
  const asignaturaData = await c.req.json();
  const id = crypto.randomUUID();
  const asignatura = { id, ...asignaturaData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await kv.set(`asignatura:${id}`, asignatura);
  return c.json({ success: true, asignatura });
});

app.put('/make-server-9aeea470/asignaturas/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const updateData = await c.req.json();
  const existingAsignatura = await kv.get(`asignatura:${id}`);
  if (!existingAsignatura) return c.json({ error: 'Asignatura no encontrada' }, 404);
  const asignatura = { ...existingAsignatura, ...updateData, updatedAt: new Date().toISOString() };
  await kv.set(`asignatura:${id}`, asignatura);
  return c.json({ success: true, asignatura });
});

app.delete('/make-server-9aeea470/asignaturas/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  await kv.del(`asignatura:${id}`);
  return c.json({ success: true });
});

// ============================================
// GESTIÓN DE AULAS
// ============================================

app.get('/make-server-9aeea470/aulas', requireAuth, async (c) => {
  const aulas = await kv.getByPrefix('aula:');
  return c.json({ aulas });
});

app.post('/make-server-9aeea470/aulas', requireAuth, requireAdmin, async (c) => {
  const aulaData = await c.req.json();
  const id = crypto.randomUUID();
  const aula = { id, ...aulaData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await kv.set(`aula:${id}`, aula);
  return c.json({ success: true, aula });
});

app.put('/make-server-9aeea470/aulas/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const updateData = await c.req.json();
  const existingAula = await kv.get(`aula:${id}`);
  if (!existingAula) return c.json({ error: 'Aula no encontrada' }, 404);
  const aula = { ...existingAula, ...updateData, updatedAt: new Date().toISOString() };
  await kv.set(`aula:${id}`, aula);
  return c.json({ success: true, aula });
});

app.delete('/make-server-9aeea470/aulas/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  await kv.del(`aula:${id}`);
  return c.json({ success: true });
});

// ============================================
// GESTIÓN DE HORARIOS
// ============================================

async function verificarConflictos(horarioNuevo, horarioId) {
  const todosHorarios = await kv.getByPrefix('horario:');
  for (const horario of todosHorarios) {
    if (horarioId && horario.id === horarioId) continue;
    if (horario.dia === horarioNuevo.dia) {
      const existeInicio = parseInt(horario.horaInicio.replace(':', ''));
      const existeFin = parseInt(horario.horaFin.replace(':', ''));
      const nuevoInicio = parseInt(horarioNuevo.horaInicio.replace(':', ''));
      const nuevoFin = parseInt(horarioNuevo.horaFin.replace(':', ''));
      const haySuperposicion = (nuevoInicio < existeFin) && (nuevoFin > existeInicio);
      
      if (haySuperposicion) {
        if (horario.maestroId === horarioNuevo.maestroId) return { conflicto: true, mensaje: 'El maestro ya tiene una clase en este horario' };
        if (horario.aulaId === horarioNuevo.aulaId) return { conflicto: true, mensaje: 'El aula ya está ocupada en este horario' };
      }
    }
  }
  return { conflicto: false };
}

app.get('/make-server-9aeea470/horarios', requireAuth, async (c) => {
  const horarios = await kv.getByPrefix('horario:');
  return c.json({ horarios });
});

app.post('/make-server-9aeea470/horarios', requireAuth, requireAdmin, async (c) => {
  const horarioData = await c.req.json();
  const conflicto = await verificarConflictos(horarioData);
  if (conflicto.conflicto) return c.json({ error: conflicto.mensaje }, 400);
  
  const id = crypto.randomUUID();
  const horario = { id, ...horarioData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await kv.set(`horario:${id}`, horario);
  return c.json({ success: true, horario });
});

app.put('/make-server-9aeea470/horarios/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const updateData = await c.req.json();
  const existingHorario = await kv.get(`horario:${id}`);
  if (!existingHorario) return c.json({ error: 'Horario no encontrado' }, 404);

  const conflicto = await verificarConflictos(updateData, id);
  if (conflicto.conflicto) return c.json({ error: conflicto.mensaje }, 400);

  const horario = { ...existingHorario, ...updateData, updatedAt: new Date().toISOString() };
  await kv.set(`horario:${id}`, horario);
  return c.json({ success: true, horario });
});

app.delete('/make-server-9aeea470/horarios/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  await kv.del(`horario:${id}`);
  return c.json({ success: true });
});

// ============================================
// CONFIGURACIÓN
// ============================================

app.get('/make-server-9aeea470/config', requireAuth, async (c) => {
  let config = await kv.get('system:config');
  if (!config) {
    config = {
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      horaInicio: '07:00',
      horaFin: '22:00',
      duracionBloque: 60,
      carreras: ['Licenciatura en Informática', 'Ingeniería en Sistemas de la Información'],
      modalidades: ['Presencial', 'Virtual']
    };
    await kv.set('system:config', config);
  }
  return c.json({ config });
});

app.put('/make-server-9aeea470/config', requireAuth, requireAdmin, async (c) => {
  const configData = await c.req.json();
  await kv.set('system:config', configData);
  return c.json({ success: true, config: configData });
});

// ============================================
// VERIFICACIÓN Y LIMPIEZA
// ============================================

app.get('/make-server-9aeea470/auth/verify', requireAuth, async (c) => {
  const user = c.get('user');
  const userData = c.get('userData');
  return c.json({ 
    success: true,
    user: { id: user.id, email: user.email, nombre: userData.nombre, role: userData.role }
  });
});

app.post('/make-server-9aeea470/auth/cleanup', requireAuth, requireAdmin, async (c) => {
  const allKvUsers = await kv.getByPrefix('user:id:');
  const orphanedUsers = [];
  
  for (const kvUser of allKvUsers) {
    const { data, error } = await supabase.auth.admin.getUserById(kvUser.id);
    if (error || !data.user) {
      orphanedUsers.push(kvUser.email);
      await kv.del(`user:${kvUser.email}`);
      await kv.del(`user:id:${kvUser.id}`);
    }
  }
  
  return c.json({ success: true, message: 'Limpieza completada', orphanedUsers });
});

Deno.serve(app.fetch);