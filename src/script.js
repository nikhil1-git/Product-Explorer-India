
const API_URL = "https://dummyjson.com/products";

// Complete product catalogue used by the AI assistant
let aiProductCatalog = [];

// ======================================
// CURRENCY CONVERSION
// ======================================

const USD_TO_INR = 93.86;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function formatINR(usdPrice) {
    return currencyFormatter.format(
        Number(usdPrice) * USD_TO_INR
    );
}

// ======================================
// HTML ELEMENTS
// ======================================

// Product elements
const productContainer = document.getElementById("productContainer");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageInfo = document.getElementById("pageInfo");

// Cart elements
const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartSection = document.getElementById("cartSection");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const closeCartButton = document.getElementById("closeCartButton");
const clearCartButton = document.getElementById("clearCartButton");
const checkoutButton = document.getElementById("checkoutButton");

// ======================================
// CHECK HTML ELEMENTS
// ======================================

if (
    !productContainer ||
    !message ||
    !searchInput ||
    !searchButton ||
    !categoryFilter ||
    !sortFilter ||
    !prevButton ||
    !nextButton ||
    !pageInfo ||
    !cartButton ||
    !cartCount ||
    !cartSection ||
    !cartItems ||
    !cartTotal ||
    !closeCartButton ||
    !clearCartButton ||
    !checkoutButton
) {
    alert("Error: Check the IDs in your index.html file.");
    throw new Error("One or more HTML elements are missing.");
}

// ======================================
// PAGINATION VARIABLES
// ======================================

const limit = 10;

let currentPage = 1;
let totalProducts = 0;
let currentEndpoint = API_URL;

// ======================================
// SHOPPING CART VARIABLES
// ======================================

const CART_STORAGE_KEY = "productExplorerCart";

let cart = loadCart();

// LOAD CART FROM LOCAL STORAGE
function loadCart() {
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
            Number.isFinite(Number(item.price)) &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0
        );

    } catch (error) {
        console.error("Cart loading error:", error);
        return [];
    }
}

// SAVE CART TO LOCAL STORAGE
function saveCart() {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );
    } catch (error) {
        console.error("Cart saving error:", error);
    }
}

// ======================================
// WISHLIST VARIABLES
// ======================================

const WISHLIST_STORAGE_KEY = "productExplorerWishlist";

let wishlist = loadWishlist();

// LOAD WISHLIST FROM LOCAL STORAGE
function loadWishlist() {
    try {
        const savedWishlist = localStorage.getItem(
            WISHLIST_STORAGE_KEY
        );

        if (!savedWishlist) {
            return [];
        }

        const parsedWishlist = JSON.parse(savedWishlist);

        if (!Array.isArray(parsedWishlist)) {
            return [];
        }

        return parsedWishlist.filter(item =>
            item &&
            Number.isInteger(Number(item.id)) &&
            Number.isFinite(Number(item.price))
        );

    } catch (error) {
        console.error("Wishlist loading error:", error);
        return [];
    }
}

// SAVE WISHLIST TO LOCAL STORAGE
function saveWishlist() {
    try {
        localStorage.setItem(
            WISHLIST_STORAGE_KEY,
            JSON.stringify(wishlist)
        );
    } catch (error) {
        console.error("Wishlist saving error:", error);
    }
}

// CHECK WHETHER PRODUCT IS ALREADY IN WISHLIST
function isInWishlist(productId) {
    return wishlist.some(
        item => Number(item.id) === Number(productId)
    );
}

// ADD OR REMOVE PRODUCT FROM WISHLIST
function toggleWishlist(product, heartButton) {

    if (isInWishlist(product.id)) {

        // REMOVE PRODUCT
        wishlist = wishlist.filter(
            item => Number(item.id) !== Number(product.id)
        );

        heartButton.classList.remove("is-active");
        heartButton.textContent = "♡ ";
        heartButton.setAttribute("aria-label", "Add to Wishlist");

        console.log("Removed from wishlist:", product.title);

    } else {

        // ADD PRODUCT
        wishlist.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail
        });

        heartButton.classList.add("is-active");
        heartButton.textContent = "♥";
        heartButton.setAttribute("aria-label", "Remove from Wishlist");

        console.log("Added to wishlist:", product.title);
    }

    saveWishlist();
}

