import store from '../store.js';

let activeCategory = 'all';
let searchQuery = '';
let sortBy = 'default';

export function initProducts() {
    // Escuchar cuando los productos se carguen en el store
    store.subscribe('products_loaded', (productos) => {
        renderCategoryFilters(productos);
        applyFiltersAndRender();
    });

    // Escuchar cuando cambie el idioma para volver a renderizar (por traducción de categorías)
    store.subscribe('lang_changed', () => {
        const productos = store.state.productos;
        renderCategoryFilters(productos);
        applyFiltersAndRender();
    });

    // Eventos del buscador (CORREGIDO: Solo un listener permanente)
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFiltersAndRender();
        });
    }

    // Eventos de ordenamiento
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            sortBy = e.target.value;
            applyFiltersAndRender();
        });
    }

    // Eventos del Modal de Detalle
    setupDetailModal();
}

function renderCategoryFilters(productos) {
    const container = document.getElementById("category-filter-list");
    if (!container) return;

    // Extraer categorías únicas
    const categories = ['all', ...new Set(productos.map(p => p.categoria))];

    container.innerHTML = "";

    categories.forEach(cat => {
        const button = document.createElement("button");
        button.className = `category-btn ${activeCategory === cat ? 'active' : ''}`;
        button.dataset.category = cat;

        // Traducir etiqueta
        let label = cat;
        if (cat === 'all') label = store.t('filter_all');
        else if (cat === 'citrico') label = store.t('filter_citrus');
        else if (cat === 'baya') label = store.t('filter_berries');
        else if (cat === 'tropical') label = store.t('filter_tropical');
        else if (cat === 'pomaceas') label = store.t('filter_pomaceous');
        else if (cat === 'cucurbitaceas') label = store.t('filter_cucurbits');

        button.textContent = label;

        button.addEventListener("click", () => {
            container.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            activeCategory = cat;
            applyFiltersAndRender();
        });

        container.appendChild(button);
    });
}

function applyFiltersAndRender() {
    const allProducts = store.state.productos;
    if (allProducts.length === 0) return;

    let filtered = [...allProducts];

    // 1. Filtrar por búsqueda
    if (searchQuery) {
        // Buscar por nombre (traducido si fuera el caso, pero actualmente en db.json)
        filtered = filtered.filter(p => p.nombre.toLowerCase().includes(searchQuery));
    }

    // 2. Filtrar por categoría
    if (activeCategory !== 'all') {
        filtered = filtered.filter(p => p.categoria === activeCategory);
    }

    // 3. Ordenamiento
    if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.precio - a.precio);
    } else if (sortBy === 'name-asc') {
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sortBy === 'popularity') {
        filtered.sort((a, b) => b.popularidad - a.popularidad);
    }

    renderProductsGrid(filtered);
}

function renderProductsGrid(lista) {
    const container = document.getElementById("products-grid-container");
    if (!container) return;

    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `<p class="empty-list-text" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">No se encontraron frutas.</p>`;
        return;
    }

    lista.forEach(producto => {
        const card = document.createElement("div");
        card.className = "product-card animate-card";

        // Estrellas de popularidad
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<span style="color: ${i <= producto.popularidad ? 'var(--color-warning)' : 'var(--border-color)'}">★</span>`;
        }

        card.innerHTML = `
            <div class="product-card-img-wrapper">
                <img src="${producto.img}" alt="${producto.nombre}">
            </div>
            <div class="product-card-category">${producto.categoria}</div>
            <h3>${producto.nombre}</h3>
            <div style="font-size: 0.85rem; margin-bottom: 10px;">${starsHtml}</div>
            <div class="product-card-meta">
                <span class="product-card-price">$${(producto.precio / 100).toFixed(2)}</span>
                <button class="add-to-cart-btn" aria-label="Agregar al carrito">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </button>
            </div>
        `;

        // Click en botón de carrito
        const btnAdd = card.querySelector(".add-to-cart-btn");
        btnAdd.addEventListener("click", (e) => {
            e.stopPropagation(); // Evitar abrir modal de detalle
            store.agregarAlCarrito(producto);
        });

        // Click en la tarjeta abre modal de detalles
        card.addEventListener("click", () => {
            openDetailModal(producto);
        });

        container.appendChild(card);
    });
}

// Detalle Modal
let selectedProductForModal = null;

function setupDetailModal() {
    const modal = document.getElementById("product-detail-modal");
    const btnClose = document.getElementById("btn-close-detail-modal");
    const btnAddModal = document.getElementById("btn-modal-add-to-cart");

    if (!modal) return;

    // Cerrar modal al clickear el botón de cierre
    if (btnClose) {
        btnClose.addEventListener("click", () => {
            closeDetailModal();
        });
    }

    // Cerrar modal al clickear fuera del contenido
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeDetailModal();
        }
    });

    // Agregar al carrito desde el modal
    if (btnAddModal) {
        btnAddModal.addEventListener("click", () => {
            if (selectedProductForModal) {
                store.agregarAlCarrito(selectedProductForModal);
                closeDetailModal();
            }
        });
    }
}

function openDetailModal(producto) {
    selectedProductForModal = producto;
    const modal = document.getElementById("product-detail-modal");
    if (!modal) return;

    // Llenar contenido
    document.getElementById("detail-modal-img").src = producto.img;
    document.getElementById("detail-modal-img").alt = producto.nombre;
    document.getElementById("detail-modal-title").textContent = producto.nombre;
    document.getElementById("detail-modal-category").textContent = producto.categoria;
    document.getElementById("detail-modal-price").textContent = `$${(producto.precio / 100).toFixed(2)}`;

    // Estrellas
    const starsContainer = document.getElementById("detail-modal-rating");
    starsContainer.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        star.style.color = i <= producto.popularidad ? 'var(--color-warning)' : 'var(--border-color)';
        starsContainer.appendChild(star);
    }

    // Nutrientes
    document.getElementById("detail-nutri-cal").textContent = `${producto.calorias} kcal`;
    document.getElementById("detail-nutri-sugar").textContent = `${producto.azucar}g`;
    document.getElementById("detail-nutri-fiber").textContent = `${producto.fibra}g`;
    document.getElementById("detail-nutri-vitc").textContent = `${producto.vitaminaC}mg`;

    // Animación de barras
    // Valores máximos razonables para escala 0-100%
    const scaleCal = Math.min((producto.calorias / 120) * 100, 100);
    const scaleSugar = Math.min((producto.azucar / 15) * 100, 100);
    const scaleFiber = Math.min((producto.fibra / 8) * 100, 100);
    const scaleVitC = Math.min((producto.vitaminaC / 80) * 100, 100);

    // Reiniciar barra primero para que la transición sea visible
    document.getElementById("bar-cal").style.width = "0%";
    document.getElementById("bar-sugar").style.width = "0%";
    document.getElementById("bar-fiber").style.width = "0%";
    document.getElementById("bar-vitc").style.width = "0%";

    modal.classList.add("visible");

    // Retardo mínimo para activar animación CSS
    setTimeout(() => {
        document.getElementById("bar-cal").style.width = `${scaleCal}%`;
        document.getElementById("bar-sugar").style.width = `${scaleSugar}%`;
        document.getElementById("bar-fiber").style.width = `${scaleFiber}%`;
        document.getElementById("bar-vitc").style.width = `${scaleVitC}%`;
    }, 50);
}

function closeDetailModal() {
    const modal = document.getElementById("product-detail-modal");
    if (modal) {
        modal.classList.remove("visible");
    }
    selectedProductForModal = null;
}
export default initProducts;
