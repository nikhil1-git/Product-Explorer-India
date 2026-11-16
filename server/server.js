const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

console.log("GROQ API KEY STATUS:", !!process.env.GROQ_API_KEY);

// ==========================================
// AI SHOPPING ASSISTANT INSTRUCTIONS
// ==========================================

const SYSTEM_PROMPT = `
You are the AI Shopping Assistant for Product Explorer India.

CONVERSATION RULES:
1. Read the complete conversation history.
2. Remember the customer's budget, product type, purpose and preferences.
3. Never ask again for information already provided.
4. Understand short answers such as yes, no, Windows, cheaper and more.
5. Ask only ONE question at a time if essential information is missing.
6. Do not restart the conversation or repeat greetings.
7. Preserve earlier requirements unless the customer changes them.

SHOPPING RULES:
1. Use Indian Rupees (₹).
2. Recommend products only from the supplied product catalogue.
3. Never invent product names, prices, IDs, stock or specifications.
4. Do not claim that a product has Windows, HDD, SSD, a particular screen size or other specification unless the catalogue explicitly states it.
5. If a requested specification is not available, clearly say it is not specified.
6. If no supplied products match, say so honestly.
7. Keep recommendations friendly, simple and concise.

PRODUCT ID RULES:
1. Every recommended product must have an ID from the supplied catalogue.
2. Do not invent or guess product IDs.
3. Return no more than 4 product IDs.
4. Return the IDs in this exact format on the final line:

PRODUCT_IDS: [1, 2]

5. If no products are suitable, return:

PRODUCT_IDS: []

The PRODUCT_IDS line is for the website and must always be included.
Do not show this technical line as part of your normal customer-facing reply.
`;

// ==========================================
// CHAT API
// ==========================================

app.post("/api/chat", async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Groq API key is missing. Check server/.env."
            });
        }

        const messages = req.body.messages;
        const products = req.body.products;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Please provide conversation messages."
            });
        }

        const conversation = messages
            .filter(message =>
                message &&
                ["user", "assistant"].includes(message.role) &&
                typeof message.content === "string" &&
                message.content.trim()
            )
            .slice(-16)
            .map(message => ({
                role: message.role,
                content: message.content.trim().slice(0, 3000)
            }));

        if (
            conversation.length === 0 ||
            conversation[conversation.length - 1].role !== "user"
        ) {
            return res.status(400).json({
                error: "A customer message is required."
            });
        }

        // Accept only a limited, clean product catalogue.
        const safeProducts = Array.isArray(products)
            ? products.slice(0, 30).map(product => ({
                id: Number(product.id),
                title: String(product.title || "").slice(0, 150),
                description: String(product.description || "").slice(0, 500),
                category: String(product.category || "").slice(0, 80),
                brand: String(product.brand || "").slice(0, 80),
                priceINR: Number(product.priceINR),
                rating: Number(product.rating),
                stock: Number(product.stock),
                availabilityStatus: String(
                    product.availabilityStatus || ""
                ).slice(0, 80)
            })).filter(product =>
                Number.isInteger(product.id) &&
                Number.isFinite(product.priceINR)
            )
            : [];

        const catalogueMessage = `
WEBSITE PRODUCT CATALOGUE:
The following are the only products you may recommend.
Prices shown are the website's converted INR prices.

${JSON.stringify(safeProducts, null, 2)}

Only recommend products from this list.
Use their exact IDs in the PRODUCT_IDS line.
`;

        console.log("New chat request received.");
        console.log("Conversation messages:", conversation.length);
        console.log("Products supplied:", safeProducts.length);
        console.log("Customer:", conversation[conversation.length - 1].content);

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: [
                        {
                            role: "system",
                            content: SYSTEM_PROMPT
                        },
                        {
                            role: "system",
                            content: catalogueMessage
                        },
                        ...conversation
                    ],
                    temperature: 0.2,
                    max_tokens: 900
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API error:", data);

            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    "Groq AI service is currently unavailable."
            });
        }

        const aiText = data.choices?.[0]?.message?.content;

        if (!aiText) {
            return res.status(500).json({
                error: "AI returned an empty response."
            });
        }

        // Extract product IDs from the AI response.
        const idMatch = aiText.match(/PRODUCT_IDS:\s*\[([^\]]*)\]/i);

        let productIds = [];

        if (idMatch) {
            productIds = idMatch[1]
                .split(",")
                .map(value => Number(value.trim()))
                .filter(id =>
                    Number.isInteger(id) &&
                    safeProducts.some(product => product.id === id)
                );

            productIds = [...new Set(productIds)].slice(0, 4);
        }

        // Remove the technical product ID line from the customer reply.
        const reply = aiText
            .replace(/PRODUCT_IDS:\s*\[[^\]]*\]/i, "")
            .trim();

        console.log("AI response generated.");
        console.log("Validated product IDs:", productIds);

        return res.status(200).json({
            success: true,
            reply,
            productIds
        });

    } catch (error) {
        console.error("Chat server error:", error);

        return res.status(500).json({
            error: error.message ||
                "Unable to connect to AI. Please try again."
        });
    }
});

// ==========================================
// SERVER HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
    res.status(200).send(
        "Product Explorer India AI Server is running!"
    );
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log("Product Explorer AI Server Started");
    console.log("Port:", PORT);
    console.log("Groq Model: openai/gpt-oss-120b");
    console.log("API Key Loaded:", !!process.env.GROQ_API_KEY);
    console.log(`URL: http://localhost:${PORT}`);
    console.log("----------------------------------");
});