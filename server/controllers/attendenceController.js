const Attendance = require("../models/Attendence");
const Employee = require("../models/Employee");

// Helper: date ko din ki shuruaat (00:00) par set karta hai
const startOfDay = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Helper: logged-in user ka Employee record dhundta hai
const getEmployeeOfUser = (userId) => Employee.findOne({ user: userId });

// POST /api/attendance/check-in  (logged-in employee)
const checkIn = async (req, res) => {
  try {
    const employee = await getEmployeeOfUser(req.user._id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee record not found for this user" });
    }

    const today = startOfDay();
    const existing = await Attendance.findOne({ employee: employee._id, date: today });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      checkIn: new Date(),
      status: "Present",
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/attendance/check-out  (logged-in employee)
const checkOut = async (req, res) => {
  try {
    const employee = await getEmployeeOfUser(req.user._id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee record not found for this user" });
    }

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: startOfDay(),
    });

    if (!attendance || !attendance.checkIn) {
      return res
        .status(400)
        .json({ success: false, message: "You have not checked in today" });
    }
    if (attendance.checkOut) {
      return res
        .status(400)
        .json({ success: false, message: "Already checked out today" });
    }

    attendance.checkOut = new Date();
    const hours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workingHours = Number(hours.toFixed(2));
    if (attendance.workingHours < 4) {
      attendance.status = "Half Day";
    }

    await attendance.save();
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/my  (logged-in employee ki apni attendance)
const getMyAttendance = async (req, res) => {
  try {
    const employee = await getEmployeeOfUser(req.user._id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee record not found for this user" });
    }

    const records = await Attendance.find({ employee: employee._id }).sort({
      date: -1,
    });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance  (HR / Manager) - optional ?date=2026-10-28
const getAllAttendance = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) {
      const start = startOfDay(req.query.date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(filter)
      .populate("employee", "name employeeId department")
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/employee/:employeeId  (HR / Manager)
const getEmployeeAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({
      employee: req.params.employeeId,
    }).sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance  (HR manual entry)
const markAttendance = async (req, res) => {
  try {
    const { employee, date, status, checkIn, checkOut, workingHours, remarks } =
      req.body;

    if (!employee || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Employee and date are required" });
    }

    const attendance = await Attendance.create({
      employee,
      date: startOfDay(date),
      status,
      checkIn,
      checkOut,
      workingHours,
      remarks,
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Attendance already exists for this employee on this date",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/attendance/:id  (HR)
const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/attendance/:id  (HR)
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }
    res.json({ success: true, message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getEmployeeAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
};