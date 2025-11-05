import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    contentURLs: [{ type: String }], // Array of content URLs (audio, video, PDF files)
    submissions: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        submissionURL: { type: String, required: true },
        submittedAt: { type: Date, default: Date.now },
        grade: { type: Number, default: null },
        gradedAt: { type: Date, default: null },
        feedback: { type: String, default: "" },
      },
    ],
    dueDate: { type: Date },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", AssignmentSchema);
export default Assignment;

