import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { chatCompletion, streamCompletion } from '../lib/openai';
import { api } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatContextType {
  messages: Message[];
  loading: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendMessageNoStreaming: (content: string) => Promise<void>;
  clearChat: () => void;
  switchConversation: (conversationId: string) => Promise<void>;
  messageLimitInfo: {
    used: number;
    limit: number;
    isPremium: boolean;
  } | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Separate the provider component to fix HMR
const ChatProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messageLimitInfo, setMessageLimitInfo] = useState<ChatContextType['messageLimitInfo']>(null);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setCurrentConversationId(null);
      setMessageLimitInfo(null);
    } else {
      initializeChat();
      loadMessageLimitInfo();
    }
  }, [user]);

  const loadMessageLimitInfo = async () => {
    try {
      const info = await api.getMessageLimitInfo();
      setMessageLimitInfo(info);
    } catch (error) {
      console.error('Error loading message limit info:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messageError) {
        console.error('Error loading messages:', messageError);
        throw new Error('Failed to load messages');
      }

      if (messageData) {
        setMessages(
          messageData.map(msg => ({
            ...msg,
            timestamp: msg.created_at
          }))
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
      throw error;
    }
  };

  const initializeChat = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      const { data: existingConversations, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching conversations:', fetchError);
        throw new Error('Failed to fetch conversations');
      }

      let conversationId: string;

      if (!existingConversations || existingConversations.length === 0) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_id: session.user.id,
            title: 'New Chat'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          throw new Error('Failed to create new conversation');
        }
        if (!newConversation) {
          throw new Error('Failed to create conversation');
        }
        conversationId = newConversation.id;
      } else {
        conversationId = existingConversations[0].id;
      }

      setCurrentConversationId(conversationId);
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initialize chat');
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setLoading(true);

      // Check message limit
      const canSendMessage = await api.checkMessageLimit();
      const info = await api.getMessageLimitInfo();
      
      if (!canSendMessage && !info.isPremium) {
        const info = await api.getMessageLimitInfo();
        setMessageLimitInfo(info);

        if (info.isPremium) {
          toast.error(`You've reached your daily limit of ${info.limit} messages`);
        } else {
          toast.error(
            'Daily message limit reached. Upgrade to premium for more messages!',
            {
              duration: 5000,
              icon: '⭐'
            }
          );
        }
        return;
      }

      if (!currentConversationId) {
        await initializeChat();
        if (!currentConversationId) {
          throw new Error('Failed to initialize conversation');
        }
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          role: 'user',
          content
        });

      if (insertError) {
        console.error('Error saving user message:', insertError);
        throw new Error('Failed to save message');
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const goalsContext = await getGoalsContext();

      let fullResponse = '';
      await streamCompletion(
        [
          {
            role: 'system',
            content: `You are Clara, a helpful and empathetic AI assistant. You provide thoughtful, personalized responses while maintaining a friendly and supportive tone. You help users with personal growth, goal setting, and emotional support.${goalsContext}`
          },
          ...messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          }))
        ],
        async (chunk) => {
          fullResponse += chunk;
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: fullResponse }
              ];
            }
            return prev;
          });
        }
      );

      const { error: saveError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          role: 'assistant',
          content: fullResponse
        });

      if (saveError) {
        console.error('Error saving assistant message:', saveError);
        throw new Error('Failed to save assistant response');
      }

      // Update message limit info after successful message
      await loadMessageLimitInfo();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const sendMessageNoStreaming = async (content: string) => {
    if (!content.trim()) return;

    try {
      setLoading(true);

      // Check message limit
      const canSendMessage = await api.checkMessageLimit();
      const info = await api.getMessageLimitInfo();
      
      if (!canSendMessage && !info.isPremium) {
        const info = await api.getMessageLimitInfo();
        setMessageLimitInfo(info);

        if (info.isPremium) {
          toast.error(`You've reached your daily limit of ${info.limit} messages`);
        } else {
          toast.error(
            'Daily message limit reached. Upgrade to premium for more messages!',
            {
              duration: 5000,
              icon: '⭐'
            }
          );
        }
        return;
      }

      if (!currentConversationId) {
        await initializeChat();
        if (!currentConversationId) {
          throw new Error('Failed to initialize conversation');
        }
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          role: 'user',
          content
        });

      if (insertError) {
        console.error('Error saving user message:', insertError);
        throw new Error('Failed to save message');
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const goalsContext = await getGoalsContext();

      let data = await chatCompletion(
        [
          {
            role: 'system',
            content: `You are Clara, a helpful and empathetic AI assistant. You provide thoughtful, personalized responses while maintaining a friendly and supportive tone. You help users with personal growth, goal setting, and emotional support.${goalsContext}`
          },
          ...messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          }))
        ]
      );

      let fullResponse = data;

      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: data }
          ];
        }
        return prev;
      });

      console.log('data', data)

      const { error: saveError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          role: 'assistant',
          content: fullResponse
        });

      if (saveError) {
        console.error('Error saving assistant message:', saveError);
        throw new Error('Failed to save assistant response');
      }

      // Update message limit info after successful message
      await loadMessageLimitInfo();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const switchConversation = async (conversationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', session.user.id)
        .single();

      if (convError) {
        console.error('Error verifying conversation:', convError);
        throw new Error('Failed to verify conversation');
      }
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      setCurrentConversationId(conversationId);
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error switching conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to switch conversation');
    }
  };

  const getGoalsContext = async () => {
    try {
      const goals = await api.getGoals();
      if (!goals.length) return '';

      const activeGoals = goals.filter(g => !g.completed);
      const completedGoals = goals.filter(g => g.completed);

      let context = '\nUser Goals Context:';

      if (activeGoals.length) {
        context += '\nActive Goals:';
        activeGoals.forEach(goal => {
          context += `\n- ${goal.title}${goal.deadline ? ` (Due: ${new Date(goal.deadline).toLocaleDateString()})` : ''}`;
          if (goal.description) context += `\n  Description: ${goal.description}`;
        });
      }

      if (completedGoals.length) {
        context += '\nRecently Completed Goals:';
        completedGoals.slice(0, 3).forEach(goal => {
          context += `\n- ${goal.title} (Completed: ${new Date(goal.created_at).toLocaleDateString()})`;
        });
      }

      return context;
    } catch (error) {
      console.error('Failed to fetch goals context:', error);
      return '';
    }
  };

  const clearChat = async () => {
    try {
      if (!currentConversationId) {
        throw new Error('No active conversation to clear');
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', currentConversationId);

      if (error) {
        console.error('Error clearing chat:', error);
        throw new Error('Failed to clear chat');
      }

      setMessages([]);
      toast.success('Chat cleared');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to clear chat');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        sendMessage,
        sendMessageNoStreaming,
        clearChat,
        switchConversation,
        messageLimitInfo
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Export the provider component separately
export const ChatProvider = React.memo(ChatProviderComponent);

// Export the hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};