// ======================================
// GET PRODUCTS FROM API
// ======================================

async function getProducts(page = 1) {
    try {
        currentPage = page;

        message.textContent = "Loading products...";
        productContainer.innerHTML = "";

        const skip = (currentPage - 1) * limit;

        const params = new URLSearchParams();

        params.set("limit", limit);
        params.set("skip", skip);

        // SORT PRODUCTS
        if (sortFilter.value !== "") {
            const [sortBy, order] = sortFilter.value.split("-");

            params.set("sortBy", sortBy);
            params.set("order", order);
        }

        // CREATE API URL
        const separator =
            currentEndpoint.includes("?") ? "&" : "?";

        const url =
            `${currentEndpoint}${separator}${params.toString()}`;

        console.log("Connecting to:", url);

        // FETCH API
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        totalProducts = data.total;

        displayProducts(data.products);

        updatePagination();

    } catch (error) {
        console.error("Product Error:", error);

        message.textContent =
            "Error: " + error.message +
            ". Please check your internet connection.";

        pageInfo.textContent = "Page unavailable";
        prevButton.disabled = true;
        nextButton.disabled = true;
    }
}

// ======================================
// DISPLAY PRODUCTS
// ======================================

function displayProducts(products) {
    productContainer.innerHTML = "";

    if (!products || products.length === 0) {
        message.textContent = "No products found.";
        return;
    }

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";
        card.style.cursor = "pointer";

        // PRODUCT IMAGE
        const image = document.createElement("img");

        image.src = product.thumbnail;
        image.alt = product.title;
        image.loading = "lazy";

        // PRODUCT TITLE
        const title = document.createElement("h3");

        title.textContent = product.title;

        // PRODUCT CATEGORY
        const category = document.createElement("p");

        category.textContent = product.category;

        // PRODUCT PRICE IN INR
        const price = document.createElement("p");

        price.className = "price";
        price.textContent = formatINR(product.price);

        // PRODUCT RATING
        const rating = document.createElement("p");

        rating.textContent = `Rating: ${product.rating} ⭐`;

        // BUTTON CONTAINER
        const buttonContainer = document.createElement("div");

        buttonContainer.className = "product-actions";

        // ==================================
        // ADD TO CART BUTTON
        // ==================================

        const addButton = document.createElement("button");

        addButton.type = "button";
        addButton.className = "add-cart-button";
        addButton.textContent = "Add to Cart";

        addButton.addEventListener("click", function(event) {
            event.stopPropagation();

            addToCart(product);
        });

        // ==================================
        // BUY NOW BUTTON
        // ==================================

        const buyButton = document.createElement("button");

        buyButton.type = "button";
        buyButton.className = "buy-now-button";
        buyButton.textContent = "Buy Now";

        buyButton.addEventListener("click", function(event) {
            event.stopPropagation();

            addToCart(product);

            // OPEN CART AFTER ADDING PRODUCT
            cartSection.hidden = false;

            cartSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        // ==================================
        // WISHLIST BUTTON
        // ==================================

        const heartButton = document.createElement("button");

        heartButton.type = "button";
        heartButton.className = "wishlist-button";

        // CHECK WHETHER PRODUCT IS ALREADY WISHLISTED
        if (isInWishlist(product.id)) {

            heartButton.classList.add("is-active");
            heartButton.textContent = "♥ Wishlisted";
            heartButton.setAttribute(
                "aria-label",
                "Remove from Wishlist"
            );

        } else {

            heartButton.textContent = "♡ Wishlist";
            heartButton.setAttribute(
                "aria-label",
                "Add to Wishlist"
            );
        }

        // WISHLIST BUTTON CLICK EVENT
        heartButton.addEventListener("click", function(event) {
            event.stopPropagation();

            toggleWishlist(product, heartButton);
        });

        // ==================================
        // ADD BUTTONS TO BUTTON CONTAINER
        // ==================================

        buttonContainer.appendChild(addButton);
        buttonContainer.appendChild(buyButton);
        buttonContainer.appendChild(heartButton);

        // ==================================
        // ADD ELEMENTS TO PRODUCT CARD
        // ==================================

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(category);
        card.appendChild(price);
        card.appendChild(rating);
        card.appendChild(buttonContainer);

        // ==================================
        // OPEN PRODUCT DETAILS
        // ==================================

        card.addEventListener("click", function() {
            window.location.href =
                `product-details.html?id=${product.id}`;
        });

        productContainer.appendChild(card);
    });

    message.textContent =
        `Showing ${products.length} products`;
}

