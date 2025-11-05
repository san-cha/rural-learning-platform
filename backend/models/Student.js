import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", StudentSchema);
export default Student;


