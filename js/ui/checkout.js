import store from '../store.js';
import showToast from './toast.js';

export function initCheckout() {
    // Escuchar evento personalizado de apertura del modal
    window.addEventListener("checkout_opened", () => {
        renderCheckoutSummary();
    });

    // Escuchar cuando cambie el idioma para actualizar textos
    store.subscribe('lang_changed', () => {
        if (document.getElementById("checkout-modal").classList.contains("visible")) {
            renderCheckoutSummary();
        }
        renderOrderHistory();
    });

    // Escuchar actualizaciones del historial de la base de datos
    store.subscribe('order_history_updated', () => {
        renderOrderHistory();
    });

    // Cerrar modal checkout
    const btnCloseCheckout = document.getElementById("btn-close-checkout-modal");
    if (btnCloseCheckout) {
        btnCloseCheckout.addEventListener("click", () => {
            document.getElementById("checkout-modal").classList.remove("visible");
        });
    }

    // Cerrar modal recibo
    const btnCloseReceipt = document.getElementById("btn-close-receipt-modal");
    const btnDoneReceipt = document.getElementById("btn-done-receipt");
    const receiptModal = document.getElementById("receipt-modal");
    if (btnCloseReceipt && receiptModal) {
        btnCloseReceipt.addEventListener("click", () => {
            receiptModal.classList.remove("visible");
        });
    }
    if (btnDoneReceipt && receiptModal) {
        btnDoneReceipt.addEventListener("click", () => {
            receiptModal.classList.remove("visible");
        });
    }

    // Imprimir factura
    const btnPrint = document.getElementById("btn-print-receipt");
    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
            window.print();
        });
    }

    setupCreditCardBindings();
    setupCheckoutFormSubmit();
    renderOrderHistory(); // Inicializar historial
}

