const { Queue } = require("bullmq");

const reservationQueue = new Queue("reservation-queue", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
  },
});

module.exports = reservationQueue;
