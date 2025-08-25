# 🧠 Legacy AI Setup Guide

## Overview
Your Legacy AI system now supports multiple intelligence backends with real-time data streaming from your Mac mini.

## 🚀 Quick Start (Recommended: Groq + GitHub Streaming)

### 1. Get Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up/login and create an API key
3. Add to your `.env` file:
```bash
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 2. Set Up GitHub Data Streaming Repository
1. Create a new GitHub repository named `system-data-stream`
2. Generate a Personal Access Token with repo permissions
3. Add to your `.env` file:
```bash
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=system-data-stream
VITE_GITHUB_TOKEN=your_github_token
```

### 3. Mac Mini Data Collection Setup

#### Option A: Automated Script (Recommended)
1. Copy the setup script from `src/services/githubDataStreamer.ts`
2. Save as `collect-system-data.sh` on your Mac mini
3. Update variables in the script:
```bash
REPO_OWNER="your-github-username"
REPO_NAME="system-data-stream"
GITHUB_TOKEN="your-github-token"
```
4. Make executable and run:
```bash
chmod +x collect-system-data.sh
./collect-system-data.sh
```

#### Option B: Manual Data Streaming
Create a cron job that runs every 2 minutes:
```bash
# Edit crontab
crontab -e

# Add this line (adjust paths as needed)
*/2 * * * * /path/to/your/collect-system-data.sh
```

## 📊 Data Sources You Can Stream

### WhatsApp Data
- **Business API**: Use WhatsApp Business API for message data
- **Web Scraping**: Automate WhatsApp Web (requires careful implementation)
- **Export Tools**: Use third-party WhatsApp export tools

### Telegram Data
- **Bot API**: Create Telegram bots to monitor channels
- **CLI Tools**: Use telegram-cli or similar tools
- **Channel Monitoring**: Monitor public channels you're subscribed to

### System Monitoring
- **macOS Built-ins**: `top`, `vm_stat`, `df`, `iostat`
- **Third-party**: Install monitoring tools like `htop`, `glances`
- **Custom Scripts**: Build specific monitoring for your needs

### Agent/Automation Systems
- **API Monitoring**: Monitor your automation APIs
- **Log Parsing**: Parse log files from your agents
- **Health Checks**: Create custom health check endpoints

## 🛠️ Advanced Configurations

### Alternative Models

#### Option 1: Claude Code Integration
```bash
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_LEGACY_AI_MODE=claude
```

#### Option 2: Local Model (Future)
```bash
VITE_LEGACY_AI_MODE=local
```

### Data Sources Priority
The system tries data sources in this order:
1. **GitHub Real Data** (if available)
2. **Mock Data** (fallback)

### Model Priority
The system tries models in this order:
1. **Groq** (fast, intelligent)
2. **Local Intelligence** (fallback)

## 🔧 Testing Your Setup

### Test Groq Connection
Open browser console on your Legacy AI page and run:
```javascript
import('../services/groqLegacyAI').then(({ groqLegacyAI }) => {
  groqLegacyAI.testConnection().then(console.log);
});
```

### Test GitHub Data Streaming
```javascript
import('../services/githubDataStreamer').then(({ githubDataStreamer }) => {
  githubDataStreamer.testConnection().then(console.log);
});
```

### Test System Health
```javascript
import('../services/githubDataStreamer').then(({ githubDataStreamer }) => {
  githubDataStreamer.getSystemHealth().then(console.log);
});
```

## 📱 Expected Data Format

Your GitHub repo should contain `data/latest.json` in this format:

```json
{
  "timestamp": "2025-01-21T10:30:00.000Z",
  "whatsapp": {
    "unreadCount": 23,
    "conversations": [
      {
        "name": "Work Team",
        "unreadCount": 5,
        "lastMessage": "Meeting at 2 PM",
        "priority": "high"
      }
    ],
    "importantMessages": [
      {
        "from": "Boss",
        "content": "Urgent: Review the quarterly report",
        "timestamp": "2025-01-21T10:25:00.000Z"
      }
    ]
  },
  "telegram": {
    "channels": [
      {
        "name": "Tech News",
        "unreadCount": 12,
        "lastActivity": "2025-01-21T10:20:00.000Z"
      }
    ],
    "bots": [
      {
        "name": "Deployment Bot",
        "status": "active",
        "notifications": 2
      }
    ]
  },
  "agents": {
    "activeAgents": [
      {
        "name": "Task Processor",
        "status": "running",
        "efficiency": 96.2,
        "tasksCompleted": 47
      }
    ],
    "automations": [
      {
        "name": "Daily Sync",
        "status": "active",
        "successRate": 98.5,
        "rateLimitHit": false
      }
    ]
  },
  "system": {
    "cpu": 45.2,
    "memory": 62.1,
    "disk": 78.3,
    "network": 15.4,
    "alerts": [
      {
        "type": "warning",
        "message": "High memory usage detected",
        "timestamp": "2025-01-21T10:15:00.000Z"
      }
    ]
  }
}
```

## 🎯 What You Get

### With Mock Data Only
- ✅ Smart chat interface with learning
- ✅ Pattern recognition and insights
- ✅ Proactive monitoring simulation
- ✅ Thumbs up/down learning

### With GitHub Real Data
- ✅ Everything above PLUS:
- ✅ **Real system monitoring**
- ✅ **Actual message analysis**
- ✅ **True performance insights**
- ✅ **Genuine pattern detection**

### With Groq Integration
- ✅ Everything above PLUS:
- ✅ **Lightning-fast responses**
- ✅ **Natural language understanding**
- ✅ **Context-aware analysis**
- ✅ **Intelligent recommendations**

## 🚀 Next Steps

1. **Start with Groq** - Get immediate smart responses
2. **Add GitHub streaming** - Connect real data sources
3. **Monitor and optimize** - Use the insights to improve your systems
4. **Expand data sources** - Add more systems to monitor
5. **Advanced automation** - Build actions based on AI recommendations

## 🔍 Troubleshooting

### Groq Not Working
- Check API key in `.env`
- Verify internet connection
- Check browser console for errors

### GitHub Data Not Loading
- Verify repository exists and is accessible
- Check GitHub token permissions
- Ensure data file exists at correct path

### No Real-Time Updates
- Verify Mac mini data collection script is running
- Check GitHub repository for recent commits
- Monitor network connectivity

---

**Ready to make your Legacy AI hyper-intelligent with real data!** 🧠✨