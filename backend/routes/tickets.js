import express from 'express';
const router = express.Router();
// NOTE: Please ensure these paths are 100% correct relative to your routes/tickets.js file
import Ticket from '../models/Ticket.js'; 
import { protect } from '../middleware/authMiddleware.js';

// --- CREATE (POST) ---
// @route   POST /api/tickets/submit  
router.post('/submit', protect, async (req, res) => {
  try {
    // We no longer need 'submittedBy' from the body; we get it from the token
    const { description, priority, title } = req.body; 

    // --- Validation Check ---
    if (!description || !title) {
        return res.status(400).json({ msg: "Please include a title and description for the ticket." });
    }
    
    const newTicket = new Ticket({
      submittedBy: req.user._id, // <--- CRITICAL: Get User ID from JWT token
      title, 
      description,
      priority: priority || 'Medium', 
      status: 'Open' // <--- CORRECTED: Now uses capitalized 'Open' to match Mongoose enum
    });

    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (err) {
    console.error(`Mongoose Error during Ticket creation: ${err.message}`);
    // If the error is still a validation error, it will show up here
    res.status(500).send('Server Error');
  }
});

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