import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: '#'
    }, // Frontend route to navigate to
    read: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['submission', 'upload', 'grade'],
      default: 'upload'
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;