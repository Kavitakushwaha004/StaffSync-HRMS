const Announcement = require("../models/Announcement");

// POST /api/announcements  (HR / Manager)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, department, expiryDate } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      priority,
      department,
      expiryDate,
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/announcements  (all logged-in users)
// Sirf active aur expire na hui announcements, user ke department ya "All" ke hisaab se
const getAnnouncements = async (req, res) => {
  try {
    const filter = {
      isActive: true,
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: new Date() } }],
    };

    // HR / Manager ko sab dikhe, employee ko sirf apne department ki ya "All"
    if (req.user.role === "Employee") {
      filter.department = { $in: ["All", req.user.department] };
    }

    const announcements = await Announcement.find(filter)
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/announcements/:id
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "postedBy",
      "name role"
    );

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/announcements/:id  (HR / Manager)
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/announcements/:id  (HR / Manager)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};