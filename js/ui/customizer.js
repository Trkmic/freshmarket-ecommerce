import store from '../store.js';
import showToast from './toast.js';

// Colores de frutas para la visualización del tazón (virtual bowl)
const FRUIT_COLORS = {
    1: '#3b82f6', // Arándano (azul)
    2: '#fde047', // Ananá (amarillo claro)
    3: '#eab308', // Banana (amarillo)
    4: '#f43f5e', // Frambuesa (rosa)
    5: '#fb923c', // Mandarina (naranja claro)
    6: '#22c55e', // Manzana (verde)
    7: '#f97316', // Naranja (naranja)
    8: '#84cc16', // Pera (verde claro)
    9: '#facc15', // Pomelo amarillo
    10: '#fda4af', // Pomelo rojo (rosa)
    11: '#ef4444', // Sandia (rojo)
    12: '#be123c', // Frutilla (rojo oscuro)
    13: '#4ade80'  // Kiwi (kiwi)
};

let currentContainerSize = 'copa'; // copa, tazon, familiar
let containerSpecs = {
    copa: { maxWeight: 250, basePrice: 80000, key: 'size_cup' },
    tazon: { maxWeight: 500, basePrice: 140000, key: 'size_bowl' },
    familiar: { maxWeight: 1000, basePrice: 250000, key: 'size_family' }
};

let selectedFruits = {}; // id -> gramos
let selectedToppings = []; // array de topping ids

export function initCustomizer() {
    // Escuchar cuando los productos se carguen en el store
    store.subscribe('products_loaded', (productos) => {
        renderFruitsSelection(productos);
    });

    // Escuchar cambios de idioma
    store.subscribe('lang_changed', () => {
        const productos = store.state.productos;
        renderFruitsSelection(productos);
        updateCalculations();
    });

    // Registrar cambios en el tamaño del envase
    const sizeRadios = document.querySelectorAll('input[name="salad-size"]');
    sizeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentContainerSize = e.target.value;

            // Actualizar la clase activa en los cards
            document.querySelectorAll('.size-card').forEach(card => card.classList.remove('active'));
            e.target.closest('.size-card').classList.add('active');

            // Validar/ajustar pesos de frutas
            validateSaladWeightLimit();
            updateCalculations();
        });
    });

    // Registrar cambios en toppings
    const toppingsCheckboxes = document.querySelectorAll('.toppings-options input[type="checkbox"]');
    toppingsCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            selectedToppings = [];
            toppingsCheckboxes.forEach(item => {
                if (item.checked) {
                    selectedToppings.push({
                        id: item.value,
                        nombre: item.dataset.toppingName
                    });
                }
            });
            updateCalculations();
            updateToppingsVisual();
        });
    });

    // Botón agregar ensalada al carrito
    const btnAddSalad = document.getElementById("btn-add-salad-to-cart");
    if (btnAddSalad) {
        btnAddSalad.addEventListener("click", () => {
            const totalWeight = getSaladTotalWeight();
            if (totalWeight === 0) {
                showToast(store.t('toast_salad_empty'), 'warning');
                return;
            }

            // Construir objeto ensalada personalizada
            const spec = containerSpecs[currentContainerSize];
            const sizeTitle = store.t(spec.key);
            const saladName = store.t('salad_name_template').replace('{size}', sizeTitle);

            const calculated = calculateNutrientsAndPrice();

            const ensalada = {
                nombre: saladName,
                precio: calculated.price,
                calorias: calculated.calorias,
                azucar: calculated.azucar,
                fibra: calculated.fibra,
                vitaminaC: calculated.vitaminaC,
                ingredientes: Object.keys(selectedFruits).map(id => {
                    const fruit = store.state.productos.find(p => p.id === parseInt(id));
                    return {
                        id: parseInt(id),
                        nombre: fruit.nombre,
                        gramos: selectedFruits[id]
                    };
                }),
                toppings: selectedToppings.map(t => t.nombre)
            };

            store.agregarEnsaladaAlCarrito(ensalada);
            resetCustomizer();
        });
    }

    // Inicializar sliders si ya hay productos cargados
    if (store.state.productos.length > 0) {
        renderFruitsSelection(store.state.productos);
    }
}

