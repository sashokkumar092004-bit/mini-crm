const express = require('express');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalLeads,
      qualifiedLeads,
      tasksDueToday,
      completedTasks,
      leadsByStatus,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'Qualified' }),
      Task.countDocuments({ dueDate: { $gte: today, $lt: tomorrow }, status: { $ne: 'Completed' } }),
      Task.countDocuments({ status: 'Completed' }),
      Lead.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      totalLeads,
      qualifiedLeads,
      tasksDueToday,
      completedTasks,
      leadsByStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
