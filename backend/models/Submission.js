// backend/models/Submission.js
import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // For quiz submissions
    answers: [{
      type: String // e.g., ["A", "B", "C", "D"]
    }],
    score: {
      type: Number // Number of correct answers
    },
    totalScore: {
      type: Number // Total number of questions
    },
    // For text assignment submissions
    textSubmission: {
      type: String
    },
    // Grading (for both types)
    grade: {
      type: Number // 0-100
    },
    feedback: {
      type: String // Teacher's feedback
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    gradedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Ensure one submission per student per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;