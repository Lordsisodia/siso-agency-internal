import React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectHeader } from '@/components/projects/details/ProjectHeader';
import { ProjectCardNavigation } from '@/components/projects/details/ProjectCardNavigation';
import { UserFlowNavigation } from '@/components/projects/userflow/UserFlowNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Copy, Code } from 'lucide-react';

export default function UserFlowCodePage() {
  const { projectId = '123' } = useParams<{ projectId: string }>();
  
  // Mock project data - this would come from an API in a real app
  const projectData = {
    name: 'UbahCrypt Project',
    description: 'A revolutionary blockchain-based cryptocurrency platform with enhanced security features and cross-chain capabilities.',
    status: 'ACTIVE',
    created_at: '2025-04-01T10:00:00Z',
  };
  
  // Sample React code export
  const reactCode = `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import UserProfile from './screens/UserProfile';
import WalletView from './screens/WalletView';
import TradingInterface from './screens/TradingInterface';
import SecurityCenter from './screens/SecurityCenter';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/wallet" element={<WalletView />} />
      <Route path="/trading" element={<TradingInterface />} />
      <Route path="/security" element={<SecurityCenter />} />
    </Routes>
  );
}`;

  // Sample Swift code export
  const swiftCode = `import SwiftUI

@main
struct UbahCryptApp: App {
    var body: some Scene {
        WindowGroup {
            NavigationView {
                LoginScreen()
            }
        }
    }
}

struct LoginScreen: View {
    @State private var username: String = ""
    @State private var password: String = ""
    
    var body: some View {
        VStack {
            // Login form
            TextField("Username", text: $username)
            SecureField("Password", text: $password)
            
            NavigationLink(destination: DashboardScreen()) {
                Text("Log In")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
        .padding()
        .navigationTitle("Login")
    }
}

struct DashboardScreen: View {
    var body: some View {
        TabView {
            WalletView()
                .tabItem {
                    Label("Wallet", systemImage: "wallet.pass")
                }
            
            TradingView()
                .tabItem {
                    Label("Trading", systemImage: "arrow.left.arrow.right")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
        .navigationTitle("Dashboard")
    }
}`;
  
  return (
    <>
      {/* Project Header */}
      <ProjectHeader 
        name={projectData.name} 
        description={projectData.description} 
        status={projectData.status} 
        created_at={projectData.created_at} 
      />
      
      {/* Project Card Navigation */}
      <ProjectCardNavigation projectId={projectId} />
      
      {/* User Flow Navigation */}
      <UserFlowNavigation 
        projectId={projectId}
        projectName="Agency Onboarding App"
        status="draft"
      />
      
      {/* Code Export Content */}
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Code Export</h2>
            <p className="text-sm text-gray-400">Generate boilerplate code from your user flow</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select defaultValue="react">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="swift">Swift</SelectItem>
                <SelectItem value="kotlin">Kotlin</SelectItem>
                <SelectItem value="flutter">Flutter</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Code
            </Button>
          </div>
        </div>
        
        <Card className="bg-black/20 border border-siso-text/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium flex items-center">
                <Code className="mr-2 h-5 w-5 text-blue-400" />
                Generated Code
              </CardTitle>
              <Button variant="outline" size="sm" className="h-8">
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="react" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="react">React Router</TabsTrigger>
                <TabsTrigger value="swift">Swift UI</TabsTrigger>
              </TabsList>
              
              <TabsContent value="react">
                <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono">
                    {reactCode}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="swift">
                <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono">
                    {swiftCode}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 