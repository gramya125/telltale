'use client';

import { usePathname } from 'next/navigation';
import ChatBotWrapper from '@/components/chat/ChatBotWrapper';

export default function ConditionalChatBot() {
  const pathname = usePathname();
  
  // Don't show chatbot on landing, login, or signup pages
  const hideChatBot = pathname === '/' || pathname === '/auth/login' || pathname === '/auth/signup';
  
  if (hideChatBot) {
    return null;
  }
  
  return <ChatBotWrapper />;
}
