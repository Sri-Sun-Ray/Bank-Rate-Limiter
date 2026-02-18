const fs = require("fs");
const { client, connectRedis } = require("./redisClient");
const rateConfig = require("./rateConfig");

const script = fs.readFileSync(__dirname + "/tokenBucket.lua", "utf8");
const TTL = 60;

async function rateLimiter(req, res, next) {

    await connectRedis();

    const endpoint = req.path;
    const config = rateConfig[endpoint] || rateConfig.default;

    const MAX_TOKENS = config.maxTokens;
    const REFILL_RATE = config.refillRate;

    let userId = req.headers["x-user-id"] || req.ip;
    userId = userId.replace("::ffff:", "");

    const key = `rate_limit:${userId}:${endpoint}`;
    const now = Math.floor(Date.now() / 1000);

    try {
        const result = await client.eval(script, {
            keys: [String(key)],
            arguments: [
                String(MAX_TOKENS),
                String(REFILL_RATE),
                String(now),
                String(TTL)
            ]
        });

        if (result === 0) {
            // Track violations in Redis
            await client.incr(`violations:${userId}`);

            // Track blocked metrics
            global.metrics.blocked++;

            return res.status(429).json({
                error: "Too many requests"
            });
        }

        next();

    } catch (err) {
        console.error("Rate limiter error:", err);
        res.status(500).json({ error: "Internal error" });
    }
}

module.exports = rateLimiter;
