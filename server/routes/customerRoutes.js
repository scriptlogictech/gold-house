
const express = require("express");

const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
} = require("../controllers/customerController");

const {
  authMiddleware,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All customer routes require an authenticated admin or staff member.
router.use(authMiddleware);
router.use(requireRole("admin", "staff"));

// GET /api/v1/customers
// Search, filter, and paginate customers.
router.get("/", getCustomers);

// POST /api/v1/customers
// Create a customer.
router.post("/", createCustomer);

// GET /api/v1/customers/:id
// Get one customer.
router.get("/:id", getCustomerById);

// PATCH /api/v1/customers/:id
// Update customer details.
router.patch("/:id", updateCustomer);

// PATCH /api/v1/customers/:id/status
// Activate or deactivate a customer.
router.patch("/:id/status", updateCustomerStatus);

module.exports = router;
