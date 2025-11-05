import express from 'express';
const router = express.Router();
import Ticket from '../models/Ticket.js'; // Make sure this path is correct

// --- READ (GET All) ---
// @route   GET /api/tickets/
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- CREATE (POST) ---
// @route   POST /api/tickets/create
router.post('/create', async (req, res) => {
  try {
    const { submittedBy, description, priority } = req.body;

    const newTicket = new Ticket({
      submittedBy,
      description,
      priority
    });

    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- UPDATE (POST) ---
// @route   POST /api/tickets/update/:id
router.post('/update/:id', async (req, res) => {
  try {
    const { status, priority } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    res.json(updatedTicket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Use export default for ES Modules
export default router;