const redis = require("redis");

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: 6379
    }
});

client.on("error", (err) => {
    console.error("Redis Client Error", err);
});

async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
        console.log("Connected to Redis");
    }
}

module.exports = { client, connectRedis };
