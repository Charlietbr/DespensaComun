import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [activeChat, setActiveChat] = useState(null);


  const openPrivateChat = (conversationData) => {

    setActiveChat({
      ...conversationData,
      type: 'private'
    });
  };

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChat, openPrivateChat }}>
      {children}
    </ChatContext.Provider>
  );
};