require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Product = require("../models/Product");

console.log("🚀 Reservation worker starting...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Worker MongoDB connected"))
  .catch(err => {
    console.error("🔴 Worker MongoDB connection failed", err);
    process.exit(1);
  });

const worker = new Worker(
  "reservation-queue",
  async (job) => {
    if (job.name !== "expire-reservation") return;

    const { reservationId } = job.data;

    const reservation = await Reservation.findOneAndUpdate(
      { _id: reservationId, status: "PENDING" },
      { status: "EXPIRED" },
      { new: true }
    );

    if (!reservation) return;

    await Product.findByIdAndUpdate(reservation.productId, {
      $inc: { stockQuantity: 1 },
    });

    console.log(`⏳ Reservation expired: ${reservationId}`);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    },
  }
);

worker.on("ready", () =>
  console.log("✅ Reservation worker ready")
);

worker.on("error", console.error);
