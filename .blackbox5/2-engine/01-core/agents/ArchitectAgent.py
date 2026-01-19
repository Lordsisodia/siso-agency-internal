"""
Architect Agent (Alex)

Specializes in system architecture, design patterns, and technical planning.
"""

import logging
from typing import List
from datetime import datetime

from agents.core.base_agent import BaseAgent, AgentTask, AgentResult, AgentConfig

logger = logging.getLogger(__name__)


class ArchitectAgent(BaseAgent):
    """
    Architect Agent - Alex 🏗️

    Specializes in:
    - System architecture
    - Design patterns
    - Technical planning
    - Infrastructure design
    - Scalability planning
    - Security architecture
    """

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        """Get default configuration for the Architect agent."""
        return AgentConfig(
            name="architect",
            full_name="Alex",
            role="Architect",
            category="specialists",
            description="Expert architect specializing in system design, patterns, and scalable architecture",
            capabilities=[
                "architecture",
                "design_patterns",
                "system_design",
                "scalability",
                "security_design",
                "infrastructure",
                "technical_planning",
            ],
            temperature=0.4,  # Balanced for creative and structured thinking
            metadata={
                "icon": "🏗️",
                "created_at": datetime.now().isoformat(),
            }
        )

    async def execute(self, task: AgentTask) -> AgentResult:
        """
        Execute an architecture task.

        Args:
            task: The task to execute

        Returns:
            AgentResult with architectural design and recommendations
        """
        thinking_steps = await self.think(task)

        # Analyze task type
        task_lower = task.description.lower()

        if any(word in task_lower for word in ["architecture", "design", "structure"]):
            output = await self._design_architecture(task)
        elif any(word in task_lower for word in ["pattern", "anti-pattern"]):
            output = await self._design_patterns(task)
        elif any(word in task_lower for word in ["scal", "scale", "performance"]):
            output = await self._scalability_plan(task)
        elif any(word in task_lower for word in ["security", "secure"]):
            output = await self._security_architecture(task)
        else:
            output = await self._technical_guidance(task)

        return AgentResult(
            success=True,
            output=output,
            thinking_steps=thinking_steps,
            artifacts={
                "diagrams": self._extract_diagram_refs(output),
                "components": self._extract_components(output),
                "decisions": self._extract_decisions(output),
            },
            metadata={
                "agent_name": self.name,
                "architecture_type": self._determine_arch_type(task),
            }
        )

    async def think(self, task: AgentTask) -> List[str]:
        """Generate thinking steps for architecture tasks."""
        return [
            f"🏗️ Analyzing requirements for: {task.description[:100]}...",
            "📐 Designing system structure and components",
            "🔄 Considering scalability and performance",
            "🔒 Planning security and reliability",
            "📋 Documenting architecture decisions",
        ]

    async def _design_architecture(self, task: AgentTask) -> str:
        """Design system architecture."""
        return f"""# System Architecture: {task.description}

## Overview
This document outlines the system architecture for {task.description}.

## Architecture Diagram
```
┌─────────────────────────────────────────┐
│           Client Layer                  │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Web  │  │ API  │  │ Mobile│       │
│  └──┬───┘  └──┬───┘  └──┬───┘          │
└─────┼────────┼─────────┼───────────────┘
      │        │         │
┌─────┼────────┼─────────┼───────────────┐
│      │    Gateway Layer               │
│  ┌───┴───────────────────────┐        │
│  │   API Gateway / LB         │        │
│  └───┬───────────────────────┘        │
└──────┼────────────────────────────────┘
       │
┌──────┼────────────────────────────────┐
│      │    Service Layer               │
│  ┌───┴────┐  ┌──────┐  ┌──────┐      │
│  │Service A│  │Service B│  │Service C│   │
│  └────────┘  └──────┘  └──────┘      │
└──────────────────────────────────────┘
       │
┌──────┼────────────────────────────────┐
│      │    Data Layer                  │
│  ┌───┴────┐  ┌──────┐  ┌──────┐      │
│  │Primary │  │Cache │  │Queue │      │
│  └────────┘  └──────┘  └──────┘      │
└──────────────────────────────────────┘
```

## Components

### Client Layer
- **Web Interface**: React-based SPA
- **API Client**: RESTful API access
- **Mobile Apps**: iOS and Android applications

### Gateway Layer
- **API Gateway**: Kong/AWS API Gateway
- **Load Balancer**: Distributes traffic
- **Rate Limiting**: Protects against abuse

### Service Layer
- **Service A**: [Description and responsibilities]
- **Service B**: [Description and responsibilities]
- **Service C**: [Description and responsibilities]

### Data Layer
- **Primary DB**: PostgreSQL for persistent data
- **Cache**: Redis for frequently accessed data
- **Message Queue**: RabbitMQ for async processing

## Technology Stack
- **Languages**: Python, TypeScript, SQL
- **Frameworks**: FastAPI, React, SQLAlchemy
- **Infrastructure**: Docker, Kubernetes, AWS
- **Monitoring**: Prometheus, Grafana, ELK

## Quality Attributes
| Attribute | Approach | Priority |
|-----------|----------|----------|
| Scalability | Horizontal scaling with K8s | High |
| Reliability | Multi-region deployment | High |
| Security | Zero-trust architecture | Critical |
| Performance | Caching and CDN | High |
| Maintainability | Microservices with clear boundaries | Medium |

## Trade-offs and Decisions
1. **Microservices vs Monolith**: Chose microservices for scalability
2. **SQL vs NoSQL**: PostgreSQL for ACID compliance
3. **Sync vs Async**: Hybrid approach based on use case

## Next Steps
1. Implement core services
2. Set up CI/CD pipeline
3. Configure monitoring and alerting
4. Plan phased rollout
"""

    async def _design_patterns(self, task: AgentTask) -> str:
        """Design pattern recommendations."""
        return f"""# Design Patterns: {task.description}

## Pattern Recommendations

### Creational Patterns
**Factory Method** - Use when:
- Object creation logic is complex
- Types not known until runtime
- Want to centralize object creation

```python
class ServiceFactory:
    def create_service(self, service_type: str):
        if service_type == "database":
            return DatabaseService()
        elif service_type == "cache":
            return CacheService()
```

### Structural Patterns
**Adapter Pattern** - Use when:
- Integrating incompatible interfaces
- Working with third-party APIs
- Need to normalize different data sources

```python
class PaymentAdapter:
    def __init__(self, payment_gateway):
        self.gateway = payment_gateway

    def process_payment(self, amount):
        # Adapt gateway interface to our standard
        return self.gateway.charge(amount)
```

### Behavioral Patterns
**Strategy Pattern** - Use when:
- Multiple algorithms for same operation
- Need to switch algorithms at runtime
- Want to isolate algorithm implementation

```python
class PricingStrategy(ABC):
    @abstractmethod
    def calculate_price(self, base_price):
        pass

class DynamicPricing(PricingStrategy):
    def calculate_price(self, base_price):
        return base_price * self._get_demand_multiplier()
```

## Pattern Selection Guide
| Scenario | Recommended Pattern | Rationale |
|----------|---------------------|-----------|
| Object creation | Factory Method | Centralizes creation logic |
| API integration | Adapter | Normalizes interfaces |
| Algorithm selection | Strategy | Runtime flexibility |
| State management | State Machine | Clear state transitions |
| Event handling | Observer | Decoupled communication |

## Anti-Patterns to Avoid
1. **God Object**: Single class doing too much
2. **Golden Hammer**: Using same solution everywhere
3. **Premature Optimization**: Optimizing before profiling
4. **Boat Anchor**: Keeping unused dependencies

## Best Practices
- Favor composition over inheritance
- Program to interfaces, not implementations
- Keep components loosely coupled
- Follow SOLID principles
- Document pattern usage and rationale
"""

    async def _scalability_plan(self, task: AgentTask) -> str:
        """Design scalability strategy."""
        return f"""# Scalability Plan: {task.description}

## Current State Assessment
- **Current Load**: X requests/sec
- **Target Load**: Y requests/sec (Z% growth)
- **Bottlenecks**: Identified constraints

## Scaling Strategy

### Horizontal Scaling
**Approach**: Add more instances
**Best For**: Stateless services
**Implementation**:
- Container orchestration (Kubernetes)
- Auto-scaling policies
- Load balancing

```yaml
autoscaling:
  min_replicas: 3
  max_replicas: 10
  target_cpu_utilization: 70%
```

### Vertical Scaling
**Approach**: Increase instance resources
**Best For**: Stateful services, databases
**Implementation**:
- Instance size upgrades
- Resource quotas
- Performance tuning

### Caching Strategy
**Levels**:
1. **CDN**: Static content delivery
2. **Application Cache**: In-memory caching (Redis)
3. **Database Cache**: Query result caching
4. **Browser Cache**: Client-side caching

**Cache Invalidation**:
- TTL-based expiration
- Event-driven invalidation
- Cache warming for critical data

### Database Scaling
**Read Replicas**:
- Distribute read queries
- Reduce load on primary

```sql
-- Configure read replicas
CREATE USER 'replica_user'@'%';
GRANT SELECT ON database.* TO 'replica_user'@'%';
```

**Partitioning**:
- Horizontal partitioning (sharding)
- Vertical partitioning (table splitting)
- Time-based partitioning

## Performance Optimization

### Query Optimization
- Index critical columns
- Use EXPLAIN ANALYZE
- Optimize JOIN operations
- Batch operations

### API Optimization
- Pagination for large datasets
- Compression for responses
- HTTP/2 for multiplexing
- GraphQL for precise queries

## Monitoring and Alerting
- **Metrics**: Response time, throughput, error rate
- **Alerts**: Threshold-based alerts
- **Dashboards**: Real-time visibility
- **Capacity Planning**: Trend analysis

## Rollout Plan
1. **Phase 1**: Implement caching (30% improvement)
2. **Phase 2**: Add read replicas (2x capacity)
3. **Phase 3**: Auto-scaling (elastic capacity)
4. **Phase 4**: Database sharding (10x+ capacity)

## Cost Considerations
| Service | Current Cost | Scaled Cost | ROI |
|---------|--------------|-------------|-----|
| Compute | $X/month | $Y/month | Justified |
| Database | $A/month | $B/month | Justified |
| Cache | $M/month | $N/month | High |
"""

    async def _security_architecture(self, task: AgentTask) -> str:
        """Design security architecture."""
        return f"""# Security Architecture: {task.description}

## Security Principles
1. **Defense in Depth**: Multiple security layers
2. **Least Privilege**: Minimal access rights
3. **Zero Trust**: Verify everything
4. **Security by Design**: Built-in from start

## Authentication & Authorization

### Authentication Flow
```
Client → API Gateway → Auth Service → Identity Provider
                        ↓
                   JWT Token
                        ↓
                 Resource Access
```

### Authorization Model
**RBAC** (Role-Based Access Control):
- Admin: Full system access
- User: Limited to own resources
- Guest: Read-only public resources

**Implementation**:
```python
def require_role(role: str):
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not current_user.has_role(role):
                raise Forbidden("Insufficient permissions")
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

## Data Security

### Encryption
- **At Rest**: AES-256 for databases, files
- **In Transit**: TLS 1.3 for network communication
- **Key Management**: KMS for key rotation

### PII Protection
- Data masking in logs
- Field-level encryption
- Right to be forgotten

## Network Security

### API Security
- Rate limiting per user
- Input validation and sanitization
- CORS configuration
- API authentication tokens

### DDoS Protection
- CDN as first line of defense
- Rate limiting and throttling
- IP-based blocking
- Challenge-response tests

## Security Monitoring

### Logging
- Authentication events
- Authorization failures
- Data access logs
- System changes

### Alerting
- Failed login attempts
- Anomalous behavior
- Security violations
- Compliance issues

## Compliance
- **GDPR**: Privacy by design
- **SOC 2**: Security controls
- **HIPAA**: PHI protection (if applicable)
- **PCI DSS**: Payment security (if applicable)

## Security Checklist
- [ ] Authentication implemented
- [ ] Authorization checks on all endpoints
- [ ] Input validation
- [ ] Output encoding
- [ ] Secrets management
- [ ] Security headers
- [ ] HTTPS only
- [ ] Regular security audits
"""

    async def _technical_guidance(self, task: AgentTask) -> str:
        """General technical guidance."""
        return f"""# Technical Guidance: {task.description}

## Analysis
Reviewing the technical aspects of your request.

## Recommendations

### Architecture
- Consider microservices for scalability
- Implement API gateway for routing
- Use message queues for async processing

### Technology Stack
- **Backend**: Python/FastAPI or Node.js/Express
- **Frontend**: React or Vue.js
- **Database**: PostgreSQL or MongoDB
- **Cache**: Redis
- **Queue**: RabbitMQ or SQS

### Best Practices
1. **Code Organization**
   - Follow clean code principles
   - Use design patterns appropriately
   - Document complex logic

2. **Testing**
   - Unit tests for business logic
   - Integration tests for APIs
   - E2E tests for critical flows

3. **Deployment**
   - CI/CD pipeline
   - Automated testing
   - Blue-green deployment

4. **Monitoring**
   - Application metrics
   - Error tracking
   - Performance monitoring

## Next Steps
1. Define requirements clearly
2. Choose appropriate technology
3. Implement incrementally
4. Test thoroughly
5. Monitor and iterate
"""

    def _extract_diagram_refs(self, text: str) -> List[str]:
        """Extract diagram references."""
        import re
        return re.findall(r'```\n(.+?)```', text, re.DOTALL)

    def _extract_components(self, text: str) -> List[str]:
        """Extract component names."""
        import re
        return re.findall(r'^\*\*(.+?)\*\*\*:', text, re.MULTILINE)

    def _extract_decisions(self, text: str) -> List[str]:
        """Extract architectural decisions."""
        import re
        return re.findall(r'^\d+\.\s+\*\*(.+?)\*\*:', text, re.MULTILINE)

    def _determine_arch_type(self, task: AgentTask) -> str:
        """Determine architecture type."""
        task_lower = task.description.lower()

        if "architecture" in task_lower or "design" in task_lower:
            return "architecture"
        elif "pattern" in task_lower:
            return "patterns"
        elif "scal" in task_lower or "scale" in task_lower:
            return "scalability"
        elif "security" in task_lower or "secure" in task_lower:
            return "security"
        else:
            return "guidance"
