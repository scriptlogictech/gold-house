
const express = require("express");

const {
  getInvoices,
  getInvoiceById,
  previewInvoiceImport,
  confirmInvoiceImport,
  getImportJob,
} = require("../controllers/invoiceController");

const {
  postInvoice,
  addPayment,
  getPayments,
  addReturn,
  getReturns,
  addRefund,
  approveRefund,
  rejectRefund,
  cancelInvoice,
} = require("../controllers/paymentController");

const {
  authMiddleware,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All invoice and financial routes require authentication.
router.use(authMiddleware);

// Admin and staff can access invoice operations.
router.use(requireRole("admin", "staff"));

// -------------------- INVOICE LIST & IMPORT --------------------

router.get("/", getInvoices);

router.post("/import/preview", previewInvoiceImport);
router.post("/import/:jobId/confirm", confirmInvoiceImport);
router.get("/imports/:jobId", getImportJob);

// -------------------- INVOICE LIFECYCLE --------------------

router.post("/:id/post", postInvoice);
router.post("/:id/cancel", cancelInvoice);

// -------------------- PAYMENT MANAGEMENT --------------------

router.post("/:id/payments", addPayment);
router.get("/:id/payments", getPayments);

// -------------------- RETURNS --------------------

router.post("/:id/returns", addReturn);
router.get("/:id/returns", getReturns);

// -------------------- REFUND MANAGEMENT --------------------

// Staff can submit refund requests.
router.post("/:id/refunds", addRefund);

// Only admins can approve or reject pending refunds.
// The controller also verifies the admin role.
router.post(
  "/:id/refunds/:refundId/approve",
  requireRole("admin"),
  approveRefund
);

router.post(
  "/:id/refunds/:refundId/reject",
  requireRole("admin"),
  rejectRefund
);

// Keep the generic invoice detail route last.
router.get("/:id", getInvoiceById);

module.exports = router;
