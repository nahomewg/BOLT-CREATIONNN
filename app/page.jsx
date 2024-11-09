'use client';

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

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
    if (session?.user && !currentChatId) {
      startNewChat();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/chats')
        .then(res => res.json())
        .then(data => setChats(data))
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

  const ChatItem = ({ chat, currentChatId, onSelect, onRename, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

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
      <div className="group relative flex items-center pr-8">
        <div
          onClick={onSelect}
          onDoubleClick={() => onRename(chat)}
          className={`flex-1 p-2 rounded cursor-pointer hover:bg-gray-700 ${
            currentChatId === chat.id ? 'bg-gray-700' : ''
          }`}
        >
          <span className="truncate">{chat.title}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded text-lg"
        >
          ⋯
        </button>
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onRename(chat);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center gap-2"
              >
                <span>✏️</span> Rename
              </button>
              <button
                onClick={() => {
                  onDelete(chat.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <button
          onClick={startNewChat}
          className="w-full px-4 py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          New Chat
        </button>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div key={chat.id} className="mb-2">
              {editingChatId === chat.id ? (
                <div className="flex items-center p-2 pr-8">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRename(chat.id)}
                    className="flex-1 bg-gray-700 text-white rounded px-2 py-1"
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

      {/* Main chat area */}
      <div className="flex-1 flex flex-col p-4">
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
  );
}
