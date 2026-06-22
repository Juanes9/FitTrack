CREATE DATABASE FitTrackDB;
GO

USE FitTrackDB;
GO

CREATE TABLE Usuarios(
	Id INT IDENTITY(1,1) PRIMARY KEY,
	Nombre VARCHAR(100) NOT NULL,
	Email VARCHAR(100) NOT NULL UNIQUE,
	Altura_cm DECIMAL(5,2),
	Peso_kg DECIMAL(5,2)
);

CREATE TABLE Workouts(
	Id INT IDENTITY(1,1) PRIMARY KEY,
	UsuarioId INT,
	FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id),
	Tipo_Ejercicio VARCHAR(50),
	Duracion_Minutos INT,
	Calorias_Quemadas INT,
	Fecha DATETIME
);

CREATE TABLE Historia_Calorias(
	Id INT IDENTITY(1,1) PRIMARY KEY,
	UsuarioId INT,
	FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id),
	Fecha DATE,
	Pasos INT,
	Calorias_Consumidas INT,
	Calorias_Quemadas_Totales INT
);