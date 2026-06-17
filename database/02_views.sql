-- ============================================================
-- VISTAS
-- Ejecutar despues de que Sequelize haya creado las tablas
-- ============================================================

-- -------------------------------------------------------
-- Vista 1: Notas consolidadas por estudiante y curso
-- Muestra el promedio de evaluaciones, la nota_semestre
-- y cuantos cortes tiene registrados cada matricula.
-- -------------------------------------------------------
CREATE VIEW vista_notas_consolidadas AS
SELECT
    u.id                          AS estudiante_id,
    u.nombre + ' ' + u.apellido   AS estudiante,
    c.id                          AS curso_id,
    c.titulo                      AS curso,
    m.id                          AS matricula_id,
    m.fecha_registro,
    m.nota_semestre,
    COUNT(e.id)                   AS total_evaluaciones,
    AVG(e.calificacion)           AS promedio_evaluaciones,
    MAX(e.calificacion)           AS nota_maxima,
    MIN(e.calificacion)           AS nota_minima
FROM Matriculas m
JOIN Usuarios u ON m.estudiante_id = u.id
JOIN Cursos   c ON m.curso_id      = c.id
LEFT JOIN Evaluaciones e ON e.matricula_id = m.id
GROUP BY
    u.id, u.nombre, u.apellido,
    c.id, c.titulo,
    m.id, m.fecha_registro, m.nota_semestre;

-- -------------------------------------------------------
-- Vista 2: Resumen de cursos con profesor y cantidad de
-- estudiantes matriculados.
-- -------------------------------------------------------
CREATE VIEW vista_cursos_resumen AS
SELECT
    c.id                                      AS curso_id,
    c.titulo,
    c.fecha_inicio,
    c.fecha_fin,
    CASE WHEN c.estado = 1 THEN 'Activo'
         ELSE 'Inactivo' END                  AS estado,
    p.nombre + ' ' + p.apellido               AS profesor,
    COUNT(m.id)                               AS total_estudiantes
FROM Cursos c
LEFT JOIN Usuarios u ON c.profesor_id = u.id
LEFT JOIN Usuarios p ON c.profesor_id = p.id
LEFT JOIN Matriculas m ON m.curso_id  = c.id
GROUP BY
    c.id, c.titulo, c.fecha_inicio, c.fecha_fin, c.estado,
    p.nombre, p.apellido;
