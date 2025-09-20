import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Make receiverId optional for group chats
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // New field for group chats
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
