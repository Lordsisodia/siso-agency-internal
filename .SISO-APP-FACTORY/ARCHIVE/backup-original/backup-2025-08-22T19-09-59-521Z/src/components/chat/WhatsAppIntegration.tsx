
import { useState, useEffect } from 'react';
import { Check, QrCode, RefreshCw, Settings, Smartphone, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  from: 'app' | 'whatsapp';
  status: 'sent' | 'delivered' | 'read';
}

export function WhatsAppIntegration() {
  const { user } = useAuthSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [autoForward, setAutoForward] = useState(true);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  
  // Check connection status on component mount
  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);
  
  // Function to check WhatsApp connection status
  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-integration', {
        body: { action: 'status' },
      });
      
      if (error) throw error;
      
      setIsConnected(data.connected);
      if (data.qrCode) {
        setQrCodeUrl(data.qrCode);
      }
      
      // Load recent message history
      if (data.messages) {
        setRecentMessages(data.messages);
      }
      
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };
  
  // Function to initiate WhatsApp connection
  const connectWhatsApp = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-integration', {
        body: { action: 'connect' },
      });
      
      if (error) throw error;
      
      if (data.qrCode) {
        setQrCodeUrl(data.qrCode);
        toast({
          title: 'QR Code Generated',
          description: 'Scan the QR code with WhatsApp on your phone',
          duration: 5000,
        });
      }
      
    } catch (error) {
      console.error('Error connecting to WhatsApp:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to WhatsApp. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Function to disconnect WhatsApp
  const disconnectWhatsApp = async () => {
    try {
      const { error } = await supabase.functions.invoke('whatsapp-integration', {
        body: { action: 'disconnect' },
      });
      
      if (error) throw error;
      
      setIsConnected(false);
      setQrCodeUrl(null);
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from WhatsApp',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    }
  };
  
  // Function to toggle auto-forward setting
  const toggleAutoForward = async () => {
    const newValue = !autoForward;
    setAutoForward(newValue);
    
    try {
      const { error } = await supabase.functions.invoke('whatsapp-integration', {
        body: { action: 'settings', autoForward: newValue },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Settings Updated',
        description: `Auto-forward ${newValue ? 'enabled' : 'disabled'}`,
      });
      
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert the UI state if the API call fails
      setAutoForward(!newValue);
    }
  };

  return (
    <Card className="border-white/10 bg-black/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-white">WhatsApp Integration</CardTitle>
            <CardDescription className="text-gray-400">Connect your SISO Assistant to WhatsApp</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 bg-black/20 rounded-full px-3 py-1.5 border border-white/10">
            {isConnected ? (
              <>
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="text-green-500 text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                <span className="text-red-500 text-sm font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={isConnected ? "messages" : "connect"} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 bg-black/20">
            <TabsTrigger value="connect">Connection</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-4">
            {isConnected ? (
              <div className="flex flex-col items-center text-center gap-4 p-6">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-white">WhatsApp Connected</h3>
                <p className="text-gray-400 max-w-lg">
                  Your SISO Assistant is now linked to your WhatsApp account. Messages will be synchronized between platforms.
                </p>
                <Button 
                  variant="destructive"
                  className="mt-2"
                  onClick={disconnectWhatsApp}
                >
                  Disconnect WhatsApp
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4">
                {qrCodeUrl ? (
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={qrCodeUrl} 
                      alt="WhatsApp QR Code" 
                      className="w-64 h-64 object-contain" 
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-black/40 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-500" />
                  </div>
                )}
                
                <div className="space-y-2 max-w-lg">
                  <h3 className="text-xl font-medium text-white">Connect to WhatsApp</h3>
                  <p className="text-gray-400">
                    Link your WhatsApp account to sync messages between SISO Assistant and WhatsApp.
                  </p>
                  <ol className="text-left text-gray-400 text-sm space-y-1 mt-4">
                    <li>1. Click the "Generate QR Code" button below</li>
                    <li>2. Open WhatsApp on your phone</li>
                    <li>3. Go to Settings &gt; Linked Devices &gt; Link a Device</li>
                    <li>4. Scan the QR code with your phone</li>
                  </ol>
                </div>
                
                <Button
                  className="bg-green-600 hover:bg-green-700 mt-2"
                  onClick={connectWhatsApp}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating QR Code...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Recent Messages</h3>
              
              {recentMessages.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {recentMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-3 rounded-lg flex items-start gap-2 ${
                        message.from === 'app' 
                          ? 'bg-siso-red/20 ml-8' 
                          : 'bg-gray-800/50 mr-8'
                      }`}
                    >
                      <div className={`p-1 rounded-full ${
                        message.from === 'app' 
                          ? 'bg-siso-red/30' 
                          : 'bg-green-600/30'
                      }`}>
                        {message.from === 'app' ? (
                          <svg className="h-3 w-3 text-siso-red" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg className="h-3 w-3 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.51 12.177C2.857 11.211 2.5 10.09 2.5 9C2.5 5.5 5.5 2.5 9 2.5C12.5 2.5 15.5 5.5 15.5 9C15.5 12.5 12.5 15.5 9 15.5C7.91 15.5 6.789 15.143 5.823 14.49L2.5 15.5L3.51 12.177Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10.5 9C10.5 12.5 13.5 15.5 17 15.5C18.09 15.5 19.211 15.143 20.177 14.49L23.5 15.5L22.49 12.177C23.143 11.211 23.5 10.09 23.5 9C23.5 5.5 20.5 2.5 17 2.5C15.167 2.5 13.523 3.361 12.5 4.715" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-white">{message.content}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {message.from === 'app' && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              {message.status === 'read' ? (
                                <svg className="h-3 w-3 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4.5 12.75L10.5 18.75L19.5 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : message.status === 'delivered' ? (
                                <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4.5 12.75L10.5 18.75M10.5 18.75L19.5 5.25M10.5 18.75L19.5 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4.5 12.75L10.5 18.75L19.5 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              {message.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-400">No recent messages</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-white/5">
                <Button
                  variant="outline"
                  className="w-full bg-black/40 border-white/10 hover:bg-black/60"
                  onClick={checkConnectionStatus}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Message History
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Messaging Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-white">Auto-forward messages</h4>
                    <p className="text-xs text-gray-400">Automatically send messages to WhatsApp</p>
                  </div>
                  <Switch 
                    checked={autoForward} 
                    onCheckedChange={toggleAutoForward}
                    disabled={!isConnected}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-white">WhatsApp notifications</h4>
                    <p className="text-xs text-gray-400">Receive notification on WhatsApp</p>
                  </div>
                  <Switch disabled={!isConnected} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-white">Save chat history</h4>
                    <p className="text-xs text-gray-400">Store conversations for later reference</p>
                  </div>
                  <Switch defaultChecked disabled={!isConnected} />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-medium text-white">General Settings</h3>
              
              <Button
                variant="outline"
                className="w-full bg-black/40 border-white/10 hover:bg-black/60 flex justify-between"
                disabled={!isConnected}
              >
                <span>Account Settings</span>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-white/10 pt-4">
        <p className="text-xs text-gray-500">
          Messages sent through this integration are end-to-end encrypted
        </p>
        
        {isConnected && (
          <span className="text-xs flex items-center gap-1 text-green-500">
            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Active
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
