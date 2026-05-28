// State Management - Organique Store
const TRANSLATIONS = {
    es: {
        tab_shop: "Tienda",
        tab_salad: "Ensaladas",
        tab_nutrition: "Dashboard Nutricional",
        tab_history: "Mis Pedidos",
        search_placeholder: "Buscar frutas...",
        sort_label: "Ordenar por:",
        sort_default: "Recomendados",
        sort_price_asc: "Precio: Menor a Mayor",
        sort_price_desc: "Precio: Mayor a Menor",
        sort_alpha: "Nombre: A-Z",
        sort_pop: "Popularidad",
        add_to_cart: "Agregar a carrito",
        cart_title: "Tu Carrito",
        cart_empty: "No hay elementos en el carrito.",
        coupon_placeholder: "Cupón de descuento",
        coupon_apply: "Aplicar",
        subtotal_label: "Subtotal",
        discount_label: "Descuento",
        cart_total: "Total",
        btn_clear_cart: "Vaciar carrito",
        btn_checkout: "Finalizar compra",
        modal_nutri_title: "Información Nutricional (por 100g)",
        nutri_cal: "Calorías",
        nutri_sugar: "Azúcar",
        nutri_fiber: "Fibra",
        nutri_vitc: "Vitamina C",
        salad_builder_title: "Crea tu Ensalada de Frutas",
        salad_builder_desc: "Elige el tamaño del envase, mezcla tus frutas favoritas y añade toppings.",
        salad_step_size: "1. Elige el tamaño del envase",
        size_cup: "Copa Individual (250g)",
        size_bowl: "Tazón Mediano (500g)",
        size_family: "Familiar (1000g)",
        salad_step_fruits: "2. Añade tus frutas (Gramos)",
        salad_step_toppings: "3. Elige los Toppings (+$300 c/u)",
        topping_honey: "Miel Orgánica",
        topping_yogurt: "Yogur Natural",
        topping_granola: "Granola con Almendras",
        topping_mint: "Menta Fresca",
        salad_preview_title: "Tu Ensalada",
        nutri_sugar_label: "Azúcar",
        salad_empty_composition: "Agrega frutas para ver la composición.",
        salad_total_label: "Precio Final:",
        salad_add_cart: "Agregar Ensalada",
        dash_title: "Mi Perfil de Consumo Saludable",
        dash_desc: "Analiza el valor nutricional y vitamínico de tu carrito frente a la ingesta diaria recomendada (IDR).",
        dash_totals_title: "Totales Acumulados",
        dash_chart_idr: "% Cobertura de Ingesta Diaria Recomendada (IDR)",
        dash_chart_share: "Distribución de Frutas en tu Carrito (g)",
        hist_title: "Mis Compras Anteriores",
        hist_desc: "Consulta las facturas y el historial de tus compras.",
        hist_empty: "Aún no has realizado ninguna compra.",
        checkout_title: "Finalizar Compra",
        form_name: "Nombre Completo",
        form_email: "Email",
        form_address: "Dirección de Envío",
        card_holder_label: "TITULAR",
        card_expiry_label: "EXP",
        form_card_num: "Número de Tarjeta",
        form_expiry: "Expiración",
        form_cvv: "CVV",
        btn_pay: "Pagar ahora",
        checkout_summary_title: "Resumen de Compra",
        checkout_processing: "Procesando tu pago...",
        checkout_processing_sub: "Por favor, no recargues la página.",
        receipt_title: "FACTURA DIGITAL",
        invoice_num: "Factura N°:",
        invoice_date: "Fecha:",
        invoice_to: "Cliente:",
        table_product: "Producto",
        table_qty: "Cant.",
        table_unit_price: "Precio U.",
        table_total: "Total",
        invoice_footer_thanks: "¡Gracias por elegir Organique! Cuida tu cuerpo con alimentos orgánicos.",
        btn_print: "Imprimir Factura",
        btn_close: "Aceptar",
        toast_cart_added: "¡Producto agregado al carrito!",
        toast_cart_removed: "¡Producto removido del carrito!",
        toast_cart_cleared: "¡Carrito vaciado!",
        toast_coupon_ok: "¡Cupón aplicado correctamente!",
        toast_coupon_err: "Cupón inválido o compra insuficiente (Min: $4,000).",
        toast_pay_success: "¡Pago procesado con éxito! Gracias por tu compra.",
        toast_pay_error: "Por favor completa correctamente los datos de pago.",
        toast_salad_limit: "¡Has alcanzado la capacidad máxima del envase!",
        toast_salad_empty: "Por favor añade al menos una fruta a la ensalada.",
        toast_theme_dark: "Modo oscuro activado.",
        toast_theme_light: "Modo claro activado.",
        salad_name_template: "Ensalada - {size}"
    },
    en: {
        tab_shop: "Shop",
        tab_salad: "Salad Maker",
        tab_nutrition: "Nutrition Hub",
        tab_history: "Orders",
        search_placeholder: "Search fruits...",
        sort_label: "Sort by:",
        sort_default: "Recommended",
        sort_price_asc: "Price: Low to High",
        sort_price_desc: "Price: High to Low",
        sort_alpha: "Name: A-Z",
        sort_pop: "Popularity",
        add_to_cart: "Add to cart",
        cart_title: "Your Cart",
        cart_empty: "Your cart is empty.",
        coupon_placeholder: "Promo code",
        coupon_apply: "Apply",
        subtotal_label: "Subtotal",
        discount_label: "Discount",
        cart_total: "Total",
        btn_clear_cart: "Clear Cart",
        btn_checkout: "Checkout",
        modal_nutri_title: "Nutrition Facts (per 100g)",
        nutri_cal: "Calories",
        nutri_sugar: "Sugars",
        nutri_fiber: "Fiber",
        nutri_vitc: "Vitamin C",
        salad_builder_title: "Create Your Fruit Salad",
        salad_builder_desc: "Choose container size, mix your favorite fruits, and add delicious toppings.",
        salad_step_size: "1. Choose container size",
        size_cup: "Individual Cup (250g)",
        size_bowl: "Medium Bowl (500g)",
        size_family: "Family Size (1000g)",
        salad_step_fruits: "2. Add your fruits (Grams)",
        salad_step_toppings: "3. Choose Toppings (+$300 each)",
        topping_honey: "Organic Honey",
        topping_yogurt: "Natural Yogurt",
        topping_granola: "Granola with Almonds",
        topping_mint: "Fresh Mint",
        salad_preview_title: "Your Salad",
        nutri_sugar_label: "Sugars",
        salad_empty_composition: "Add fruits to view composition.",
        salad_total_label: "Final Price:",
        salad_add_cart: "Add Salad",
        dash_title: "My Healthy Consumption Profile",
        dash_desc: "Analyze the nutritional value of your cart compared to the daily recommended intake (DRI).",
        dash_totals_title: "Accumulated Totals",
        dash_chart_idr: "% Coverage of Daily Recommended Intake (DRI)",
        dash_chart_share: "Fruits Distribution in Cart (g)",
        hist_title: "My Order History",
        hist_desc: "View past invoices and purchases.",
        hist_empty: "You haven't made any purchases yet.",
        checkout_title: "Checkout",
        form_name: "Full Name",
        form_email: "Email",
        form_address: "Shipping Address",
        card_holder_label: "CARDHOLDER",
        card_expiry_label: "EXP",
        form_card_num: "Card Number",
        form_expiry: "Expiration",
        form_cvv: "CVV",
        btn_pay: "Pay Now",
        checkout_summary_title: "Order Summary",
        checkout_processing: "Processing payment...",
        checkout_processing_sub: "Please do not reload the page.",
        receipt_title: "DIGITAL RECEIPT",
        invoice_num: "Invoice No:",
        invoice_date: "Date:",
        invoice_to: "Billed To:",
        table_product: "Product",
        table_qty: "Qty.",
        table_unit_price: "Unit Price",
        table_total: "Total",
        invoice_footer_thanks: "Thank you for choosing Organique! Nourish your body with organic foods.",
        btn_print: "Print Receipt",
        btn_close: "Close",
        toast_cart_added: "Product added to cart!",
        toast_cart_removed: "Product removed from cart!",
        toast_cart_cleared: "Cart cleared!",
        toast_coupon_ok: "Promo code applied successfully!",
        toast_coupon_err: "Invalid code or purchase threshold not met (Min: $4,000).",
        toast_pay_success: "Payment processed successfully! Thank you.",
        toast_pay_error: "Please complete payment details correctly.",
        toast_salad_limit: "You have reached the maximum capacity of the container!",
        toast_salad_empty: "Please add at least one fruit to the salad.",
        toast_theme_dark: "Dark mode activated.",
        toast_theme_light: "Light mode activated.",
        salad_name_template: "Fruit Salad - Size {size}"
    }
};

