import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { formatDateToLocal } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ChatMessage } from "@/types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  receiver: string;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  receiver,
  connectionStatus 
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (newMessage.trim() && connectionStatus === 'connected') {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  // Group messages by date
  const groupedMessages: { [date: string]: ChatMessage[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="" />
            <AvatarFallback>{receiver.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{receiver}</h3>
            <div className="flex items-center text-xs text-gray-500">
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="h-3 w-3 mr-1 text-green-500" />
                  <span>Connected</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin text-amber-500" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1 text-red-500" />
                  <span>Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div ref={scrollAreaRef} className="space-y-6">
          {Object.keys(groupedMessages).map(date => (
            <div key={date} className="space-y-3">
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs text-gray-500">{date}</span>
                </div>
              </div>

              {groupedMessages[date].map((message, idx) => {
                const isSentByMe = message.senderId === user?.id;
                
                return (
                  <div 
                    key={idx} 
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isSentByMe ? 'order-1' : 'order-2'}`}>
                      {!isSentByMe && (
                        <Avatar className="h-8 w-8 mb-1">
                          <AvatarImage src="" />
                          <AvatarFallback>{receiver.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div 
                        className={`rounded-lg px-4 py-2 ${
                          isSentByMe 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <div 
                        className={`text-xs text-gray-500 mt-1 flex items-center ${
                          isSentByMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {formatDateToLocal(message.createdAt, { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: true 
                        })}
                        {isSentByMe && message.status && (
                          <Badge 
                            variant="outline" 
                            className="ml-2 py-0 px-1 h-4 text-[10px]"
                          >
                            {message.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet</p>
              <p className="text-xs mt-1">Send a message to start the conversation</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="flex-1 relative">
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-12 max-h-32 resize-none"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={connectionStatus !== 'connected'}
            />
          </div>
          <Button
            className="ml-2"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionStatus !== 'connected'}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {connectionStatus !== 'connected' && (
          <p className="text-xs text-red-500 mt-1">
            {connectionStatus === 'connecting' 
              ? 'Connecting to chat server...' 
              : 'Connection lost. Messages cannot be sent right now.'}
          </p>
        )}
      </div>
    </div>
  );
}
