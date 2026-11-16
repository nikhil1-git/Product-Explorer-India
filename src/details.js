
const API_URL = "https://dummyjson.com/products";

// CURRENCY CONVERSION
const USD_TO_INR = 93.86;

// FORMAT PRICE IN INDIAN RUPEES
const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

// CONVERT USD TO INR
function formatINR(usdPrice) {

    const inrPrice = usdPrice * USD_TO_INR;

    return currencyFormatter.format(inrPrice);
}

// HTML ELEMENTS
const productDetails =
    document.getElementById("productDetails");

const detailsMessage =
    document.getElementById("detailsMessage");

// CHECK HTML ELEMENTS
if (!productDetails || !detailsMessage) {

    throw new Error(
        "Product details HTML elements are missing."
    );
}

console.log("Details JavaScript connected!");

// GET PRODUCT ID FROM URL
const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

// GET PRODUCT DETAILS
async function getProductDetails() {

    try {

        detailsMessage.textContent =
            "Loading product details...";

        if (!productId) {
            throw new Error("Product ID is missing from URL.");
        }

        // FETCH PRODUCT FROM API
        const response = await fetch(`${API_URL}/${productId}`);

        if (!response.ok) {
            throw new Error("Product not found.");
        }

        // CONVERT RESPONSE TO JSON
        const product = await response.json();

        console.log("Product received:", product);

        // DISPLAY PRODUCT
        displayProductDetails(product);

    } catch (error) {

        detailsMessage.textContent =
            "Error: " + error.message;

        console.error("Details Error:", error);

    }
}

// DISPLAY PRODUCT DETAILS
function displayProductDetails(product) {

    detailsMessage.textContent = "";

    productDetails.innerHTML = `
        <div class="details-card">

            <img
                src="${product.thumbnail}"
                alt="${product.title}"
                class="details-image"
            >

            <div class="details-info">

                <h2>${product.title}</h2>

                <p>${product.description}</p>

                <h3>
                    Price: ${formatINR(product.price)}
                </h3>

                <p>
                    Discount: ${product.discountPercentage}%
                </p>

                <p>
                    Rating: ${product.rating} ⭐
                </p>

                <p>
                    Stock Available: ${product.stock}
                </p>

                <p>
                    Brand: ${product.brand || "Not available"}
                </p>

                <p>
                    Category: ${product.category}
                </p>

                <p>
                    <strong>Currency: Indian Rupee (INR)</strong>
                </p>

            </div>

        </div>
    `;
}

// START APPLICATION
getProductDetails();
