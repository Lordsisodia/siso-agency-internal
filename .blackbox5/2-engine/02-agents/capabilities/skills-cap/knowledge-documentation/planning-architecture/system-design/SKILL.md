---
name: system-design
category: knowledge-documentation/planning-architecture
version: 1.0.0
description: System design patterns, architectural principles, and best practices for building scalable systems
author: blackbox5/core
verified: true
tags: [architecture, design, scalability, systems, planning]
---

# System Design Skill

## Context

System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements. It involves making high-level decisions about the organization and structure of a system, considering trade-offs between different design alternatives.

### Core Objectives

**Scalability**: The ability of a system to handle growing amounts of work by adding resources to the system
- Vertical scaling (scale up): Adding more power to a single machine
- Horizontal scaling (scale out): Adding more machines to the pool
- Diagonal scaling: Combination of both approaches

**Reliability**: The probability that a system will function correctly and consistently
- Availability: System is operational and accessible when needed
- Fault tolerance: System continues operating properly in the event of failure
- Recoverability: Ability to recover from failures and resume operation

**Maintainability**: Ease with which a system can be modified, corrected, or adapted
- Modularity: Components are independent and interchangeable
- Readability: Code and architecture are easy to understand
- Testability: System can be easily tested

**Performance**: System responsiveness and efficiency
- Latency: Time taken to respond to a request
- Throughput: Number of requests processed per time unit
- Resource utilization: Efficient use of computational resources

### Architectural Thinking

System design requires a mindset that:
- Thinks in terms of trade-offs, not absolute solutions
- Considers both functional and non-functional requirements
- Plans for failure and degradation
- Embraces simplicity over complexity
- Iterates on design based on feedback and constraints

## Instructions

### Approach to System Design Problems

**1. Understand the Problem**
- Clarify requirements and constraints
- Identify functional and non-functional requirements
- Define success metrics and key performance indicators
- Understand the scope and boundaries of the system

**2. Estimate Capacity and Constraints**
- Calculate storage requirements
- Estimate network bandwidth needs
- Project traffic patterns (QPS, peak loads)
- Identify resource limitations

**3. Abstract Design**
- Define the core components and their responsibilities
- Establish data flow between components
- Identify key algorithms and data structures
- Consider scaling requirements

**4. Bottleneck Analysis**
- Identify potential bottlenecks in the design
- Propose solutions for each bottleneck
- Evaluate trade-offs of different approaches
- Plan for monitoring and mitigation

**5. Detailed Design**
- Design data models and schemas
- Define APIs and interfaces
- Specify communication protocols
- Detail component interactions

### Design Methodology

**Top-Down Approach**
- Start with high-level architecture
- Progressively refine components
- Useful for understanding overall structure

**Bottom-Up Approach**
- Start with individual components
- Build up to complete system
- Useful when dealing with well-understood components

**Iterative Refinement**
- Begin with simple design
- Identify limitations and bottlenecks
- Refine design based on findings
- Repeat until requirements are met

## Rules

### Scalability Rules

**Horizontal Scaling Preferred**
- Design for stateless components when possible
- Use load balancers to distribute traffic
- Implement auto-scaling based on demand
- Avoid session affinity requirements

**Database Scaling**
- Read replicas for read-heavy workloads
- Database sharding for write-heavy workloads
- Caching layers to reduce database load
- Connection pooling for efficient resource use

**Caching Strategy**
- Cache frequently accessed data
- Implement cache invalidation policies
- Use CDN for static content
- Consider edge computing for distributed caching

**Asynchronous Processing**
- Message queues for decoupling components
- Event-driven architecture for scalability
- Background processing for heavy tasks
- Rate limiting to prevent overload

### Reliability Rules

**Redundancy**
- Eliminate single points of failure
- Deploy services across multiple availability zones
- Implement failover mechanisms
- Use redundant data storage

**Health Monitoring**
- Implement health check endpoints
- Monitor key metrics and logs
- Set up automated alerts
- Conduct regular load testing

**Graceful Degradation**
- Design for partial system failure
- Implement circuit breakers
- Provide fallback mechanisms
- Prioritize critical functionality

**Data Consistency**
- Understand consistency requirements (strong vs eventual)
- Implement appropriate consistency models
- Handle data conflicts properly
- Plan for data recovery and backup

### Maintainability Rules

**Modularity**
- Separate concerns into distinct modules
- Define clear interfaces between components
- Minimize coupling between modules
- Maximize cohesion within modules

**Documentation**
- Document architectural decisions
- Maintain up-to-date API documentation
- Create system diagrams and flowcharts
- Document deployment procedures

