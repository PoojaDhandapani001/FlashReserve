const Reservation = require("../models/Reservation");

/**
 * Confirm purchase for a reservation
 * Transitions reservation from PENDING → CONFIRMED
 */
exports.confirmPurchase = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        status: "PENDING",
      },
      { status: "CONFIRMED" },
      { new: true }
    );

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Reservation not found or already processed" });
    }

    res.json({
      message: "Purchase confirmed",
      reservation,
    });
  } catch (err) {
    console.error("Checkout error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
