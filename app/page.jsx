'use client';

import dynamic from 'next/dynamic';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const PropertyCalculator = dynamic(() => import('./components/PropertyCalculator'), {
  loading: () => <div>Loading calculator...</div>
});

const AnalysisResults = dynamic(() => import('./components/AnalysisResults'), {
  loading: () => <div>Loading results...</div>
});

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Load previous messages
    if (session?.user && currentChatId) {
      fetch(`/api/messages?chatId=${currentChatId}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error('Error loading messages:', err));
    }
  }, [session, currentChatId]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/chats')
        .then(res => res.json())
        .then(data => {
          setChats(data);
          // If there are existing chats, set the most recent one as current
          if (data.length > 0) {
            setCurrentChatId(data[0].id);
            fetch(`/api/messages?chatId=${data[0].id}`)
              .then(res => res.json())
              .then(messages => setMessages(messages));
          } else {
            // Only create a new chat if there are no existing chats
            startNewChat();
          }
        })
        .catch(err => console.error('Error loading chats:', err));
    }
  }, [session]);

  useEffect(() => {
    if (currentChatId) {
      fetch(`/api/analysis/${currentChatId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setAnalysisResults(data);
          } else {
            setAnalysisResults(null);
          }
        })
        .catch(err => console.error('Error loading analysis:', err));
    }
  }, [currentChatId]);
  
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
  }, [messages, isLoading]); // Added isLoading to trigger scroll when loading spinner appears

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
    if (!inputMessage.trim() || !currentChatId) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Temporarily commented out API call
      /*
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chatId: currentChatId
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
      */

      // Simulate API delay
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Temporary placeholder response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "This is a placeholder response while the API integration is in progress."
      }]);
      setIsLoading(false);

      // Refresh the chat list after successful message
      const chatsResponse = await fetch('/api/chats');
      const chatsData = await chatsResponse.json();
      setChats(chatsData);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const startNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create new chat');
      }

      const chat = await response.json();
      setCurrentChatId(chat.id);
      setAnalysisResults(null);
      setMessages([]);
      setResetTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error creating new chat:', error);
      setError('Failed to create new chat');
    }
  };

  const handleRename = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle })
      });

      if (!response.ok) throw new Error('Failed to rename chat');

      // Update chats list
      setChats(chats.map(chat =>
        chat.id === chatId ? { ...chat, title: editingTitle } : chat
      ));
      setEditingChatId(null);
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const handleDelete = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      setChats(chats.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleCalculatorSubmit = async (analysis) => {
    setAnalysisInProgress(true);
    setIsLoading(true);
    setError(null);

    try {
      // First get AI analysis
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: JSON.stringify(analysis),
          chatId: currentChatId,
          systemPrompt: true,
          hidePrompt: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Create analysis results object
      const results = {
        location: analysis.location,
        totalStartupCost: { value: analysis.financials.totalStartupCost },
        monthsToRepay: { value: analysis.financials.monthsToRepay },
        percentDebtRepaidMonthly: { value: analysis.financials.percentDebtRepaidMonthly },
        annualROI: { value: analysis.financials.annualROI },
        netAnnualIncome: { value: analysis.financials.netAnnualIncome },
        netMonthlyIncome: { value: analysis.financials.netMonthlyIncome },
        aiAnalysis: data.message
      };

      // Save analysis results
      const analysisResponse = await fetch(`/api/analysis/${currentChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to save analysis');
      }

      setAnalysisResults(results);

      // Now fetch updated chat list to include the new chat with analysis
      const chatsResponse = await fetch('/api/chats');
      if (chatsResponse.ok) {
        const chats = await chatsResponse.json();
        setChats(chats);
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setAnalysisInProgress(false);
    }
  };

  const handleChatSelect = (chatId) => {
    if (analysisInProgress) {
      alert('Please wait for the current analysis to complete');
      return;
    }
    setCurrentChatId(chatId);
  };

  const ChatItem = ({ chat, currentChatId, onSelect, onRename, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Function to truncate text with ellipsis
    const truncateText = (text, maxLength) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative group">
        <div
          className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700 ${currentChatId === chat.id ? 'bg-gray-700' : ''
            }`}
          onClick={() => onSelect()}
        >
          <div className="flex-1 min-w-0"> {/* Add min-w-0 to allow truncation */}
            <p className="text-sm text-white truncate" title={chat.title}>
              {truncateText(chat.title, 25)}
            </p>
          </div>
          <button
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="14" r="1.5" />
            </svg>
          </button>
        </div>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          >
            <div className="py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(chat);
                  setShowMenu(false);
                }}
              >
                Rename
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat.id);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  exportToPdf(chat.id);
                  setShowMenu(false);
                }}
              >
                Export to PDF
              </button>
            </div>
          </div>
        )}
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
          <a href="/" className="cursor-pointer">
            <img src="/logo.png" alt="Logo"/>
          </a>
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
                <h1 className="text-4xl font-bold text-white mb-4 typewriter-text" style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  animation: 'typing 2s steps(40, end)',
                  margin: '0 auto',
                  maxWidth: 'fit-content'
                }}>
                  Property Profit Analyzer
                </h1>
                <p className="max-w-2xl mx-auto text-gray-400 typewriter-text" style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  animation: 'typing 2s steps(40, end) 2s forwards',
                  margin: '0 auto',
                  maxWidth: '0',
                  opacity: '0'
                }}>
                  Get instant insights on your Airbnb property's potential value, profitability, and market performance.
                </p>
                <style jsx>{`
                  @keyframes typing {
                    from { max-width: 0; opacity: 0; }
                    to { max-width: 100%; opacity: 1; }
                  }
                `}</style>
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
                  {isLoading && (
                    <div className="mr-auto flex items-center gap-2 text-white p-4">
                      <div 
                        className="animate-spin rounded-full h-4 w-4"
                        style={{
                          border: '2px solid white',
                          borderTopColor: '#CC5500'
                        }}
                      ></div>
                      Expert is thinking...
                    </div>
                  )}
                  <div ref={messagesEndRef} /> {/* Added ref for scrolling */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const exportToPdf = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/export`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to export chat');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${chatId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting chat:', error);
    }
  };

  const handleLogout = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/login'
    });
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="px-4 py-4">
          <button
            onClick={startNewChat}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            New Analysis
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Array.isArray(chats) && chats.map((chat) => (
            <div key={chat.id} className="px-4 mb-2">
              {editingChatId === chat.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRename(chat.id)}
                    className="w-full bg-gray-700 text-white rounded p-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(chat.id);
                      if (e.key === 'Escape') setEditingChatId(null);
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <ChatItem
                  chat={chat}
                  currentChatId={currentChatId}
                  onSelect={() => {
                    handleChatSelect(chat.id);
                    fetch(`/api/messages?chatId=${chat.id}`)
                      .then(res => res.json())
                      .then(data => setMessages(data));
                  }}
                  onRename={(chat) => {
                    setEditingChatId(chat.id);
                    setEditingTitle(chat.title);
                  }}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-4 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
        {/* Property Calculator */}
        <div className="flex-shrink-0">
          <PropertyCalculator onCalculate={handleCalculatorSubmit} resetTrigger={resetTrigger} />
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <div className="flex-shrink-0">
            <AnalysisResults results={analysisResults} />
          </div>
        )}

        {/* Chat Area */}
        {analysisResults ? (
          <div className="flex-1 flex flex-col min-h-[500px]">
            <div className="flex-1 bg-white rounded-lg shadow mb-4 p-4 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 p-3 rounded-lg ${message.role === 'user'
                        ? 'bg-blue-100 ml-8'
                        : 'bg-gray-100 mr-8'
                      }`}
                  >
                    <div className="font-semibold mb-1">
                      {message.role === 'user' ? 'You' : 'Claude'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-600 text-center p-4">
                  <p className="mb-2">Analysis complete! Have any questions about the results?</p>
                  <p>Feel free to ask about:</p>
                  <div className="flex justify-center mt-2">
                    <ul className="list-disc pl-14 space-y-1 inline-block">
                      <li className="text-left">Location strategy</li>
                      <li className="text-left">Revenue projections</li>
                      <li className="text-left">Operating costs</li>
                      <li className="text-left">Market competition</li>
                      <li className="text-left">Optimization suggestions</li>
                    </ul>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="text-gray-500 italic">Claude is thinking...</div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Send
              </button>
            </form>
          </div>
        ) : null}
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
//             message.role  'user' 
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
