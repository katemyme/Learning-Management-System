-- ============================================================
-- TRIGGERS
-- Ejecutar despues de que Sequelize haya creado las tablas
-- ============================================================

-- -------------------------------------------------------
-- Trigger 1: Recalcular nota_semestre al insertar o
-- actualizar una evaluacion.
-- Calcula el promedio de todas las evaluaciones de esa
-- matricula y lo guarda en Matriculas.nota_semestre.
-- -------------------------------------------------------
CREATE TRIGGER tr_recalcular_nota_semestre
ON Evaluaciones
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE m
    SET m.nota_semestre = (
        SELECT AVG(e.calificacion)
        FROM Evaluaciones e
        WHERE e.matricula_id = i.matricula_id
    )
    FROM Matriculas m
    JOIN inserted i ON m.id = i.matricula_id;
END;

-- -------------------------------------------------------
-- Trigger 2: Ajustar nota_semestre al eliminar una
-- evaluacion. Si quedan evaluaciones recalcula el promedio;
-- si no quedan, deja nota_semestre en NULL.
-- -------------------------------------------------------
CREATE TRIGGER tr_ajustar_nota_al_eliminar
ON Evaluaciones
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE m
    SET m.nota_semestre = (
        SELECT AVG(e.calificacion)
        FROM Evaluaciones e
        WHERE e.matricula_id = d.matricula_id
    )
    FROM Matriculas m
    JOIN deleted d ON m.id = d.matricula_id;
END;
