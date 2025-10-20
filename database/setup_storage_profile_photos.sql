-- ============================================
-- Script para configurar Storage en Supabase
-- para fotos de perfil de usuarios
-- ============================================

-- PASO 1: Crear el bucket en la interfaz de Supabase Storage
-- Ve a Storage > Create a new bucket
-- Nombre: profile-photos
-- Public: YES (marcar como público)

-- PASO 2: Configurar políticas de seguridad (RLS)
-- Ejecutar estos comandos en el SQL Editor de Supabase:

-- Política para permitir que usuarios autenticados suban sus propias fotos
CREATE POLICY "Los usuarios pueden subir sus propias fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Política para permitir que usuarios autenticados actualicen sus propias fotos
CREATE POLICY "Los usuarios pueden actualizar sus propias fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Política para permitir que usuarios autenticados eliminen sus propias fotos
CREATE POLICY "Los usuarios pueden eliminar sus propias fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Política para permitir que cualquier usuario autenticado vea las fotos
CREATE POLICY "Las fotos de perfil son visibles para usuarios autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-photos');

-- NOTA: Si el bucket ya está marcado como público, las fotos serán
-- accesibles mediante URL pública sin necesidad de autenticación para verlas,
-- pero solo usuarios autenticados pueden subirlas/modificarlas.
