'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const newMessage = { role: 'user', content: inputMessage };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');

      console.log('Sending request with messages:', [...messages, newMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, newMessage]
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.content?.text || data.content || 'No response content'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col h-screen">
        <h1 className="text-2xl font-bold mb-4 text-center">Chat with Claude</h1>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-[80%] text-right'
                  : 'bg-white max-w-[80%]'
              }`}
            >
              <div className="text-sm text-gray-500 mb-1">
                {msg.role === 'user' ? 'You' : 'Claude'}
              </div>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-pulse text-gray-500">Claude is thinking...</div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={`px-4 py-2 rounded-lg font-medium ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
              } text-white transition-colors`}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
