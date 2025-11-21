USE ministerio;

GO
/* Crear usuario */
CREATE OR ALTER PROCEDURE sp_crear_usuario
  @nombre NVARCHAR(100),
  @correo NVARCHAR(150),
  @hash   NVARCHAR(255),
  @rol    NVARCHAR(20)
AS
INSERT INTO Usuarios(nombre,email,passwordHash,rol)
VALUES (@nombre,@correo,@hash,@rol);
GO

/* Login: obtener por email */
CREATE OR ALTER PROCEDURE sp_get_usuario_por_email
  @correo NVARCHAR(150)
AS
SELECT TOP 1 * FROM Usuarios WHERE email=@correo;
GO

CREATE OR ALTER PROCEDURE sp_get_usuarios
AS
SELECT u.id, u.nombre, u.email, u.rol, f.nombre AS fiscalia
FROM Usuarios u
LEFT JOIN Fiscalias f ON u.fiscaliaId = f.id
WHERE u.rol <> 'admin'
ORDER BY u.nombre;
GO

CREATE OR ALTER PROCEDURE sp_get_usuario_por_id
  @id INT
AS
SELECT u.id, u.nombre, u.email, u.rol, f.nombre AS fiscalia
FROM Usuarios u
LEFT JOIN Fiscalias f ON u.fiscaliaId = f.id
WHERE u.id = @id;
GO

/* Obtener expediente dicri por id */
CREATE OR ALTER PROCEDURE sp_get_expediente_dicri_por_id
  @id INT
AS
SELECT c.id, c.numeroExpediente, c.estado, c.fechaRegistro, c.descripcionGeneral, c.referenciaMp, c.ubicacion, c.idTecnico, u.nombre AS tecnicoNombre, u.email AS tecnicoEmail
FROM ExpedientesDicri c
LEFT JOIN Usuarios u ON c.idTecnico = u.id
WHERE c.id = @id;
GO

/* Obtener todos los expedientes dicri */
CREATE OR ALTER PROCEDURE sp_obtener_expedientes_dicri
AS
SELECT c.id, c.numeroExpediente, c.estado, c.fechaRegistro, c.descripcionGeneral, c.referenciaMp, c.ubicacion, u.nombre, u.email FROM ExpedientesDicri c left join Usuarios u on c.idTecnico=u.id
WHERE c.estado<>'eliminado'
ORDER BY c.fechaRegistro DESC;
GO

/* Crear expediente dicri */
CREATE OR ALTER PROCEDURE sp_crear_expediente_dicri
  @id           INT = NULL,
  @numero       NVARCHAR(50),
  @idTecnico    INT,
  @justificacionRechazo NVARCHAR(500) = NULL,
  @descripcionGeneral NVARCHAR(500) = NULL,
  @referenciaMp NVARCHAR(100) = NULL,
  @ubicacion    NVARCHAR(100) = NULL
AS
BEGIN
    IF @id IS NULL  
    BEGIN
        INSERT INTO ExpedientesDicri (numeroExpediente, idTecnico, estado, justificacionRechazo, descripcionGeneral, referenciaMp, ubicacion)
        OUTPUT INSERTED.*
        VALUES (@numero, @idTecnico, 'Registrado', @justificacionRechazo, @descripcionGeneral, @referenciaMp, @ubicacion);

        DECLARE @nuevoId INT = SCOPE_IDENTITY();

        exec sp_agregar_historial_expediente @nuevoId, 'Registrado', @justificacionRechazo, @idTecnico;
         SELECT *
        FROM ExpedientesDicri
        WHERE id = @nuevoId;
    END
    ELSE 
    BEGIN
        UPDATE ExpedientesDicri
        SET    numeroExpediente       = @numero,
               idTecnico              = @idTecnico,
               justificacionRechazo   = @justificacionRechazo,
               descripcionGeneral     = @descripcionGeneral,
               referenciaMp           = @referenciaMp,
               ubicacion              = @ubicacion
        OUTPUT INSERTED.*
        WHERE  id = @id;
    END
END
GO

/* Crear indicio */
CREATE OR ALTER PROCEDURE sp_crear_indicio
  @idExpediente INT,
  @descripcion NVARCHAR(200),
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @peso DECIMAL(10, 2) = NULL,
  @ubicacion NVARCHAR(200) = NULL,
  @idTecnico INT
AS
INSERT INTO Indicios (IdExpediente, Descripcion, Color, Tamano, Peso, Ubicacion, IdTecnico)
VALUES (@idExpediente, @descripcion, @color, @tamano, @peso, @ubicacion, @idTecnico);
GO

/* Obtener indicios por expediente */
CREATE OR ALTER PROCEDURE sp_obtener_indicios_por_expediente
  @idExpediente INT
AS
SELECT * FROM Indicios WHERE idExpediente=@idExpediente ORDER BY fechaRegistro DESC;
GO

/* Actualizar Indicio */
CREATE OR ALTER PROCEDURE sp_actualizar_indicio
  @id INT,
  @descripcion NVARCHAR(200),
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @peso DECIMAL(10, 2) = NULL,
  @ubicacion NVARCHAR(200) = NULL
AS
UPDATE Indicios
SET    descripcion = @descripcion,
       color       = @color,
       tamano      = @tamano,
       peso        = @peso,
       ubicacion   = @ubicacion
WHERE  id = @id;
GO

/* Expediente dicri a revision */
CREATE OR ALTER PROCEDURE sp_expediente_a_revision
  @idExpediente INT,
  @idUsuario INT,
  @comentario NVARCHAR(500) = NULL
AS
UPDATE ExpedientesDicri
SET    estado = 'EnRevision'
WHERE  id = @idExpediente;  
exec sp_agregar_historial_expediente @idExpediente, 'EnRevision', @comentario, @idUsuario;
GO

/* Expediente dicri aprobado */
CREATE OR ALTER PROCEDURE sp_aprobar_expediente
  @idExpediente INT,
  @comentario NVARCHAR(500) = NULL,
  @idUsuario INT
AS
UPDATE ExpedientesDicri
SET    estado = 'Aprobado'
WHERE  id = @idExpediente;  
exec sp_agregar_historial_expediente @idExpediente, 'Aprobado', @comentario, @idUsuario;
GO  

/* Rejectar expediente dicri */
CREATE OR ALTER PROCEDURE sp_rechazar_expediente
  @idExpediente INT,
  @justificacion NVARCHAR(500),
  @idUsuario INT
AS
UPDATE ExpedientesDicri
SET    estado               = 'Rechazado',
       justificacionRechazo = @justificacion
WHERE  id = @idExpediente;  
exec sp_agregar_historial_expediente @idExpediente, 'Rechazado', @justificacion, @idUsuario;
GO

/* Agregar registro al historial de expediente dicri */
CREATE OR ALTER PROCEDURE sp_agregar_historial_expediente
  @idExpediente INT,
  @estado NVARCHAR(20),
  @comentario NVARCHAR(500) = NULL,
  @idUsuario INT
AS
INSERT INTO ExpedientesDicriHistorial (idExpediente, estado, comentario, idUsuario)
VALUES (@idExpediente, @estado, @comentario, @idUsuario);
GO

/* Obtener historial de expediente dicri */
CREATE OR ALTER PROCEDURE sp_obtener_historial_expediente
  @idExpediente INT
AS
SELECT h.id, h.estado, h.comentario, u.nombre AS usuarioNombre, u.email AS usuarioEmail, h.fecha
FROM ExpedientesDicriHistorial h
JOIN Usuarios u ON h.idUsuario = u.id
WHERE h.idExpediente = @idExpediente
ORDER BY h.fecha DESC;
GO