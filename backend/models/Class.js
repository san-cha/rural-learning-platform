import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    enrollmentCode: { type: String, unique: true, sparse: true },
    gradeLevel: { 
      type: String, 
      required: true,
      enum: [
        "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
        "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
        "Grade 11", "Grade 12", "College"
      ]
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate enrollment code if missing
ClassSchema.pre("save", async function (next) {
  if (!this.enrollmentCode) {
    const generateEnrollmentCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      this.enrollmentCode = generateEnrollmentCode();
      const existingClass = await mongoose.model("Class").findOne({ enrollmentCode: this.enrollmentCode });
      if (!existingClass) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(new Error("Failed to generate unique enrollment code"));
    }
  }
  next();
});

const ClassModel = mongoose.model("Class", ClassSchema);
export default ClassModel;


