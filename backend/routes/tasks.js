const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, assignedTo, lead } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (lead) filter.lead = lead;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('lead', 'name email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({ tasks, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, lead, assignedTo, dueDate, status } = req.body;
    if (!title || !lead || !assignedTo) {
      return res.status(400).json({ message: 'Title, lead, and assignedTo are required.' });
    }
    const task = await Task.create({
      title,
      description,
      lead,
      assignedTo,
      dueDate,
      status,
      createdBy: req.user._id,
    });
    await task.populate('lead', 'name email');
    await task.populate('assignedTo', 'name email');
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Authorization: only assigned user or admin can update status
    const isAdmin = req.user.role === 'admin';
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Only the assigned user or admin can update this task.' });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id/status - only assigned user or admin
router.patch('/:id/status', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const isAdmin = req.user.role === 'admin';
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Only the assigned user or admin can update this task status.' });
    }

    task.status = req.body.status;
    await task.save();
    await task.populate('lead', 'name email');
    await task.populate('assignedTo', 'name email');
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
