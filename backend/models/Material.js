import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["pdf", "image", "video"], required: true },
    filePath: { type: String, required: true }, // Path to the uploaded file
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Material = mongoose.model("Material", MaterialSchema);
export default Material;