**Testing**
- Implement comprehensive testing strategy
- Use automated testing pipelines
- Conduct chaos engineering experiments
- Test for failure scenarios

**Code Quality**
- Follow coding standards and conventions
- Conduct code reviews
- Refactor regularly
- Keep code simple and readable

### Trade-off Rules

**CAP Theorem**
- Consistency: All nodes see same data simultaneously
- Availability: Every request receives a response
- Partition tolerance: System continues despite network partitions
- Choose two of three based on requirements

**Consistency Patterns**
- Strong consistency: Latest data always returned
- Eventual consistency: Data propagates over time
- Causal consistency: Causally related operations seen in order
- Read-your-writes consistency: Client sees own writes

**Latency vs Throughput**
- Optimize for latency when user experience matters
- Optimize for throughput for batch processing
- Consider hybrid approaches for mixed workloads
- Monitor both metrics in production

## Workflow

### Phase 1: Requirements Gathering

**Functional Requirements**
- What features must the system provide?
- What are the primary use cases?
- Who are the users and their roles?
- What are the key workflows?

**Non-Functional Requirements**
- Scalability: Expected growth patterns
- Availability: Uptime requirements (e.g., 99.9%)
- Latency: Response time requirements
- Consistency: Data consistency requirements
- Security: Authentication, authorization, data protection

**Constraints**
- Budget: Cost limitations for infrastructure
- Timeline: Development and deployment deadlines
- Technology: Required technology stack or restrictions
- Team: Team size and expertise

### Phase 2: Capacity Estimation

**Storage Calculation**
- Estimate data size per object
- Calculate expected number of objects
- Account for data growth rate
- Include backup and redundancy overhead

**Traffic Estimation**
- Estimate daily/monthly active users
- Calculate average requests per user
- Determine peak traffic multipliers
- Account for seasonal variations

**Bandwidth Calculation**
- Estimate request/response sizes
- Calculate total data transfer
- Account for media and large files
- Include CDN and caching benefits

**Resource Requirements**
- CPU requirements for processing
- Memory requirements for caching
- Network requirements for data transfer
- Storage requirements for persistence

### Phase 3: High-Level Architecture

**System Components**
- Define major system components
- Establish component boundaries
- Identify communication patterns
- Plan component scaling

**Data Flow**
- Map request/response flow
- Identify data transformation points
- Plan for error handling and retry logic
- Consider authentication and authorization

**Technology Choices**
- Select programming languages and frameworks
- Choose database technologies (SQL vs NoSQL)
- Decide on messaging and caching systems
- Select infrastructure and deployment tools

### Phase 4: Data Modeling

**Schema Design**
- Define entities and relationships
- Normalize or denormalize based on access patterns
- Plan for indexing strategy
- Consider data partitioning

**Data Storage**
- Choose appropriate database types
- Plan for data replication and sharding
- Design backup and recovery procedures
- Consider data archiving strategies

**Data Access Patterns**
- Identify read-heavy vs write-heavy operations
- Plan caching strategy for frequent queries
- Design efficient queries and indexes
- Implement connection pooling

### Phase 5: Service Design

**API Design**
- Define API endpoints and contracts
- Choose appropriate API protocols (REST, GraphQL, gRPC)
- Implement API versioning strategy
- Design authentication and authorization

**Service Communication**
- Choose synchronous vs asynchronous communication
- Select appropriate messaging protocols
- Implement service discovery
- Plan for inter-service communication patterns

**Deployment Architecture**
- Design for containerization (Docker, Kubernetes)
- Plan for blue-green or canary deployments
- Implement CI/CD pipelines
- Configure load balancing and auto-scaling

## Best Practices

### CAP Theorem Application

**CA (Consistency + Availability)**
- Traditional relational databases
- Single-region deployments
- Strong consistency requirements
- Example: Financial systems

**CP (Consistency + Partition Tolerance)**
- Distributed databases with strong consistency
- Multi-region deployments
- Availability may be compromised during partitions
- Example: HBase, MongoDB

**AP (Availability + Partition Tolerance)**
- Highly available distributed systems
- Eventual consistency acceptable
- Optimistic conflict resolution
- Example: Cassandra, DynamoDB

### Consistency Patterns

**Strong Consistency**
- Linearizability: Operations appear instantaneous
- Sequential consistency: All operations seen in same order
- Read-after-write: Clients see their own writes
- Use case: Financial transactions, inventory

**Eventual Consistency**
- Data propagates asynchronously
- Temporary inconsistencies acceptable
- High availability and low latency
- Use case: Social media feeds, recommendations

