import { systemPrompt } from './config';
import { useState, useEffect } from 'react';

const Page = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Custom theme colors
  const theme = {
    rusticOrange: '#D35400',
    darkBlue: '#154360',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: inputMessage };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          messages: [...messages, userMessage],
          system: systemPrompt,
          system: "Your custom instructions here" // Replace with your actual instructions
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div style={{ backgroundColor: theme.darkBlue }} className="p-4">
            <h1 className="text-2xl font-bold text-white">Chat with Claude</h1>
          </div>

          {/* Chat messages */}
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  style={{
                    backgroundColor: message.role === 'user' ? theme.rusticOrange : theme.darkBlue,
                  }}
                  className="max-w-[80%] rounded-lg p-3 text-white"
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div style={{ backgroundColor: theme.darkBlue }} className="max-w-[80%] rounded-lg p-3 text-white">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                style={{ backgroundColor: theme.rusticOrange }}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;

