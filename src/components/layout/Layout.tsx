import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Target, 
  LineChart, 
  Settings, 
  Brain,
  Dumbbell,
  LogOut,
  History,
  ChevronRight,
  ChevronLeft,
  Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: MessageSquare, label: 'Chat' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/insights', icon: LineChart, label: 'Insights' },
  { path: '/activities', icon: Dumbbell, label: 'Activities' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface Conversation {
  id: string;
  title: string;
  preview: string;
  created_at: string;
}

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          messages:messages(
            content,
            role,
            created_at
          )
        `)
         .eq('user_id', session.user.id) // Add this line to ensure only user's conversations
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedConversations = data?.map(conv => {
        const messages = conv.messages || [];
        const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
        const preview = firstUserMessage.length > 50 
          ? firstUserMessage.substring(0, 50) + '...'
          : firstUserMessage;

        return {
          id: conv.id,
          title: new Date(conv.created_at).toLocaleDateString(),
          preview,
          created_at: conv.created_at
        };
      }) || [];

      setConversations(processedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== id));
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-20 bg-white/5 backdrop-blur-sm border-r border-white/10">
        <div className="flex flex-col items-center h-full py-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="p-3 rounded-xl bg-white/5">
              <Brain className="w-8 h-8 text-violet-400" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 w-full px-2 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-col items-center py-3 px-2 rounded-xl",
                    "text-gray-400 hover:text-white",
                    "transition-colors duration-200",
                    isActive && "text-white bg-white/10"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-6 h-6" />
                    <span className="text-xs mt-1">{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-xl bg-white/10 -z-10"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* History Toggle */}
          <button
            onClick={() => {
              setShowHistory(prev => {
                if (!prev) loadConversations();
                return !prev;
              });
            }}
            className={cn(
              "p-3 rounded-xl",
              "text-gray-400 hover:text-white",
              "transition-colors duration-200",
              showHistory && "text-white bg-white/10"
            )}
          >
            <History className="w-6 h-6" />
          </button>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className={cn(
              "p-3 rounded-xl",
              "text-gray-400 hover:text-white",
              "transition-colors duration-200"
            )}
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 80, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            className="fixed inset-y-0 left-0 w-80 bg-white/5 backdrop-blur-sm border-r border-white/10 z-20"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white">Chat History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Loading history...
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-xl cursor-pointer group",
                        "bg-white/5 hover:bg-white/10",
                        "border border-white/10",
                        "transition-colors duration-200"
                      )}
                      onClick={() => {
                        navigate('/', { state: { conversationId: conv.id } });
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-violet-400" />
                          <span className="text-sm text-gray-300">{conv.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => deleteConversation(conv.id, e)}
                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {conv.preview || 'No preview available'}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <History className="w-12 h-12 text-gray-500 mb-4" />
                    <p className="text-gray-300">No chat history yet</p>
                    <p className="text-sm text-gray-400">
                      Start a conversation to see it here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pl-20">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;