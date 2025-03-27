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
  UserRoundCog,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import Chat3dIcon from "../../../src/assets/chat-3d.png"
import Target3dIcon from "../../../src/assets/Target-3d.png"
import LineChart3dIcon from "../../../src/assets/LineChart-3d.png"
import Dumbbell3dIcon from "../../../src/assets/Dumbbell-3d.png"
import Settings3dIcon from "../../../src/assets/Settings-3d.png"
import Admin3dIcon from "../../../src/assets/Admin-3e.png"
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';



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
  const [showMenu, setShowMenu] = useState(false); // State to toggle the hamburger menu
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth()
  let width = screen.width;
  console.log('width', width)
  const navItems = [
    { path: '/', icon: Chat3dIcon, label: 'Chat' },
    { path: '/goals', icon: Target3dIcon, label: 'Goals' },
    { path: '/insights', icon: LineChart3dIcon, label: 'Insights' },
    { path: '/activities', icon: Dumbbell3dIcon, label: 'Activities' },
    { path: '/settings', icon: Settings3dIcon, label: 'Settings' },
    ...(user?.email === 'nivesh2@yopmail.com' ? [{ path: '/admin', icon: Admin3dIcon, label: 'Admin' }] : []),
  ];
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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col w-screen">
      {/* Sidebar */}
      <div className='w-full flex justify-center z-50 h-[10%]'>

        {/* Desktop Version */}
        <div className="fixed bg-white/5  border-r border-white/10 w-1/2  rounded-lg h-[10%] xs:hidden lg:block">
          <div className="flex items-center justify-center h-full w-full ">
            {/* Logo */}
            <div className="p-2">
              <div className="p-3 rounded-xl bg-white/5">
                <Brain className="w-8 h-8 text-violet-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex w-full justify-center items-center gap-2">
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
                      <img src={Icon} alt="..." className="w-10 h-10" />
                      <span className="text-xs mt-1">{label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute  h-[90%] rounded-xl bg-white/10 -z-10"
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

        {/* Mobile version */}
        <div className="fixed bg-white/5  border-r border-white/10 w-full  rounded-lg h-[10%] pt-3 lg-pt:0 xs:block lg:hidden">
          <div className="flex items-center justify-between">
            <div className='flex items-center'>
              <div className="p-3 rounded-xl bg-white/5">
                <Brain className="w-8 h-8 text-violet-400" />
              </div>
              <span className="ml-2 text-white text-lg font-bold">Clara</span>
            </div>

            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors duration-200 lg:hidden"
            >
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>


      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            className="fixed inset-y-0 left-0 w-80 bg-white/5 backdrop-blur-sm border-r border-white/10 z-[99]"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white">Chat History</h2>
                <button
                  onClick={() => {
                    setShowHistory(false)
                  }}
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

      {/* Hamburger Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            className="fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10  flex flex-col p-4 space-y-4 z-50"
          >
            {/* Navigation */}
            <nav className="flex flex-col space-y-4 ">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-4 p-3 rounded-lg',
                      'text-gray-400 hover:text-white hover:bg-white/10',
                      'transition-colors duration-200',
                      isActive && 'text-white bg-white/10'
                    )
                  }
                  onClick={() => setShowMenu(false)} // Close menu on navigation
                >
                  {/* <Icon className="w-6 h-6" /> */}
                  <img src={Icon} alt="..." className='w-10 h-10' />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* History Toggle */}
            <button
              onClick={() => {
                setShowMenu(false); // Close menu when toggling history
              }}
              className={cn(
                'flex items-center space-x-4 p-3 rounded-lg',
                'text-gray-400 hover:text-white hover:bg-white/10',
                'transition-colors duration-200'
              )}
            >
              <History className="w-6 h-6" />
              <span>History</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={signOut}
              className={cn(
                'flex items-center space-x-4 p-3 rounded-lg',
                'text-gray-400 hover:text-white hover:bg-white/10',
                'transition-colors duration-200'
              )}
            >
              <LogOut className="w-6 h-6" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Content */}
      <div className="w-full overflow-x-hidden pt-2 h-[90%] ">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;