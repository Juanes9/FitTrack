// 1. Importar las librerías
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sql, getConnection } = require('./db'); // <-- LÍNEA NUEVA: Traemos el túnel

// 2. Inicializar la aplicación
const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. Endpoint de prueba
app.get('/api/test', (req, res) => {
    res.json({
        mensaje: 'El servidor de FitTrack esta vivo y funcionando al 100%',
        estado: 'Exitoso'
    });
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {

        // 1. Llamamos a la función que abre el túnel
        const pool = await getConnection();

        // 2. Ejecutamos la consulta SQL tal como lo harías en SSMS
        const result = await pool.request().query('SELECT * FROM Usuarios');

        // 3. Devolvemos los datos al Front-End (o al navegador)
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
});

// POST: Crear un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
    try {
        const { Nombre, Email, Altura_cm, Peso_kg } = req.body;
        const pool = await getConnection();

        await pool.request()
            .input('Nombre', sql.VarChar, Nombre)
            .input('Email', sql.VarChar, Email)
            .input('Altura_cm', sql.Decimal, Altura_cm)
            .input('Peso_kg', sql.Decimal, Peso_kg)
            .query('INSERT INTO Usuarios (Nombre, Email, ALtura_cm, Peso_kg) VALUES (@Nombre, @Email, @Altura_cm, @Peso_kg)');

        res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
    }
});

// End Point de entrenamientos
app.post('/api/entrenamientos', async (req, res) => {
    try {
        const { UsuarioId, Tipo_Ejercicio, Duracion_Minutos, Calorias_Quemadas, Fecha } = req.body;
        const pool = await getConnection();

        await pool.request()
            .input('UsuarioId', sql.Int, UsuarioId)
            .input('Tipo_Ejercicio', sql.VarChar, Tipo_Ejercicio)
            .input('Duracion_Minutos', sql.Int, Duracion_Minutos)
            .input('Calorias_Quemadas', sql.Int, Calorias_Quemadas)
            .input('Fecha', sql.DateTime, Fecha)
            .query('INSERT INTO Workouts(UsuarioId, Tipo_Ejercicio, Duracion_Minutos, Calorias_Quemadas, Fecha) VALUES (@UsuarioId, @Tipo_Ejercicio, @Duracion_Minutos, @Calorias_Quemadas, @Fecha)');

        res.status(201).json({ mensaje: 'Entrenamiento creado correctamente' });
    } catch (error) {
        console.error('Error al crear entrenamiento', error);
        res.status(500).json({ mensaje: 'Error al crear el entrenamiento' });
    }
});

// DELETE: Eliminar un entrenamiento por ID
app.delete('/api/entrenamientos/:id', async (req, res) => {
    try {
        // 1. Capturamos el ID que viene en la URL
        const { id } = req.params;
        const pool = await getConnection();

        // 2. Ejecutamos el DELETE en la base de datos de forma segura
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('DELETE FROM Workouts WHERE Id = @Id');

        // 3. Revisamos si SQL Server realmente borró algo
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ mensaje: 'No se encontro ningun entrenamiento con ese ID' });
        }

        res.json({ mensaje: 'Entrenamiento eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar entrenamiento:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el entrenamiento' });
    }
});

// GET: Obtener todos los entrenamientos
app.get('/api/entrenamientos', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Workouts');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ mensaje: 'Error al obtener los entrenamientos' });
    }
});

//ENDPOINTS HISTORIAL DE CALORIAS

// POST: Registrar calorias del dia
app.post('/api/calorias', async (req, res) => {
    try {
        const { UsuarioId, Fecha, Pasos, Calorias_Consumidas, Calorias_Quemadas_Totales } = req.body;
        const pool = await getConnection();

        await pool.request()
            .input('UsuarioId', sql.Int, UsuarioId)
            .input('Fecha', sql.DateTime, Fecha)
            .input('Pasos', sql.Int, Pasos)
            .input('Calorias_Consumidas', sql.Int, Calorias_Consumidas)
            .input('Calorias_Quemadas_Totales', sql.Int, Calorias_Quemadas_Totales)
            .query('INSERT INTO Historial_Calorias (UsuarioId, Fecha, Pasos, Calorias_Consumidas, Calorias_Quemadas_Totales) VALUES (@UsuarioId, @Fecha, @Pasos, @Calorias_Consumidas, @Calorias_Quemadas_Totales)');

        res.status(201).json({ mensaje: 'Historial de calorias registrado' });
    } catch (error) {
        console.error('Error al registrar calorias:', error);
        res.status(500).json({ mensaje: 'Error al registrar las calorias' });
    }
});

//GET: Obtener el historial completo de calorias
app.get('/api/calorias', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Historial_Calorias');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener historial de calorias:', error);
        res.status(500).json({ mensaje: 'Error al obtener el historial de calorias' });
    }
});

// 5. Intentar conectar a la base de datos
getConnection(); // <-- LÍNEA NUEVA: Abrimos el túnel apenas arranca el servidor

// 6. Encender el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de FitTrack corriendo en http://localhost:${PORT}`);
});