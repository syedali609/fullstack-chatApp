import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const admin = req.user._id;

    if (!name || !members || members.length < 2) {
      return res
        .status(400)
        .json({ message: "A group must have a name and at least 2 members." });
    }

    const newGroup = new Group({
      name,
      members: [admin, ...members],
      admin,
    });

    await newGroup.save();

    // Populate the group members and admin fields before sending the response
    const populatedGroup = await newGroup
      .populate("members", "fullName profilePic email")
      .populate("admin", "fullName profilePic email");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get groups a user is a member of
// The route for this function is probably '/groups/my-groups'
// This function needs no change.
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId }).select("-__v");
    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getMyGroups:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all messages for a specific group
// The route for this function should be '/groups/:groupId/messages' to be consistent
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params; // Changed 'id' to 'groupId' for consistency
    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .populate("sender", "-password");
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Send a message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let imageUrl = "";
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = new GroupMessage({
      sender: senderId,
      groupId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    await newMessage.populate("sender", "-password");

    // ✅ Broadcast to all group members
    io.to(groupId).emit("newGroupMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "Group deleted successfully as it had no members left" });
    }

    await group.save();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};