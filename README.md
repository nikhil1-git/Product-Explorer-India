# Product Explorer India IN

**Explore Products. Shop Smarter. Powered by AI.**

Product Explorer India is an interactive e-commerce product browsing application developed using HTML, CSS, and JavaScript. It allows users to explore products, search and filter items, sort products, manage their shopping cart and wishlist, and place demo orders.

The application integrates the **DummyJSON Products API** to retrieve product information and a **Groq-powered AI Shopping Assistant** to provide conversational product recommendations.

---

## 🚀 Project Overview

Product Explorer India demonstrates how APIs and modern JavaScript concepts can be used to build a dynamic shopping application.

The project includes:

- Dynamic product loading from an external API.
- Search, category filtering, sorting, and pagination.
- Product details and shopping cart management.
- Wishlist functionality.
- Demo checkout and order history.
- An AI-powered shopping assistant.

## ✨ Features

### 1. Product Browsing
- Retrieve and display products dynamically using an API.
- Display product images, names, descriptions, prices, and ratings.
- Search products by name.
- Filter products by category.
- Sort products by price and rating.
- Navigate through products using pagination.

### 2. Product Details
- View individual product information.
- Display product images, descriptions, prices, and ratings.
- Navigate between the product listing and details pages.

### 3. Shopping Cart
- Add products to the shopping cart.
- Increase or decrease product quantities.
- Remove individual products.
- Clear the shopping cart.
- Calculate the total price automatically.
- Preserve cart information using browser Local Storage.

### 4. Wishlist
- Add products to the wishlist.
- Remove products from the wishlist.
- Preserve wishlist information after refreshing the page.

### 5. Checkout and Order History
- Display the order summary.
- Calculate the total order amount.
- Place demo orders.
- Display order confirmation and order number.
- Save order information using Local Storage.
- View previously placed orders.

### 6. AI Shopping Assistant
- Interact with an AI-powered shopping assistant.
- Ask questions using natural language.
- Receive product recommendations.
- Ask follow-up questions using conversation history.
- Get recommendations based on the website's product catalogue.
- View recommended product details.
- Add recommended products to the cart or use Buy Now.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Creates the website structure |
| CSS3 | Provides styling and responsive design |
| JavaScript | Implements website functionality |
| REST API | Defines how the application communicates with API services |
| Fetch API | Sends HTTP requests and retrieves API responses |
| Promises | Handle asynchronous operations |
| Async/Await | Makes asynchronous JavaScript easier to read |
| JSON | Exchanges structured data between applications |
| DummyJSON API | Provides sample product information |
| Node.js | Runs the backend JavaScript application |
| Express.js | Creates and manages the backend server |
| Groq API | Generates AI shopping assistant responses |
| Local Storage | Preserves cart, wishlist, orders, and chat history |

---

## 🔗 API Integration

This project integrates two main external APIs.

### 1. DummyJSON Products API

**API URL:** https://dummyjson.com/products

**Purpose:** Retrieves sample product information from an external API.

The application uses this API to obtain:
- Product names
- Product descriptions
- Product images
- Product prices
- Product categories
- Product ratings

**Example API endpoints:**

| Endpoint | Purpose |
|---|---|
| `/products` | Retrieves all products |
| `/products/1` | Retrieves a specific product |
| `/products/search?q=phone` | Searches for products |
| `/products/categories` | Retrieves product categories |
| `/products/category/smartphones` | Retrieves products from a category |
| `/products?limit=10&skip=0` | Retrieves products with pagination |

### 2. Groq API

**Purpose:** Powers the AI Shopping Assistant.

The frontend sends the user's message to the application's Node.js and Express backend. The backend communicates with the Groq API and returns the AI-generated response.

The assistant can help users:
- Find suitable products.
- Understand product features.
- Get shopping recommendations.
- Ask follow-up questions.

**Important:** The Groq API key is stored in the backend environment file. It should never be exposed in frontend JavaScript.

---

## 🔄 Application Workflow

The application works through the following process:

