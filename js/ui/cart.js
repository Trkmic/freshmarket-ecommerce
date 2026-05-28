import store from '../store.js';
import showToast from './toast.js';

export function initCart() {
    // Escuchar actualizaciones del carrito
    store.subscribe('cart_updated', (carrito) => {
        renderCart(carrito);
    });

    // Escuchar cambio de idioma
    store.subscribe('lang_changed', () => {
        renderCart(store.state.carrito);
    });

    // Evento vaciar carrito
    const btnClear = document.getElementById("btn-clear-cart");
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            if (store.state.carrito.length > 0) {
                store.vaciarCarrito();
                showToast(store.t('toast_cart_cleared'), 'warning');
            }
        });
    }

    // Evento aplicar cupón
    const btnApplyCoupon = document.getElementById("btn-apply-coupon");
    const couponInput = document.getElementById("coupon-input");
    if (btnApplyCoupon && couponInput) {
        btnApplyCoupon.addEventListener("click", () => {
            const code = couponInput.value;
            if (!code) return;

            const success = store.applyCoupon(code);
            const feedbackMsg = document.getElementById("coupon-feedback-msg");

            if (success) {
                feedbackMsg.textContent = `${store.t('toast_coupon_ok')} (${(store.state.coupon.pct * 100)}% Off)`;
                feedbackMsg.className = "coupon-feedback success";
                showToast(store.t('toast_coupon_ok'), 'success');
            } else {
                feedbackMsg.textContent = store.t('toast_coupon_err');
                feedbackMsg.className = "coupon-feedback error";
                showToast(store.t('toast_coupon_err'), 'error');
            }
        });
    }

    // Evento disparar checkout modal
    const btnCheckout = document.getElementById("btn-checkout-trigger");
    if (btnCheckout) {
        btnCheckout.addEventListener("click", () => {
            if (store.state.carrito.length === 0) {
                showToast(store.state.lang === 'es' ? 'Tu carrito está vacío.' : 'Your cart is empty.', 'warning');
                return;
            }
            // Abrir modal de checkout
            const checkoutModal = document.getElementById("checkout-modal");
            if (checkoutModal) {
                checkoutModal.classList.add("visible");
                // Disparar evento para que el panel de checkout actualice sus ítems
                window.dispatchEvent(new CustomEvent("checkout_opened"));
            }
        });
    }

    // Toggle Carrito Móvil
    const trigger = document.getElementById("cart-trigger-btn");
    const closeBtn = document.getElementById("cart-close-mobile-btn");
    const sidebar = document.getElementById("cart-sidebar-panel");
    const backdrop = document.getElementById("cart-backdrop-element");

    if (trigger && sidebar && backdrop) {
        trigger.addEventListener("click", () => {
            sidebar.classList.add("open");
            backdrop.classList.add("visible");
        });
    }

    if (closeBtn && sidebar && backdrop) {
        closeBtn.addEventListener("click", closeCartMobile);
        backdrop.addEventListener("click", closeCartMobile);
    }

    // Inicializar render con datos persistidos
    renderCart(store.state.carrito);
}

function closeCartMobile() {
    const sidebar = document.getElementById("cart-sidebar-panel");
    const backdrop = document.getElementById("cart-backdrop-element");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("visible");
}

function renderCart(carrito) {
    const container = document.getElementById("cart-items-container");
    const badge = document.getElementById("cart-badge-count");
    if (!container) return;

    container.innerHTML = "";

    // Actualizar badge
    const itemsCount = store.getCartItemsCount();
    if (badge) {
        badge.textContent = itemsCount;
        if (itemsCount > 0) {
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    if (carrito.length === 0) {
        container.innerHTML = `<p class="cart-empty-text" data-i18n="cart_empty">${store.t('cart_empty')}</p>`;
        updateTotals();
        return;
    }

    carrito.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-block animate-card";

        // Precios
        const unitPrice = (item.precio / 100).toFixed(2);
        const totalItemPrice = ((item.precio * item.cantidad) / 100).toFixed(2);

        // Nombre traducido (si es ensalada, ya está construida, si no, se traduce por id)
        let displayName = item.nombre;
        if (item.esEnsalada) {
            // El nombre ya contiene el formato "Ensalada - Copa (250g)"
            displayName = item.nombre;
        }

        // Imagen: si es ensalada, usar fallback en SVG ya que no hay imagen física
        let imgHtml = "";
        if (item.esEnsalada) {
            imgHtml = `<div class="cart-item-img" style="display: flex; align-items: center; justify-content: center; background-color: var(--color-primary-light);">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6a6 6 0 0 0-6 6c0 2.2.8 4.2 2.1 5.7l7.8-7.8C14.4 8.6 13.3 8 12 6z"/></svg>
            </div>`;
        } else {
            imgHtml = `<img class="cart-item-img" src="${item.img}" alt="${displayName}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect width=%22100%%22 height=%22100%%22 fill=%22%23ccc%22/></svg>'">`;
        }

        div.innerHTML = `
            ${imgHtml}
            <div class="cart-item-info">
                <div class="cart-item-title">${displayName}</div>
                <div class="cart-item-details">$${unitPrice} c/u &bull; $${totalItemPrice}</div>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn btn-dec" data-id="${item.id}">-</button>
                <span class="cart-item-qty">${item.cantidad}</span>
                <button class="qty-btn btn-inc" data-id="${item.id}">+</button>
                <button class="cart-item-delete" data-id="${item.id}" aria-label="Eliminar ítem">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        `;

        // Eventos
        div.querySelector(".btn-dec").addEventListener("click", () => store.decrementarCantidad(item.id));
        div.querySelector(".btn-inc").addEventListener("click", () => store.incrementarCantidad(item.id));
        div.querySelector(".cart-item-delete").addEventListener("click", () => store.eliminarDelCarrito(item.id));

        container.appendChild(div);
    });

    updateTotals();
}

function updateTotals() {
    const subtotal = store.getCartSubtotal();
    const discount = store.getCartDiscount();
    const total = store.getCartTotal();

    const subtotalValEl = document.getElementById("cart-subtotal-val");
    const discountValEl = document.getElementById("cart-discount-val");
    const discountLineEl = document.getElementById("discount-summary-line");
    const totalValEl = document.getElementById("cart-total-price");

    if (subtotalValEl) subtotalValEl.textContent = `$${(subtotal / 100).toFixed(2)}`;

    if (discountValEl && discountLineEl) {
        if (discount > 0) {
            discountValEl.textContent = `-$${(discount / 100).toFixed(2)}`;
            discountLineEl.classList.remove("hidden");
        } else {
            discountLineEl.classList.add("hidden");
        }
    }

    if (totalValEl) totalValEl.textContent = `$${(total / 100).toFixed(2)}`;
}

export default initCart;
