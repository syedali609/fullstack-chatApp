import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [preview, setPreview] = useState("/avatar.png");
  const fileRef = useRef(null);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (authUser?.profilePic) setPreview(authUser.profilePic);
  }, [authUser]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setPreview(base64);
      // auto upload
      await updateProfile({ profilePic: base64 });
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => fileRef.current?.click();

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString()
    : "—";

  return (
    <div data-theme={theme} className="pt-20 min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-xl bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Profile</h1>
        <p className="text-center text-gray-400 mb-6">
          Your profile information
        </p>

        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={preview}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
            />

            <button
              onClick={openFilePicker}
              aria-label="Change profile photo"
              className="absolute right-0 bottom-0 bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-800 hover:bg-gray-600"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          <p className="text-gray-400 mt-4">
            Click the camera icon to update your photo
          </p>
        </div>

        <div className="mt-8">
          <label className="text-sm text-gray-400">Full Name</label>
          <input
            readOnly
            value={authUser?.fullName || ""}
            className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-md text-white"
          />

          <label className="text-sm text-gray-400 mt-4 block">
            Email Address
          </label>
          <input
            readOnly
            value={authUser?.email || ""}
            className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-md text-white"
          />
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold">Account Information</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <div className="text-xs text-gray-500">Member Since</div>
              <div className="mt-1 text-white">{memberSince}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Account Status</div>
              <div className="mt-1 text-green-400">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
