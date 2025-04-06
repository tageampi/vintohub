import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SellerDashboardLayout from "@/components/sellers/SellerDashboardLayout";
import { User, Message } from "@shared/schema";
import { useChat } from "@/hooks/use-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageCircle, AlertCircle, Clock } from "lucide-react";
import { formatDateToLocal } from "@/lib/utils";
import ChatInterface from "@/components/chat/ChatInterface";
import { MessageThread } from "@/types";

export default function SellerMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    conversations, 
    activeConversation, 
    sendMessage, 
    setActiveUser, 
    activeUserId, 
    connectionStatus, 
    loadingConversations 
  } = useChat();

  // Filter conversations by search query
  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <SellerDashboardLayout title="Customer Messages">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <div className="border rounded-lg bg-white overflow-hidden md:col-span-1">
          <div className="p-4 border-b">
            <h3 className="font-medium mb-2">Conversations</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col h-[calc(100%-5rem)]">
            {loadingConversations ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                {searchQuery ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No conversations match your search</p>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">When customers message you, they'll appear here</p>
                  </>
                )}
              </div>
            ) : (
              <ScrollArea className="flex-1">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.userId}
                    className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 text-left ${
                      activeUserId === conversation.userId ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => setActiveUser(conversation.userId)}
                  >
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{conversation.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{conversation.username}</p>
                        <span className="text-xs text-gray-500">
                          {formatDateToLocal(conversation.lastMessage.createdAt, { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </span>
                      </div>
                      <p className="text-sm truncate text-gray-500">
                        {conversation.lastMessage.content}
                      </p>
                      {!conversation.lastMessage.read && conversation.lastMessage.receiverId === conversation.userId && (
                        <Badge variant="default" className="mt-1">New</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="border rounded-lg bg-white overflow-hidden md:col-span-2 lg:col-span-3 flex flex-col">
          {activeUserId ? (
            <ChatInterface 
              messages={activeConversation} 
              onSendMessage={(content) => sendMessage(activeUserId, content)}
              receiver={conversations.find(c => c.userId === activeUserId)?.username || ''}
              connectionStatus={connectionStatus}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your Messages</h3>
              <p className="text-gray-500 max-w-md">
                Select a conversation from the list to view and respond to customer messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </SellerDashboardLayout>
  );
}
