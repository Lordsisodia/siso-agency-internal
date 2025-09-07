
import { Card } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Terminal, Code, CheckCircle, AlertCircle, Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type APIStatus = 'operational' | 'degraded' | 'outage';

interface API {
  id: string;
  name: string;
  description: string;
  status: APIStatus;
  version: string;
  baseUrl: string;
  authType: string;
  category: string;
  endpoints: APIEndpoint[];
}

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters?: {name: string, type: string, required: boolean, description: string}[];
  responses?: {code: string, description: string}[];
  example?: string;
}

// Mock data for APIs
const apis: API[] = [
  {
    id: '1',
    name: 'Wallet API',
    description: 'Core API for wallet creation, balance checks, and transactions',
    status: 'operational',
    version: '1.2.0',
    baseUrl: 'https://api.ubahcrypt.com/v1/wallet',
    authType: 'Bearer Token',
    category: 'Core',
    endpoints: [
      {
        path: '/create',
        method: 'POST',
        description: 'Create a new wallet for a user',
        parameters: [
          {name: 'user_id', type: 'string', required: true, description: 'Unique identifier for the user'},
          {name: 'wallet_type', type: 'string', required: true, description: 'Type of wallet to create (standard, multisig)'}
        ],
        responses: [
          {code: '201', description: 'Wallet created successfully'},
          {code: '400', description: 'Invalid parameters'},
          {code: '409', description: 'Wallet already exists'}
        ],
        example: `{
  "user_id": "usr_12345abcde",
  "wallet_type": "standard"
}`
      },
      {
        path: '/balance',
        method: 'GET',
        description: 'Get wallet balance',
        parameters: [
          {name: 'wallet_id', type: 'string', required: true, description: 'Wallet identifier'},
          {name: 'currency', type: 'string', required: false, description: 'Currency to get balance for'}
        ],
        responses: [
          {code: '200', description: 'Balance retrieved successfully'},
          {code: '404', description: 'Wallet not found'}
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Transaction API',
    description: 'API for handling all types of cryptocurrency transactions',
    status: 'operational',
    version: '1.1.5',
    baseUrl: 'https://api.ubahcrypt.com/v1/transactions',
    authType: 'API Key',
    category: 'Core',
    endpoints: [
      {
        path: '/create',
        method: 'POST',
        description: 'Create a new transaction',
        parameters: [
          {name: 'sender', type: 'string', required: true, description: 'Sender wallet address'},
          {name: 'recipient', type: 'string', required: true, description: 'Recipient wallet address'},
          {name: 'amount', type: 'number', required: true, description: 'Amount to transfer'},
          {name: 'currency', type: 'string', required: true, description: 'Currency to transfer'}
        ],
        responses: [
          {code: '201', description: 'Transaction created successfully'},
          {code: '400', description: 'Invalid parameters'},
          {code: '403', description: 'Insufficient funds'}
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Exchange Rate API',
    description: 'Real-time exchange rates for cryptocurrency conversions',
    status: 'degraded',
    version: '1.0.2',
    baseUrl: 'https://api.ubahcrypt.com/v1/rates',
    authType: 'API Key',
    category: 'Market Data',
    endpoints: [
      {
        path: '/current',
        method: 'GET',
        description: 'Get current exchange rates',
        parameters: [
          {name: 'base', type: 'string', required: false, description: 'Base currency'},
          {name: 'target', type: 'string', required: false, description: 'Target currency'}
        ],
        responses: [
          {code: '200', description: 'Rates retrieved successfully'},
          {code: '400', description: 'Invalid parameters'}
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Authentication API',
    description: 'User authentication and authorization services',
    status: 'operational',
    version: '2.0.0',
    baseUrl: 'https://api.ubahcrypt.com/v1/auth',
    authType: 'OAuth 2.0',
    category: 'Security',
    endpoints: [
      {
        path: '/token',
        method: 'POST',
        description: 'Generate authentication token',
        parameters: [
          {name: 'grant_type', type: 'string', required: true, description: 'OAuth grant type'},
          {name: 'client_id', type: 'string', required: true, description: 'Client identifier'},
          {name: 'client_secret', type: 'string', required: true, description: 'Client secret'}
        ],
        responses: [
          {code: '200', description: 'Token generated successfully'},
          {code: '401', description: 'Invalid credentials'}
        ]
      }
    ]
  }
];

export function APIsSection() {
  const [expandedAPI, setExpandedAPI] = useState<string | null>('1');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>('/create');

  const toggleAPI = (apiId: string) => {
    setExpandedAPI(expandedAPI === apiId ? null : apiId);
  };

  const getStatusColor = (status: APIStatus) => {
    switch (status) {
      case 'operational': return 'bg-green-500 text-green-100';
      case 'degraded': return 'bg-amber-500 text-amber-100';
      case 'outage': return 'bg-rose-500 text-rose-100';
      default: return 'bg-neutral-500 text-neutral-100';
    }
  };

  const getStatusIcon = (status: APIStatus) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      case 'outage': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: APIStatus) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded Performance';
      case 'outage': return 'Service Outage';
      default: return 'Unknown';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'POST': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">API Documentation</h2>
          <p className="text-neutral-400">Integration details for Ubahcrypt's RESTful APIs.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#9b87f5] hover:bg-[#8a76e4] text-white">
            API Console
          </Button>
          <Button variant="outline" className="border-white/10 text-white">
            API Key Management
          </Button>
        </div>
      </div>

      <AnimatedCard className="border border-white/10">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">API Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {apis.map((api) => (
              <div key={api.id} className="bg-black/30 border border-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium text-white">{api.name}</h4>
                  <Badge className={`${getStatusColor(api.status)} flex items-center gap-1`}>
                    {getStatusIcon(api.status)} {getStatusText(api.status)}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-400">v{api.version}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      <div className="space-y-4">
        {apis.map((api) => (
          <AnimatedCard key={api.id} className="border border-white/10">
            <div>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleAPI(api.id)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-[#9b87f5]/10 text-[#9b87f5]">
                    {api.category}
                  </Badge>
                  <h3 className="text-lg font-semibold text-white">{api.name}</h3>
                  <Badge variant="secondary" className="bg-black/30">v{api.version}</Badge>
                </div>
                <Button variant="ghost" size="icon">
                  {expandedAPI === api.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {expandedAPI === api.id && (
                <div className="mt-4 space-y-4">
                  <p className="text-neutral-300">{api.description}</p>
                  
                  <div className="bg-black/50 rounded-md p-4 flex items-center gap-3">
                    <Badge variant="outline" className="bg-black/30 text-neutral-300">Base URL</Badge>
                    <code className="text-sm text-[#9b87f5] flex-grow">{api.baseUrl}</code>
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-black/30 rounded-md">
                    <div className="border-b border-white/5 p-3">
                      <h4 className="text-md font-medium text-white">Endpoints</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 lg:divide-x lg:divide-white/5">
                      <div className="p-3 space-y-1">
                        {api.endpoints.map((endpoint) => (
                          <div 
                            key={endpoint.path}
                            className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${selectedEndpoint === endpoint.path ? 'bg-[#9b87f5]/10' : 'hover:bg-black/50'}`}
                            onClick={() => setSelectedEndpoint(endpoint.path)}
                          >
                            <Badge className={`${getMethodColor(endpoint.method)} border font-mono text-xs w-16 flex justify-center`}>
                              {endpoint.method}
                            </Badge>
                            <span className="text-sm text-white font-mono">{endpoint.path}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="lg:col-span-2 p-4 space-y-4">
                        {api.endpoints.find(e => e.path === selectedEndpoint) && (
                          <>
                            <div>
                              <h5 className="text-sm font-medium text-white mb-2">Description</h5>
                              <p className="text-sm text-neutral-300">
                                {api.endpoints.find(e => e.path === selectedEndpoint)?.description}
                              </p>
                            </div>
                            
                            {api.endpoints.find(e => e.path === selectedEndpoint)?.parameters && (
                              <div>
                                <h5 className="text-sm font-medium text-white mb-2">Parameters</h5>
                                <div className="bg-black/30 rounded-md overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="border-b border-white/10">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs text-neutral-400 font-medium">Name</th>
                                        <th className="px-4 py-2 text-left text-xs text-neutral-400 font-medium">Type</th>
                                        <th className="px-4 py-2 text-left text-xs text-neutral-400 font-medium">Required</th>
                                        <th className="px-4 py-2 text-left text-xs text-neutral-400 font-medium">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {api.endpoints.find(e => e.path === selectedEndpoint)?.parameters?.map((param, idx) => (
                                        <tr key={idx} className="border-b border-white/5 last:border-0">
                                          <td className="px-4 py-2 text-white font-mono">{param.name}</td>
                                          <td className="px-4 py-2 text-[#9b87f5]">{param.type}</td>
                                          <td className="px-4 py-2 text-neutral-300">{param.required ? 'Yes' : 'No'}</td>
                                          <td className="px-4 py-2 text-neutral-300">{param.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            
                            {api.endpoints.find(e => e.path === selectedEndpoint)?.responses && (
                              <div>
                                <h5 className="text-sm font-medium text-white mb-2">Responses</h5>
                                <div className="bg-black/30 rounded-md overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="border-b border-white/10">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs text-neutral-400 font-medium">Code</th>
                                        <th className="px-4 py-2 text-left text-xs text-neutral-400 font-medium">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {api.endpoints.find(e => e.path === selectedEndpoint)?.responses?.map((response, idx) => (
                                        <tr key={idx} className="border-b border-white/5 last:border-0">
                                          <td className="px-4 py-2">
                                            <Badge 
                                              className={
                                                response.code.startsWith('2') ? 'bg-green-500/20 text-green-400' :
                                                response.code.startsWith('4') ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-rose-500/20 text-rose-400'
                                              }
                                            >{response.code}</Badge>
                                          </td>
                                          <td className="px-4 py-2 text-neutral-300">{response.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            
                            {api.endpoints.find(e => e.path === selectedEndpoint)?.example && (
                              <div>
                                <h5 className="text-sm font-medium text-white mb-2">Example Request</h5>
                                <div className="bg-black/60 rounded-md p-4 font-mono text-sm text-[#9b87f5] overflow-x-auto">
                                  <pre className="whitespace-pre-wrap break-words">
                                    {api.endpoints.find(e => e.path === selectedEndpoint)?.example}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm pt-2">
                    <div className="text-neutral-400">
                      Authentication: <span className="text-white">{api.authType}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#9b87f5] flex items-center gap-1">
                      API Docs <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
}
