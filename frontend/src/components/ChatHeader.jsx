import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeft, UserPlus, LogOut } from "lucide-react";

const ChatHeader = () => {
  const {
    selectedUser,
    selectedGroup,
    setSelectedChat,
    getGroups,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const isGroupChat = !!selectedGroup;
  const currentChat = selectedUser || selectedGroup;

  const handleLeaveGroup = async () => {
    try {
      await axiosInstance.post(`/groups/${selectedGroup._id}/leave`);
      toast.success("Left group successfully");
      setSelectedChat(null);
      getGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error(error?.response?.data?.message || "Error leaving group");
    }
  };

  // Important: This is the fix. If there is no current chat,
  // we return null to stop rendering the component immediately.
  if (!currentChat) {
    return null;
  }

  return (
    <header className="bg-base-200 p-4 border-b border-base-300 flex items-center justify-between">
      {/* Left section: Back button and Chat info */}
      <div className="flex items-center gap-4 flex-grow min-w-0">
        {/* Back button visible only on small screens */}
        <button
          className="sm:hidden btn btn-ghost btn-circle"
          onClick={() => setSelectedChat(null)}
        >
          <ArrowLeft size={24} />
        </button>

        {/* Chat profile image and name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentChat.profilePic || (isGroupChat ? "/group-avatar.png" : "/avatar.png")}
              alt="profile"
              className="size-12 rounded-full object-cover border-2 border-primary"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {currentChat.fullName || currentChat.name}
            </h2>
            <p className="text-sm text-zinc-500 truncate">
              {isGroupChat ? `${currentChat.members.length} members` : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center gap-2">
        {isGroupChat && (
          <>
            <button className="btn btn-sm btn-ghost btn-circle" title="Add members">
              <UserPlus size={20} />
            </button>
            <button
              className="btn btn-sm btn-ghost btn-circle"
              onClick={handleLeaveGroup}
              title="Leave group"
            >
              <LogOut size={20} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;