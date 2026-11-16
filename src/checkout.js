
// ======================================
// CHECKOUT CONFIGURATION
// ======================================

const CART_STORAGE_KEY = "productExplorerCart";
const ORDER_STORAGE_KEY = "productExplorerOrders";
const USD_TO_INR = 93.86;

// CURRENCY FORMATTER
const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// CONVERT USD TO INR
function formatINR(usdPrice) {
    return currencyFormatter.format(
        Number(usdPrice) * USD_TO_INR
    );
}

// ======================================
// HTML ELEMENTS
// ======================================

const checkoutItems = document.getElementById("checkoutItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutContent = document.getElementById("checkoutContent");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const orderSuccess = document.getElementById("orderSuccess");
const orderNumber = document.getElementById("orderNumber");

// ======================================
// CHECK HTML ELEMENTS
// ======================================

if (
    !checkoutItems ||
    !checkoutSubtotal ||
    !checkoutTotal ||
    !checkoutForm ||
    !checkoutContent ||
    !emptyCartMessage ||
    !orderSuccess ||
    !orderNumber
) {
    throw new Error("Checkout HTML elements are missing. Check your IDs.");
}

// ======================================
// LOAD CART
// ======================================

function getCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) {
            return [];
        }

        const parsedCart = JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart.filter(item =>
            Number.isInteger(Number(item.id)) &&
            typeof item.title === "string" &&
            Number.isFinite(Number(item.price)) &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0
        );

    } catch (error) {
        console.error("Cart loading error:", error);
        return [];
    }
}

let cart = getCart();

// ======================================
// GET PREVIOUS ORDERS
// ======================================

function getOrders() {
    try {
        const savedOrders =
            localStorage.getItem(ORDER_STORAGE_KEY);

        if (!savedOrders) {
            return [];
        }

        const parsedOrders = JSON.parse(savedOrders);

        return Array.isArray(parsedOrders) ? parsedOrders : [];

    } catch (error) {
        console.error("Order loading error:", error);
        return [];
    }
}

// ======================================
// DISPLAY ORDER SUMMARY
// ======================================

function displayOrderSummary() {

    checkoutItems.innerHTML = "";

    if (cart.length === 0) {
        checkoutContent.hidden = true;
        emptyCartMessage.hidden = false;
        return;
    }

    checkoutContent.hidden = false;
    emptyCartMessage.hidden = true;

    let subtotal = 0;

    cart.forEach(item => {

        const itemTotal =
            Number(item.price) * Number(item.quantity);

        subtotal += itemTotal;

        const itemElement = document.createElement("div");

        itemElement.className = "checkout-item";

        const title = document.createElement("p");

        title.textContent =
            `${item.title} × ${item.quantity}`;

        const price = document.createElement("strong");

        price.textContent = formatINR(itemTotal);

        itemElement.appendChild(title);
        itemElement.appendChild(price);

        checkoutItems.appendChild(itemElement);
    });

    checkoutSubtotal.textContent = formatINR(subtotal);

    // FREE DELIVERY
    checkoutTotal.textContent = formatINR(subtotal);
}

// ======================================
// CREATE ORDER CONFIRMATION DETAILS
// ======================================

function displayOrderConfirmation(order) {

    // SHOW ORDER NUMBER
    orderNumber.textContent = order.orderNumber;

    // SHOW ORDER TOTAL
    let totalElement = document.getElementById("confirmedOrderTotal");

    if (!totalElement) {
        totalElement = document.createElement("p");
        totalElement.id = "confirmedOrderTotal";
        orderSuccess.appendChild(totalElement);
    }

    totalElement.textContent =
        "Order Total: " + formatINR(order.total);

    // SHOW SUCCESS MESSAGE
    let successMessage = document.getElementById("orderSuccessMessage");

    if (!successMessage) {
        successMessage = document.createElement("p");
        successMessage.id = "orderSuccessMessage";
        orderSuccess.insertBefore(successMessage, orderNumber);
    }

    successMessage.textContent =
        "Thank you! Your order has been placed successfully.";

    // SHOW VIEW HISTORY BUTTON
    let historyButton = document.getElementById("viewOrderHistoryButton");

    if (!historyButton) {
        historyButton = document.createElement("button");
        historyButton.id = "viewOrderHistoryButton";
        historyButton.type = "button";
        historyButton.textContent = "View Order History";

        orderSuccess.appendChild(historyButton);

        historyButton.addEventListener("click", function() {
            window.location.href = "order-history.html";
        });
    }

    // SHOW CONTINUE SHOPPING BUTTON
    let shoppingButton = document.getElementById("continueShoppingButton");

    if (!shoppingButton) {
        shoppingButton = document.createElement("button");
        shoppingButton.id = "continueShoppingButton";
        shoppingButton.type = "button";
        shoppingButton.textContent = "Continue Shopping";

        orderSuccess.appendChild(shoppingButton);

        shoppingButton.addEventListener("click", function() {
            window.location.href = "index.html";
        });
    }

    // SHOW SUCCESS SECTION
    checkoutContent.hidden = true;
    emptyCartMessage.hidden = true;
    orderSuccess.hidden = false;

    // SCROLL TO CONFIRMATION
    orderSuccess.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// ======================================
// PLACE ORDER
// ======================================

checkoutForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // GET EXISTING ORDERS
    const previousOrders = getOrders();

    // GENERATE ORDER NUMBER
    const newOrderNumber =
        "PE" + Date.now().toString().slice(-8);

    // COLLECT DELIVERY DETAILS
    const formData = new FormData(checkoutForm);

    const deliveryAddress = {
        customerName: formData.get("customerName") || "",
        phone: formData.get("phone") || "",
        email: formData.get("email") || "",
        address: formData.get("address") || "",
        city: formData.get("city") || "",
        state: formData.get("state") || "",
        pincode: formData.get("pincode") || ""
    };

    // CREATE NEW ORDER
    const newOrder = {
        orderNumber: newOrderNumber,
        date: new Date().toISOString(),
        status: "Placed",

        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: Number(item.price),
            thumbnail: item.thumbnail,
            quantity: Number(item.quantity)
        })),

        total: cart.reduce(function(sum, item) {
            return sum + (
                Number(item.price) * Number(item.quantity)
            );
        }, 0),

        deliveryAddress: deliveryAddress
    };

    try {

        // ADD NEW ORDER
        previousOrders.unshift(newOrder);

        // SAVE ORDER HISTORY
        localStorage.setItem(
            ORDER_STORAGE_KEY,
            JSON.stringify(previousOrders)
        );

        // VERIFY ORDER WAS SAVED
        const savedOrders = JSON.parse(
            localStorage.getItem(ORDER_STORAGE_KEY)
        );

        const orderSaved = savedOrders.some(
            order => order.orderNumber === newOrderNumber
        );

        if (!orderSaved) {
            throw new Error("Order could not be saved.");
        }

        // CLEAR CART ONLY AFTER SUCCESSFUL SAVE
        localStorage.removeItem(CART_STORAGE_KEY);

        cart = [];

        // RESET FORM
        checkoutForm.reset();

        // DISPLAY CONFIRMATION
        displayOrderConfirmation(newOrder);

        console.log("Order placed successfully:", newOrder);

    } catch (error) {

        console.error("Order saving error:", error);

        alert(
            "Unable to place your order. Please try again."
        );
    }
});

// ======================================
// START CHECKOUT
// ======================================

orderSuccess.hidden = true;

displayOrderSummary();