function renderFruitsSelection(productos) {
    const container = document.getElementById("salad-fruits-selection");
    if (!container) return;

    container.innerHTML = "";

    productos.forEach(fruit => {
        const item = document.createElement("div");
        item.className = "fruit-selector-item";

        const currentVal = selectedFruits[fruit.id] || 0;

        item.innerHTML = `
            <span class="fruit-meta-label">${fruit.nombre}</span>
            <div class="range-slider-wrapper">
                <input type="range" class="custom-range fruit-slider" 
                       data-id="${fruit.id}" 
                       min="0" max="${containerSpecs[currentContainerSize].maxWeight}" 
                       value="${currentVal}">
            </div>
            <span class="weight-display" id="weight-lbl-${fruit.id}">${currentVal}g</span>
        `;

        const slider = item.querySelector(".fruit-slider");
        slider.addEventListener("input", (e) => {
            const id = parseInt(e.target.dataset.id);
            const val = parseInt(e.target.value);

            // Guardar valor anterior en caso de exceder límite
            const oldVal = selectedFruits[id] || 0;
            selectedFruits[id] = val;

            const maxWeight = containerSpecs[currentContainerSize].maxWeight;
            const totalWeight = getSaladTotalWeight();

            if (totalWeight > maxWeight) {
                // Ajustar al máximo permitido
                const allowed = val - (totalWeight - maxWeight);
                selectedFruits[id] = allowed;
                e.target.value = allowed;
                document.getElementById(`weight-lbl-${id}`).textContent = `${allowed}g`;
                showToast(store.t('toast_salad_limit'), 'warning');
            } else {
                document.getElementById(`weight-lbl-${id}`).textContent = `${val}g`;
            }

            updateCalculations();
        });

        container.appendChild(item);
    });
}

function getSaladTotalWeight() {
    return Object.values(selectedFruits).reduce((sum, val) => sum + val, 0);
}

function validateSaladWeightLimit() {
    const maxWeight = containerSpecs[currentContainerSize].maxWeight;

    // Actualizar max de los inputs visualmente
    document.querySelectorAll(".fruit-slider").forEach(slider => {
        slider.setAttribute("max", maxWeight);
    });

    const totalWeight = getSaladTotalWeight();
    if (totalWeight > maxWeight) {
        // Reducir proporcionalmente o limpiar
        resetCustomizer();
        showToast(store.t('toast_theme_light') ? "Envase cambiado: se reiniciaron los gramos" : "Container changed: grams reset", 'info');
    }
}

function calculateNutrientsAndPrice() {
    const spec = containerSpecs[currentContainerSize];
    let price = spec.basePrice; // en centavos
    let calorias = 0;
    let azucar = 0;
    let fibra = 0;
    let vitaminaC = 0;

    // Calcular por cada fruta (precio es por 100g en db.json)
    Object.keys(selectedFruits).forEach(id => {
        const gramos = selectedFruits[id];
        if (gramos > 0) {
            const fruit = store.state.productos.find(p => p.id === parseInt(id));
            if (fruit) {
                price += (fruit.precio * gramos) / 100;
                calorias += (fruit.calorias * gramos) / 100;
                azucar += (fruit.azucar * gramos) / 100;
                fibra += (fruit.fibra * gramos) / 100;
                vitaminaC += (fruit.vitaminaC * gramos) / 100;
            }
        }
    });

    // Toppings: +$300 c/u (30000 centavos)
    price += selectedToppings.length * 30000;

    return {
        price: Math.round(price),
        calorias: Math.round(calorias),
        azucar: parseFloat(azucar.toFixed(1)),
        fibra: parseFloat(fibra.toFixed(1)),
        vitaminaC: parseFloat(vitaminaC.toFixed(1))
    };
}

