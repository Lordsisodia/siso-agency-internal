---
name: first-principles-thinking
category: collaboration-communication/thinking-methodologies
version: 1.0.0
description: Break down complex problems to fundamental truths and build up from there
author: obra/superpowers
verified: true
tags: [thinking, problem-solving, first-principles, analysis, methodology]
---

# First Principles Thinking

<context>
First principles thinking is a problem-solving mental model that involves breaking down complex problems into their most basic, foundational elements (the "first principles") and then reconstructing solutions from the ground up. This approach, favored by Aristotle and modern thinkers like Elon Musk, helps avoid reasoning by analogy and leads to more innovative solutions.
</context>

<instructions>
When faced with a complex problem or challenge:

1. **Identify the problem** you're trying to solve
2. **Break it down** to its fundamental truths (axioms that cannot be reduced further)
3. **Question assumptions** (especially "we've always done it this way")
4. **Reconstruct** from first principles, not by analogy
5. **Build up** from fundamentals to create novel solutions

Ask "What do we know to be TRUE?" not "What do others do?"
</instructions>

<rules>
- Never accept "because that's how it's done" as a reason
- Distinguish between fundamental truths and assumptions
- Question every constraint - is it real or self-imposed?
- Don't reason by analogy (comparing to existing solutions)
- Build from physics/logic, not from "best practices"
- Be willing to challenge conventional wisdom
- Accept that first-principles thinking takes more mental effort
- Verify your "first principles" are actually fundamental
</rules>

<workflow>
<phase name="1. Deconstruct">
<steps>
1. State the problem clearly in one sentence
2. List all assumptions you're making about the problem
3. Identify constraints (real vs. imagined)
4. Break down to the most basic level possible
5. Ask "Why?" five times to get to root causes
</steps>
<outcome>Clear understanding of fundamental truths vs. assumptions</outcome>
</phase>

<phase name="2. Challenge">
<steps>
1. Question each assumption: "Is this absolutely true?"
2. For each constraint: "Is this a law of physics or just a convention?"
3. Ask "What would have to be true for this to be different?"
4. Eliminate assumptions that aren't fundamental truths
5. Keep only what cannot be reduced further
</steps>
<outcome>Set of verified first principles</outcome>
</phase>

<phase name="3. Reconstruct">
<steps>
1. Start from first principles only
2. Build up solution from fundamentals
3. Don't look at existing solutions (avoid analogy)
4. Create novel approach based on physics/logic
5. Verify solution addresses original problem
</steps>
<outcome>Innovative solution built from ground truth</outcome>
</phase>
</workflow>

<examples>
<example>
<title>Elon Musk and SpaceX Rockets</title>
<description>Classic example of first-principles thinking in action</description>
<text>
**Problem**: Rockets are too expensive (~$65M per rocket)

**Reasoning by Analogy** (what everyone else did):
- "Rockets have always been expensive"
- "Space industry is expensive"
- "We need to negotiate better prices"
- Result: Still expensive (~$65M from Lockheed/Boeing)

**First Principles Approach** (Musk):
1. **What is a rocket made of?**
   - Aluminum alloys, titanium, copper, carbon fiber
2. **What is the material cost of a rocket?**
   - ~2% of typical price (~$130K of materials in $65M rocket)
3. **Why is it so expensive then?**
   - Manufacturing processes are inefficient
   - Supply chain is complex
   - No reusability (throw away after one use)
4. **Solution from first principles**:
   - Build rockets in-house (vertical integration)
   - Design for reusability
   - Simplify manufacturing
   - Result: SpaceX can launch for ~$7M (10x cheaper)
</text>
<outcome>Disruptive innovation by questioning fundamental assumptions</outcome>
</example>

<example>
<title>Software Architecture Decision</title>
<description>Applying first principles to technical decisions</description>
<text>
**Problem**: "Should we use microservices?"

