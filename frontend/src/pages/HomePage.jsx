import React from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();

  // The isChatSelected variable should check for both selectedUser and selectedGroup.
  const isChatSelected = selectedUser || selectedGroup;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar is hidden on phone screens only if a chat is selected */}
            <div className={`
              w-full md:w-40 lg:w-72 border-r border-base-300 transition-all duration-200
              ${isChatSelected ? "hidden sm:block" : "block"}
            `}>
              <Sidebar />
            </div>

            {/* Chat container is hidden on phone screens when no chat is selected */}
            <div className={`
              flex-1
              ${isChatSelected ? "block" : "hidden sm:block"}
            `}>
              {isChatSelected ? <ChatContainer /> : <NoChatSelected />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;