const VALID_COUPONS = {
    "FRESH20": 0.20, // 20% descuento
    "VITALITY": 0.15, // 15% descuento
    "ORGANIC10": 0.10 // 10% descuento
};

export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://freshmarket-ecommerce.onrender.com';

class Store {
    constructor() {
        this.listeners = {};

        // Estado inicial
        this.state = {
            productos: [],
            carrito: [],
            coupon: null, // { code, pct }
            orderHistory: [],
            lang: 'es',
            theme: 'light',
            activeTab: 'shop',
            alumno: {
                nombre: "Ignacio",
                apellido: "Trkmic Torres",
                dni: 46948657
            }
        };

        this.initFromLocalStorage();
        this.cargarHistorial();
    }

    async cargarHistorial() {
        try {
            const res = await fetch(`${API_URL}/historial`);
            if (res.ok) {
                this.state.orderHistory = await res.json();
                this.publish('order_history_updated', this.state.orderHistory);
            }
        } catch (err) {
            console.error("Error al cargar historial desde API:", err);
        }
    }

    initFromLocalStorage() {
        // Cargar carrito
        const cachedCart = localStorage.getItem("org_cart");
        if (cachedCart) {
            try {
                this.state.carrito = JSON.parse(cachedCart);
            } catch (e) {
                console.error("Error parsing cart cache", e);
            }
        }

        // Cargar historial
        const cachedHistory = localStorage.getItem("org_history");
        if (cachedHistory) {
            try {
                this.state.orderHistory = JSON.parse(cachedHistory);
            } catch (e) {
                console.error("Error parsing history cache", e);
            }
        }

        // Cargar tema
        const cachedTheme = localStorage.getItem("org_theme") || 'light';
        this.state.theme = cachedTheme;
        document.documentElement.setAttribute("data-theme", cachedTheme);

        // Cargar idioma
        const cachedLang = localStorage.getItem("org_lang") || 'es';
        this.state.lang = cachedLang;
    }

