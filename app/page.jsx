'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Placeholder messages for testing scrolling
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you analyze properties today?' },
    { role: 'user', content: 'Can you help me analyze a property in San Francisco?' },
    { role: 'assistant', content: 'Of course! Please provide the property details you\'d like me to analyze.' },
    { role: 'user', content: 'It\'s a 3 bed, 2 bath single family home.' },
    { role: 'assistant', content: 'Could you share more specifics like the square footage, year built, and asking price?' },
    { role: 'user', content: '2000 sq ft, built in 1950, asking $1.2M' },
    { role: 'assistant', content: 'Let me break down some key factors to consider for this property...' },
    { role: 'user', content: 'What about the price per square foot?' },
    { role: 'assistant', content: 'The price per square foot would be $600, which is...' },
    { role: 'user', content: 'How does that compare to the neighborhood?' },
    { role: 'assistant', content: 'Based on recent sales data...' },
    { role: 'user', content: 'What about potential rental income?' },
    { role: 'assistant', content: 'For a property of this size in San Francisco...' },
    { role: 'user', content: 'Are there any red flags I should be aware of?' },
    { role: 'assistant', content: 'Given the age of the property...' },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowPopover(false);
    };

    if (showPopover) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPopover]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'This is a placeholder response for testing purposes.'
      }]);
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: darkMode ? '#1F1A79' : '#ffffff' }}>
      <div className="max-w-4xl mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Image 
              src="/logo.png"
              alt="Property Analyzer Logo"
              width={40}
              height={40}
              className="mr-3"
            />
            <h1 className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1F1A79' }}>Property Analyzer</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600">
                <Image
                  src={darkMode ? "/moon-blue.png" : "/sun-blue.png"}
                  alt={darkMode ? "Dark mode" : "Light mode"}
                  width={20}
                  height={20}
                  className={`absolute top-1.5 ${darkMode ? 'right-1.5' : 'left-1.5'}`}
                />
              </div>
            </label>
            
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopover(!showPopover);
                }}
                className="rounded-full overflow-hidden"
              >
                <div className="w-10 h-10 text-white rounded-full flex items-center justify-center font-bold" 
                  style={{ backgroundColor: darkMode ? '#ffffff' : '#1F1A79', color: darkMode ? '#1F1A79' : '#ffffff' }}>
                  J
                </div>
              </button>
              
              {showPopover && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1"
                  style={{ 
                    backgroundColor: darkMode ? '#1F1A79' : '#ffffff',
                    border: `1px solid ${darkMode ? '#ffffff' : '#1F1A79'}`
                  }}
                >
                  <button
                    onClick={() => {/* Add logout handler */}}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10"
                    style={{ color: darkMode ? '#ffffff' : '#1F1A79' }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="rounded-lg mb-4 p-4 min-h-[400px] max-h-[600px] overflow-y-auto pb-20">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-3xl shadow-lg ${
                message.role === 'user' 
                  ? 'ml-12' 
                  : 'mr-12'
              }`}
              style={{ 
                backgroundColor: message.role === 'user' 
                  ? (darkMode ? '#ffffff' : '#1F1A79')
                  : (darkMode ? '#3A35A7' : '#f5f5f7'),
                color: message.role === 'user'
                  ? (darkMode ? '#1F1A79' : '#ffffff')
                  : (darkMode ? '#ffffff' : '#1F1A79'),
                border: '3px solid ' + (message.role === 'user' 
                  ? (darkMode ? '#ffffff' : '#1F1A79')
                  : (darkMode ? '#ffffff' : '#D35400')),
                borderRadius: message.role === 'user' ? '30px 30px 5px 30px' : '30px 30px 30px 5px',
                padding: '16px 24px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="font-semibold mb-2" style={{ color: 'inherit' }}>
                {message.role === 'user' ? 'You' : 'Expert'}
              </div>
              <div className="whitespace-pre-wrap" style={{ color: 'inherit' }}>{message.content}</div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke={darkMode ? '#ffffff' : '#1F1A79'} strokeWidth="4" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                    fill={darkMode ? '#ffffff' : '#1F1A79'}/>
                </svg>
              </div>
              <div style={{ color: darkMode ? '#ffffff' : '#1F1A79' }} className="italic">Expert is thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4" 
          style={{ backgroundColor: darkMode ? '#1F1A79' : '#ffffff' }}>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-5xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded-full"
              style={{ 
                color: darkMode ? '#ffffff' : '#1F1A79',
                backgroundColor: darkMode ? '#2A2587' : '#ffffff',
                border: `1px solid ${darkMode ? '#ffffff' : '#1F1A79'}`
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 rounded-full disabled:opacity-50"
              style={{ 
                backgroundColor: darkMode ? '#ffffff' : '#1F1A79',
                color: darkMode ? '#1F1A79' : '#ffffff'
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
