const router = require("express").Router();
const controller = require("../controllers/reservation.controller");
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Product reservation and checkout APIs
 */

/**
 * @swagger
 * /reservations/{productId}:
 *   post:
 *     summary: Reserve a product for 10 minutes
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6982444244357acf21f63890
 *     responses:
 *       201:
 *         description: Product reserved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservationId:
 *                   type: string
 *                   example: 698247c7200fdac64365c8dc
 *                 productId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: PENDING
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Product out of stock
 *       401:
 *         description: Unauthorized
 */
router.post("/:productId", auth, controller.reserve);

/**
 * @swagger
 * /reservations/confirm/{reservationId}:
 *   post:
 *     summary: Confirm purchase for a reserved product
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *         example: 698247c7200fdac64365c8dc
 *     responses:
 *       200:
 *         description: Purchase confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Purchase confirmed
 *                 reservationId:
 *                   type: string
 *       400:
 *         description: Reservation expired or invalid
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/confirm/:reservationId",
  auth,
  controller.confirm
);

module.exports = router;
