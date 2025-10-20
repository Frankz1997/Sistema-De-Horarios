-- Agregar columna para foto de perfil en la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

-- Comentario sobre la columna
COMMENT ON COLUMN usuarios.foto_perfil IS 'URL de la foto de perfil del usuario (puede ser una URL de Supabase Storage o externa)';