1. The user opens Product Explorer India.
2. JavaScript sends a Fetch API request to DummyJSON.
3. DummyJSON returns product information in JSON format.
4. JavaScript processes the response and displays product cards.
5. Users search, filter, sort, and explore products.
6. Cart, wishlist, and order information are stored in Local Storage.
7. When users chat with the AI assistant, the frontend sends a request to the Express backend.
8. The backend communicates with Groq and returns the AI response.
9. The chatbot displays the response to the user.

**Application communication:**

`User → Frontend → DummyJSON API → Product Display`

`User → AI Chatbot → Express Backend → Groq API → AI Response`

---

## 📁 Project Structure

```text
JavaScript-API-Development/
│
├── index.html
├── style.css
├── script.js
│
├── product-details.html
├── order-history.html
│
├── checkout.html
├── checkout.js
│
├── wishlist.html
├── wishlist.js
│
├── package.json
├── package-lock.json
├── .gitignore
│
└── server/
    ├── server.js
    └── .env
```

**Note:** The checkout and wishlist filenames above are suggested entries for separate files. Keep them in this structure only if those files exist in your actual project. If their functionality is included in `script.js` or another existing file, document that actual structure instead.

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js (version 18 or later recommended)
- npm
- IntelliJ IDEA or another code editor
- Internet connection
- Groq API key

### Step 1: Open the project

Open the `JavaScript-API-Development` project folder in IntelliJ IDEA or your preferred code editor.

### Step 2: Install backend dependencies

Open the terminal in the main project folder.

If you do not already have a `package.json` file, initialize the Node.js project:

```bash
npm init -y
```

Install the required dependencies:

```bash
npm install express cors dotenv
```

### Step 3: Configure the Groq API key

Create a file named `.env` inside the `server` folder.

Add your API key:

```env
GROQ_API_KEY=your_groq_api_key
```

Replace the example value with your actual Groq API key.

**Security:** Never upload your actual `.env` file or API key to GitHub.

### Step 4: Start the backend server

Run this command from the main project folder:

```bash
node server/server.js
```

The backend server should start at:

```text
http://localhost:3000
```

### Step 5: Open the website

Open `index.html` using IntelliJ's browser preview or a local development server.

Make sure the backend server is running when using the AI Shopping Assistant.

---

## 💾 Local Storage

The application uses browser Local Storage to preserve user information.

| Local Storage Key | Purpose |
|---|---|
| `productExplorerCart` | Stores shopping cart information |
| `productExplorerWishlist` | Stores wishlist information |
| `productExplorerOrders` | Stores order history |
| `productExplorerAiChatHistory` | Stores chatbot conversation history |

Local Storage allows this information to remain available after refreshing the browser, as long as the stored data is not cleared.

---

## 🎯 Learning Outcomes

Through this project, I learned:

- How REST APIs work in a JavaScript application.
- How to retrieve data using the Fetch API.
- How to handle asynchronous operations using Promises.
- How to use Async/Await.
- How to process JSON responses.
- How to dynamically display API data.
- How to implement search, filtering, sorting, and pagination.
- How to use browser Local Storage.
- How to develop a backend using Node.js and Express.js.
- How to integrate an AI API into a JavaScript application.
- How frontend and backend applications communicate.
- How to build an interactive shopping application.

---

## ⚠️ Project Notes

- Product information is retrieved from DummyJSON, which provides sample product data.
- INR prices are converted for display using the conversion rate configured in the project.
- Checkout is a demonstration feature and does not process real payments.
- Cart, wishlist, and order information are stored locally in the browser.
- Groq API access requires a valid API key and an available API service.
- Product availability and specifications should be verified before making a real purchase.

---

## 👨‍💻 Project Information

**Project Name:** Product Explorer

**Project Type:** JavaScript API Development

**Developer:** Nikhil Thangedipalli

**Frontend:** HTML, CSS, JavaScript

**Backend:** Node.js, Express.js

**External APIs:** DummyJSON Products API, Groq API

---

*🇮🇳 Product Explorer India — Explore Products. Shop Smarter. Powered by AI.*