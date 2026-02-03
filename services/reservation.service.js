const Product = require("../models/Product");
const Reservation = require("../models/Reservation");
const reservationQueue = require("../queues/reservation.queue");

async function reserveProduct({ productId, userId }) {
  // 🔒 Atomic stock decrement (race-condition safe)
  const product = await Product.findOneAndUpdate(
    { _id: productId, stockQuantity: { $gt: 0 } },
    { $inc: { stockQuantity: -1 } },
    { new: true }
  );


  if (!product) {
    throw new Error("Out of stock");
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const reservation = await Reservation.create({
    productId,
    userId,
    expiresAt,
  });

  // ⏳ Schedule expiry job
  await reservationQueue.add(
    "expire-reservation",
    { reservationId: reservation._id },
    { delay: 10 * 60 * 1000 }
  );
// console.log('⏳ Expiry job scheduled for', reservation._id);
//   await reservationQueue.add(
//     "expire-reservation",
//     { reservationId: reservation._id },
//     { delay: 10 * 1000 }
//   );


  return reservation;
}

async function confirmPurchase({ reservationId, userId }) {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    userId,
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (reservation.status === "CONFIRMED") {
    return reservation; // idempotent success
  }

  if (
    reservation.status === "EXPIRED" ||
    reservation.expiresAt < new Date()
  ) {
    throw new Error("Reservation expired");
  }

  reservation.status = "CONFIRMED";
  await reservation.save();

  return reservation;
}

module.exports = {
  reserveProduct,
  confirmPurchase,
};

