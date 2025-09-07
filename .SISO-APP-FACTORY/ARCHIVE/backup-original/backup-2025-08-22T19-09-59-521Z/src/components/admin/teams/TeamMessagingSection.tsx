
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  SendHorizontal, Users, UserCircle, Search,
  MessageSquare, PaperclipIcon, SmileIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  participants: number;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export function TeamMessagingSection() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock conversations data - in a real app this would come from your database
  const mockConversations: Conversation[] = [
    {
      id: 'team-general',
      type: 'group',
      name: 'Team General',
      avatar: '',
      participants: 8,
      lastMessage: 'Don\'t forget the team meeting tomorrow at 10 AM',
      lastTimestamp: '10:45 AM',
      unreadCount: 3
    },
    {
      id: 'alex-johnson',
      type: 'direct',
      name: 'Alex Johnson',
      avatar: '',
      participants: 1,
      lastMessage: 'I\'ve updated the design files as discussed',
      lastTimestamp: 'Yesterday',
      unreadCount: 0
    },
    {
      id: 'project-redesign',
      type: 'group',
      name: 'Website Redesign',
      avatar: '',
      participants: 5,
      lastMessage: 'The new mockups look great!',
      lastTimestamp: 'Yesterday',
      unreadCount: 2
    },
    {
      id: 'sam-rodriguez',
      type: 'direct',
      name: 'Sam Rodriguez',
      avatar: '',
      participants: 1,
      lastMessage: 'Let me know when you have time to discuss the API',
      lastTimestamp: 'Monday',
      unreadCount: 0
    },
    {
      id: 'marketing-team',
      type: 'group',
      name: 'Marketing Team',
      avatar: '',
      participants: 4,
      lastMessage: 'The campaign numbers look promising',
      lastTimestamp: 'Last week',
      unreadCount: 0
    }
  ];
  
  // Mock messages for the selected conversation
  const mockMessages: Record<string, Message[]> = {
    'team-general': [
      {
        id: 'm1',
        sender: {
          id: 'casey',
          name: 'Casey Wilson',
          avatar: ''
        },
        content: 'Good morning everyone! Don\'t forget the team meeting tomorrow at 10 AM.',
        timestamp: '2025-06-10T10:45:00'
      },
      {
        id: 'm2',
        sender: {
          id: 'alex',
          name: 'Alex Johnson',
          avatar: ''
        },
        content: 'Thanks for the reminder! Will there be a video call link?',
        timestamp: '2025-06-10T10:48:00'
      },
      {
        id: 'm3',
        sender: {
          id: 'casey',
          name: 'Casey Wilson',
          avatar: ''
        },
        content: 'Yes, I\'ll share the link 15 minutes before the meeting.',
        timestamp: '2025-06-10T10:52:00'
      },
      {
        id: 'm4',
        sender: {
          id: 'morgan',
          name: 'Morgan Lee',
          avatar: ''
        },
        content: 'Great! I\'ll prepare a short update on the marketing campaign.',
        timestamp: '2025-06-10T11:05:00'
      }
    ],
    'alex-johnson': [
      {
        id: 'm1',
        sender: {
          id: 'alex',
          name: 'Alex Johnson',
          avatar: ''
        },
        content: 'Hi! I\'ve updated the design files as discussed.',
        timestamp: '2025-06-09T16:30:00'
      },
      {
        id: 'm2',
        sender: {
          id: 'current-user',
          name: 'You',
          avatar: ''
        },
        content: 'Thanks Alex! I\'ll take a look at them right away.',
        timestamp: '2025-06-09T16:35:00'
      },
      {
        id: 'm3',
        sender: {
          id: 'alex',
          name: 'Alex Johnson',
          avatar: ''
        },
        content: 'Let me know if you need any changes.',
        timestamp: '2025-06-09T16:40:00'
      }
    ]
  };
  
  // Filter conversations based on search
  const filteredConversations = mockConversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get messages for selected chat
  const activeMessages = selectedChat ? (mockMessages[selectedChat] || []) : [];
  
  // Get selected conversation details
  const selectedConversation = mockConversations.find(c => c.id === selectedChat);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedChat) return;
    
    // In a real app, you would send the message to your backend
    // and then update the UI when you receive a response
    console.log('Sending message:', messageText, 'to chat:', selectedChat);
    
    // Clear the input
    setMessageText('');
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Tabs defaultValue="team">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="team" className="flex-1 rounded-none">
            <MessageSquare className="h-4 w-4 mr-2" /> Team Chat
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex-1 rounded-none">
            <UserCircle className="h-4 w-4 mr-2" /> Direct Messages
          </TabsTrigger>
        </TabsList>
        
        <div className="grid md:grid-cols-[300px_1fr] h-[500px] max-h-[500px]">
          {/* Conversations List */}
          <div className="border-r">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(500px-56px)]">
              <div className="divide-y">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  filteredConversations.map(conversation => (
                    <div 
                      key={conversation.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 ${
                        selectedChat === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedChat(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        {conversation.type === 'group' ? (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback className="bg-primary/10">
                              {conversation.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate">{conversation.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {conversation.lastTimestamp}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground truncate">
                              {conversation.type === 'group' && (
                                <span className="text-xs text-primary">
                                  {conversation.participants} members • 
                                </span>
                              )}{' '}
                              {conversation.lastMessage}
                            </div>
                            
                            {conversation.unreadCount > 0 && (
                              <Badge className="ml-2">{conversation.unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Chat Area */}
          <div className="flex flex-col h-full">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedConversation?.type === 'group' ? (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10">
                          {selectedConversation?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div>
                      <div className="font-medium">{selectedConversation?.name}</div>
                      {selectedConversation?.type === 'group' && (
                        <div className="text-xs text-muted-foreground">
                          {selectedConversation.participants} members
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {activeMessages.map(message => (
                      <div 
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.sender.id === 'current-user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.sender.id !== 'current-user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10">
                              {message.sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[75%] ${
                          message.sender.id === 'current-user' ? 'order-first' : ''
                        }`}>
                          {message.sender.id !== 'current-user' && (
                            <div className="text-sm font-medium mb-1">
                              {message.sender.name}
                            </div>
                          )}
                          
                          <div className={`rounded-lg p-3 ${
                            message.sender.id === 'current-user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            {message.content}
                            <div className={`text-xs mt-1 ${
                              message.sender.id === 'current-user' 
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        {message.sender.id === 'current-user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10">
                              Y
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="p-3 border-t">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0"
                    >
                      <PaperclipIcon className="h-4 w-4" />
                    </Button>
                    
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-10 resize-none"
                    />
                    
                    <div className="flex-shrink-0 flex gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                      >
                        <SmileIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!messageText.trim()}
                      >
                        <SendHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-1">No Conversation Selected</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Choose a conversation from the list or start a new one.
                  </p>
                  <Button variant="outline" className="mt-4">
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
