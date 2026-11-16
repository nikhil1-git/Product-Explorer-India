
// ORDER HISTORY STORAGE KEY
const ORDER_STORAGE_KEY = "productExplorerOrders";

const USD_TO_INR = 93.86;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function formatINR(usdPrice) {
    return currencyFormatter.format(Number(usdPrice) * USD_TO_INR);
}

// HTML ELEMENTS
const historyMessage = document.getElementById("historyMessage");
const orderHistoryContainer = document.getElementById("orderHistoryContainer");

// GET ORDERS
function getOrders() {
    try {
        const savedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
        return savedOrders ? JSON.parse(savedOrders) : [];
    } catch (error) {
        console.error("Error loading orders:", error);
        return [];
    }
}

// SAVE ORDERS
function saveOrders(orders) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

// CANCEL ORDER
function cancelOrder(orderNumber) {
    const orders = getOrders();

    const order = orders.find(item =>
        item.orderNumber === orderNumber
    );

    if (!order) {
        alert("Order not found.");
        return;
    }

    if (order.status === "Cancelled") {
        alert("This order is already cancelled.");
        return;
    }

    const confirmation = confirm(
        "Are you sure you want to cancel this order?"
    );

    if (!confirmation) return;

    order.status = "Cancelled";
    order.cancelledAt = new Date().toISOString();

    saveOrders(orders);

    alert("Order cancelled successfully!");

    displayOrderHistory();
}

// CHANGE DELIVERY ADDRESS
function changeDeliveryAddress(orderNumber) {
    const orders = getOrders();

    const order = orders.find(item =>
        item.orderNumber === orderNumber
    );

    if (!order) {
        alert("Order not found.");
        return;
    }

    if (order.status === "Cancelled") {
        alert("You cannot change the address of a cancelled order.");
        return;
    }

    const oldAddress = order.deliveryAddress || {};

    const fields = [
        ["customerName", "Customer Name"],
        ["phone", "Phone Number"],
        ["email", "Email"],
        ["address", "Delivery Address"],
        ["city", "City"],
        ["state", "State"],
        ["pincode", "PIN Code"]
    ];

    const newAddress = {};

    for (const [key, label] of fields) {
        const value = prompt(
            "Enter " + label + ":",
            oldAddress[key] || ""
        );

        if (value === null) return;

        if (!value.trim()) {
            alert(label + " cannot be empty.");
            return;
        }

        newAddress[key] = value.trim();
    }

    order.deliveryAddress = newAddress;

    saveOrders(orders);

    alert("Delivery address updated successfully!");

    displayOrderHistory();
}

// DISPLAY ORDER HISTORY
function displayOrderHistory() {
    const orders = getOrders();

    orderHistoryContainer.innerHTML = "";

    if (orders.length === 0) {
        historyMessage.textContent =
            "You have not placed any orders yet.";
        return;
    }

    historyMessage.textContent =
        "You have " + orders.length + " order(s) in your history.";

    orders.forEach(function(order) {
        const orderCard = document.createElement("div");
        orderCard.className = "order-card";

        // ORDER ID
        const heading = document.createElement("h3");
        heading.textContent = "Order ID: " + order.orderNumber;

        // ORDER DATE
        const dateElement = document.createElement("p");

        dateElement.textContent = "Order Date: " +
            (order.date
                ? new Date(order.date).toLocaleString("en-IN")
                : "Date unavailable");

        // ORDER STATUS
        const statusElement = document.createElement("div");

        const currentStatus = order.status || "Placed";

        statusElement.textContent = "ORDER STATUS: " + currentStatus;

        statusElement.style.display = "inline-block";
        statusElement.style.padding = "9px 16px";
        statusElement.style.margin = "12px 0 18px";
        statusElement.style.borderRadius = "8px";
        statusElement.style.fontWeight = "800";
        statusElement.style.fontSize = "14px";

        if (currentStatus === "Cancelled") {
            statusElement.style.backgroundColor = "#fee2e2";
            statusElement.style.color = "#b91c1c";
            statusElement.style.border = "1px solid #fecaca";
        } else {
            statusElement.style.backgroundColor = "#d1fae5";
            statusElement.style.color = "#047857";
            statusElement.style.border = "1px solid #a7f3d0";
        }

        // DELIVERY ADDRESS
        const addressHeading = document.createElement("h4");
        addressHeading.textContent = "Delivery Address:";

        const addressElement = document.createElement("p");
        const address = order.deliveryAddress;

        if (address) {
            addressElement.textContent =
                "Name: " + (address.customerName || "") +
                " | Phone: " + (address.phone || "") +
                " | Email: " + (address.email || "") +
                " | Address: " + (address.address || "") +
                " | City: " + (address.city || "") +
                " | State: " + (address.state || "") +
                " | PIN Code: " + (address.pincode || "");
        } else {
            addressElement.textContent =
                "Delivery address not available.";
        }

        // PRODUCTS
        const productsHeading = document.createElement("h4");
        productsHeading.textContent = "Products:";

        const productList = document.createElement("ul");

        (order.items || []).forEach(function(item) {
            const product = document.createElement("li");

            product.textContent =
                item.title +
                " × " + item.quantity +
                " — " + formatINR(item.price * item.quantity);

            productList.appendChild(product);
        });

        // TOTAL
        const totalElement = document.createElement("h3");

        totalElement.textContent =
            "Total: " + formatINR(order.total);

        // ADD ORDER DETAILS
        orderCard.appendChild(heading);
        orderCard.appendChild(dateElement);
        orderCard.appendChild(statusElement);
        orderCard.appendChild(addressHeading);
        orderCard.appendChild(addressElement);
        orderCard.appendChild(productsHeading);
        orderCard.appendChild(productList);
        orderCard.appendChild(totalElement);

        // ACTION BUTTONS FOR ACTIVE ORDERS ONLY
        if (currentStatus !== "Cancelled") {
            const cancelButton = document.createElement("button");

            cancelButton.textContent = "Cancel Order";
            cancelButton.className = "cancel-order-button";

            cancelButton.addEventListener("click", function() {
                cancelOrder(order.orderNumber);
            });

            const editButton = document.createElement("button");

            editButton.textContent = "Change Delivery Address";
            editButton.className = "edit-address-button";

            editButton.addEventListener("click", function() {
                changeDeliveryAddress(order.orderNumber);
            });

            cancelButton.style.margin = "15px 10px 0 0";
            cancelButton.style.background = "#e11d48";

            editButton.style.margin = "15px 0 0";
            editButton.style.background = "#4f46e5";

            orderCard.appendChild(cancelButton);
            orderCard.appendChild(editButton);

        } else {
            const cancelledMessage = document.createElement("p");

            cancelledMessage.textContent =
                "This order has been cancelled. No further changes are available.";

            cancelledMessage.style.color = "#b91c1c";
            cancelledMessage.style.fontWeight = "700";
            cancelledMessage.style.marginTop = "15px";

            orderCard.appendChild(cancelledMessage);
        }

        orderHistoryContainer.appendChild(orderCard);
    });
}

// LOAD ORDER HISTORY
displayOrderHistory();
