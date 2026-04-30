'use client';

import React, { useState } from 'react';
import ChatBot from './ChatBot';

export default function ChatBotWrapper() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    // Clear voice message when closing chat
    if (isChatOpen) {
      setVoiceMessage(null);
    }
  };

  return (
    <ChatBot 
      isOpen={isChatOpen} 
      onToggle={handleChatToggle}
      voiceMessage={voiceMessage}
      onVoiceMessageSent={() => setVoiceMessage(null)}
    />
  );
}