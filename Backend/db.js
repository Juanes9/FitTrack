// Importamos el driver de SQL Server y la librería para leer el .env
const sql = require('mssql');
require('dotenv').config();

// Configuramos los parámetros de conexión usando las variables ocultas
const dbSettings = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // En false porque estamos trabajando en local (localhost)
        trustServerCertificate: true // Súper importante para que SQL Server local no rechace la conexión
    }
}

let pool; // <-- LÍNEA NUEVA: Aquí guardaremos la conexión para no repetirla

// Creamos una función asíncrona para intentar conectarnos
const getConnection = async () => {
    try {
        // <-- LÍNEA NUEVA: Si el túnel ya existe, lo reutilizamos inmediatamente
        if (pool) return pool;

        pool = await sql.connect(dbSettings);
        console.log('Conexion exitosa a la base de datos FitTrackDB');
        return pool;
    } catch (error) {
        console.log('Error conectando a la base de datos: ', error);
    }
}

// Exportamos la función para poder usarla en otros archivos
module.exports = { sql, getConnection };