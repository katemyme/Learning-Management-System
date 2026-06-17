-- ============================================================
-- CONSTRAINTS A NIVEL DE BASE DE DATOS
-- Ejecutar una sola vez sobre la BD ya creada por Sequelize
-- ============================================================

-- CHECK: valores validos para rol en Usuarios
ALTER TABLE Usuarios
  ADD CONSTRAINT chk_usuarios_rol
  CHECK (rol IN ('admin', 'profesor', 'estudiante'));

-- CHECK: calificacion entre 0 y 100 en Evaluaciones
ALTER TABLE Evaluaciones
  ADD CONSTRAINT chk_evaluaciones_calificacion
  CHECK (calificacion >= 0 AND calificacion <= 100);

-- CHECK: nota_semestre entre 0 y 100 en Matriculas
ALTER TABLE Matriculas
  ADD CONSTRAINT chk_matriculas_nota_semestre
  CHECK (nota_semestre >= 0 AND nota_semestre <= 100);

-- CHECK: fecha_fin debe ser igual o posterior a fecha_inicio en Cursos
ALTER TABLE Cursos
  ADD CONSTRAINT chk_cursos_fechas
  CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio);
