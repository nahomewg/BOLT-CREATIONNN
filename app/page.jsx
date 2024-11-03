'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const newMessage = { role: 'user', content: inputMessage };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');

      // Updated API endpoint path
      const response = await fetch('/api/chat/route', {  // Changed this line
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.content) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error.'
      }]);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col h-screen">
        <h1 className="text-2xl font-bold mb-4">Chat with Claude</h1>
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-[80%]' 
                  : 'bg-gray-100 max-w-[80%]'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Type your message..."
          />
        </form>
      </div>
    </main>
  );
}
