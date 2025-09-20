import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import MessageSkeleton from "../components/skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { ArrowLeft } from "lucide-react"; // Import the back arrow icon

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    getGroupMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToNewMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
    lastReadMessages,
    setSelectedChat, // Import the function to deselect the chat
  } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const isGroupChat = !!selectedGroup;
  const currentChat = selectedUser || selectedGroup;

  // Function to handle going back to the sidebar
  const handleGoBack = () => {
    setSelectedChat(null);
  };

  // Fetch messages and setup socket listeners
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
    if (selectedGroup) getGroupMessages(selectedGroup._id);

    subscribeToNewMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    selectedGroup,
    getMessages,
    getGroupMessages,
    subscribeToNewMessages,
    unsubscribeFromMessages,
  ]);

  // Scroll to latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    if (!messagesContainerRef.current || !currentChat || !messages.length) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;

    if (isAtBottom) {
      const lastMessage = messages[messages.length - 1];
      const senderId = lastMessage.sender?._id || lastMessage.senderId;
      if (senderId !== authUser._id) {
        markMessagesAsRead(currentChat._id, lastMessage._id);
      }
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-base-300 p-4 border-b border-base-300 flex items-center gap-4">
        {/* Back button visible only on small screens */}
        <button
          className="sm:hidden btn btn-ghost btn-circle"
          onClick={handleGoBack}
        >
          <ArrowLeft size={24} />
        </button>
        {/* Pass the correct chat data to the ChatHeader */}
        <ChatHeader chat={currentChat} isGroupChat={isGroupChat} />
      </div>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => {
          const senderId = message.sender?._id || message.senderId;
          const isSentByMe = senderId === authUser._id;
          const sender = isSentByMe
            ? authUser
            : isGroupChat
            ? message.sender
            : selectedUser;

          if (!sender) return null;

          const isLastReadMessage =
            !isGroupChat &&
            isSentByMe &&
            lastReadMessages[selectedUser?._id] === message._id;

          return (
            <div key={message._id}>
              <div className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}>
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={sender.profilePic || "/avatar.png"}
                      alt="profile"
                    />
                  </div>
                </div>
                {isGroupChat && !isSentByMe && (
                  <div className="chat-header mb-1 text-sm font-medium">
                    {sender.fullName}
                  </div>
                )}
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
                {isSentByMe && (
                  <div className="chat-footer opacity-50 text-xs mt-1">
                    {isLastReadMessage ? (
                      <span className="text-blue-500">✓✓ Read</span>
                    ) : (
                      <span>✓✓ Delivered</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;