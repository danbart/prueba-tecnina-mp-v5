USE ministerio;

GO
/* Usuarios */
IF OBJECT_ID ('Usuarios') IS NULL
CREATE TABLE
    Usuarios (
        id INT IDENTITY PRIMARY KEY,
        nombre NVARCHAR (100) NOT NULL,
        email NVARCHAR (150) NOT NULL UNIQUE,
        passwordHash NVARCHAR (255) NOT NULL,
        rol NVARCHAR (20) NOT NULL
    );

GO
/* Fiscalías */
IF OBJECT_ID ('Fiscalias') IS NULL
CREATE TABLE
    Fiscalias (
        id INT IDENTITY PRIMARY KEY,
        nombre NVARCHAR (150) NOT NULL
    );

GO
/* Agregar columna fiscaliaId a Usuarios */
IF COL_LENGTH ('Usuarios', 'fiscaliaId') IS NULL
ALTER TABLE Usuarios ADD fiscaliaId INT REFERENCES Fiscalias (id);

GO
/* ExpedientesDicri */
IF OBJECT_ID ('ExpedientesDicri') IS NULL
CREATE TABLE
    ExpedientesDicri (
        id INT IDENTITY PRIMARY KEY,
        numeroExpediente NVARCHAR (50) NOT NULL,
        fechaRegistro DATETIME2 NOT NULL DEFAULT SYSDATETIME (),
        idTecnico INT NOT NULL REFERENCES Usuarios (id),
        estado NVARCHAR (20) NOT NULL, -- Registrado, EnRevision, Aprobado, Rechazado
        justificacionRechazo NVARCHAR (500) NULL,
        descripcionGeneral NVARCHAR (500) NULL,
        referenciaMp NVARCHAR (100) NULL,
        ubicacion NVARCHAR (100) NULL
    );

GO
/* Indicios */
IF OBJECT_ID ('Indicios') IS NULL
CREATE TABLE
    Indicios (
        id INT IDENTITY PRIMARY KEY,
        idExpediente INT NOT NULL FOREIGN KEY REFERENCES ExpedientesDicri (id),
        descripcion NVARCHAR (200) NOT NULL,
        color NVARCHAR (50) NULL,
        tamano NVARCHAR (50) NULL,
        peso DECIMAL(10, 2) NULL,
        ubicacion NVARCHAR (200) NULL,
        idTecnico INT NOT NULL REFERENCES Usuarios (id),
        fechaRegistro DATETIME2 NOT NULL DEFAULT SYSDATETIME ()
    );

GO
/* Historial de estados */
IF OBJECT_ID ('ExpedientesDicriHistorial') IS NULL
CREATE TABLE
    ExpedientesDicriHistorial (
        id INT IDENTITY PRIMARY KEY,
        idExpediente INT NOT NULL REFERENCES ExpedientesDicri (id),
        estado NVARCHAR (20) NOT NULL,
        comentario NVARCHAR (500) NULL,
        idUsuario INT NOT NULL REFERENCES Usuarios (id),
        fecha DATETIME2 NOT NULL DEFAULT SYSDATETIME ()
    );

GO