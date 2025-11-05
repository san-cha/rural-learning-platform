import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", TeacherSchema);
export default Teacher;


