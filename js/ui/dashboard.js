import store from '../store.js';

// Colores para el gráfico de distribución
const FRUIT_COLORS_MAP = {
    1: '#3b82f6', // Arándano
    2: '#fde047', // Ananá
    3: '#eab308', // Banana
    4: '#f43f5e', // Frambuesa
    5: '#fb923c', // Mandarina
    6: '#22c55e', // Manzana
    7: '#f97316', // Naranja
    8: '#84cc16', // Pera
    9: '#facc15', // Pomelo amarillo
    10: '#fda4af', // Pomelo rojo
    11: '#ef4444', // Sandia
    12: '#be123c', // Frutilla
    13: '#4ade80', // Kiwi
    'ensalada': '#10b981' // Ensaladas en general
};

// Recomendaciones Diarias (IDR)
const IDR_LIMITS = {
    calorias: 2000,   // kcal
    azucar: 50,       // g
    fibra: 25,        // g
    vitaminaC: 90     // mg
};

export function initDashboard() {
    // Escuchar actualizaciones del carrito
    store.subscribe('cart_updated', () => {
        updateDashboardData();
    });

    // Escuchar cambio de idioma
    store.subscribe('lang_changed', () => {
        updateDashboardData();
    });

    // Evento al cambiar de pestaña para redibujar si se abre la pestaña de Dashboard
    store.subscribe('tab_changed', (tabId) => {
        if (tabId === 'dashboard') {
            // Retrasar levemente para asegurar que el DOM y el canvas estén visibles
            setTimeout(updateDashboardData, 100);
        }
    });

    // Primera carga
    updateDashboardData();
}

function calculateCartNutrients() {
    let calorias = 0;
    let azucar = 0;
    let fibra = 0;
    let vitaminaC = 0;
    let weightDistribution = {}; // id/tipo -> gramos

    store.state.carrito.forEach(item => {
        if (item.esEnsalada) {
            // Ensalada: los nutrientes ya son totales por unidad de ensalada
            calorias += item.calorias * item.cantidad;
            azucar += item.azucar * item.cantidad;
            fibra += item.fibra * item.cantidad;
            vitaminaC += item.vitaminaC * item.cantidad;

            // Registrar peso de sus frutas
            item.ingredientes.forEach(ing => {
                const key = `ensalada_${ing.nombre}`;
                weightDistribution[key] = (weightDistribution[key] || 0) + (ing.gramos * item.cantidad);
            });
        } else {
            // Producto estándar: los nutrientes en el store están por 100g
            // Asumimos que 1 unidad comprada equivale a una porción estándar de 100g
            const factor = item.cantidad; // 1 unidad = 100g
            calorias += item.calorias * factor;
            azucar += item.azucar * factor;
            fibra += item.fibra * factor;
            vitaminaC += item.vitaminaC * factor;

            const key = item.nombre;
            weightDistribution[key] = (weightDistribution[key] || 0) + (100 * factor);
        }
    });

    return {
        calorias: Math.round(calorias),
        azucar: parseFloat(azucar.toFixed(1)),
        fibra: parseFloat(fibra.toFixed(1)),
        vitaminaC: parseFloat(vitaminaC.toFixed(1)),
        weightDistribution
    };
}

function updateDashboardData() {
    const data = calculateCartNutrients();

    // Actualizar paneles numéricos
    const calEl = document.getElementById("dash-cal-total");
    const sugarEl = document.getElementById("dash-sugar-total");
    const fiberEl = document.getElementById("dash-fiber-total");
    const vitcEl = document.getElementById("dash-vitc-total");

    if (calEl) calEl.textContent = `${data.calorias} kcal`;
    if (sugarEl) sugarEl.textContent = `${data.azucar} g`;
    if (fiberEl) fiberEl.textContent = `${data.fibra} g`;
    if (vitcEl) vitcEl.textContent = `${data.vitaminaC} mg`;

    // Redibujar gráficos
    drawIDRChart(data);
    drawShareChart(data.weightDistribution);
}

