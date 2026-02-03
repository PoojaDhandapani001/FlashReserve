const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const checkoutController = require("../controllers/checkout.controller");

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Purchase confirmation APIs
 */

/**
 * @swagger
 * /checkout/{id}:
 *   post:
 *     summary: Confirm purchase for a reservation
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Reservation ID
 *         schema:
 *           type: string
 *           example: 66c1e8f9a9b7a1d123456789
 *     responses:
 *       200:
 *         description: Purchase confirmed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 */
router.post("/:id", auth, checkoutController.confirmPurchase);

module.exports = router;
