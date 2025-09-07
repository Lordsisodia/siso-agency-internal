#!/bin/bash
# 🚀 AUTONOMOUS TRILLION-DOLLAR RESEARCH LAUNCHER

echo "🚀 LAUNCHING AUTONOMOUS TRILLION-DOLLAR RESEARCH SYSTEM"
echo "=" * 60

cd "/Users/shaansisodia/DEV/SISO-INTERNAL/trillion-dollar-research/"

echo "📁 Current Directory: $(pwd)"
echo "🐍 Python Version: $(python3 --version)"
echo "⏰ Start Time: $(date)"
echo "🎯 Mission: Execute 97 remaining research steps autonomously"
echo ""

# Option 1: Run in foreground (you can see live output)
echo "🔄 Choose execution mode:"
echo "1) Foreground (see live progress, Ctrl+C to stop)"
echo "2) Background (runs independently, logs to file)"
echo ""
read -p "Select mode (1 or 2): " mode

if [ "$mode" = "2" ]; then
    echo "🔄 Starting in BACKGROUND mode..."
    echo "📄 Output will be logged to: research_execution.log"
    echo "📊 Monitor progress: tail -f research_execution.log"
    echo "🛑 Stop system: kill $(ps aux | grep start_continuous_research.py | grep -v grep | awk '{print $2}')"
    echo ""
    
    nohup python3 start_continuous_research.py > research_execution.log 2>&1 &
    
    echo "✅ System launched in background!"
    echo "📊 Check progress: tail -f research_execution.log"
    echo "🔍 Find process: ps aux | grep start_continuous_research"
    
else
    echo "🔄 Starting in FOREGROUND mode..."
    echo "🛑 Press Ctrl+C to stop system"
    echo "📊 Live progress will be displayed below:"
    echo ""
    
    python3 start_continuous_research.py
fi