// ======================================
// ADD PRODUCT TO CART
// ======================================

function addToCart(product) {

    const existingProduct = cart.find(
        item => Number(item.id) === Number(product.id)
    );

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }

    saveCart();

    renderCart();

    console.log("Product added to cart:", product.title);
}

// ======================================
// DISPLAY CART
// ======================================

function renderCart() {

    cartItems.innerHTML = "";

    let totalQuantity = 0;
    let totalPrice = 0;

    if (cart.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = "Your cart is empty.";

        cartItems.appendChild(emptyMessage);
    }

    cart.forEach(item => {

        const itemTotal = item.price * item.quantity;

        totalQuantity += item.quantity;
        totalPrice += itemTotal;

        // CART ITEM
        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        // PRODUCT IMAGE
        const image = document.createElement("img");

        image.src = item.thumbnail;
        image.alt = item.title;
        image.loading = "lazy";

        // PRODUCT INFORMATION
        const info = document.createElement("div");

        info.className = "cart-item-info";

        const title = document.createElement("h3");

        title.textContent = item.title;

        const price = document.createElement("p");

        price.textContent =
            `Price: ${formatINR(item.price)}`;

        const subtotal = document.createElement("p");

        subtotal.textContent =
            `Subtotal: ${formatINR(itemTotal)}`;

        info.appendChild(title);
        info.appendChild(price);
        info.appendChild(subtotal);

        // QUANTITY CONTROLS
        const quantityControls = document.createElement("div");

        quantityControls.className = "quantity-controls";

        const decreaseButton = document.createElement("button");

        decreaseButton.type = "button";
        decreaseButton.textContent = "-";
        decreaseButton.dataset.action = "decrease";
        decreaseButton.dataset.id = item.id;

        const quantity = document.createElement("span");

        quantity.textContent = item.quantity;

        const increaseButton = document.createElement("button");

        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.dataset.action = "increase";
        increaseButton.dataset.id = item.id;

        quantityControls.appendChild(decreaseButton);
        quantityControls.appendChild(quantity);
        quantityControls.appendChild(increaseButton);

        // REMOVE BUTTON
        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-button";
        removeButton.dataset.action = "remove";
        removeButton.dataset.id = item.id;

        // ADD TO CART ITEM
        cartItem.appendChild(image);
        cartItem.appendChild(info);
        cartItem.appendChild(quantityControls);
        cartItem.appendChild(removeButton);

        cartItems.appendChild(cartItem);
    });

    // UPDATE CART COUNT
    cartCount.textContent = totalQuantity;

    // UPDATE CART TOTAL IN INR
    cartTotal.textContent = formatINR(totalPrice);

    // SAVE UPDATED CART
    saveCart();
}

// ======================================
// CART BUTTON EVENTS
// ======================================

// OPEN CART
cartButton.addEventListener("click", function() {

    cartSection.hidden = false;

    cartSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// CLOSE CART
closeCartButton.addEventListener("click", function() {
    cartSection.hidden = true;
});

// ======================================
// INCREASE / DECREASE / REMOVE ITEMS
// ======================================

cartItems.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const productId = Number(button.dataset.id);

    const product = cart.find(
        item => Number(item.id) === productId
    );

    if (!product) {
        return;
    }

    if (action === "increase") {
        product.quantity++;
    }

    if (action === "decrease") {

        product.quantity--;

        if (product.quantity <= 0) {

            cart = cart.filter(
                item => Number(item.id) !== productId
            );
        }
    }

    if (action === "remove") {

        cart = cart.filter(
            item => Number(item.id) !== productId
        );
    }

    saveCart();

    renderCart();
});

