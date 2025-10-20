-- ============================================
-- FIX: Crear registros en maestros para usuarios existentes
-- ============================================
-- Este script crea registros en la tabla maestros para usuarios 
-- con rol 'maestro' que ya existían antes de implementar el trigger

-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase

-- Insertar registros de maestros para usuarios existentes que no tienen entrada en maestros
INSERT INTO public.maestros (
    email,
    nombre,
    especialidad,
    dias_disponibles,
    horas_disponibilidad,
    created_at,
    updated_at
)
SELECT 
    u.email,
    u.nombre,
    'Sin especificar' as especialidad,
    ARRAY[]::text[] as dias_disponibles,
    ARRAY[]::jsonb[] as horas_disponibilidad,
    NOW() as created_at,
    NOW() as updated_at
FROM public.usuarios u
LEFT JOIN public.maestros m ON u.email = m.email
WHERE u.role = 'maestro' 
  AND m.id IS NULL; -- Solo insertar si no existe ya en maestros

-- Verificar los registros creados
SELECT 
    m.id,
    m.email,
    m.nombre,
    m.especialidad,
    m.created_at
FROM public.maestros m
ORDER BY m.created_at DESC;

-- ============================================
-- NOTA: Si quieres crear un registro específico para TU usuario,
-- puedes ejecutar este query reemplazando el email:
-- ============================================

-- INSERT INTO public.maestros (
--     email,
--     nombre,
--     especialidad,
--     dias_disponibles,
--     horas_disponibilidad,
--     created_at,
--     updated_at
-- )
-- SELECT 
--     email,
--     nombre,
--     'Sin especificar',
--     ARRAY[]::text[],
--     ARRAY[]::jsonb[],
--     NOW(),
--     NOW()
-- FROM public.usuarios
-- WHERE email = 'TU_EMAIL_AQUI@ejemplo.com'
-- AND role = 'maestro';
