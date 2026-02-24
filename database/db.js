const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'pos.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Verificar si la base de datos existe
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        // Si es una nueva base de datos, ejecutar el esquema
        if (!dbExists) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
                if (err) {
                    console.error('Error al crear las tablas:', err.message);
                } else {
                    console.log('Base de datos inicializada correctamente.');
                }
            });
        }
    }
});

module.exports = db;