const express = require("express");

const {
  getPublicProducts,
  getPublicProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  softDeleteProduct,
} = require("../controllers/productController");

const {
  authMiddleware,
  requireRole,
} = require("../middleware/authMiddleware");

const uploadProductImages = require("../middleware/upload");

const router = express.Router();

// Public website catalogue.
router.get("/", getPublicProducts);
router.get("/:slug", getPublicProductBySlug);

// Protected CRM catalogue.
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("admin", "staff"),
  getAdminProducts
);

// Create product with image uploads.
router.post(
  "/",
  authMiddleware,
  requireRole("admin", "staff"),
  uploadProductImages,
  createProduct
);

// Update product with optional new image uploads.
router.patch(
  "/:id",
  authMiddleware,
  requireRole("admin", "staff"),
  uploadProductImages,
  updateProduct
);

// Product status.
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("admin", "staff"),
  updateProductStatus
);

// Soft delete.
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin", "staff"),
  softDeleteProduct
);

module.exports = router;