import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    enrolledClasses: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Class" 
    }],
    completedMaterials: [{
      type: mongoose.Schema.Types.ObjectId,
      // This can reference both Material and Assignment documents
      refPath: 'completedMaterialTypes'
    }],
    // Optional: track what type each completed item is
    completedMaterialTypes: [{
      type: String,
      enum: ['Material', 'Assignment']
    }]
  },
  { timestamps: true }
);

// Add index for faster queries
StudentSchema.index({ userId: 1 });

const Student = mongoose.model("Student", StudentSchema);
export default Student;