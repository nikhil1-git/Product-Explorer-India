
const WISHLIST_STORAGE_KEY = "productExplorerWishlist";
const CART_STORAGE_KEY = "productExplorerCart";

const USD_TO_INR = 93.86;

const wishlistContainer = document.getElementById("wishlistContainer");
const wishlistMessage = document.getElementById("wishlistMessage");

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function formatINR(price) {
    return currencyFormatter.format(Number(price) * USD_TO_INR);
}

// GET WISHLIST
function getWishlist() {
    return JSON.parse(
        localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]"
    );
}

// SAVE WISHLIST
function saveWishlist(wishlist) {
    localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlist)
    );
}

// GET CART
function getCart() {
    return JSON.parse(
        localStorage.getItem(CART_STORAGE_KEY) || "[]"
    );
}

// SAVE CART
function saveCart(cart) {
    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );
}

// DISPLAY WISHLIST PRODUCTS
function displayWishlist() {

    const wishlist = getWishlist();

    wishlistContainer.innerHTML = "";

    if (wishlist.length === 0) {
        wishlistMessage.textContent =
            "Your wishlist is empty. Add some favourite products! ❤️";
        return;
    }

    wishlistMessage.textContent =
        `You have ${wishlist.length} favourite product(s).`;

    wishlist.forEach(function(product) {

        const productCard = document.createElement("div");
        productCard.className = "wishlist-product-card";

        const image = document.createElement("img");
        image.src = product.thumbnail;
        image.alt = product.title;

        const title = document.createElement("h3");
        title.textContent = product.title;

        const price = document.createElement("p");
        price.textContent = formatINR(product.price);

        const addButton = document.createElement("button");
        addButton.textContent = "Add to Cart";
        addButton.className = "wishlist-action-button";

        addButton.addEventListener("click", function() {
            addToCart(product);
        });

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove ❤️";
        removeButton.className = "wishlist-remove-button";

        removeButton.addEventListener("click", function() {
            removeFromWishlist(product.id);
        });

        productCard.appendChild(image);
        productCard.appendChild(title);
        productCard.appendChild(price);
        productCard.appendChild(addButton);
        productCard.appendChild(removeButton);

        wishlistContainer.appendChild(productCard);
    });
}

// REMOVE PRODUCT FROM WISHLIST
function removeFromWishlist(productId) {

    let wishlist = getWishlist();

    wishlist = wishlist.filter(function(product) {
        return product.id !== productId;
    });

    saveWishlist(wishlist);

    displayWishlist();
}

// ADD WISHLIST PRODUCT TO CART
function addToCart(product) {

    let cart = getCart();

    const existingProduct = cart.find(function(item) {
        return item.id === product.id;
    });

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

    saveCart(cart);

    alert("Product added to cart successfully!");
}

// INITIAL DISPLAY
displayWishlist();
