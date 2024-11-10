'use client';

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import PropertyCalculator from './components/PropertyCalculator';
import AnalysisResults from './components/AnalysisResults';

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChatId) return;

    setIsLoading(true);
    setError(null);

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
          message: inputMessage,
          chatId: currentChatId
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

      const data = await response.json();
      setCurrentChatId(data.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating new chat:', error);
      setError(error.message);
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

  const handleCalculatorSubmit = async (propertyDetails) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Please analyze this property with the following details:\n${JSON.stringify(propertyDetails, null, 2)}`,
          chatId: currentChatId,
          systemPrompt: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Parse the response to extract the analysis results
      const results = {
        totalStartupCost: data.message.match(/Total Startup Cost: \$?([\d,\.]+)/)?.[1] || 'N/A',
        monthsToRepay: data.message.match(/Months to Repay: (\d+)/)?.[1] || 'N/A',
        percentDebtRepaidMonthly: data.message.match(/Percent of Debt Repaid Each Month: ([\d\.]+)%/)?.[1] || 'N/A',
        annualROI: data.message.match(/Annual ROI After Debt Repaid: ([\d\.]+)%/)?.[1] || 'N/A',
        netAnnualIncome: data.message.match(/Net Annual Income After Debt Repaid: \$?([\d,\.]+)/)?.[1] || 'N/A',
        netMonthlyIncome: data.message.match(/Net Monthly Income After Debt Repaid: \$?([\d,\.]+)/)?.[1] || 'N/A'
      };

      setAnalysisResults(results);
      setMessages(prev => [...prev, 
        { role: 'user', content: `Please analyze this property with the following details:\n${JSON.stringify(propertyDetails, null, 2)}` },
        { role: 'assistant', content: data.message }
      ]);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
          className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700 ${
            currentChatId === chat.id ? 'bg-gray-700' : ''
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
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
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
                    setCurrentChatId(chat.id);
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
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
        {/* Property Calculator */}
        <div className="flex-shrink-0">
          <PropertyCalculator onCalculate={handleCalculatorSubmit} />
        </div>
        
        {/* Analysis Results */}
        {analysisResults && (
          <div className="flex-shrink-0">
            <AnalysisResults results={analysisResults} />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          <div className="flex-1 bg-white rounded-lg shadow mb-4 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-8'
                    : 'bg-gray-100 mr-8'
                }`}
              >
                <div className="font-semibold mb-1">
                  {message.role === 'user' ? 'You' : 'Claude'}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}

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
      </div>
    </div>
  );
}