function drawIDRChart(nutrientes) {
    const canvas = document.getElementById("chart-idr-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Ajustar pixel ratio para nitidez en pantallas de alta densidad
    const devicePixelRatio = window.devicePixelRatio || 1;
    if (canvas.style.width !== `${width}px`) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
    }
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Fondo según tema
    const isDark = store.state.theme === 'dark';
    const textMainColor = isDark ? '#f8fafc' : '#0f172a';
    const textMutedColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#2a354f' : '#e2e8f0';

    // Datos del gráfico
    const labels = [
        store.t('nutri_cal'),
        store.t('nutri_sugar'),
        store.t('nutri_fiber'),
        store.t('nutri_vitc')
    ];

    const percentages = [
        (nutrientes.calorias / IDR_LIMITS.calorias) * 100,
        (nutrientes.azucar / IDR_LIMITS.azucar) * 100,
        (nutrientes.fibra / IDR_LIMITS.fibra) * 100,
        (nutrientes.vitaminaC / IDR_LIMITS.vitaminaC) * 100
    ];

    const colors = [
        '#10b981', // Verde Calorías
        nutrientes.azucar > IDR_LIMITS.azucar ? '#f43f5e' : '#10b981', // Rojo si excede azucar
        '#10b981', // Verde Fibra
        '#10b981'  // Verde Vitamina C
    ];

    // Parámetros de dibujo
    const startX = 90;
    const startY = 30;
    const rowHeight = 45;
    const barMaxValWidth = width - startX - 50;

    // Dibujar líneas guía verticales (0%, 50%, 100%)
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = textMutedColor;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";

    const guides = [0, 50, 100];
    guides.forEach(g => {
        const x = startX + (g / 100) * barMaxValWidth;
        ctx.beginPath();
        ctx.moveTo(x, startY - 10);
        ctx.lineTo(x, startY + (labels.length * rowHeight) - 20);
        ctx.stroke();
        ctx.fillText(`${g}%`, x, startY - 15);
    });

    // Dibujar barras y etiquetas
    percentages.forEach((pct, index) => {
        const y = startY + index * rowHeight;

        // Etiqueta del nutriente
        ctx.fillStyle = textMainColor;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(labels[index], startX - 10, y + 12);

        // Barra de fondo
        ctx.fillStyle = gridColor;
        ctx.beginPath();
        ctx.roundRect(startX, y, barMaxValWidth, 14, 4);
        ctx.fill();

        // Barra rellena (animada o inmediata)
        const fillWidth = Math.min((pct / 100) * barMaxValWidth, barMaxValWidth);
        if (fillWidth > 0) {
            ctx.fillStyle = colors[index];
            ctx.beginPath();
            ctx.roundRect(startX, y, fillWidth, 14, 4);
            ctx.fill();
        }

        // Valor textual
        ctx.fillStyle = textMainColor;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${pct.toFixed(0)}%`, startX + fillWidth + 8, y + 12);
    });
}

function drawShareChart(distribution) {
    const canvas = document.getElementById("chart-share-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Ajustar pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    if (canvas.style.width !== `${width}px`) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
    }
    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const isDark = store.state.theme === 'dark';
    const textMainColor = isDark ? '#f8fafc' : '#0f172a';
    const textMutedColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#2a354f' : '#e2e8f0';

    const keys = Object.keys(distribution);
    const totalGrams = keys.reduce((sum, k) => sum + distribution[k], 0);

    if (totalGrams === 0) {
        // Carrito vacío - Dibujar círculo gris vacío
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 10, 60, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = textMutedColor;
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(store.state.lang === 'es' ? "Carrito Vacío" : "Empty Cart", width / 2, height / 2 - 5);
        return;
    }

    // Dibujar gráfico Donut interactivo
    const centerX = 120;
    const centerY = height / 2 - 10;
    const radius = 60;
    const thickness = 20;

    let currentAngle = -0.5 * Math.PI; // Iniciar arriba

    // Resolver colores e índices de frutas
    const allProducts = store.state.productos;

    keys.forEach((key, index) => {
        const grams = distribution[key];
        const pct = grams / totalGrams;
        const angleSize = pct * 2 * Math.PI;

        // Determinar color
        let color = '#ccc';
        if (key.startsWith('ensalada_')) {
            color = FRUIT_COLORS_MAP['ensalada'];
        } else {
            const fruit = allProducts.find(p => p.nombre === key);
            if (fruit) {
                color = FRUIT_COLORS_MAP[fruit.id] || '#ccc';
            }
        }

        // Dibujar arco exterior
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angleSize);
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        currentAngle += angleSize;
    });

    // Dibujar máscara interior blanca para convertir en Donut
    ctx.fillStyle = isDark ? '#161f30' : '#ffffff'; // Match card background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - thickness, 0, 2 * Math.PI);
    ctx.fill();

    // Dibujar Leyenda
    const legendX = centerX + radius + 30;
    let legendY = 30;
    const legendSpacing = 20;

    // Solo mostrar las primeras 8 frutas más relevantes para evitar desborde
    const sortedKeys = [...keys].sort((a, b) => distribution[b] - distribution[a]);
    const displayKeys = sortedKeys.slice(0, 8);

    displayKeys.forEach((key, index) => {
        const grams = distribution[key];
        const pct = (grams / totalGrams) * 100;

        // Determinar color
        let color = '#ccc';
        let label = key;
        if (key.startsWith('ensalada_')) {
            color = FRUIT_COLORS_MAP['ensalada'];
            label = key.replace('ensalada_', 'Mix: ');
        } else {
            const fruit = allProducts.find(p => p.nombre === key);
            if (fruit) {
                color = FRUIT_COLORS_MAP[fruit.id] || '#ccc';
            }
        }

        // Dibujar color box
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(legendX, legendY + (index * legendSpacing) - 8, 12, 12, 3);
        ctx.fill();

        // Dibujar texto
        ctx.fillStyle = textMainColor;
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";

        // Formatear texto de leyenda
        const cleanLabel = label.charAt(0).toUpperCase() + label.slice(1);
        ctx.fillText(`${cleanLabel}: ${grams}g (${pct.toFixed(0)}%)`, legendX + 20, legendY + (index * legendSpacing) + 2);
    });

    // Si hay más elementos, mostrar un indicador de "...otros"
    if (keys.length > 8) {
        ctx.fillStyle = textMutedColor;
        ctx.font = "italic 11px sans-serif";
        ctx.fillText(`+ ${keys.length - 8} ítems adicionales`, legendX, legendY + (8 * legendSpacing) + 2);
    }
}
export default initDashboard;
