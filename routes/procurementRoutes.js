const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Procurement = require("../models/Procurement");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Procurement
 *   description: Procurement management (Managers only)
 */

/**
 * @swagger
 * /procurement:
 *   post:
 *     summary: Record new produce bought by KGL
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               produceName:
 *                 type: string
 *               produceType:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *               tonnage:
 *                 type: number
 *                 minimum: 100
 *               cost:
 *                 type: number
 *                 minimum: 10000
 *               dealerName:
 *                 type: string
 *               branch:
 *                 type: string
 *                 enum: [Maganjo, Matugga]
 *               contact:
 *                 type: string
 *               sellingPrice:
 *                 type: number
 *     responses:
 *       "201":
 *         description: Procurement record created successfully
 *       "400":
 *         description: Bad request due to validation error
 *       "401":
 *         description: Unauthorized, token is missing or invalid
 *       "403":
 *         description: Forbidden, user is not a manager
 */
router.post(
  "/",
  auth,
  role("manager"),
  [
    body("produceName").matches(/^[a-zA-Z0-9\s]+$/).withMessage("Name of produce must be alpha-numeric"),
    body("produceType").matches(/^[A-Za-z\s]+$/).withMessage("Type of produce must be alphabetic characters only").isLength({ min: 2 }).withMessage("Type of produce must be at least 2 characters"),
    body("date").isISO8601().withMessage("Date cannot be empty"),
    body("time").notEmpty().withMessage("Time cannot be empty"),
    body("tonnage").isNumeric().withMessage("Tonnage must be a number").isInt({ min: 100 }).withMessage("Tonnage must be at least 100"),
    body("cost").isNumeric().withMessage("Cost must be a number").isInt({ min: 10000 }).withMessage("Cost must be at least 10000"),
    body("dealerName").matches(/^[a-zA-Z0-9\s]+$/).withMessage("Dealer Name must be alpha-numeric").isLength({ min: 2 }).withMessage("Dealer Name must be at least 2 characters"),
    body("branch").isIn(["Maganjo", "Matugga"]).withMessage("Branch must be either Maganjo or Matugga"),
    body("contact").isMobilePhone('any').withMessage("Contact must be a valid phone number"),
    body("sellingPrice").isNumeric().withMessage("Selling Price must be a number")
  .isInt({ min: 10000 }).withMessage("Selling Price must be at least 10000")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const procurement = new Procurement(req.body);
      await procurement.save();
      res.status(201).json(procurement);
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((error) => ({
          msg: error.message,
          path: error.path,
          value: error.value,
          location: "body",
          type: "field",
        }));
        return res.status(400).json({ errors });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = router;
