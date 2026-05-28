import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let isMySQL = false;
let mysqlPool = null;
let sqliteDb = null;

// Semillas iniciales (Frutas enriquecidas)
const PRODUCTOS_SEMILLA = [
    { id: 1, nombre: "arandano", precio: 5000, img: "img/arandano.jpg", categoria: "baya", calorias: 57, azucar: 10.0, fibra: 2.4, vitaminaC: 9.7, popularidad: 5 },
    { id: 2, nombre: "anana", precio: 9560, img: "img/anana.jpg", categoria: "tropical", calorias: 50, azucar: 10.0, fibra: 1.4, vitaminaC: 47.8, popularidad: 4 },
    { id: 3, nombre: "banana", precio: 79600, img: "img/banana.jpg", categoria: "tropical", calorias: 89, azucar: 12.0, fibra: 2.6, vitaminaC: 8.7, popularidad: 5 },
    { id: 4, nombre: "frambuesa", precio: 35000, img: "img/frambuesa.png", categoria: "baya", calorias: 52, azucar: 4.4, fibra: 6.5, vitaminaC: 26.2, popularidad: 5 },
    { id: 5, nombre: "mandarina", precio: 55000, img: "img/mandarina.jpg", categoria: "citrico", calorias: 53, azucar: 10.6, fibra: 1.8, vitaminaC: 26.7, popularidad: 4 },
    { id: 6, nombre: "manzana", precio: 55000, img: "img/manzana.jpg", categoria: "pomaceas", calorias: 52, azucar: 10.4, fibra: 2.4, vitaminaC: 4.6, popularidad: 5 },
    { id: 7, nombre: "naranja", precio: 55000, img: "img/naranja.jpg", categoria: "citrico", calorias: 47, azucar: 9.4, fibra: 2.4, vitaminaC: 53.2, popularidad: 5 },
    { id: 8, nombre: "pera", precio: 55000, img: "img/pera.jpg", categoria: "pomaceas", calorias: 57, azucar: 9.8, fibra: 3.1, vitaminaC: 4.3, popularidad: 4 },
    { id: 9, nombre: "pomelo-amarillo", precio: 55000, img: "img/pomelo-amarillo.jpg", categoria: "citrico", calorias: 38, azucar: 7.0, fibra: 1.6, vitaminaC: 38.0, popularidad: 3 },
    { id: 10, nombre: "pomelo-rojo", precio: 55000, img: "img/pomelo-rojo.jpg", categoria: "citrico", calorias: 42, azucar: 7.3, fibra: 1.6, vitaminaC: 31.2, popularidad: 4 },
    { id: 11, nombre: "sandia", precio: 55000, img: "img/sandia.jpg", categoria: "cucurbitaceas", calorias: 30, azucar: 6.2, fibra: 0.4, vitaminaC: 8.1, popularidad: 5 },
    { id: 12, nombre: "frutilla", precio: 55000, img: "img/frutilla.jpg", categoria: "baya", calorias: 32, azucar: 4.9, fibra: 2.0, vitaminaC: 58.8, popularidad: 5 },
    { id: 13, nombre: "kiwi", precio: 55000, img: "img/kiwi.jpg", categoria: "tropical", calorias: 61, azucar: 9.0, fibra: 3.0, vitaminaC: 92.7, popularidad: 4 }
];

export async function connectDB() {
    if (process.env.DB_HOST) {
        console.log("Conectando a base de datos MySQL remota...");
        try {
            mysqlPool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: parseInt(process.env.DB_PORT || '3306'),
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            isMySQL = true;
            console.log("Conexión a MySQL establecida.");
        } catch (err) {
            console.error("Error al conectar a MySQL, cayendo a SQLite local...", err.message);
            setupSQLite();
        }
    } else {
        setupSQLite();
    }

    await initSchema();
    await seedProducts();
}

function setupSQLite() {
    console.log("Usando base de datos SQLite local (organique.db)...");
    const dbPath = path.join(__dirname, 'organique.db');
    sqliteDb = new sqlite3.Database(dbPath);
    isMySQL = false;
}

async function initSchema() {
    if (isMySQL) {
        // Tablas MySQL
        const conn = await mysqlPool.getConnection();
        try {
            await conn.execute(`
                CREATE TABLE IF NOT EXISTS productos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    precio INT NOT NULL,
                    img VARCHAR(255) NOT NULL,
                    categoria VARCHAR(50) NOT NULL,
                    calorias INT NOT NULL,
                    azucar DECIMAL(5,2) NOT NULL,
                    fibra DECIMAL(5,2) NOT NULL,
                    vitaminaC DECIMAL(5,2) NOT NULL,
                    popularidad INT NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);

            await conn.execute(`
                CREATE TABLE IF NOT EXISTS ventas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cliente_nombre VARCHAR(100) NOT NULL,
                    cliente_email VARCHAR(100) NOT NULL,
                    cliente_direccion VARCHAR(255) NOT NULL,
                    fecha VARCHAR(50) NOT NULL,
                    subtotal INT NOT NULL,
                    descuento INT NOT NULL,
                    total INT NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);

            await conn.execute(`
                CREATE TABLE IF NOT EXISTS ventas_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    venta_id INT NOT NULL,
                    producto_nombre VARCHAR(150) NOT NULL,
                    cantidad INT NOT NULL,
                    precio_unitario INT NOT NULL,
                    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        } finally {
            conn.release();
        }
    } else {
        // Tablas SQLite (ejecuciones síncronas en orden)
        const runQuery = (sql) => new Promise((resolve, reject) => {
            sqliteDb.run(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await runQuery(`
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(100) NOT NULL,
                precio INT NOT NULL,
                img VARCHAR(255) NOT NULL,
                categoria VARCHAR(50) NOT NULL,
                calorias INT NOT NULL,
                azucar REAL NOT NULL,
                fibra REAL NOT NULL,
                vitaminaC REAL NOT NULL,
                popularidad INT NOT NULL
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS ventas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_nombre VARCHAR(100) NOT NULL,
                cliente_email VARCHAR(100) NOT NULL,
                cliente_direccion VARCHAR(255) NOT NULL,
                fecha VARCHAR(50) NOT NULL,
                subtotal INT NOT NULL,
                descuento INT NOT NULL,
                total INT NOT NULL
            );
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS ventas_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                venta_id INT NOT NULL,
                producto_nombre VARCHAR(150) NOT NULL,
                cantidad INT NOT NULL,
                precio_unitario INT NOT NULL,
                FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
            );
        `);
    }
}

async function seedProducts() {
    const rows = await query("SELECT COUNT(*) as count FROM productos");
    const count = rows[0].count;

    if (count === 0) {
        console.log("Sembrando catálogo de frutas en la base de datos...");
        for (const p of PRODUCTOS_SEMILLA) {
            const sql = `INSERT INTO productos (id, nombre, precio, img, categoria, calorias, azucar, fibra, vitaminaC, popularidad) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [p.id, p.nombre, p.precio, p.img, p.categoria, p.calorias, p.azucar, p.fibra, p.vitaminaC, p.popularidad];
            await executeInsert(sql, params);
        }
        console.log("Sembrado finalizado con éxito.");
    }
}

// Interfaz pública de base de datos unificada
export async function query(sql, params = []) {
    if (isMySQL) {
        const [rows] = await mysqlPool.execute(sql, params);
        return rows;
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export async function executeInsert(sql, params = []) {
    if (isMySQL) {
        const [result] = await mysqlPool.execute(sql, params);
        return result.insertId;
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }
}
export default { query, executeInsert, connectDB };
