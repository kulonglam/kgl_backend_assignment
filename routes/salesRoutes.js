const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Sale = require("../models/Sale");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales transaction management
 */

/**
 * @swagger
 * /sales/cash:
 *   post:
 *     summary: Record a new cash sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - produceName
 *               - tonnage
 *               - amountPaid
 *               - buyerName
 *               - salesAgentName
 *               - date
 *               - time
 *             properties:
 *               produceName:
 *                 type: string
 *               tonnage:
 *                 type: number
 *               amountPaid:
 *                 type: number
 *                 minimum: 10000
 *               buyerName:
 *                 type: string
 *               salesAgentName:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale recorded successfully
 *       400:
 *         description: Validation error
 */
router.post("/cash", auth, role("SalesAgent"),
  [
    body("produceName").isAlphanumeric().withMessage("Produce Name must be alpha-numeric"),
    body("tonnage").isNumeric().withMessage("Tonnage must be a number").isInt({ min: 100 }).withMessage("Tonnage must be at least 100"),
    body("amountPaid").isNumeric().withMessage("Amount Paid must be a number").isInt({ min: 10000 }).withMessage("Amount Paid must be at least 10000"),
    body("buyerName").isAlphanumeric().withMessage("Buyer Name must be alpha-numeric").isLength({ min: 2 }).withMessage("Buyer Name must be at least 2 characters"),
    body("salesAgentName").isAlphanumeric().withMessage("Sales Agent Name must be alpha-numeric").isLength({ min: 2 }).withMessage("Sales Agent Name must be at least 2 characters"),
    body("date").notEmpty().withMessage("Date cannot be empty"),
    body("time").notEmpty().withMessage("Time cannot be empty")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const sale = new Sale({ ...req.body, type: "Cash" });
    await sale.save();
    res.status(201).json(sale);
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
});

/**
 * @swagger
 * /sales/credit:
 *   post:
 *     summary: Record a new credit/deferred sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - buyerName
 *               - nin
 *               - location
 *               - contact
 *               - amountDue
 *               - salesAgentName
 *               - dueDate
 *               - produceName
 *               - produceType
 *               - tonnage
 *               - dispatchDate
 *             properties:
 *               buyerName:
 *                 type: string
 *               nin:
 *                 type: string
 *               location:
 *                 type: string
 *               contact:
 *                 type: string
 *               amountDue:
 *                 type: number
 *                 minimum: 10000
 *               salesAgentName:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               produceName:
 *                 type: string
 *               produceType:
 *                 type: string
 *               tonnage:
 *                 type: number
 *               dispatchDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Credit sale recorded successfully
 *       400:
 *         description: Validation error
 */
router.post("/credit", auth, role("SalesAgent"),
  [
    body("buyerName").matches(/^[a-zA-Z0-9\s]+$/).withMessage("Buyer Name must be alpha-numeric").isLength({ min: 2 }).withMessage("Buyer Name must be at least 2 characters"),
    body("nin").isAlphanumeric().withMessage("NIN must be alpha-numeric").isLength({ min: 13 }).withMessage("NIN must be at least 13 characters"),
    body("location").matches(/^[a-zA-Z0-9\s]+$/).withMessage("Location must be alpha-numeric").isLength({ min: 2 }).withMessage("Location must be at least 2 characters"),
    body("contact").isMobilePhone('any').withMessage("Contact must be a valid phone number"),
    body("amountDue").isNumeric().withMessage("Amount Due must be a number").isInt({ min: 10000 }).withMessage("Amount Due must be at least 10000"),
    body("salesAgentName").matches(/^[a-zA-Z0-9\s]+$/).withMessage("Sales Agent Name must be alpha-numeric").isLength({ min: 2 }).withMessage("Sales Agent Name must be at least 2 characters"),
    body("dueDate").notEmpty().withMessage("Due Date cannot be empty"),
    body("produceName").isAlphanumeric().withMessage("Produce Name must be alpha-numeric"),
    body("produceType").isAlpha().withMessage("Produce Type must be alphabetic characters only").isLength({ min: 2 }).withMessage("Produce Type must be at least 2 characters"),
    body("tonnage").isNumeric().withMessage("Tonnage must be a number").isInt({ min: 100 }).withMessage("Tonnage must be at least 100"),
    body("dispatchDate").notEmpty().withMessage("Dispatch Date cannot be empty")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const sale = new Sale({ ...req.body, type: "Credit" });
    await sale.save();
    res.status(201).json(sale);
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
});

module.exports = router;
