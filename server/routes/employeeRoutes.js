const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", authorizeRoles("HR", "Manager"), getAllEmployees);
router.get("/:id", authorizeRoles("HR", "Manager"), getEmployeeById);
router.post("/", authorizeRoles("HR"), createEmployee);
router.put("/:id", authorizeRoles("HR"), updateEmployee);
router.delete("/:id", authorizeRoles("HR"), deleteEmployee);

module.exports = router;