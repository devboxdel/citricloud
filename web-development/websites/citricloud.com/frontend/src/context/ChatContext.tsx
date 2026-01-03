import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  name?: string;
  message: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  user_name: string;
  user_email: string;
  status: 'active' | 'closed';
  messages: ChatMessage[];
  created_at: string;
  last_message_at: string;
}

interface ChatContextType {
  sessions: ChatSession[];
  addSession: (session: ChatSession) => void;
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  closeSession: (id: string) => void;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  getActiveSessionsCount: () => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem('chat-sessions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((session: any) => ({
          ...session,
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (session: ChatSession) => {
    console.log('➕ ChatContext: Adding session', session);
    setSessions(prev => {
      const updated = [...prev, session];
      console.log('📝 ChatContext: Updated sessions', updated);
      return updated;
    });
  };

  const updateSession = (id: string, updates: Partial<ChatSession>) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, ...updates } : session
      )
    );
  };

  const closeSession = (id: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, status: 'closed' as const } : session
      )
    );
  };

  const addMessageToSession = (sessionId: string, message: ChatMessage) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              messages: [...session.messages, message],
              last_message_at: new Date().toISOString(),
            }
          : session
      )
    );
  };

  const getActiveSessionsCount = () => {
    return sessions.filter(s => s.status === 'active').length;
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        addSession,
        updateSession,
        closeSession,
        addMessageToSession,
        getActiveSessionsCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
