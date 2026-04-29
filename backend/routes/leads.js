const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/leads - list with pagination, search, filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, assignedTo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({
      leads,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/leads/:id
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('company', 'name industry location');
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leads
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, company, notes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }
    const lead = await Lead.create({ name, email, phone, status, assignedTo, company, notes });
    await lead.populate('assignedTo', 'name email');
    await lead.populate('company', 'name');
    res.status(201).json({ lead });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A lead with this email already exists.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/leads/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, company, notes } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status, assignedTo, company, notes },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('company', 'name');
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/leads/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/leads/:id - soft delete
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    res.json({ message: 'Lead deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