    // Pub/Sub
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        // Retorna función para desuscribirse
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    publish(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Setters y lógica de estado
    setProductos(productos) {
        this.state.productos = productos;
        this.publish('products_loaded', productos);
    }

    setTab(tabId) {
        this.state.activeTab = tabId;
        this.publish('tab_changed', tabId);
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.state.theme = newTheme;
        localStorage.setItem("org_theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        this.publish('theme_changed', newTheme);
    }

    setLanguage(lang) {
        if (lang === 'es' || lang === 'en') {
            this.state.lang = lang;
            localStorage.setItem("org_lang", lang);
            this.publish('lang_changed', lang);
            this.translatePage();
        }
    }

    t(key) {
        return TRANSLATIONS[this.state.lang][key] || key;
    }

    translatePage() {
        // Traducir todos los elementos con data-i18n
        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.getAttribute("data-i18n");
            element.textContent = this.t(key);
        });

        // Traducir todos los inputs con data-i18n-placeholder
        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            const key = element.getAttribute("data-i18n-placeholder");
            element.setAttribute("placeholder", this.t(key));
        });
    }

    // Carrito de compras
    agregarAlCarrito(producto) {
        const itemExistente = this.state.carrito.find(item => !item.esEnsalada && item.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            this.state.carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                img: producto.img,
                categoria: producto.categoria,
                calorias: producto.calorias,
                azucar: producto.azucar,
                fibra: producto.fibra,
                vitaminaC: producto.vitaminaC,
                cantidad: 1,
                esEnsalada: false
            });
        }

        this.syncCart();
        this.publish('cart_added', producto.nombre);
    }

    agregarEnsaladaAlCarrito(ensalada) {
        // Las ensaladas siempre se agregan como elementos individuales ya que suelen ser únicas
        this.state.carrito.push({
            id: `salad-${Date.now()}`,
            nombre: ensalada.nombre,
            precio: ensalada.precio,
            img: "img/salad_icon.png", // Icono genérico o fallback
            categoria: "ensalada",
            calorias: ensalada.calorias,
            azucar: ensalada.azucar,
            fibra: ensalada.fibra,
            vitaminaC: ensalada.vitaminaC,
            cantidad: 1,
            esEnsalada: true,
            ingredientes: ensalada.ingredientes,
            toppings: ensalada.toppings
        });

        this.syncCart();
        this.publish('cart_added', ensalada.nombre);
    }

    incrementarCantidad(itemId) {
        const item = this.state.carrito.find(i => i.id === itemId);
        if (item) {
            item.cantidad++;
            this.syncCart();
        }
    }

    decrementarCantidad(itemId) {
        const item = this.state.carrito.find(i => i.id === itemId);
        if (item) {
            if (item.cantidad > 1) {
                item.cantidad--;
            } else {
                this.state.carrito = this.state.carrito.filter(i => i.id !== itemId);
            }
            this.syncCart();
            this.publish('cart_removed', item.nombre);
        }
    }

    eliminarDelCarrito(itemId) {
        const item = this.state.carrito.find(i => i.id === itemId);
        if (item) {
            this.state.carrito = this.state.carrito.filter(i => i.id !== itemId);
            this.syncCart();
            this.publish('cart_removed', item.nombre);
        }
    }

    vaciarCarrito() {
        this.state.carrito = [];
        this.state.coupon = null;
        this.syncCart();
        this.publish('cart_cleared', null);
    }

    applyCoupon(code) {
        const uppercaseCode = code.trim().toUpperCase();
        const subtotal = this.getCartSubtotal();

        if (subtotal < 4000) {
            this.state.coupon = null;
            this.publish('coupon_result', { success: false });
            return false;
        }

        if (VALID_COUPONS[uppercaseCode] !== undefined) {
            this.state.coupon = {
                code: uppercaseCode,
                pct: VALID_COUPONS[uppercaseCode]
            };
            this.syncCart();
            this.publish('coupon_result', { success: true, code: uppercaseCode, pct: VALID_COUPONS[uppercaseCode] });
            return true;
        } else {
            this.state.coupon = null;
            this.publish('coupon_result', { success: false });
            return false;
        }
    }

    syncCart() {
        localStorage.setItem("org_cart", JSON.stringify(this.state.carrito));
        this.publish('cart_updated', this.state.carrito);
    }

    // Computados de Carrito
    getCartSubtotal() {
        return this.state.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    getCartDiscount() {
        if (!this.state.coupon) return 0;
        return this.getCartSubtotal() * this.state.coupon.pct;
    }

    getCartTotal() {
        return this.getCartSubtotal() - this.getCartDiscount();
    }

    getCartItemsCount() {
        return this.state.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    }

    // Historial y Finalización de compra
    async registrarCompra(customerInfo) {
        const subtotal = this.getCartSubtotal();
        const descuento = this.getCartDiscount();
        const total = this.getCartTotal();

        const payload = {
            cliente_nombre: customerInfo.name,
            cliente_email: customerInfo.email,
            cliente_direccion: customerInfo.address,
            carrito: this.state.carrito,
            subtotal,
            descuento,
            total
        };

        try {
            const res = await fetch(`${API_URL}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error("HTTP error " + res.status);
            }

            const order = await res.json();
            this.state.orderHistory.unshift(order);
            this.vaciarCarrito();
            this.publish('order_placed', order);
            this.publish('order_history_updated', this.state.orderHistory);
        } catch (err) {
            console.error("Error al registrar compra en API:", err);
            throw err;
        }
    }
}

// Singleton global
export const store = new Store();
export default store;
