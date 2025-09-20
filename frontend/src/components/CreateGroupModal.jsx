import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast"; // Import toast for better UX

const CreateGroupModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const { users, createGroup } = useChatStore();
  const { authUser } = useAuthStore();

  const handleMemberSelection = (userId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    // Corrected client-side validation
    if (!groupName.trim()) {
      return toast.error("Group name cannot be empty.");
    }
    if (selectedMembers.length === 0) {
      return toast.error("A group must have at least one member.");
    }

    setIsCreating(true);
    // The server-side validation already checks for members.length < 2,
    // so this check is redundant here but good for a better user experience.

    // Corrected call to createGroup - removed redundant validation check
    await createGroup(groupName.trim(), selectedMembers);
    
    setIsCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-base-200 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-base-content/70 hover:text-base-content transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
        <form onSubmit={handleCreateGroup}>
          <div className="mb-4">
            <label
              htmlFor="groupName"
              className="block text-sm font-medium mb-1"
            >
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full input input-bordered rounded-lg"
              placeholder="Enter group name"
              required
            />
          </div>
          <div className="mb-4 max-h-64 overflow-y-auto pr-2">
            <label className="block text-sm font-medium mb-2">
              Select Members
            </label>
            {users.map(
              (user) =>
                user._id !== authUser._id && (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={user._id}
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => handleMemberSelection(user._id)}
                      className="checkbox checkbox-sm"
                    />
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-8 rounded-full"
                    />
                    <label
                      htmlFor={user._id}
                      className="font-medium flex-1 truncate"
                    >
                      {user.fullName}
                    </label>
                  </div>
                )
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost rounded-lg"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-lg"
              disabled={
                isCreating || !groupName.trim() || selectedMembers.length < 1 // This is the corrected validation
              }
            >
              {isCreating ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;