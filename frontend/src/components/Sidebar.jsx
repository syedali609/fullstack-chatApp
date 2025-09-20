import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Users2, Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import CreateGroupModal from "./CreateGroupModal";

const GroupList = () => {
  const { getGroups, groups, selectedGroup, setSelectedChat, getUnreadCount } =
    useChatStore();

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  return (
    <>
      <div className="flex items-center gap-2 mt-4">
        <Users2 className="size-6" />
        <span className="font-medium hidden lg:block">Groups</span>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {groups.map((group) => {
          const unreadCount = getUnreadCount(group._id);
          return (
            <button
              key={group._id}
              onClick={() => setSelectedChat(group)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors relative ${
                selectedGroup?._id === group._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
            >
              <div className="relative">
                <img
                  src={group.profilePic || "/group-avatar.png"}
                  alt={group.name}
                  className="size-12 object-cover rounded-full"
                />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium truncate">{group.name}</div>
                <div className="text-sm text-zinc-400">
                  {group.members.length} members
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <span className="bg-primary text-primary-content text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedChat,
    isUsersLoading,
    getUnreadCount,
    initializeUnreadMessages,
    saveUnreadMessages,
    unreadMessages,
  } = useChatStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
    initializeUnreadMessages();
  }, [getUsers, initializeUnreadMessages]);

  useEffect(() => {
  saveUnreadMessages();
}, [unreadMessages]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-40 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        <div className="border-b border-base-300 w-full p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-circle btn-sm btn-ghost"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2 px-5">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
        <div className="overflow-y-auto w-full py-3">
          {filteredUsers.map((user) => {
            const unreadCount = getUnreadCount(user._id);
            return (
              <button
                key={user._id}
                onClick={() => setSelectedChat(user)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors relative ${
                  selectedUser?._id === user._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="bg-primary text-primary-content text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">
              No online users
            </div>
          )}
        </div>
        <GroupList />
      </aside>
      {isModalOpen && (
        <CreateGroupModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
