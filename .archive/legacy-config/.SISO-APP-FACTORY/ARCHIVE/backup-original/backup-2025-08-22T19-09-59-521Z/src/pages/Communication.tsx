
import { AppLayout } from '@/components/layout/AppLayout';
import { Helmet } from 'react-helmet';
import { Waves } from '@/components/ui/waves-background';
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { WhatsAppIntegration } from '@/components/chat/WhatsAppIntegration';

export default function Communication() {
  return (
    <AppLayout>
      <Helmet>
        <title>SISO Assistant | SISO Resource Hub</title>
      </Helmet>

      <div className="relative flex flex-col min-h-screen w-full">
        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          <FloatingOrbs />
        </div>
        
        <div className="absolute inset-0 z-10">
          <Waves 
            lineColor="rgba(249, 115, 22, 0.15)"
            backgroundColor="transparent"
            waveSpeedX={0.018}
            waveSpeedY={0.015}
            waveAmpX={70}
            waveAmpY={35}
            friction={0.92}
            tension={0.012}
            maxCursorMove={180}
            xGap={22}
            yGap={55}
          />
        </div>

        {/* Content container */}
        <div className="relative z-20 container mx-auto px-4 py-8 flex flex-col flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">SISO Assistant</h1>
            <p className="text-gray-400">
              Your AI assistant to help with project planning and communication
            </p>
          </div>
          
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6 bg-black/30">
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col">
              {/* Reusing the existing v0 chat component */}
              <VercelV0Chat />
            </TabsContent>
            
            <TabsContent value="integrations" className="space-y-8">
              <h2 className="text-xl font-semibold text-white">Communication Channels</h2>
              <WhatsAppIntegration />
              
              <div className="mt-8 p-4 border border-white/10 bg-black/30 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">About WhatsApp Integration</h3>
                <p className="text-gray-400 text-sm">
                  Link your WhatsApp account to SISO Assistant to receive messages and updates directly on your phone. 
                  Your conversations will be synced between platforms, allowing you to continue discussions 
                  seamlessly whether you're on this platform or on WhatsApp.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
