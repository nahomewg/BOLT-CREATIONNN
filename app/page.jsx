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
  // const [messages, setMessages] = useState([
  //   { role: 'assistant', content: 'Hello! How can I help you analyze properties today?' },
  //   { role: 'user', content: 'Can you help me analyze a property in San Francisco?' },
  //   { role: 'assistant', content: 'Of course! Please provide the property details you\'d like me to analyze.' },
  //   { role: 'user', content: 'It\'s a 3 bed, 2 bath single family home.' },
  //   { role: 'assistant', content: 'Could you share more specifics like the square footage, year built, and asking price?' },
  //   { role: 'user', content: '2000 sq ft, built in 1950, asking $1.2M' },
  //   { role: 'assistant', content: 'Let me break down some key factors to consider for this property...' },
  //   { role: 'user', content: 'What about the price per square foot?' },
  //   { role: 'assistant', content: 'The price per square foot would be $600, which is...' },
  //   { role: 'user', content: 'How does that compare to the neighborhood?' },
  //   { role: 'assistant', content: 'Based on recent sales data...' },
  //   { role: 'user', content: 'What about potential rental income?' },
  //   { role: 'assistant', content: 'For a property of this size in San Francisco...' },
  //   { role: 'user', content: 'Are there any red flags I should be aware of?' },
  //   { role: 'assistant', content: 'Given the age of the property...' },
  // ]);
  const [messages, setMessages] = useState([]);

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

    // Add user message immediately
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(true);

  useEffect(() => {
    // Check if device is mobile on mount
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();

    // Only add mouse move listener if not mobile
    if (!isMobile) {
      const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };

      const handleMouseEnterInput = () => {
        setShowSpotlight(false);
      };

      const handleMouseLeaveInput = () => {
        setShowSpotlight(true);
      };

      window.addEventListener('mousemove', handleMouseMove);
      
      // Add listeners to all inputs, textareas, and their parent divs
      const inputs = document.querySelectorAll('input, textarea');
      const inputContainers = document.querySelectorAll('.mt-8.p-4.rounded-xl');
      const header = document.querySelector('.w-full.max-w-4xl.mx-auto.px-4.py-6');
      
      inputs.forEach(input => {
        input.addEventListener('mouseenter', handleMouseEnterInput);
        input.addEventListener('mouseleave', handleMouseLeaveInput);
      });

      inputContainers.forEach(container => {
        container.addEventListener('mouseenter', handleMouseEnterInput);
        container.addEventListener('mouseleave', handleMouseLeaveInput);
      });

      if (header) {
        header.addEventListener('mouseenter', handleMouseEnterInput);
        header.addEventListener('mouseleave', handleMouseLeaveInput);
      }

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        inputs.forEach(input => {
          input.removeEventListener('mouseenter', handleMouseEnterInput);
          input.removeEventListener('mouseleave', handleMouseLeaveInput);
        });
        inputContainers.forEach(container => {
          container.removeEventListener('mouseenter', handleMouseEnterInput);
          container.removeEventListener('mouseleave', handleMouseLeaveInput);
        });
        if (header) {
          header.removeEventListener('mouseenter', handleMouseEnterInput);
          header.removeEventListener('mouseleave', handleMouseLeaveInput);
        }
      };
    }
  }, [isMobile]);

  return (
    <div className="h-screen flex flex-col">
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgb(30, 27, 75), rgb(23, 37, 84), rgb(0, 0, 0))',
        zIndex: -10
      }} />
      {!isMobile && showSpotlight && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle 150px at var(--x) var(--y), rgba(204, 85, 0, 0.3), transparent 90%)',
            zIndex: -5,
            pointerEvents: 'none',
            '--x': `${mousePosition.x}px`,
            '--y': `${mousePosition.y}px`,
          }}
        />
      )}
      {/* Header - Fixed */}
      <div className="w-full max-w-4xl mx-auto px-4 py-6 flex justify-between items-center sticky top-0 z-50 bg-transparent backdrop-blur-sm">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo"/>
        </div>
        <div className="text-white text-lg cursor-pointer">
          Log in
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full flex items-center" style={{ marginTop: '-10vh' }}>
          <div className="max-w-4xl w-full mx-auto">
            {(!messages || messages.length === 0) && (
              <div className="text-center px-4 sm:px-6 md:px-8 py-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Property Profit Analyzer
                </h1>
                <p className="max-w-2xl mx-auto text-gray-400">
                  Get instant insights on your Airbnb property's potential value, profitability, and market performance.
                </p>
                <div className="mt-8 p-4 rounded-xl relative flex flex-col mx-auto" style={{ border: '2px solid rgba(255, 255, 255, 0.3)', backgroundColor: 'transparent', maxWidth: '500px', minHeight: '100px' }}>
                  <form onSubmit={handleSubmit} id="chatForm">
                    <textarea
                      placeholder="How may I help you today?"
                      className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none overflow-hidden mb-14"
                      style={{ 
                        minHeight: '60px',
                        height: 'auto',
                      }}
                      onChange={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                        setInputMessage(e.target.value);
                      }}
                      value={inputMessage}
                    />
                    <button
                      className="absolute bottom-4 right-4 p-2 rounded-lg transition-all duration-200"
                      type="submit"
                    >
                      <Image 
                        src="/send-white.png"
                        alt="Send"
                        width={24}
                        height={24}
                      />
                    </button>
                  </form>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-6 max-w-2xl mx-auto">
                  <button
                    onClick={() => {
                      setInputMessage("What's the average ROI for Airbnb properties in Edmonton?");
                      setTimeout(() => {
                        document.getElementById('chatForm').requestSubmit();
                      }, 0);
                    }}
                    className="px-4 py-2 rounded-full text-white transition-colors duration-200 text-sm text-center"
                    style={{ 
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#CC5500';
                      e.target.style.borderColor = '#CC5500';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                  >
                    What's the average ROI for Airbnb properties in Edmonton?
                  </button>
                  <button
                    onClick={() => {
                      setInputMessage("How do I calculate potential rental income for my property?");
                      setTimeout(() => {
                        document.getElementById('chatForm').requestSubmit();
                      }, 0);
                    }}
                    className="px-4 py-2 rounded-full text-white transition-colors duration-200 text-sm text-center"
                    style={{ 
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#CC5500';
                      e.target.style.borderColor = '#CC5500';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                  >
                    How do I calculate potential rental income for my property?
                  </button>
                  <button
                    onClick={() => {
                      setInputMessage("What are the key factors that affect property value in my area?");
                      setTimeout(() => {
                        document.getElementById('chatForm').requestSubmit();
                      }, 0);
                    }}
                    className="px-4 py-2 rounded-full text-white transition-colors duration-200 text-sm text-center"
                    style={{ 
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#CC5500';
                      e.target.style.borderColor = '#CC5500';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                  >
                    What are the key factors that affect property value in my area?
                  </button>
                </div>
              </div>
            )}

            {messages && messages.length > 0 && (
              <>
                <div className="flex-1 w-full px-4 py-8 mb-2">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`mb-4 p-4 flex flex-col ${
                        message.role === 'user' 
                          ? 'ml-auto items-end' 
                          : 'mr-auto items-start'
                      }`}
                      style={{
                        maxWidth: '80%'
                      }}
                    >
                      <div className="font-bold mb-2 text-white text-sm flex items-center gap-2">
                        {message.role === 'user' ? 'You' : (
                          <>
                            Expert
                            <Image 
                              src="/expert-orange.png"
                              alt="Expert"
                              width={16}
                              height={16}
                            />
                          </>
                        )}
                      </div>
                      <div 
                        className={`p-3 ${
                          message.role === 'user'
                            ? 'rounded-t-2xl rounded-l-2xl rounded-br-2xl'
                            : 'bg-gray-700 rounded-t-2xl rounded-r-2xl rounded-bl-2xl'
                        }`}
                        style={message.role === 'user' ? {
                          backgroundColor: '#0a1c3d'
                        } : {}}
                      >
                        <div className="text-white">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Fixed */}
      {messages && messages.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 bg-transparent backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
              style={{ 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              className="p-2 rounded-xl transition-all duration-200"
            >
              <Image 
                src="/send-white.png"
                alt="Send"
                width={24}
                height={24}
              />
            </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// return (
//   <div className="max-w-4xl mx-auto p-4">
//     <h1 className="text-2xl font-bold mb-4">Chat with Claude</h1>
    
//     <div className="bg-white rounded-lg shadow mb-4 p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
//       {messages.map((message, index) => (
//         <div
//           key={index}
//           className={`mb-4 p-3 rounded-lg ${
//             message.role === 'user' 
//               ? 'bg-blue-100 ml-8' 
//               : 'bg-gray-100 mr-8'
//           }`}
//         >
//           <div className="font-semibold mb-1">
//             {message.role === 'user' ? 'You' : 'Claude'}
//           </div>
//           <div className="whitespace-pre-wrap">{message.content}</div>
//         </div>
//       ))}
      
//       {isLoading && (
//         <div className="text-gray-500 italic">Claude is thinking...</div>
//       )}
//     </div>

//     <form onSubmit={handleSubmit} className="flex gap-2">
//       <input
//         type="text"
//         value={inputMessage}
//         onChange={(e) => setInputMessage(e.target.value)}
//         placeholder="Type your message..."
//         className="flex-1 p-2 border rounded"
//         disabled={isLoading}
//       />
//       <button
//         type="submit"
//         disabled={isLoading || !inputMessage.trim()}
//         className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
//       >
//         Send
//       </button>
//     </form>
//   </div>
// );
