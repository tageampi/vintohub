import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Message } from "@shared/schema";

interface Conversation {
  userId: number;
  username: string;
  lastMessage: Message;
}

interface ChatMessage extends Message {
  status?: 'sent' | 'delivered' | 'read';
}

type ChatContextType = {
  conversations: Conversation[];
  activeConversation: ChatMessage[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendMessage: (receiverId: number, content: string) => void;
  setActiveUser: (userId: number) => void;
  activeUserId: number | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user,
  });

  // Fetch messages for active conversation
  const { data: activeConversationData = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages', activeUserId],
    enabled: !!user && !!activeUserId,
    onSuccess: (data) => {
      if (activeUserId) {
        setMessages(prev => ({
          ...prev,
          [activeUserId]: data as ChatMessage[]
        }));
      }
    }
  });

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    setConnectionStatus('connecting');

    ws.onopen = () => {
      setConnectionStatus('connected');
      // Authenticate with the WebSocket server
      ws.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    ws.onerror = () => {
      setConnectionStatus('disconnected');
      toast({
        title: "Connection error",
        description: "Failed to connect to chat server",
        variant: "destructive"
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ChatMessage;
        if (data.type === 'message') {
          const partnerId = data.senderId === user.id ? data.receiverId : data.senderId;
          
          setMessages(prev => {
            const conversationMessages = prev[partnerId] || [];
            return {
              ...prev,
              [partnerId]: [...conversationMessages, data]
            };
          });
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user]);

  const sendMessage = (receiverId: number, content: string) => {
    if (!socket || connectionStatus !== 'connected' || !user) {
      toast({
        title: "Cannot send message",
        description: "You are not connected to the chat server",
        variant: "destructive"
      });
      return;
    }

    const message = {
      type: 'message',
      senderId: user.id,
      receiverId,
      content
    };

    socket.send(JSON.stringify(message));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation: activeUserId ? (messages[activeUserId] || []) : [],
        loadingConversations,
        loadingMessages,
        sendMessage,
        setActiveUser: setActiveUserId,
        activeUserId,
        connectionStatus
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
