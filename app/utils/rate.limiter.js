const Bottleneck = require("bottleneck");

const rateLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000 * 60 * 60 / 200,
});

module.exports = rateLimiter;