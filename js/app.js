// Main Entry Point - Organique Application
import store, { API_URL } from './store.js';
import initProducts from './ui/products.js';
import initCart from './ui/cart.js';
import initCustomizer from './ui/customizer.js';
import initDashboard from './ui/dashboard.js';
import initCheckout from './ui/checkout.js';
import showToast from './ui/toast.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar sub-módulos de la UI
    initProducts();
    initCart();
    initCustomizer();
    initDashboard();
    initCheckout();


    // 3. Configurar selector de temas (Modo Oscuro)
    setupThemeToggler();

    // 4. Configurar selector de Idioma
    setupLanguageSelector();

    // 5. Configurar navegación de pestañas
    setupTabNavigation();

    // 6. Cargar base de datos de frutas
    cargarProductos();

    // 7. Inicializar traducción inicial de página
    store.translatePage();
});

function setupThemeToggler() {
    const btn = document.getElementById("theme-toggle-btn");
    if (!btn) return;

    // Actualizar iconos iniciales
    updateThemeIcons(store.state.theme);

    btn.addEventListener("click", () => {
        store.toggleTheme();
    });

    // Escuchar cuando cambie el tema
    store.subscribe('theme_changed', (newTheme) => {
        updateThemeIcons(newTheme);
        const msg = newTheme === 'dark' ? store.t('toast_theme_dark') : store.t('toast_theme_light');
        showToast(msg, 'success');
    });
}

function updateThemeIcons(theme) {
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");

    if (theme === 'dark') {
        if (sunIcon) sunIcon.classList.add("hidden");
        if (moonIcon) moonIcon.classList.remove("hidden");
    } else {
        if (sunIcon) sunIcon.classList.remove("hidden");
        if (moonIcon) moonIcon.classList.add("hidden");
    }
}

function setupLanguageSelector() {
    const buttons = document.querySelectorAll(".lang-btn");
    buttons.forEach(btn => {
        // Poner estado activo inicial
        if (btn.dataset.lang === store.state.lang) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }

        btn.addEventListener("click", (e) => {
            buttons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            store.setLanguage(e.target.dataset.lang);
        });
    });
}

function setupTabNavigation() {
    const tabLinks = document.querySelectorAll(".tab-link");
    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            const tabId = link.dataset.tab;
            store.setTab(tabId);
        });
    });

    // Escuchar cambios de pestaña para activar contenido en UI
    store.subscribe('tab_changed', (tabId) => {
        // Remover clases activas en enlaces
        document.querySelectorAll(".tab-link").forEach(link => {
            if (link.dataset.tab === tabId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Remover clases activas en contenidos de vistas
        document.querySelectorAll(".tab-content").forEach(content => {
            if (content.id === `view-${tabId}`) {
                content.classList.add("active");
            } else {
                content.classList.remove("active");
            }
        });
    });
}

function cargarProductos() {
    fetch(`${API_URL}/productos`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            store.setProductos(data);
        })
        .catch(err => {
            console.error("Error al cargar la base de datos de frutas:", err);
            showToast(store.state.lang === 'es' ? 'Error al cargar productos del servidor.' : 'Error loading products from server.', 'error');
        });
}
export default {};
