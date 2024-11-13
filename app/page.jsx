'use client';

import dynamic from 'next/dynamic';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const messagesEndRef = useRef(null);
  const [formData, setFormData] = useState({
    address: '',
    purchasePrice: '',
    downPaymentPercent: '',
    interestRate: '',
    propertyType: '',
    bedrooms: '',
    monthlyRent: '',
    monthlyExpenses: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        setIsLoadingData(true);
        try {
          // First get all chats with analysis
          const chatsResponse = await fetch('/api/chats');
          if (chatsResponse.ok) {
            const chats = await chatsResponse.json();
            setChats(chats);
            
            // If there are existing chats, set the most recent one as current
            if (chats.length > 0) {
              setCurrentChatId(chats[0].id); // First chat is most recent due to orderBy: desc
            }
          }
  
          // Only fetch analysis and messages if we have a currentChatId
          if (currentChatId) {
            const analysisResponse = await fetch(`/api/analysis/${currentChatId}`);
            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              setAnalysisResults(analysisData);
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
  
    loadUserData();
  }, [session, currentChatId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.address.trim()) return false;
    if (!formData.purchasePrice || formData.purchasePrice <= 0) return false;
    if (!formData.downPaymentPercent || formData.downPaymentPercent <= 0 || formData.downPaymentPercent > 100) return false;
    if (!formData.interestRate || formData.interestRate <= 0) return false;
    if (!formData.propertyType) return false;
    if (!formData.bedrooms || formData.bedrooms <= 0) return false;
    if (!formData.monthlyRent || formData.monthlyRent <= 0) return false;
    if (!formData.monthlyExpenses || formData.monthlyExpenses < 0) return false;
    return true;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChatId) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch(`/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage, chatId: currentChatId }),
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
    } catch (error) { 
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

  useEffect(() => {
    // Load previous messages
    if (session?.user && currentChatId) {
      fetch(`/api/messages?chatId=${currentChatId}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error('Error loading messages:', err));
    }
  }, [session, currentChatId]);


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!inputMessage.trim() || !currentChatId) return;

  //   setIsLoading(true);
  //   setError(null);

  //   const userMessage = { role: 'user', content: inputMessage };
  //   setMessages(prev => [...prev, userMessage]);
  //   setInputMessage('');

  //   try {
  //     // Simulate API delay
  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //     // Temporary placeholder response
  //     setMessages(prev => [...prev, {
  //       role: 'assistant',
  //       content: "This is a placeholder response while the API integration is in progress."
  //     }]);

  //     // Refresh the chat list after successful message
  //     const chatsResponse = await fetch('/api/chats');
  //     const chatsData = await chatsResponse.json();
  //     setChats(chatsData);

  //   } catch (err) {
  //     console.error('Chat error:', err);
  //     setError(err.message);
  //     setMessages(prev => [...prev, {
  //       role: 'assistant',
  //       content: `Error: ${err.message}`
  //     }]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleAnalyzeProperty = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all fields correctly');
      return;
    }

    setAnalysisInProgress(true);

    try {
      // First, create a new chat
      const createChatResponse = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.address || 'New Property Analysis',
        }),
      });

      if (!createChatResponse.ok) {
        throw new Error('Failed to create chat');
      }

      const { id: chatId } = await createChatResponse.json();

      // Then send the analysis data
      const response = await fetch(`/api/analysis/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: formData.address,
          purchasePrice: parseFloat(formData.purchasePrice),
          downPayment: parseFloat(formData.downPaymentPercent),
          interestRate: parseFloat(formData.interestRate),
          propertyType: formData.propertyType,
          bedrooms: parseInt(formData.bedrooms),
          monthlyRent: parseFloat(formData.monthlyRent),
          monthlyExpenses: parseFloat(formData.monthlyExpenses)
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await response.json();
      setAnalysisResults(analysisData);
      setCurrentChatId(chatId);

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze property');
    } finally {
      setAnalysisInProgress(false);
    }
  };

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

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

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
      <div className="w-full max-w-4xl mx-auto px-4 py-3 flex justify-between items-center sticky top-0 z-50 bg-transparent backdrop-blur-sm">
        <div className="flex items-center">
          <a href="/" className="cursor-pointer">
            <img src="/logo.png" alt="Logo"/>
          </a>
        </div>
        <div className="text-white text-lg cursor-pointer">
          Log in
        </div>
      </div>

      {isLoadingData ? (
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="animate-spin rounded-full h-12 w-12"
            style={{
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #CC5500'
            }}
          ></div>
        </div>
      ) : (
      /* Main Content - Scrollable */
      <div className="flex-1 overflow-y-auto">
        <div className="h-full" style={{ paddingTop: '0.5rem' }}>
          {analysisResults ? (
            // Two column layout when analysis exists
            <div className="flex flex-wrap w-full h-[calc(100vh-80px)]">
              {/* Analysis Column - Will be on top in mobile view */}
              <div className="w-full md:w-1/2 order-1 md:order-2 p-4 h-full md:h-full">
                <div className="h-full rounded-xl backdrop-blur-sm overflow-y-auto">
                  <AnalysisResults results={analysisResults} />
                </div>
              </div>
              
              {/* Chat Column - Will be below analysis in mobile view */}
              <div className="w-full md:w-1/2 order-2 md:order-1 p-4 h-full md:h-full">
                <div className="h-full rounded-xl border border-gray-500 backdrop-blur-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3 text-center border-b border-gray-500">
                    <h2 className="text-xl font-bold text-white">Chat with Magic BnB</h2>
                  </div>
                  <div className="flex-1 px-4 py-8 overflow-y-auto">
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
                            backgroundColor: '#122f66'
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
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="border-t border-gray-500 p-4">
                    <form onSubmit={handleSubmit} className="relative">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 pr-12 h-10"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        className="absolute right-0 p-2 rounded-lg transition-all duration-200"
                        style={{
                          top: '50%',
                          transform: 'translateY(-50%)',
                          opacity: isLoading ? 0.5 : 1
                        }}
                        type="submit"
                        disabled={isLoading || !inputMessage.trim()}
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
              </div>
            </div>
          ) : (
            // Original single column layout for property form
            <div className="max-w-5xl w-full mx-auto">
              <div className="text-center px-4 sm:px-6 md:px-8 py-4">
                <div className="mb-4 p-6 rounded-xl backdrop-blur-sm overflow-x-hidden">
                  <h2 className="text-2xl font-bold text-white mb-4">Property Details</h2>
                  <form onSubmit={handleAnalyzeProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <label className="text-white mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </label>
                        {key === 'propertyType' ? (
                          <select
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            className="p-2 rounded bg-transparent border border-gray-500 text-white w-full h-10 box-border"
                            required
                          >
                            <option value="">Select property type</option>
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="condo">Condo</option>
                          </select>
                        ) : (
                          <input
                            type={key === 'address' ? 'text' : 'number'}
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                            className="p-2 rounded bg-transparent border border-gray-500 text-white w-full"
                            min={key === 'downPaymentPercent' ? '0' : undefined}
                            max={key === 'downPaymentPercent' ? '100' : undefined}
                            step={key === 'interestRate' ? '0.01' : undefined}
                            required
                          />
                        )}
                      </div>
                    ))}
                    <div className="col-span-2">
                      <button 
                        type="submit"
                        disabled={analysisInProgress}
                        className="p-3 text-white rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: analysisInProgress ? '#666' : '#D35400',
                          width: 'fit-content',
                          margin: '0 auto',
                          padding: '12px 24px'
                        }}
                      >
                        {analysisInProgress ? 'Analyzing...' : 'Analyze Property'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className={`${messages.length > 0 ? 'hidden' : 'block'}`}>
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
                </div>

                <div className={`mt-8 p-4 rounded-xl relative flex flex-col mx-auto ${messages.length > 0 ? 'hidden' : 'block'}`} style={{ border: '2px solid rgba(255, 255, 255, 0.3)', backgroundColor: 'transparent', maxWidth: '500px', minHeight: '100px' }}>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!inputMessage.trim()) return;
                    
                    const userMessage = {
                      role: 'user',
                      content: inputMessage
                    };
                    setMessages(prev => [...prev, userMessage]);
                    setInputMessage('');
                    
                    setIsLoading(true);
                    
                    try {
                      const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          message: inputMessage,
                        }),
                      });
                      
                      const data = await response.json();
                      
                      const assistantMessage = {
                        role: 'assistant',
                        content: data.message
                      };
                      setMessages(prev => [...prev, assistantMessage]);
                    } catch (error) {
                      console.error('Error:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}>
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
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

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
