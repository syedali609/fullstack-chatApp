// import React, { useState, useEffect } from "react";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  // Function to check the authentication status on app load.
 checkAuth: async () => {
  try {
    const res = await axiosInstance.get("/auth/check");
    set({ authUser: res.data?.user || null });
    get().connectSocket();
  } catch (error) {
    if (error.response?.status !== 401) {
      console.error(
        "Error in checkAuth:",
        error.response?.data?.message || error.message
      );
    }
    set({ authUser: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},


  // Asynchronous function to handle user sign up.
  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const user = res.data?.user || null;
      set({ authUser: user });
      toast.success(res.data?.message || "Account created successfully!");
      get().connectSocket();

      return {
        success: true,
        message: res.data?.message || "Account created successfully!",
      };
    } catch (error) {
      set({ authUser: null });
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Sign up failed. Please try again.";
      toast.error(errMsg);
      console.error("Error during sign up:", errMsg);
      return { success: false, message: errMsg };
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Convenience login action (used by LoginPage)
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      // fetch current user after login and set local state
      const check = await axiosInstance.get("/auth/check");
      set({ authUser: check.data?.user || null });

      // ensure socket connects after authUser is set
      get().connectSocket();

      toast.success(res.data?.message || "Login successful");
      return { success: true, message: res.data?.message };
    } catch (error) {
      const errMsg =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errMsg);
      console.error("Error during login:", errMsg);
      return { success: false, message: errMsg };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      // expects { profilePic: base64String }
      const res = await axiosInstance.put("/auth/update-profile-pic", data);
      const updatedPic = res.data?.profilePic || null;
      // update local authUser
      set((state) => ({
        authUser: { ...state.authUser, profilePic: updatedPic },
      }));
      toast.success(res.data?.message || "Profile updated");
      return { success: true, message: res.data?.message };
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Profile update failed";
      toast.error(errMsg);
      console.error("Error during profile update:", errMsg);
      return { success: false, message: errMsg };
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Function to clear authentication state on logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully.");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Error during logout:", error.message);
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) return; // only connect if authenticated
    if (socket && socket.connected) return; // already connected

    try {
      const newSocket = io(BASE_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        query: { userId: authUser._id },
      });

      // register listeners
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        // save socket instance in store when connected
        set({ socket: newSocket });
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        set({ socket: null });
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connect error:", err);
      });

      // server may emit either "online-users" or "onlineUsers"; handle both
     newSocket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds});
      });

      // initiate connection
      newSocket.connect();
    } catch (err) {
      console.error("Error while connecting socket:", err);
    }
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (!socket) return;
    try {
      // remove all listeners and disconnect
      socket.off();
      socket.disconnect();
    } catch (err) {
      console.error("Error while disconnecting socket:", err);
    } finally {
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
