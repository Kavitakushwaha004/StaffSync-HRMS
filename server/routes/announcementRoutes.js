const express = require("express");
const router = express.Router();

const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");


router.use(authMiddleware);


router.get("/", getAnnouncements);
router.get("/:id", getAnnouncementById);


router.post("/", authorizeRoles("HR", "Manager"), createAnnouncement);
router.put("/:id", authorizeRoles("HR", "Manager"), updateAnnouncement);
router.delete("/:id", authorizeRoles("HR", "Manager"), deleteAnnouncement);

module.exports = router;