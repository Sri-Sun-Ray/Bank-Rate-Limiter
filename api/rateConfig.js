module.exports = {
    "/balance": {
        maxTokens: 100,
        refillRate: 5
    },
    "/transfer": {
        maxTokens: 5,
        refillRate: 0.2
    },
    "/login": {
        maxTokens: 5,
        refillRate: 0
    },
    default: {
        maxTokens: 20,
        refillRate: 1
    }
};