// ======================================
// CLEAR CART
// ======================================

clearCartButton.addEventListener("click", function() {

    if (cart.length === 0) {
        alert("Your cart is already empty.");
        return;
    }

    const confirmClear = confirm(
        "Are you sure you want to clear your cart?"
    );

    if (confirmClear) {

        cart = [];

        saveCart();

        renderCart();
    }
});

// ======================================
// PROCEED TO CHECKOUT
// ======================================

checkoutButton.addEventListener("click", function() {

    if (cart.length === 0) {
        alert("Your cart is empty. Please add products first.");
        return;
    }

    window.location.href = "checkout.html";
});

// ======================================
// UPDATE PAGINATION
// ======================================

function updatePagination() {

    const totalPages = Math.ceil(totalProducts / limit);

    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;
}

// ======================================
// SEARCH PRODUCTS
// ======================================

async function searchProducts() {

    const searchValue = searchInput.value.trim();

    categoryFilter.value = "";

    currentEndpoint = searchValue === ""
        ? API_URL
        : `${API_URL}/search?q=${encodeURIComponent(searchValue)}`;

    await getProducts(1);
}

// ======================================
// GET CATEGORIES
// ======================================

async function getCategories() {

    try {

        const response = await fetch(
            `${API_URL}/category-list`
        );

        if (!response.ok) {
            throw new Error("Unable to load categories");
        }

        const categories = await response.json();

        categories.forEach(category => {

            const option = document.createElement("option");

            option.value = category;

            option.textContent =
                category.charAt(0).toUpperCase() +
                category.slice(1);

            categoryFilter.appendChild(option);
        });

    } catch (error) {

        console.error("Category Error:", error);
    }
}

// ======================================
// FILTER BY CATEGORY
// ======================================

async function filterByCategory() {

    searchInput.value = "";

    const selectedCategory = categoryFilter.value;

    currentEndpoint = selectedCategory === ""
        ? API_URL
        : `${API_URL}/category/${encodeURIComponent(selectedCategory)}`;

    await getProducts(1);
}

// ======================================
// EVENT LISTENERS
// ======================================

// SEARCH BUTTON
searchButton.addEventListener("click", searchProducts);

// SEARCH USING ENTER KEY
searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchProducts();
    }
});

// CATEGORY FILTER
categoryFilter.addEventListener("change", filterByCategory);

// SORT FILTER
sortFilter.addEventListener("change", function() {
    getProducts(1);
});

// PREVIOUS PAGE
prevButton.addEventListener("click", function() {

    if (currentPage > 1) {
        getProducts(currentPage - 1);
    }
});

// NEXT PAGE
nextButton.addEventListener("click", function() {

    const totalPages = Math.ceil(totalProducts / limit);

    if (currentPage < totalPages) {
        getProducts(currentPage + 1);
    }
});

// ======================================
// START APPLICATION
// ======================================

renderCart();

getCategories();

getProducts(1);renderCart();

               getCategories();

               getProducts(1);

               // OPEN CART WHEN COMING FROM WISHLIST PAGE
               const urlParams = new URLSearchParams(window.location.search);

               if (urlParams.get("openCart") === "1") {
                   cartSection.hidden = false;

                   cartSection.scrollIntoView({
                       behavior: "smooth",
                       block: "start"
                   });
               }

// ======================================
// GROQ AI SHOPPING ASSISTANT
// CONNECTED TO REAL WEBSITE PRODUCTS
// ======================================

const aiMessageInput = document.getElementById("aiMessageInput");
const sendAiMessageButton = document.getElementById("sendAiMessage");
const chatMessages = document.getElementById("chatMessages");

