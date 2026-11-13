
const express = require("express");

const {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
} = require("../controllers/familyController");

const {
  authMiddleware,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All family routes require an authenticated admin or staff member.
router.use(authMiddleware);
router.use(requireRole("admin", "staff"));

router.get("/", getFamilies);
router.post("/", createFamily);
router.get("/:id", getFamilyById);
router.put("/:id", updateFamily);

module.exports = router;
