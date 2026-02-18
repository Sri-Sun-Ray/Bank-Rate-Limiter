const express = require("express");
const rateLimiter = require("./rateLimiter");
const { client } = require("./redisClient");

const app = express();

// Global metrics
global.metrics = {
    total: 0,
    blocked: 0
};

app.use(express.json());

// Count total requests
app.use((req, res, next) => {
    global.metrics.total++;
    next();
});

// Apply rate limiter
app.use(rateLimiter);

// Serve static dashboard
app.use(express.static("public"));

app.get("/balance", (req, res) => {
    res.json({ balance: 10000 });
});

app.post("/transfer", (req, res) => {
    res.json({ status: "Transfer Successful" });
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {

    const keys = await client.keys("violations:*");

    let violations = {};

    for (let key of keys) {
        const user = key.split(":")[1];
        const count = await client.get(key);
        violations[user] = parseInt(count);
    }

    res.json({
        totalRequests: global.metrics.total,
        blockedRequests: global.metrics.blocked,
        allowedRequests: global.metrics.total - global.metrics.blocked,
        violations
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
