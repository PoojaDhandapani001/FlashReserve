// redis/app.redis.js
const { Redis } = require("ioredis");

const appRedis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // safe
});

appRedis.on("connect", () => console.log("App Redis connected"));
appRedis.on("error", (e) => console.error("App Redis error", e));



module.exports = appRedis;
