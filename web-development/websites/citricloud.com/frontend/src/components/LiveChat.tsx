import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMessageCircle, FiSend, FiClock, FiPaperclip, FiSmile } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { useChatContext } from '../context/ChatContext';
import { useOpeningHours } from '../context/OpeningHoursContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  name?: string;
  message: string;
  timestamp: Date;
}

export default function LiveChat() {
  const { addSession, addMessageToSession } = useChatContext();
  const { isCurrentlyOpen, getBusinessHoursText } = useOpeningHours();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [agentStatus, setAgentStatus] = useState('available');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isBusinessHours = isCurrentlyOpen();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInitializeChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    setIsInitialized(true);
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'system',
      message: isBusinessHours
        ? `Welcome ${userName}! A support agent will be with you shortly. We're currently online and available to help.`
        : `Welcome ${userName}! We're currently offline, but we'll respond to your message via email within 2 hours during our next business hours.`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // Create session in context
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    const newSession = {
      id: newSessionId,
      user_name: userName,
      user_email: userEmail,
      status: 'active' as const,
      messages: [welcomeMessage],
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };
    console.log('🆕 LiveChat: Creating new session', newSession);
    addSession(newSession);

    // Simulate agent availability during business hours
    if (isBusinessHours) {
      setTimeout(() => {
        setAgentStatus('available');
        const agentMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'support',
          name: 'Sarah',
          message: "Hi! Thanks for reaching out. How can I help you today?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentMessage]);
        if (newSessionId) {
          addMessageToSession(newSessionId, agentMessage);
        }
      }, 1500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      name: userName,
      message: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (sessionId) {
      addMessageToSession(sessionId, userMessage);
    }
    setInputValue('');

    // Simulate agent response during business hours
    if (isBusinessHours && isInitialized) {
      setTimeout(() => {
        const responses = [
          "Thank you for your message! Let me help you with that.",
          "I'm looking into this for you. One moment please.",
          "Great question! Here's what I can help you with...",
          "I understand. Let me assist you right away.",
          "Thanks for providing those details! I can definitely help.",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const agentMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'support',
          name: 'Sarah',
          message: randomResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentMessage]);
        if (sessionId) {
          addMessageToSession(sessionId, agentMessage);
        }
      }, 1000 + Math.random() * 2000);
    } else if (!isBusinessHours && isInitialized) {
      // Outside business hours
      setTimeout(() => {
        const autoMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'system',
          message: "Thanks for your message! We're currently offline, but we'll respond via email as soon as we're back online.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, autoMessage]);
      }, 500);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center z-40"
          >
            <FiMessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-full sm:w-96 h-96 sm:h-[500px] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 sm:p-5 rounded-t-2xl bg-gradient-to-r ${isBusinessHours ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'} text-white`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isBusinessHours ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                  <h3 className="text-lg font-bold">Live Chat Support</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <FiClock className="w-4 h-4" />
                <span>{isBusinessHours ? 'Online Now' : 'Offline'} • {getBusinessHoursText()}</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              {!isInitialized ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FaRobot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-center">Get in touch</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {isBusinessHours
                      ? 'We typically respond in minutes!'
                      : 'We\'ll respond via email within 2 hours.'}
                  </p>
                </motion.div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : msg.sender === 'support'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm italic'
                        }`}
                      >
                        {msg.sender === 'support' && msg.name && (
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">{msg.name}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            {!isInitialized ? (
              <form onSubmit={handleInitializeChat} className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!userName.trim() || !userEmail.trim()}
                    className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Chat
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FiSmile className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
