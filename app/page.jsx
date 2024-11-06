'use client';

import { useState } from 'react';

export default function ChatPage() {
 const [messages, setMessages] = useState([]);
 const [inputMessage, setInputMessage] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState(null);

 async function handleSubmit(e) {
   e.preventDefault();
   if (!inputMessage.trim()) return;

   try {
     setIsLoading(true);
     setError(null);

     const userMessage = { role: 'user', content: inputMessage };
     setMessages(prev => [...prev, userMessage]);
     setInputMessage('');

     const response = await fetch('/api/chat', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ message: inputMessage }),
     });

     const data = await response.json();

     if (!response.ok) {
       // Format error details nicely
       const errorDetails = typeof data.debug === 'object' 
         ? Object.entries(data.debug)
             .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
             .join('\n')
         : JSON.stringify(data.debug);

       setMessages(prev => [...prev, {
         role: 'assistant',
         content: `Error Information:\n${errorDetails}`
       }]);
       return;
     }

     setMessages(prev => [...prev, {
       role: 'assistant',
       content: data.message
     }]);

   } catch (err) {
     console.error('Chat error:', err);
     setError(err.message);
     setMessages(prev => [...prev, {
       role: 'assistant',
       content: `Error: ${err.message}\nPlease try again.`
     }]);
   } finally {
     setIsLoading(false);
   }
 }

 return (
   <div className="max-w-4xl mx-auto p-4">
     <h1 className="text-2xl font-bold mb-4">Chat with Claude</h1>

     <div className="bg-white rounded-lg shadow mb-4 p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
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
       
       {error && (
         <div className="text-red-500 mb-4">
           Error: {error}
         </div>
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
         disabled={isLoading}
         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
       >
         {isLoading ? 'Sending...' : 'Send'}
       </button>
     </form>
   </div>
 );
}
