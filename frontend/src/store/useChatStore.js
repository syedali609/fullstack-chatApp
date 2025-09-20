import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: {},
  lastReadMessages: {},
  isSidebarVisible: true,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      if (res.data.length > 0) {
        const lastMessage = res.data[res.data.length - 1];
        get().markMessagesAsRead(userId, lastMessage._id);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
      get().markMessagesAsRead(selectedUser._id, res.data._id);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load groups");
    }
  },

  createGroup: async (name, memberIds) => {
    try {
      await axiosInstance.post("/groups/create", {
        name,
        members: memberIds,
      });
      toast.success("Group created successfully!");
      get().getGroups();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Group creation failed");
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/messages/${groupId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to get group messages"
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, messages } = get();
    if (!selectedGroup) {
      toast.error("No group selected.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/groups/send/${selectedGroup._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send group message"
      );
    }
  },

  subscribeToNewMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, unreadMessages, messages } = get();
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set({ messages: [...messages, newMessage] });
        get().markMessagesAsRead(selectedUser._id, newMessage._id);
      } else {
        const senderId = newMessage.senderId;
        const currentCount = unreadMessages[senderId] || 0;
        set({
          unreadMessages: {
            ...unreadMessages,
            [senderId]: currentCount + 1,
          },
        });
      }
    });

    socket.on("newGroupMessage", (newMessage) => {
      const { selectedGroup, unreadMessages, messages } = get();
      if (selectedGroup && newMessage.groupId === selectedGroup._id) {
        set({ messages: [...messages, newMessage] });
      } else {
        const groupId = newMessage.groupId;
        const currentCount = unreadMessages[groupId] || 0;
        set({
          unreadMessages: {
            ...unreadMessages,
            [groupId]: currentCount + 1,
          },
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("newGroupMessage");
    }
  },

  setSelectedChat: (chat) => {
    const socket = useAuthStore.getState().socket;
    const { unreadMessages } = get();

    if (!chat) {
        set({ selectedUser: null, selectedGroup: null });
        return;
    }

    if (chat.members) {
      set({ selectedGroup: chat, selectedUser: null });
      get().getGroupMessages(chat._id);
      if (socket) {
        console.log("Joining group", chat._id);
        socket.emit("joinGroup", chat._id); // ✅ join group room
      }
    } else {
      set({ selectedUser: chat, selectedGroup: null });
      get().getMessages(chat._id);
    }

    const chatId = chat._id;
    if (unreadMessages[chatId]) {
      const updatedUnread = { ...unreadMessages };
      delete updatedUnread[chatId];
      set({ unreadMessages: updatedUnread });
    }
    set({
      selectedUser: chat.members ? null : chat,
      selectedGroup: chat.members ? chat : null,
    });

    
  },

  markMessagesAsRead: (id, messageId) => {
    const { lastReadMessages, unreadMessages } = get();
    set({
      lastReadMessages: {
        ...lastReadMessages,
        [id]: messageId,
      },
      unreadMessages: {
        ...unreadMessages,
        [id]: 0,
      },
    });
  },

  getUnreadCount: (id) => {
    const { unreadMessages } = get();
    return unreadMessages[id] || 0;
  },

  initializeUnreadMessages: () => {
    try {
      const stored = localStorage.getItem("unreadMessages");
      const storedLastRead = localStorage.getItem("lastReadMessages");
      if (stored) set({ unreadMessages: JSON.parse(stored) });
      if (storedLastRead) set({ lastReadMessages: JSON.parse(storedLastRead) });
    } catch (error) {
      console.error("Failed to initialize unread messages:", error);
    }
  },

  saveUnreadMessages: () => {
    const { unreadMessages, lastReadMessages } = get();
    try {
      localStorage.setItem("unreadMessages", JSON.stringify(unreadMessages));
      localStorage.setItem(
        "lastReadMessages",
        JSON.stringify(lastReadMessages)
      );
    } catch (error) {
      console.error("Failed to save unread messages:", error);
    }
  },
}));