function renderCheckoutSummary() {
    const container = document.getElementById("checkout-summary-items-list");
    const subtotalEl = document.getElementById("checkout-subtotal-val");
    const discountEl = document.getElementById("checkout-discount-val");
    const discountLine = document.getElementById("checkout-discount-line");
    const totalEl = document.getElementById("checkout-total-val");

    if (!container) return;

    container.innerHTML = "";

    const carrito = store.state.carrito;
    carrito.forEach(item => {
        const row = document.createElement("div");
        row.className = "checkout-summary-item";

        const totalItemPrice = ((item.precio * item.cantidad) / 100).toFixed(2);

        row.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${totalItemPrice}</span>
        `;
        container.appendChild(row);
    });

    const subtotal = store.getCartSubtotal();
    const discount = store.getCartDiscount();
    const total = store.getCartTotal();

    if (subtotalEl) subtotalEl.textContent = `$${(subtotal / 100).toFixed(2)}`;

    if (discountEl && discountLine) {
        if (discount > 0) {
            discountEl.textContent = `-$${(discount / 100).toFixed(2)}`;
            discountLine.classList.remove("hidden");
        } else {
            discountLine.classList.add("hidden");
        }
    }

    if (totalEl) totalEl.textContent = `$${(total / 100).toFixed(2)}`;
}

function setupCreditCardBindings() {
    const cardNumInput = document.getElementById("checkout-card-number");
    const cardHolderInput = document.getElementById("checkout-name");
    const cardExpiryInput = document.getElementById("checkout-card-expiry");
    const cardCvvInput = document.getElementById("checkout-card-cvv");
    const cardPreview = document.getElementById("credit-card-preview-element");

    // Formatear número de tarjeta (espacios cada 4 dígitos)
    if (cardNumInput) {
        cardNumInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formatted = "";
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += " ";
                formatted += value[i];
            }
            e.target.value = formatted;
            document.getElementById("card-number-label-val").textContent = formatted || "•••• •••• •••• ••••";
        });
    }

    // Enlace Titular
    if (cardHolderInput) {
        cardHolderInput.addEventListener("input", (e) => {
            document.getElementById("card-holder-name-val").textContent = e.target.value.toUpperCase() || "NOMBRE COGNOMBRE";
        });
    }

    // Formatear expiración (MM/AA)
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
            if (value.length > 2) {
                e.target.value = value.substring(0, 2) + "/" + value.substring(2, 4);
            } else {
                e.target.value = value;
            }
            document.getElementById("card-expiry-val").textContent = e.target.value || "MM/AA";
        });
    }

    // Enlace CVV y rotación de tarjeta
    if (cardCvvInput && cardPreview) {
        cardCvvInput.addEventListener("focus", () => {
            cardPreview.classList.add("flipped");
        });
        cardCvvInput.addEventListener("blur", () => {
            cardPreview.classList.remove("flipped");
        });
        cardCvvInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/[^0-9]/gi, '');
            e.target.value = value;
            document.getElementById("card-cvv-val").textContent = "•".repeat(value.length) || "•••";
        });
    }
}

function setupCheckoutFormSubmit() {
    const form = document.getElementById("checkout-payment-form");
    const loader = document.getElementById("checkout-loader-panel");
    const checkoutModal = document.getElementById("checkout-modal");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validaciones básicas manuales
        const cardNum = document.getElementById("checkout-card-number").value.replace(/\s/g, '');
        const cardExpiry = document.getElementById("checkout-card-expiry").value;
        const cardCvv = document.getElementById("checkout-card-cvv").value;

        if (cardNum.length < 16) {
            showToast(store.state.lang === 'es' ? 'El número de tarjeta debe tener 16 dígitos.' : 'Card number must be 16 digits.', 'error');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            showToast(store.state.lang === 'es' ? 'La expiración debe tener formato MM/AA.' : 'Expiry must be in MM/YY format.', 'error');
            return;
        }

        if (cardCvv.length < 3) {
            showToast(store.state.lang === 'es' ? 'El CVV debe tener al menos 3 dígitos.' : 'CVV must be at least 3 digits.', 'error');
            return;
        }

        // Mostrar Loader procesando
        if (loader) loader.classList.remove("hidden");

        setTimeout(async () => {
            // Registrar compra
            const customerInfo = {
                name: document.getElementById("checkout-name").value,
                email: document.getElementById("checkout-email").value,
                address: document.getElementById("checkout-address").value
            };

            // Escuchar el evento de orden creada para abrir el modal recibo
            const unsub = store.subscribe('order_placed', (order) => {
                showReceipt(order);
                unsub(); // Desuscribirse inmediatamente
            });

            try {
                await store.registrarCompra(customerInfo);

                // Ocultar Loader
                if (loader) loader.classList.add("hidden");

                // Cerrar checkout modal y limpiar form
                if (checkoutModal) checkoutModal.classList.remove("visible");
                form.reset();

                // Resetear tarjeta visual
                document.getElementById("card-number-label-val").textContent = "•••• •••• •••• ••••";
                document.getElementById("card-holder-name-val").textContent = "NOMBRE COGNOMBRE";
                document.getElementById("card-expiry-val").textContent = "MM/AA";
                document.getElementById("card-cvv-val").textContent = "•••";

                showToast(store.t('toast_pay_success'), 'success');
            } catch (err) {
                if (loader) loader.classList.add("hidden");
                showToast(store.state.lang === 'es' ? 'Error de conexión con el servidor.' : 'Server connection error.', 'error');
            }
        }, 2200);
    });
}

function showReceipt(order) {
    const modal = document.getElementById("receipt-modal");
    if (!modal) return;

    document.getElementById("receipt-invoice-num").textContent = `#${order.id.replace('invoice-', '')}`;
    document.getElementById("receipt-invoice-date").textContent = order.date;
    document.getElementById("receipt-customer-name").textContent = order.customer.name;
    document.getElementById("receipt-customer-email").textContent = order.customer.email;
    document.getElementById("receipt-customer-address").textContent = order.customer.address;

    const tableBody = document.getElementById("receipt-invoice-table-body");
    tableBody.innerHTML = "";

    order.items.forEach(item => {
        const tr = document.createElement("tr");
        const price = (item.precio / 100).toFixed(2);
        const total = ((item.precio * item.cantidad) / 100).toFixed(2);

        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${price}</td>
            <td>$${total}</td>
        `;
        tableBody.appendChild(tr);
    });

    document.getElementById("receipt-subtotal-val").textContent = `$${(order.subtotal / 100).toFixed(2)}`;

    const discEl = document.getElementById("receipt-discount-val");
    const discLine = document.getElementById("receipt-discount-line");
    if (discEl && discLine) {
        if (order.descuento > 0) {
            discEl.textContent = `-$${(order.descuento / 100).toFixed(2)}`;
            discLine.classList.remove("hidden");
        } else {
            discLine.classList.add("hidden");
        }
    }

    document.getElementById("receipt-total-val").textContent = `$${(order.total / 100).toFixed(2)}`;

    modal.classList.add("visible");
}

function renderOrderHistory() {
    const container = document.getElementById("order-history-list");
    if (!container) return;

    container.innerHTML = "";

    const history = store.state.orderHistory;
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom: 10px;"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01"/></svg>
                <p>${store.t('hist_empty')}</p>
            </div>
        `;
        return;
    }

    history.forEach(order => {
        const card = document.createElement("div");
        card.className = "history-order-card animate-card";

        // Listar nombres de productos comprados de forma resumida
        const itemsSummary = order.items.map(i => `${i.nombre} x${i.cantidad}`).join(", ");

        card.innerHTML = `
            <div class="order-meta-info">
                <span class="order-id">Factura #${order.id.replace('invoice-', '')}</span>
                <span class="order-date">${order.date}</span>
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${itemsSummary}
                </span>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span class="order-total">$${(order.total / 100).toFixed(2)}</span>
                <button class="btn btn-secondary btn-sm btn-view-invoice" data-id="${order.id}">
                    ${store.state.lang === 'es' ? 'Ver Factura' : 'Receipt'}
                </button>
            </div>
        `;

        card.querySelector(".btn-view-invoice").addEventListener("click", () => {
            showReceipt(order);
        });

        container.appendChild(card);
    });
}
export default initCheckout;
