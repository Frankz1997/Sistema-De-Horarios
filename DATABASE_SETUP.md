# Configuración de Base de Datos - Sistema UAS

## Actualización de la Tabla `maestros`

Para que la funcionalidad de "Días Disponibles" funcione correctamente, asegúrate de que la tabla `maestros` en Supabase tenga la columna `dias_disponibles` como un **array de texto**.

### SQL para agregar la columna (si no existe):

```sql
-- Agregar columna dias_disponibles a la tabla maestros como array de texto
ALTER TABLE maestros 
ADD COLUMN IF NOT EXISTS dias_disponibles TEXT[];
```

### Estructura esperada de la tabla `maestros`:

| Columna          | Tipo         | Descripción                                    |
|------------------|--------------|------------------------------------------------|
| id               | uuid         | ID único (Primary Key)                         |
| nombre           | text         | Nombre completo del maestro                    |
| email            | text         | Correo electrónico                             |
| especialidad     | text         | Especialidad o área del maestro                |
| dias_disponibles | text[]       | Array de días (ej: {"Lunes", "Martes"})        |
| created_at       | timestamp    | Fecha de creación                              |
| updated_at       | timestamp    | Fecha de última actualización                  |

### Ejemplo de datos en `dias_disponibles`:

El campo es un array de PostgreSQL que se guarda así:

```
{"Lunes", "Martes", "Miércoles", "Jueves", "Viernes"}
```

O para días específicos:

```
{"Martes", "Jueves"}
```

### Cómo ejecutar en Supabase:

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Ejecuta el SQL de arriba para agregar la columna
4. Verifica que la columna se creó correctamente en la tabla `maestros`

### Nota Importante:

- **IMPORTANTE**: El tipo de dato debe ser `TEXT[]` (array de texto), NO `TEXT` simple
- La aplicación envía y recibe arrays de JavaScript directamente
- Supabase maneja automáticamente la conversión entre arrays de JavaScript y PostgreSQL
- Si un maestro no tiene días seleccionados, se enviará un array vacío `[]`
