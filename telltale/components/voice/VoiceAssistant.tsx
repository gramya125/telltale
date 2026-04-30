'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
  className?: string;
}

export default function VoiceAssistant({ onTranscript, className = '' }: VoiceAssistantProps) {
  const [isActive, setIsActive] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  const {
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceAssistant({
    onTranscript: (text) => {
      setLastTranscript(text);
      setShowTranscript(true);
      if (onTranscript) {
        onTranscript(text);
      }
      // Hide transcript after 3 seconds
      setTimeout(() => setShowTranscript(false), 3000);
    },
    onError: (error) => {
      console.error('Voice assistant error:', error);
      setIsActive(false);
    },
    continuous: false,
  });

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setIsActive(false);
    } else {
      startListening();
      setIsActive(true);
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (lastTranscript) {
      speak(`You said: ${lastTranscript}`);
    }
  };

  // Auto-deactivate when listening stops
  useEffect(() => {
    if (!isListening && isActive) {
      setIsActive(false);
    }
  }, [isListening, isActive]);

  if (!isSupported) {
    return null; // Don't render if speech recognition is not supported
  }

  return (
    <div className={`fixed bottom-20 left-6 z-40 ${className}`}>
      {/* Transcript Display */}
      {showTranscript && lastTranscript && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
          <p className="text-sm text-gray-600 mb-1">You said:</p>
          <p className="text-sm font-medium text-gray-800">{lastTranscript}</p>
        </div>
      )}

      {/* Current transcript (while listening) */}
      {isListening && transcript && (
        <div className="mb-4 bg-blue-50 rounded-lg shadow-lg border border-blue-200 p-3 max-w-xs">
          <p className="text-sm text-blue-600 mb-1">Listening...</p>
          <p className="text-sm font-medium text-blue-800">{transcript}</p>
        </div>
      )}

      {/* Voice Controls */}
      <div className="flex flex-col space-y-2">
        {/* Microphone Button */}
        <button
          onClick={handleVoiceToggle}
          className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
          disabled={isSpeaking}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Speaker Button */}
        {lastTranscript && (
          <button
            onClick={handleSpeakToggle}
            className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
              isSpeaking
                ? 'bg-blue-500 hover:bg-blue-600 text-white animate-pulse'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Repeat last transcript'}
            disabled={isListening}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-2 text-center">
        <div className={`inline-block w-2 h-2 rounded-full ${
          isListening ? 'bg-red-400 animate-pulse' : 
          isSpeaking ? 'bg-blue-400 animate-pulse' : 
          'bg-gray-300'
        }`} />
      </div>
    </div>
  );
}