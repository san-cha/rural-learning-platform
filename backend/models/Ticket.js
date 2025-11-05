import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the schema for a support ticket
const ticketSchema = new Schema({
  submittedBy: {
    type: Schema.Types.ObjectId, // The _id of the user
    ref: 'User', // Links to your 'User' model (or 'Student')
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the issue.'],
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'In Progress', 'Closed'], // Allowed values
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;