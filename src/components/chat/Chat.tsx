import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Crown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useChat } from '../../contexts/ChatContext';
import toast from 'react-hot-toast';

const Chat = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sendMessage, messageLimitInfo } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleUpgradeClick = () => {
    toast.success('Premium upgrade coming soon!', {
      icon: '⭐',
      duration: 5000
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "flex items-start space-x-4",
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Bot className="w-6 h-6 text-violet-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === 'assistant'
                      ? "bg-white/5 text-white"
                      : "bg-violet-500 text-white"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="p-2 rounded-lg bg-violet-600">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message limit info */}
      {messageLimitInfo && (
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>
                {messageLimitInfo.used} / {messageLimitInfo.limit} messages used today
              </span>
              {!messageLimitInfo.isPremium && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgradeClick}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white flex items-center space-x-1"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade</span>
                </motion.button>
              )}
            </div>
            {messageLimitInfo.used >= messageLimitInfo.limit && (
              <span className="text-sm text-red-400">
                Daily limit reached
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-xl",
                "bg-white/5 border border-white/10",
                "text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                (loading || (messageLimitInfo?.used ?? 0) >= (messageLimitInfo?.limit ?? 0)) &&
                "opacity-50 cursor-not-allowed"
              )}
              disabled={loading || (messageLimitInfo?.used ?? 0) >= (messageLimitInfo?.limit ?? 0)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || (messageLimitInfo?.used ?? 0) >= (messageLimitInfo?.limit ?? 0)}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "p-2 rounded-lg",
                "text-gray-400 hover:text-white",
                "transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;