**Causal Consistency**
- Causally related operations seen in order
- Unrelated operations can be seen in any order
- Balances consistency and availability
- Use case: Collaborative editing, chat systems

### Caching Strategies

**Cache Aside (Lazy Loading)**
- Application manages cache
- Cache miss triggers database query
- Popular data stays in cache
- Simple to implement

**Write Through**
- Write to cache and database synchronously
- Data always consistent
- Write latency increased
- Good for read-heavy workloads

**Write Back (Write Behind)**
- Write to cache immediately, database later
- Low write latency
- Risk of data loss
- Requires write-back queue

**Write Around**
- Write directly to database
- Cache populated on read miss
- Reduces cache pollution
- Good for write-once, read-many data

**Cache Invalidation**
- Time-based expiration (TTL)
- Event-based invalidation
- Cache versioning
- Write-through for critical data

### Load Balancing

**Algorithms**
- Round Robin: Sequential distribution
- Least Connections: Route to server with fewest connections
- IP Hash: Route based on client IP
- Weighted: Distribute based on server capacity

**Types**
- Layer 4 (Transport Layer): TCP/UDP based
- Layer 7 (Application Layer): HTTP based
- Global Load Balancing: Multi-region distribution
- DNS Load Balancing: Simple geographic distribution

**Health Checks**
- Active health checks: Periodic probing
- Passive health checks: Monitor responses
- Configure thresholds and timeouts
- Implement graceful failover

### Database Patterns

**Replication**
- Master-Slave: Single master, multiple read replicas
- Master-Master: Multiple write masters
- Multi-Leader: Multiple regional leaders
- Leaderless: All nodes can handle writes

**Sharding**
- Horizontal partitioning: Distribute data across nodes
- Vertical partitioning: Split by feature
- Hash-based sharding: Consistent hashing
- Range-based sharding: Key ranges

**Indexing**
- Primary indexes: Unique identifiers
- Secondary indexes: Frequent query fields
- Composite indexes: Multiple fields
- Full-text indexes: Text search

## Anti-Patterns

### Over-Engineering

**Symptoms**
- Building features not required
- Introducing unnecessary complexity
- Premature optimization
- Abstracting everything

**Prevention**
- Start simple, iterate based on needs
- Focus on core requirements first
- Measure before optimizing
- Keep design pragmatic

### Premature Optimization

**Symptoms**
- Optimizing before measuring
- Adding complexity for theoretical gains
- Ignoring maintenance costs
- Sacrificing readability for performance

**Prevention**
- Profile first, optimize bottlenecks
- Consider maintenance costs
- Prioritize code clarity
- Optimize based on real-world usage

### Ignoring Constraints

**Symptoms**
- Designing without budget consideration
- Ignoring team expertise
- Overlooking timeline constraints
- Violating technology restrictions

**Prevention**
- Document all constraints upfront
- Design within constraints
- Communicate trade-offs clearly
- Be realistic about capabilities

### Tight Coupling

**Symptoms**
- Changes in one component affect others
- Difficult to test components independently
- Hard to reuse components
- Fragile to changes

**Prevention**
- Define clear interfaces
- Use dependency injection
- Implement message-based communication
- Minimize shared state

### God Object

**Symptoms**
- Single component knows too much
- Too many responsibilities
- Difficult to maintain and test
- Changes cascade through system

**Prevention**
- Apply single responsibility principle
- Break down into smaller components
- Define clear boundaries
- Use facades for complex subsystems

## Examples

### Example 1: URL Shortener

**Requirements**
- Generate short URLs from long URLs
- Redirect short URLs to original URLs
- Handle high redirection throughput
- Custom short URLs option

**Capacity Estimation**
- 100M URLs stored
- Each URL: 100 characters long
- 10GB total storage
- 100M redirections per day = ~1,200 QPS

**Architecture**
```
Client -> Load Balancer -> Web Server
                          -> Cache (Redis)
                          -> Database (NoSQL)
```

**Data Model**
- Short URL (primary key)
- Original URL
- Creation timestamp
- User ID (optional)
- Expiration time (optional)

**Key Decisions**
- NoSQL database for horizontal scaling
- Cache for frequently accessed URLs
- Base62 encoding for compact URLs
- Read-heavy workload optimization

### Example 2: Chat System

**Requirements**
- Real-time messaging
- Group and direct messages
- Message history
- Online/offline status

**Capacity Estimation**
- 100K concurrent users
- 10 messages per user per day
- 1M messages per day
- Peak: 10K messages per second