const aiChatToggle = document.getElementById("aiChatToggle");
const aiChatWindow = document.getElementById("aiChatWindow");
const closeAiChatButton = document.getElementById("closeAiChat");

const minimizeAiChatButton =
    document.getElementById("minimizeAiChat");

const maximizeAiChatButton =
    document.getElementById("maximizeAiChat");

const AI_CHAT_STORAGE_KEY = "productExplorerAiChatHistory";

let chatHistory = loadAiChatHistory();

// ======================================
// LOAD CHAT HISTORY
// ======================================

function loadAiChatHistory() {
    try {
        const saved = localStorage.getItem(AI_CHAT_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(item =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
        ).slice(-16);

    } catch (error) {
        console.error("Chat history error:", error);
        return [];
    }
}

// SAVE CHAT HISTORY
function saveAiChatHistory() {
    try {
        localStorage.setItem(
            AI_CHAT_STORAGE_KEY,
            JSON.stringify(chatHistory.slice(-16))
        );
    } catch (error) {
        console.error("Unable to save chat history:", error);
    }
}

// ======================================
// LOAD COMPLETE WEBSITE PRODUCT CATALOGUE
// ======================================

async function loadAiProductCatalog() {
    try {
        const response = await fetch(
            `${API_URL}?limit=194`
        );

        if (!response.ok) {
            throw new Error("Unable to load website products.");
        }

        const data = await response.json();

        aiProductCatalog = Array.isArray(data.products)
            ? data.products
            : [];

        console.log(
            "AI product catalogue loaded:",
            aiProductCatalog.length
        );

    } catch (error) {
        console.error("AI catalogue error:", error);
        aiProductCatalog = [];
    }
}

// ======================================
// FIND RELEVANT PRODUCTS FOR AI
// ======================================

function getRelevantAiProducts(messages) {

    const userText = messages
        .filter(item => item.role === "user")
        .map(item => item.content)
        .join(" ")
        .toLowerCase();

    const stopWords = new Set([
        "i", "want", "need", "a", "an", "the", "to",
        "for", "is", "it", "my", "me", "please", "show",
        "suggest", "recommend", "under", "below", "above",
        "with", "and", "or", "of", "in", "on", "do",
        "you", "have", "can", "give", "more", "yes", "no",
        "buy", "purchase", "looking", "search", "find",
        "product", "products", "your", "website"
    ]);

    const keywords = userText
        .replace(/[₹$]/g, " ")
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(word =>
            word.length > 2 &&
            !stopWords.has(word) &&
            !/^\d+$/.test(word)
        );

    const scoredProducts = aiProductCatalog.map(product => {

        const searchableText = [
            product.title,
            product.description,
            product.category,
            product.brand
        ].join(" ").toLowerCase();

        let score = 0;

        keywords.forEach(keyword => {
            if (product.title?.toLowerCase().includes(keyword)) {
                score += 5;
            }

            if (product.category?.toLowerCase().includes(keyword)) {
                score += 4;
            }

            if (product.brand?.toLowerCase().includes(keyword)) {
                score += 3;
            }

            if (product.description?.toLowerCase().includes(keyword)) {
                score += 1;
            }
        });

        return {
            product,
            score
        };
    });

    scoredProducts.sort((a, b) => b.score - a.score);

    // Return up to 30 actual products.
    return scoredProducts
        .slice(0, 30)
        .map(item => item.product);
}

// ======================================
// CREATE CHAT MESSAGE
// ======================================

function addChatMessage(role, content) {

    const messageElement = document.createElement("div");

    messageElement.className =
        role === "user" ? "user-message" : "ai-message";

    if (
        role === "assistant" &&
        typeof marked !== "undefined" &&
        typeof DOMPurify !== "undefined"
    ) {
        messageElement.innerHTML = DOMPurify.sanitize(
            marked.parse(content)
        );
    } else {
        messageElement.textContent = content;
    }

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageElement;
}

// ======================================
// DISPLAY ACTUAL WEBSITE PRODUCT CARDS
// ======================================

function displayAiProductCards(productIds) {

    if (!Array.isArray(productIds) || productIds.length === 0) {
        return;
    }

    const validProducts = productIds
        .map(id =>
            aiProductCatalog.find(
                product => Number(product.id) === Number(id)
            )
        )
        .filter(Boolean);

    if (validProducts.length === 0) {
        return;
    }

    const heading = document.createElement("p");

    heading.textContent = "Products from our website:";
    heading.style.fontWeight = "bold";
    heading.style.marginTop = "12px";

    chatMessages.appendChild(heading);

    validProducts.forEach(product => {

        const card = document.createElement("div");

        card.className = "ai-product-card";

        card.style.display = "flex";
        card.style.gap = "12px";
        card.style.padding = "12px";
        card.style.margin = "10px 0";
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "12px";
        card.style.background = "#fff";
        card.style.color = "#222";
        card.style.alignItems = "center";

        // PRODUCT IMAGE
        const image = document.createElement("img");

        image.src = product.thumbnail;
        image.alt = product.title;
        image.loading = "lazy";

        image.style.width = "85px";
        image.style.height = "85px";
        image.style.objectFit = "contain";
        image.style.borderRadius = "8px";

        // PRODUCT INFORMATION
        const info = document.createElement("div");

        info.style.flex = "1";
        info.style.minWidth = "0";

        const title = document.createElement("strong");

        title.textContent = product.title;
        title.style.display = "block";
        title.style.marginBottom = "5px";

        const category = document.createElement("p");

        category.textContent = product.category || "Product";
        category.style.margin = "3px 0";

        const price = document.createElement("p");

        price.textContent = formatINR(product.price);
        price.style.fontWeight = "bold";
        price.style.margin = "5px 0";

        const rating = document.createElement("p");

        rating.textContent =
            `Rating: ${product.rating || "Not available"} ⭐`;

        rating.style.margin = "3px 0";
        rating.style.fontSize = "13px";

        // BUTTONS
        const actions = document.createElement("div");

        actions.style.display = "flex";
        actions.style.flexWrap = "wrap";
        actions.style.gap = "6px";
        actions.style.marginTop = "8px";

        // VIEW DETAILS
        const detailsButton = document.createElement("button");

        detailsButton.type = "button";
        detailsButton.textContent = "View Details";

        detailsButton.addEventListener("click", function() {
            window.location.href =
                `product-details.html?id=${product.id}`;
        });

        // ADD TO CART
        const addButton = document.createElement("button");

        addButton.type = "button";
        addButton.textContent = "Add to Cart";

        addButton.addEventListener("click", function() {

            addToCart(product);

            addButton.textContent = "Added ✓";

            setTimeout(() => {
                addButton.textContent = "Add to Cart";
            }, 1500);
        });

        // BUY NOW
        const buyButton = document.createElement("button");

        buyButton.type = "button";
        buyButton.textContent = "Buy Now";

        buyButton.addEventListener("click", function() {

            addToCart(product);

            cartSection.hidden = false;

            cartSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        actions.appendChild(detailsButton);
        actions.appendChild(addButton);
        actions.appendChild(buyButton);

        info.appendChild(title);
        info.appendChild(category);
        info.appendChild(price);
        info.appendChild(rating);
        info.appendChild(actions);

        card.appendChild(image);
        card.appendChild(info);

        chatMessages.appendChild(card);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ======================================
// RESTORE PREVIOUS CHAT MESSAGES
// ======================================

function restoreAiChat() {

    chatHistory.forEach(item => {
        addChatMessage(item.role, item.content);
    });
}

// ======================================
// OPEN CHAT
// ======================================

function openAiChat() {

    aiChatWindow.classList.remove("is-minimized");
    aiChatWindow.classList.add("is-open");

    aiChatWindow.setAttribute("aria-hidden", "false");
    aiChatToggle.setAttribute("aria-expanded", "true");

    aiMessageInput.focus();
}

// CLOSE CHAT
function closeAiChat() {

    aiChatWindow.classList.remove("is-open");

    aiChatWindow.setAttribute("aria-hidden", "true");
    aiChatToggle.setAttribute("aria-expanded", "false");
}

// CHAT TOGGLE
aiChatToggle.addEventListener("click", function() {

    if (aiChatWindow.classList.contains("is-open")) {
        closeAiChat();
    } else {
        openAiChat();
    }
});

// CLOSE BUTTON
closeAiChatButton.addEventListener("click", closeAiChat);

// ESCAPE KEY
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeAiChat();
    }
});

// ======================================
// SEND MESSAGE TO AI
// ======================================

async function sendAiMessage() {

    const userText = aiMessageInput.value.trim();

    if (!userText) {
        aiMessageInput.focus();
        return;
    }

    // Save and display customer message.
    chatHistory.push({
        role: "user",
        content: userText
    });

    addChatMessage("user", userText);

    saveAiChatHistory();

    aiMessageInput.value = "";

    sendAiMessageButton.disabled = true;
    sendAiMessageButton.textContent = "Thinking...";

    const loadingMessage = document.createElement("div");

    loadingMessage.className = "ai-message typing-message";
    loadingMessage.textContent = "Finding suitable products...";

    chatMessages.appendChild(loadingMessage);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {

        // Ensure the product catalogue is loaded.
        if (aiProductCatalog.length === 0) {
            await loadAiProductCatalog();
        }

        if (aiProductCatalog.length === 0) {
            throw new Error(
                "Website products could not be loaded. Please refresh the page."
            );
        }

        // Select relevant actual products.
        const relevantProducts =
            getRelevantAiProducts(chatHistory);

        // Prepare product information for the backend.
        const productsForAi = relevantProducts.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            category: product.category,
            brand: product.brand || "",
            priceINR: Number(
                (Number(product.price) * USD_TO_INR).toFixed(2)
            ),
            rating: product.rating,
            stock: product.stock,
            availabilityStatus: product.availabilityStatus || ""
        }));

        const response = await fetch(
            "http://localhost:3000/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: chatHistory.slice(-16),
                    products: productsForAi
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "AI request failed."
            );
        }

        const reply = data.reply || "No response received.";

        loadingMessage.remove();

        // Display AI reply.
        addChatMessage("assistant", reply);

        // Save assistant response for conversation memory.
        chatHistory.push({
            role: "assistant",
            content: reply
        });

        chatHistory = chatHistory.slice(-16);

        saveAiChatHistory();

        // Display real products selected by AI.
        displayAiProductCards(data.productIds || []);

    } catch (error) {

        loadingMessage.textContent =
            "Sorry! " + error.message;

        loadingMessage.classList.remove("typing-message");

        console.error("AI Assistant Error:", error);

    } finally {

        sendAiMessageButton.disabled = false;
        sendAiMessageButton.textContent = "Send";

        chatMessages.scrollTop = chatMessages.scrollHeight;

        aiMessageInput.focus();
    }
}

// SEND BUTTON
sendAiMessageButton.addEventListener(
    "click",
    sendAiMessage
);

// ENTER KEY
aiMessageInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        sendAiMessage();
    }
});

// ======================================
// MINIMIZE CHAT
// ======================================

minimizeAiChatButton.addEventListener("click", function() {

    aiChatWindow.classList.remove("is-maximized");
    aiChatWindow.classList.toggle("is-minimized");

    maximizeAiChatButton.textContent = "□";
    maximizeAiChatButton.title = "Maximize";
});

// ======================================
// MAXIMIZE CHAT
// ======================================

maximizeAiChatButton.addEventListener("click", function() {

    aiChatWindow.classList.remove("is-minimized");

    const isMaximized =
        aiChatWindow.classList.toggle("is-maximized");

    maximizeAiChatButton.textContent =
        isMaximized ? "❐" : "□";

    maximizeAiChatButton.title =
        isMaximized ? "Restore size" : "Maximize";
});

// ======================================
// INITIALIZE AI CHAT
// ======================================

restoreAiChat();

loadAiProductCatalog();