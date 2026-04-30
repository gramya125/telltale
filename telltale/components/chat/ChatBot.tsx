'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, X, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isRecommendation?: boolean;
  recommendations?: any[];
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
  voiceMessage?: string | null;
  onVoiceMessageSent?: () => void;
}

export default function ChatBot({ isOpen, onToggle, voiceMessage, onVoiceMessageSent }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there, book lover! 📚 I'm your TellTale reading companion. I can help you discover amazing books, get personalized recommendations, and chat about all things reading. What's on your mind today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isRecognitionActiveRef = useRef(false); // Track actual recognition state

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice messages
  useEffect(() => {
    if (voiceMessage && isOpen) {
      console.log('📨 Sending voice message:', voiceMessage);
      setInputMessage(voiceMessage);
      // Auto-send the voice message after a short delay
      setTimeout(() => {
        sendMessage(voiceMessage);
        if (onVoiceMessageSent) {
          onVoiceMessageSent();
        }
      }, 500);
    }
  }, [voiceMessage, isOpen]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // Only initialize if not already initialized
      if (!recognitionRef.current) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          console.log('🎤 Speech recognition started');
          isRecognitionActiveRef.current = true;
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log('🎤 Transcript:', transcript);
          setInputMessage(transcript);
          // Auto-send voice message
          setTimeout(() => sendMessage(transcript), 500);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('🎤 Speech recognition error:', event.error);
          isRecognitionActiveRef.current = false;
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          console.log('🎤 Speech recognition ended');
          isRecognitionActiveRef.current = false;
          setIsListening(false);
        };
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
          isRecognitionActiveRef.current = false;
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🚀 Sending message to chat API:', text);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-5),
        }),
      });

      console.log('📥 Chat API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Chat API error:', errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      console.log('✅ Chat API response:', data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        isRecommendation: data.isRecommendation,
        recommendations: data.recommendations,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if speech is enabled
      if (speechEnabled && synthRef.current) {
        speakText(data.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! I'm having trouble connecting right now. Please check your internet connection and try again in a moment. 🔌",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current || !speechEnabled) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.start();
        // State will be set by onstart event
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        isRecognitionActiveRef.current = false;
      }
    } else if (isRecognitionActiveRef.current) {
      console.log('Recognition already active, ignoring start request');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
        // State will be set by onend event
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
        isRecognitionActiveRef.current = false;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#FF6B9D] to-[#4ECDC4] hover:shadow-2xl text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 group hover:scale-110"
        aria-label="Open reading assistant"
      >
        <BookOpen size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFE66D] rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#FF6B9D]/20 flex flex-col z-50 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#FF6B9D] to-[#4ECDC4] text-white p-5 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] via-[#4ECDC4] to-[#FFE66D] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center space-x-3 relative z-10">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Reading Companion</h3>
            <p className="text-xs text-white/80">Powered by AI ✨</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative z-10">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title={speechEnabled ? "Disable voice" : "Enable voice"}
          >
            {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2 hover:bg-white/20 rounded-full transition-colors animate-pulse"
              title="Stop speaking"
            >
              <VolumeX size={18} />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#FFF5F7] to-white dark:from-[#1A1A2E] dark:to-[#1A1A2E]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8C] text-white shadow-lg shadow-[#FF6B9D]/30'
                  : 'bg-white dark:bg-[#1A1A2E] border border-[#4ECDC4]/30 text-gray-800 dark:text-gray-100 shadow-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              
              {/* Show recommendations if available */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold flex items-center gap-1">
                    <Sparkles size={14} className="text-[#FFE66D]" />
                    Recommended for you:
                  </p>
                  {message.recommendations.slice(0, 3).map((book, index) => (
                    <div key={index} className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#FFE66D]/10 p-3 rounded-xl text-xs border border-[#4ECDC4]/20">
                      <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{book.genre} • Match: {Math.round(book.score * 100)}%</p>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-60 mt-2">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#1A1A2E] border border-[#4ECDC4]/30 p-4 rounded-2xl shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#FF6B9D] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#4ECDC4] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#FFE66D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input with integrated voice */}
      <div className="p-4 border-t border-gray-200 dark:border-[#FF6B9D]/20 bg-white dark:bg-[#1A1A2E]">
        <div className="flex space-x-2 items-end">
          {/* Voice button */}
          {recognitionRef.current && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8C] text-white animate-pulse shadow-lg shadow-[#FF6B9D]/50' 
                  : 'bg-gradient-to-r from-[#4ECDC4] to-[#3DBDB4] text-white hover:shadow-lg hover:shadow-[#4ECDC4]/50'
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
              disabled={isLoading}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask me anything about books..."}
              className="w-full p-3 pr-12 border-2 border-gray-200 dark:border-[#4ECDC4]/30 rounded-xl resize-none focus:outline-none focus:border-[#FF6B9D] dark:focus:border-[#FF6B9D] bg-gray-50 dark:bg-[#1A1A2E] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              rows={1}
              disabled={isLoading || isListening}
            />
          </div>
          
          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading || isListening}
            className="bg-gradient-to-r from-[#FF6B9D] to-[#4ECDC4] hover:shadow-lg hover:shadow-[#FF6B9D]/50 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-300 hover:scale-105"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => sendMessage("Recommend popular books")}
            className="text-xs bg-gradient-to-r from-[#FF6B9D]/10 to-[#4ECDC4]/10 hover:from-[#FF6B9D]/20 hover:to-[#4ECDC4]/20 border border-[#FF6B9D]/30 px-3 py-1.5 rounded-full transition-colors"
            disabled={isLoading}
          >
            ✨ Popular Books
          </button>
          <button
            onClick={() => sendMessage("Suggest mystery novels")}
            className="text-xs bg-gradient-to-r from-[#4ECDC4]/10 to-[#FFE66D]/10 hover:from-[#4ECDC4]/20 hover:to-[#FFE66D]/20 border border-[#4ECDC4]/30 px-3 py-1.5 rounded-full transition-colors"
            disabled={isLoading}
          >
            🔍 Mystery
          </button>
          <button
            onClick={() => sendMessage("Romance recommendations")}
            className="text-xs bg-gradient-to-r from-[#FFE66D]/10 to-[#FF6B9D]/10 hover:from-[#FFE66D]/20 hover:to-[#FF6B9D]/20 border border-[#FFE66D]/30 px-3 py-1.5 rounded-full transition-colors"
            disabled={isLoading}
          >
            💕 Romance
          </button>
        </div>
      </div>
    </div>
  );
}