**Reasoning by Analogy** (common approach):
- "Everyone is using microservices"
- "Microservices are the modern way"
- "Monoliths are outdated"
- Result: Maybe not the right choice for this team/problem

**First Principles Approach**:
1. **What are we trying to optimize for?**
   - Development velocity
   - Deployment frequency
   - System reliability
   - Team coordination
2. **What are the fundamental trade-offs?**
   - Distributed systems have inherent complexity (network calls, consistency)
   - Monoliths have simplicity but limited scalability
   - Microservices enable independent deployment but require orchestration
3. **What are our constraints?**
   - Team size (5 developers, not 500)
   - Traffic (1000 req/s, not 1M req/s)
   - Domain complexity (moderate, not highly complex)
4. **Solution from first principles**:
   - Start with monolith (appropriate for scale)
   - Design modular boundaries for future extraction
   - Extract services only when justified by real needs
   - Result: Right-sized architecture for actual constraints
</text>
<outcome>Architecture decision based on actual needs, not trends</outcome>
</example>

<example>
<title>Product Feature Decision</title>
<description>First principles for product prioritization</description>
<text>
**Problem**: "Competitor has feature X, should we build it?"

**Reasoning by Analogy**:
- "Yes, competitor has it"
- "Customers might expect it"
- "We don't want to fall behind"
- Result: Feature creep, building things that don't matter

**First Principles Approach**:
1. **What problem are we solving?**
   - What user need does this address?
   - Is this a real pain point for our users?
2. **What value do we create?**
   - Will this increase retention/revenue?
   - How will we measure success?
3. **What are the costs?**
   - Development time (opportunity cost)
   - Maintenance burden
   - Complexity added
4. **Solution from first principles**:
   - Only build if solves real user problem
   - Must have clear success metric
   - Must be worth opportunity cost
   - Result: Focus on what actually matters
</text>
<outcome>Product decisions based on value, not competition</outcome>
</example>
</examples>

<best_practices>
- Start every problem-solving session with "What do we know for certain?"
- Use the "5 Whys" technique to drill down to fundamentals
- Distinguish between laws of physics (unchangeable) and human conventions (changeable)
- Be explicit about your assumptions - list them out
- Question constraints individually - don't accept "it's just not possible"
- Be willing to sound ignorant by asking obvious questions
- Take time in the deconstruction phase - rushing leads to analogy thinking
- Verify your "first principles" with data when possible
- Use first principles for important decisions, not trivial ones (not worth the effort)
- Teach others to think in first principles - creates culture of innovation
</best_practices>

<anti_patterns>
❌ "This is industry standard" - not a first principle
❌ "Everyone does it this way" - reasoning by analogy
❌ "It's too hard to change" - not a fundamental constraint
❌ "We've always done it this way" - tradition, not truth
❌ Skipping the deconstruction phase - leads to shallow thinking
❌ Accepting constraints without question - some are self-imposed
❌ Reasoning from examples instead of principles - cookbook thinking
❌ Confusing "first principles" with "obvious" - some truths are counterintuitive
❌ Using first principles for trivial decisions - waste of cognitive effort
❌ Being contrarian just for the sake of it - that's not first principles, that's rebellion
</anti_patterns>

<integration_notes>
When using Claude Code with this skill, trigger it by saying:

- "Let's think about this from first principles"
- "Break this down to fundamentals"
- "What are the first principles here?"
- "Don't tell me what others do, what's actually true?"
- "Question our assumptions about this"

Claude will automatically:
- Ask "What do we know to be TRUE?" not "What do others do?"
- Distinguish between assumptions and fundamental truths
- Question constraints and conventional wisdom
- Build solutions from ground up, not by analogy
- Help you avoid reasoning by analogy
- Reconstruct solutions from verified first principles

Expected behaviors:
- Claude will challenge your assumptions
- Claude will ask "Why?" multiple times
- Claude won't accept "because that's how it's done" as an answer
- Claude will help you distinguish real vs. imagined constraints
- Claude will build novel solutions from fundamentals
</integration_notes>

