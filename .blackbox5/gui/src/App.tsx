import { useEffect, useState } from 'react'
import { Activity, Brain, Server, Terminal } from 'lucide-react'

// Types
interface EngineStatus {
  status: string
  context_health: {
    status: string
    usage_pct: number
    color: string
    advice: string
  }
  current_task: string
}

interface TaskData {
  content: string
}

function App() {
  const [status, setStatus] = useState<EngineStatus | null>(null)
  const [taskContent, setTaskContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Poll status every 5 seconds
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/status')
        const data = await res.json()
        setStatus(data)

        const taskRes = await fetch('http://localhost:8000/tasks')
        const taskData = await taskRes.json()
        setTaskContent(taskData.content)
      } catch (err) {
        console.error('Failed to connect to Engine API', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Black Box Mission Control
          </h1>
          <p className="text-slate-400">Engine v5.0 Active</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
            <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-medium">{status ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Context Health Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Brain className="w-5 h-5" />
            <h3 className="uppercase text-xs font-bold tracking-wider">Context Health</h3>
          </div>
          {status ? (
            <div>
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-4xl font-mono font-bold text-${status.context_health.color.toLowerCase()}-400`}>
                  {status.context_health.usage_pct}%
                </span>
                <span className="text-slate-500 mb-1">used</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full bg-${status.context_health.color.toLowerCase()}-500 transition-all duration-500`}
                  style={{ width: `${status.context_health.usage_pct}%` }}
                />
              </div>
              <p className="text-sm text-slate-300">{status.context_health.advice}</p>
            </div>
          ) : (
            <div className="text-slate-500 animate-pulse">Connecting to Neural Link...</div>
          )}
        </div>

        {/* Active Task Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl backdrop-blur-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Terminal className="w-5 h-5" />
            <h3 className="uppercase text-xs font-bold tracking-wider">Current Activity</h3>
          </div>
          {status ? (
            <div className="font-mono text-lg text-blue-300">
              &gt; {status.current_task}
            </div>
          ) : (
            <div className="text-slate-500">Waiting for telemetry...</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Task List (Raw Markdown for now) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm flex flex-col overflow-hidden col-span-2">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-4 h-4" />
              <span className="font-medium text-sm">Mission Logs</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
            {loading ? 'Loading mission data...' : taskContent || 'No active mission file detected.'}
          </div>
        </div>

        {/* Agents Panel */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-slate-400">
            <Server className="w-4 h-4" />
            <span className="font-medium text-sm">Active Agents</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-indigo-400">Orchestrator</span>
                <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">IDLE</span>
              </div>
              <p className="text-xs text-slate-500">Core Planner & Context Manager</p>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 opacity-50">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-amber-400">Executor</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">OFFLINE</span>
              </div>
              <p className="text-xs text-slate-500">Task implementation specialist</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
