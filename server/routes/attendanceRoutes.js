const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getEmployeeAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendenceController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/check-in", checkIn);
router.put("/check-out", checkOut);
router.get("/my", getMyAttendance);

router.get("/", authorizeRoles("HR", "Manager"), getAllAttendance);
router.get(
  "/employee/:employeeId",
  authorizeRoles("HR", "Manager"),
  getEmployeeAttendance
);

router.post("/", authorizeRoles("HR"), markAttendance);
router.put("/:id", authorizeRoles("HR"), updateAttendance);
router.delete("/:id", authorizeRoles("HR"), deleteAttendance);

module.exports = router;