import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import apiRouter from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend en la raíz
app.use(express.static(path.join(__dirname, '..')));

// Rutas
app.use('/api', apiRouter);

// Ruta de diagnóstico simple
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Inicializar DB y luego escuchar puerto
async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`================================================`);
            console.log(` Organique Backend corriendo en puerto ${PORT}`);
            console.log(` API Diagnóstico: http://localhost:${PORT}/health`);
            console.log(`================================================`);
        });
    } catch (err) {
        console.error("Fallo crítico al iniciar el servidor:", err);
        process.exit(1);
    }
}

startServer();
