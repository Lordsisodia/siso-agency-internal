# Remote Claude Code Execution System Architecture

## Overview
Build an app that connects to your Mac Mini (running 24/7) to run Claude Code remotely for your projects, allowing you to prompt it from mobile/desktop apps.

## Quick Summary

**How it works:**

Your Mac Mini runs:
- API server (receives prompts)
- Claude Code wrapper (executes commands)
- WebSocket server (streams output back)

Your phone/desktop app:
- Sends prompts to Mac Mini API
- Gets real-time Claude responses via WebSocket
- Works like ChatGPT but runs Claude Code on your projects

**Tech needed:**
- **Server**: Node.js API + job queue (Redis)
- **Security**: OAuth login + HTTPS
- **Apps**: React Native (one codebase for all platforms)

**Architecture:**
```
Phone → API Request → Mac Mini → Claude Code → Stream back results
```

Similar to how VS Code Remote works, but for Claude Code.

## Detailed Architecture

### System Components

1. **Mac Mini Server (24/7 Host)**
   - Runs Claude Code as a daemon/service using macOS's `launchd`
   - Hosts the API server for receiving and processing requests
   - Manages authentication and session handling
   - Handles job queuing and execution

2. **API Layer**
   - RESTful API for standard CRUD operations (authentication, project management, settings)
   - WebSocket connections for real-time streaming of Claude Code output
   - Hybrid architecture leveraging strengths of both protocols

3. **Message Queue System**
   - Redis + BullMQ for job processing (lightweight, Node.js-friendly)
   - Handles long-running AI tasks asynchronously
   - Provides job states: waiting, active, delayed, completed, failed
   - Enables horizontal scaling if needed

4. **Client Applications**
   - Cross-platform apps built with React Native, Flutter, or .NET MAUI
   - WebSocket client for real-time output streaming
   - Offline capability with job queue synchronization

### Security Architecture

#### Authentication & Authorization
1. **OAuth2 + JWT Tokens**
   - Short-lived access tokens (20-30 minutes)
   - Refresh token rotation
   - Scoped permissions for different operations
   - Never store long-lived credentials in client apps

2. **API Security Patterns**
   - API Gateway as central enforcement point
   - Rate limiting per user/device
   - Device fingerprinting for anomaly detection
   - Comprehensive audit logging

3. **Claude Code Sandboxing**
   - Run Claude Code in isolated environments
   - OS-level sandboxing (macOS Seatbelt)
   - Fine-grained file system permissions
   - Network access restrictions

### Technical Architecture

#### Server Setup (Mac Mini)

```
/Users/claude-server/
├── api-server/          # Node.js/Python API server
├── claude-executor/     # Claude Code execution wrapper
├── job-queue/          # BullMQ job processor
└── security/           # Auth & permission management
```

#### Process Management
- **launchd** configuration for automatic service startup
- Process monitoring and automatic restart on failure
- Log rotation and management
- Resource usage limits

#### API Design

**REST Endpoints:**
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `GET /projects` - List user projects
- `POST /claude/execute` - Submit Claude Code job
- `GET /jobs/:id` - Check job status

**WebSocket Events:**
- `job:started` - Execution begins
- `job:output` - Streaming Claude output
- `job:completed` - Final results
- `job:error` - Error notifications

#### Job Processing Flow

1. Client submits prompt via REST API
2. API server validates auth and creates job in Redis queue
3. Job processor picks up task and executes Claude Code
4. Output streams to client via WebSocket
5. Results stored for later retrieval

### Cross-Platform Client Architecture

#### Technology Options

1. **React Native** (Recommended)
   - Single codebase for iOS/Android/Web
   - Strong WebSocket support
   - Large ecosystem

2. **Flutter**
   - Native performance
   - Good for complex UIs
   - Dart language requirement

3. **.NET MAUI**
   - Great for Windows/macOS desktop
   - C# ecosystem
   - Mobile support improving

#### Client Features
- Secure credential storage (Keychain/Keystore)
- Offline job queue
- Real-time output display
- Project file synchronization
- Push notifications for job completion

### Comparison with Claudia

**Similarities:**
- GUI wrapper for Claude interactions
- Project management capabilities
- Custom agent creation

**Key Differences:**
- Claudia runs locally, your system runs remotely
- Network-based architecture vs local execution
- Multi-user support vs single-user
- Mobile accessibility

### Implementation Challenges & Solutions

#### 1. **Network Latency**
- Use WebSocket for real-time feedback
- Implement optimistic UI updates
- Cache frequently accessed data

#### 2. **Long-Running Tasks**
- Implement job timeout mechanisms
- Allow job cancellation
- Progress indicators for long operations

#### 3. **File System Access**
- Implement virtual file system for projects
- Sync files between client and server
- Version control integration

#### 4. **Security Risks**
- Regular security audits
- Principle of least privilege
- Input validation and sanitization
- Rate limiting and DDoS protection

### Scalability Considerations

1. **Horizontal Scaling**
   - Multiple Mac Minis with load balancer
   - Shared Redis cluster for job queue
   - Distributed file storage (NFS/S3)

2. **Performance Optimization**
   - Connection pooling
   - Response caching
   - CDN for static assets
   - Database query optimization

### Recommended Technology Stack

**Server Side:**
- Node.js + Express/Fastify (API server)
- Redis + BullMQ (job queue)
- PostgreSQL (user data, projects)
- Socket.io (WebSocket handling)
- Passport.js (OAuth2 implementation)

**Client Side:**
- React Native + Expo
- Socket.io client
- React Query (API state management)
- Secure storage libraries

**DevOps:**
- Docker for containerization
- GitHub Actions for CI/CD
- Sentry for error tracking
- Prometheus + Grafana for monitoring

### Security Best Practices

1. Always use HTTPS/WSS
2. Implement API rate limiting
3. Regular security updates
4. Penetration testing
5. Compliance with data protection regulations
6. Encrypted data at rest and in transit
7. Multi-factor authentication option

### Getting Started

1. **Phase 1 - Basic Setup**
   - Set up Node.js API server on Mac Mini
   - Create simple Claude Code execution wrapper
   - Basic authentication system

2. **Phase 2 - Real-time Features**
   - Add WebSocket support
   - Implement job queue
   - Stream Claude responses

3. **Phase 3 - Client Apps**
   - Build React Native app
   - Add project management
   - Implement file sync

4. **Phase 4 - Production Ready**
   - Security hardening
   - Performance optimization
   - Monitoring and logging

This architecture provides a robust, scalable, and secure solution for remote Claude Code execution while maintaining the flexibility and power of the original tool.