function updateCalculations() {
    const maxWeight = containerSpecs[currentContainerSize].maxWeight;
    const totalWeight = getSaladTotalWeight();

    const calculated = calculateNutrientsAndPrice();

    // Actualizar displays
    document.getElementById("salad-cal-val").textContent = calculated.calorias;
    document.getElementById("salad-sugar-val").textContent = calculated.azucar;
    document.getElementById("salad-weight-val").textContent = totalWeight;
    document.getElementById("salad-weight-max").textContent = maxWeight;
    document.getElementById("salad-final-price").textContent = `$${(calculated.price / 100).toFixed(2)}`;

    // Detalle de composición
    const listContainer = document.getElementById("salad-composition-list");
    if (listContainer) {
        listContainer.innerHTML = "";

        let hasItems = false;

        // Mostrar frutas
        Object.keys(selectedFruits).forEach(id => {
            const gramos = selectedFruits[id];
            if (gramos > 0) {
                hasItems = true;
                const fruit = store.state.productos.find(p => p.id === parseInt(id));
                const itemDiv = document.createElement("div");
                itemDiv.className = "salad-item-summary";
                itemDiv.innerHTML = `
                    <span style="text-transform: capitalize;">${fruit.nombre}</span>
                    <span>${gramos}g</span>
                `;
                listContainer.appendChild(itemDiv);
            }
        });

        // Mostrar toppings
        selectedToppings.forEach(topping => {
            hasItems = true;
            const itemDiv = document.createElement("div");
            itemDiv.className = "salad-item-summary";
            itemDiv.style.color = "var(--color-primary)";
            itemDiv.innerHTML = `
                <span>+ ${topping.nombre}</span>
                <span>$3.00</span>
            `;
            listContainer.appendChild(itemDiv);
        });

        if (!hasItems) {
            listContainer.innerHTML = `<p class="empty-list-text">${store.t('salad_empty_composition')}</p>`;
        }
    }

    // Habilitar/Deshabilitar botón de compra
    const btnAdd = document.getElementById("btn-add-salad-to-cart");
    if (btnAdd) {
        btnAdd.disabled = totalWeight === 0;
    }

    // Actualizar capas visuales del Bowl
    updateBowlVisuals(totalWeight, maxWeight);
}

function updateBowlVisuals(totalWeight, maxWeight) {
    const container = document.getElementById("bowl-fillings-container");
    if (!container) return;

    container.innerHTML = "";

    if (totalWeight === 0) return;

    // Crear capas de frutas proporcionales
    Object.keys(selectedFruits).forEach(id => {
        const gramos = selectedFruits[id];
        if (gramos > 0) {
            const color = FRUIT_COLORS[parseInt(id)] || '#ccc';
            const pct = (gramos / maxWeight) * 100;

            const layer = document.createElement("div");
            layer.className = "salad-layer";
            layer.style.backgroundColor = color;
            layer.style.height = `${pct}%`;
            container.appendChild(layer);
        }
    });
}

function updateToppingsVisual() {
    const container = document.getElementById("bowl-toppings-visual-container");
    if (!container) return;

    container.innerHTML = "";

    // Colores para toppings
    const toppingColors = {
        miel: '#f59e0b', // ámbar
        yogur: '#f8fafc', // blanco
        granola: '#78350f', // marrón
        menta: '#10b981' // verde
    };

    selectedToppings.forEach((topping, index) => {
        const color = toppingColors[topping.id] || '#ccc';
        const particle = document.createElement("div");
        particle.className = "topping-visual-particle";
        particle.style.backgroundColor = color;
        particle.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(particle);
    });
}

function resetCustomizer() {
    selectedFruits = {};
    selectedToppings = [];

    // Resetear sliders en la UI
    document.querySelectorAll(".fruit-slider").forEach(slider => {
        slider.value = 0;
    });

    document.querySelectorAll(".weight-display").forEach(lbl => {
        lbl.textContent = "0g";
    });

    // Desmarcar toppings
    document.querySelectorAll(".toppings-options input[type=\"checkbox\"]").forEach(cb => {
        cb.checked = false;
    });

    // Resetear visualización
    const fillings = document.getElementById("bowl-fillings-container");
    if (fillings) fillings.innerHTML = "";

    const toppings = document.getElementById("bowl-toppings-visual-container");
    if (toppings) toppings.innerHTML = "";

    updateCalculations();
}
export default initCustomizer;
