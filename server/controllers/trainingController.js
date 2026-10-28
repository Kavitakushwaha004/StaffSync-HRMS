const Training = require("../models/Training");

// POST /api/trainings  (HR / Manager)
const createTraining = async (req, res) => {
  try {
    const { title, description, date, trainer, assignedTo } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "Title, description and date are required",
      });
    }

    const training = await Training.create({
      title,
      description,
      date,
      trainer,
      assignedTo,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/trainings  (HR / Manager: all trainings)
const getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate("createdBy", "name role")
      .populate("assignedTo", "name email department")
      .sort({ date: -1 });

    res.json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/trainings/my  (logged-in user ko assign hui trainings)
const getMyTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({ assignedTo: req.user._id })
      .populate("createdBy", "name role")
      .sort({ date: -1 });

    res.json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/trainings/:id
const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate("createdBy", "name role")
      .populate("assignedTo", "name email department");

    if (!training) {
      return res
        .status(404)
        .json({ success: false, message: "Training not found" });
    }

    // Employee sirf wahi training dekh sakta hai jo usko assign hui ho
    const isPrivileged = ["HR", "Manager"].includes(req.user.role);
    const isAssigned = training.assignedTo.some(
      (u) => u._id.toString() === req.user._id.toString()
    );
    if (!isPrivileged && !isAssigned) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/trainings/:id  (HR / Manager)
const updateTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!training) {
      return res
        .status(404)
        .json({ success: false, message: "Training not found" });
    }

    res.json({ success: true, training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/trainings/:id  (HR / Manager)
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);

    if (!training) {
      return res
        .status(404)
        .json({ success: false, message: "Training not found" });
    }

    res.json({ success: true, message: "Training deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTraining,
  getAllTrainings,
  getMyTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
};