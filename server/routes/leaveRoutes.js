const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  cancelLeave,
} = require("../controllers/leaveController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", applyLeave);
router.get("/my", getMyLeaves);
router.get("/", authorizeRoles("HR", "Manager"), getAllLeaves);
router.get("/:id", getLeaveById);
router.put("/:id/status", authorizeRoles("HR", "Manager"), updateLeaveStatus);
router.delete("/:id", cancelLeave);

module.exports = router;