'use client';

import React, { useState } from 'react';
import ChatBot from '@/components/chat/ChatBot';
import VoiceAssistant from '@/components/voice/VoiceAssistant';

export default function TestChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          TellTale AI Assistant Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chat Bot Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Chat Bot</h2>
            <p className="text-gray-600 mb-4">
              Test the AI-powered chatbot that provides book recommendations using the Grok API.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                {isChatOpen ? 'Close Chat' : 'Open Chat'}
              </button>
              
              <div className="text-sm text-gray-500">
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>AI-powered responses using Grok API</li>
                  <li>Book recommendations from ML model</li>
                  <li>Voice input and output</li>
                  <li>Conversation history</li>
                  <li>Quick action buttons</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Voice Assistant Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Voice Assistant</h2>
            <p className="text-gray-600 mb-4">
              Test the voice recognition and text-to-speech functionality.
            </p>
            
            <div className="space-y-4">
              {voiceTranscript && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-600 font-medium">Last Voice Input:</p>
                  <p className="text-blue-800">{voiceTranscript}</p>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Speech-to-text recognition</li>
                  <li>Text-to-speech output</li>
                  <li>Real-time transcript display</li>
                  <li>Browser-based (no external APIs needed)</li>
                  <li>Visual feedback for listening/speaking states</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Status Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Grok AI API</p>
              <p className="text-xs text-gray-600">Connected</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">ML Recommendation API</p>
              <p className="text-xs text-gray-600">Port 8001</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Voice APIs</p>
              <p className="text-xs text-gray-600">Browser Native</p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Test</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900">Chat Bot:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Click "Open Chat" to start the chatbot</li>
                <li>Try asking: "Recommend me some mystery books"</li>
                <li>Use the microphone button for voice input</li>
                <li>Click the speaker button to hear responses</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Voice Assistant:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Click the green microphone button (bottom left)</li>
                <li>Speak your question about books</li>
                <li>The transcript will appear and be sent to the chat</li>
                <li>Use the speaker button to hear the last transcript</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Bot Component */}
      <ChatBot 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
      
      {/* Voice Assistant Component */}
      <VoiceAssistant 
        onTranscript={setVoiceTranscript}
      />
    </div>
  );
}