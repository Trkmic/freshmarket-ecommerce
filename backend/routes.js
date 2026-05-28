import express from 'express';
import { query, executeInsert } from './db.js';

const router = express.Router();

// 1. GET /api/productos - Obtener todos los productos
router.get('/productos', async (req, res) => {
    try {
        const productos = await query("SELECT * FROM productos");
        res.json(productos);
    } catch (err) {
        console.error("Error al obtener productos:", err);
        res.status(500).json({ error: "Error al leer productos de la base de datos." });
    }
});

// 2. POST /api/checkout - Registrar una nueva venta
router.post('/checkout', async (req, res) => {
    const { cliente_nombre, cliente_email, cliente_direccion, carrito, subtotal, descuento, total } = req.body;

    // Validar parámetros mínimos
    if (!cliente_nombre || !cliente_email || !cliente_direccion || !carrito || !Array.isArray(carrito) || carrito.length === 0) {
        return res.status(400).json({ error: "Faltan datos del cliente o el carrito está vacío." });
    }

    try {
        const fechaStr = new Date().toLocaleDateString('es-AR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        // Insertar en la tabla 'ventas'
        const sqlVenta = `INSERT INTO ventas (cliente_nombre, cliente_email, cliente_direccion, fecha, subtotal, descuento, total) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const paramsVenta = [cliente_nombre, cliente_email, cliente_direccion, fechaStr, subtotal, descuento, total];

        const ventaId = await executeInsert(sqlVenta, paramsVenta);

        // Insertar items de la venta en 'ventas_items'
        for (const item of carrito) {
            const sqlItem = `INSERT INTO ventas_items (venta_id, producto_nombre, cantidad, precio_unitario) 
                             VALUES (?, ?, ?, ?)`;
            const paramsItem = [ventaId, item.nombre, item.cantidad, item.precio];
            await executeInsert(sqlItem, paramsItem);
        }

        // Devolver el objeto de factura estructurado exactamente como lo espera el frontend
        const factura = {
            id: `invoice-${ventaId}`,
            date: fechaStr,
            customer: {
                name: cliente_nombre,
                email: cliente_email,
                address: cliente_direccion
            },
            items: carrito.map(i => ({
                nombre: i.nombre,
                cantidad: i.cantidad,
                precio: i.precio // en centavos
            })),
            subtotal,
            descuento,
            total
        };

        res.status(201).json(factura);

    } catch (err) {
        console.error("Error al procesar el checkout:", err);
        res.status(500).json({ error: "Error en el servidor al registrar la compra." });
    }
});

// 3. GET /api/historial - Obtener historial de facturas
router.get('/historial', async (req, res) => {
    try {
        const ventas = await query("SELECT * FROM ventas ORDER BY id DESC");
        const historialCompleto = [];

        for (const venta of ventas) {
            // Obtener ítems asociados a la venta
            const items = await query("SELECT * FROM ventas_items WHERE venta_id = ?", [venta.id]);

            historialCompleto.push({
                id: `invoice-${venta.id}`,
                date: venta.fecha,
                customer: {
                    name: venta.cliente_nombre,
                    email: venta.cliente_email,
                    address: venta.cliente_direccion
                },
                items: items.map(i => ({
                    nombre: i.producto_nombre,
                    cantidad: i.cantidad,
                    precio: i.precio_unitario
                })),
                subtotal: venta.subtotal,
                descuento: venta.descuento,
                total: venta.total
            });
        }

        res.json(historialCompleto);

    } catch (err) {
        console.error("Error al obtener el historial:", err);
        res.status(500).json({ error: "Error en el servidor al leer el historial." });
    }
});

export default router;
