const reservationService = require("../services/reservation.service");

exports.reserve = async (req, res) => {
  try {
    const reservation = await reservationService.reserveProduct({
      productId: req.params.productId,
      userId: req.user.id,
    });

    res.status(201).json(reservation);
  } catch (err) {
    if (err.message === "Out of stock") {
      return res.status(409).json({ message: err.message });
    }

    res.status(500).json({ message: "Reservation failed" });
  }
};

exports.confirm = async (req, res) => {
  try {
    const reservation = await reservationService.confirmPurchase({
      reservationId: req.params.reservationId,
      userId: req.user.id,
    });

    res.json({
      message: "Purchase confirmed",
      reservation,
    });
  } catch (err) {
    if (err.message === "Reservation not found") {
      return res.status(404).json({ message: err.message });
    }

    if (err.message === "Reservation expired") {
      return res.status(409).json({ message: err.message });
    }

    res.status(500).json({ message: "Checkout failed" });
  }
};