<error_handling>
Common pitfalls when applying first principles:

1. **Mistaking strong beliefs for first principles**
   - Fix: Ask "Can I prove this from first principles?"
   - Fix: Look for data/evidence, not just confidence

2. **Getting stuck in infinite reduction**
   - Fix: Accept that some truths are foundational (don't drill forever)
   - Fix: Recognize when you've hit physics/logic vs. just more analysis

3. **Ignoring practical constraints completely**
   - Fix: Some constraints ARE real (laws of physics, time, resources)
   - Fix: Distinguish between impossible and merely difficult

4. **Using first principles for everything**
   - Fix: Not worth the cognitive effort for trivial decisions
   - Fix: Reserve for important/novel problems

5. **Confusing first principles with contrarianism**
   - Fix: The goal is truth, not being different
   - Fix: Sometimes conventional wisdom is right (but you should verify)
</error_handling>

<output_format>
When first principles thinking is applied, expect:

1. **Clear problem statement**: One sentence defining what you're solving
2. **Assumption list**: Explicit list of all assumptions made
3. **Constraint analysis**: Real vs. imagined constraints
4. **First principles**: Verified fundamental truths (5-7 max)
5. **Novel solution**: Approach built from ground up
6. **Justification**: Solution justified by first principles, not analogy

Document structure:
```
## First Principles Analysis

**Problem**: [One sentence]

### Assumptions
1. [Assumption 1] - ✓ Verified or ✗ Unverified
2. [Assumption 2] - ✓ Verified or ✗ Unverified

### Constraints
- Real: [Laws of physics, time, etc.]
- Imagined: [Self-imposed, conventional]

### First Principles
1. [Fundamental truth 1]
2. [Fundamental truth 2]
3. [Fundamental truth 3]

### Solution
[Built from first principles, not by analogy]
```
</output_format>

<related_skills>
- systematic-debugging - First principles helps find root causes
- intelligent-routing - Make routing decisions from fundamentals
- writing-plans - Build plans from first principles
- deep-research - Verify what's actually true vs. assumed
</related_skills>

<see_also>
- [The First Principles Mental Model](https://fs.blog/2018/04/first-principles/) - Farnam Street deep dive
- [Elon Musk: Think in First Principles](https://bigthink.com/thinking/elon-musk-first-principles) - Musk's approach
- [Aristotle's First Philosophy](https://plato.stanford.edu/entries/aristotle-first-principles/) - Origin of the concept
</see_also>

<philosophy>
<historical_context>
First principles thinking dates back to Aristotle's "Metaphysics":

> "In every systematic inquiry (methodos) where there are first principles, or causes, or elements, knowledge and science result from attaining knowledge of these."

Aristotle argued that to understand anything, you must break it down to its:
1. **Final cause** (the purpose/teleology)
2. **Formal cause** (the design/structure)
3. **Efficient cause** (the mechanism/agent)
4. **Material cause** (the substance/parts)

Modern first principles thinking simplifies this but keeps the core idea:
**Break down to what cannot be reduced further, then build up.**
</historical_context>

<modern_applications>
- **Physics**: Break down to fundamental laws, then predict phenomena
- **Engineering**: Understand material properties, then design structures
- **Business**: Understand fundamental economics, then build companies
- **Software**: Understand requirements deeply, then architect systems
- **Strategy**: Understand true constraints, then make plans
</modern_applications>

<why_it_works>
First principles works because:

1. **Avoids cargo culting** - Copying without understanding
2. **Reveals true constraints** - Not just assumed limitations
3. **Enables innovation** - Novel combinations of fundamentals
4. **Builds confidence** - You understand why it works
5. **Improves teaching** - Can explain from ground up
6. **Prevents over-engineering** - Solve actual problem, not imagined ones
</why_it_works>
</philosophy>
