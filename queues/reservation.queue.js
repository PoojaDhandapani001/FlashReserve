const { Queue } = require("bullmq");

const reservationQueue = new Queue("reservation-queue", {
   connection: {
      url: process.env.REDIS_URL,
      maxRetriesPerRequest: null,
    },
});

module.exports = reservationQueue;
