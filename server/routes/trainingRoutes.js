const express = require("express");
const router = express.Router();

const {
  createTraining,
  getAllTrainings,
  getMyTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
} = require("../controllers/trainingController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");


router.use(authMiddleware);


router.get("/my", getMyTrainings);
router.get("/", authorizeRoles("HR", "Manager"), getAllTrainings);
router.post("/", authorizeRoles("HR", "Manager"), createTraining);
router.get("/:id", getTrainingById);
router.put("/:id", authorizeRoles("HR", "Manager"), updateTraining);
router.delete("/:id", authorizeRoles("HR", "Manager"), deleteTraining);

module.exports = router;