**Architecture**
```
Client -> Load Balancer -> WebSocket Server
                          -> Message Queue (Kafka)
                          -> Message Service
                          -> Database (PostgreSQL)
                          -> Cache (Redis)
```

**Data Model**
- Users table
- Conversations table
- Messages table
- Conversation members table
- Message read receipts table

**Key Decisions**
- WebSocket for real-time communication
- Message queue for reliable delivery
- Sharded database for messages
- Redis for online status and caching

### Example 3: Rate Limiter

**Requirements**
- Limit API requests per user
- Different limits for different tiers
- Prevent abuse and protect systems
- Distributed implementation

**Capacity Estimation**
- 1M users
- 100 requests per user per hour
- Peak: 100K requests per second
- Need to handle burst traffic

**Architecture**
```
Client -> API Gateway -> Rate Limiter Service
                          -> Cache (Redis)
                          -> Backend Service
```

**Algorithms**
- Token Bucket: Smooth rate limiting
- Leaky Bucket: Constant rate
- Fixed Window: Simple but has edge cases
- Sliding Window Log: Accurate but memory intensive

**Key Decisions**
- Redis for distributed state
- Token bucket algorithm
- Sliding window for accuracy
- Hierarchical limits (user, IP, global)

## Integration Notes

### Architecture Diagrams

**Tools**
- C4 Model for hierarchical diagrams
- UML for detailed component diagrams
- AWS/Azure/GCP architecture icons
- Draw.io, Mermaid, Lucidchart

**Best Practices**
- Start with high-level context diagram
- Progressively add detail
- Label components and interactions
- Include data flow and technologies

### Documentation Standards

**Architecture Decision Records (ADR)**
- Document significant decisions
- Include context and alternatives
- Record trade-offs and rationale
- Maintain decision history

**System Design Documents**
- Problem statement and requirements
- Proposed architecture and rationale
- Data models and schemas
- API specifications
- Deployment architecture

### Collaboration with Other Skills

**Writing Plans**
- Use system design as foundation for implementation plans
- Break down architecture into actionable tasks
- Identify dependencies and integration points
- Define milestones and deliverables

**Technical Specifications**
- Detailed component designs based on architecture
- API specifications and contracts
- Database schemas and migrations
- Testing strategies

## Error Handling

### Design Validation

**Review Checklist**
- All requirements addressed
- Constraints considered
- Trade-offs documented
- Scalability planned
- Failure scenarios handled

**Common Mistakes**
- Single points of failure
- Ignoring edge cases
- Overlooking operational complexity
- Insufficient monitoring planning
- Inadequate security considerations

### Trade-off Evaluation

**Quantitative Analysis**
- Performance metrics and benchmarks
- Cost calculations
- Capacity planning projections
- Reliability metrics (MTBF, MTTR)

**Qualitative Analysis**
- Team expertise and learning curve
- Vendor lock-in risks
- Community support and ecosystem
- Long-term maintainability

## Output Format

### System Design Document Structure

```markdown
# System Design: [System Name]

## 1. Overview
- Problem statement
- Goals and objectives
- Scope and boundaries

## 2. Requirements
- Functional requirements
- Non-functional requirements
- Constraints

## 3. Capacity Planning
- Storage estimation
- Traffic estimation
- Resource requirements

## 4. High-Level Architecture
- System components
- Data flow
- Technology choices

## 5. Data Model
- Entity relationships
- Database schemas
- Data partitioning

## 6. Detailed Design
- Component details
- API specifications
- Communication protocols

## 7. Scalability & Reliability
- Scaling strategies
- Failure scenarios
- Monitoring

## 8. Security Considerations
- Authentication and authorization
- Data protection
- Security best practices

## 9. Trade-offs and Alternatives
- Design decisions
- Alternative approaches
- Rationale for choices

## 10. Implementation Plan
- Development phases
- Testing strategy
- Deployment approach
```

## Related Skills

- **writing-plans**: Creating implementation plans from system designs
- **technical-specs**: Detailed technical specifications for components
- **database-design**: Advanced database schema design
- **api-design**: RESTful API design best practices

## See Also

### Resources

**Books**
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "System Design Interview" by Alex Xu
- "The Art of Scalability" by Abbott & Fisher
- "Release It!" by Michael Nygard

**Courses**
- System Design Interview Course on educative.io
- Grokking the System Design Interview on designgurus.org
- MIT Distributed Systems courses

**Websites**
- The System Design Blog
- High Scalability blog
- Engineering blogs (Netflix, Uber, Airbnb, etc.)

**Practices**
- Mock interview practice
- Real-world case studies
- Open-source architecture analysis
- Design review sessions
