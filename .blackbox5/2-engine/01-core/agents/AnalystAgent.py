"""
Analyst Agent (Mary)

Specializes in research, analysis, and data-driven insights.
"""

import logging
from typing import List
from datetime import datetime

from agents.core.base_agent import BaseAgent, AgentTask, AgentResult, AgentConfig

logger = logging.getLogger(__name__)


class AnalystAgent(BaseAgent):
    """
    Analyst Agent - Mary 📊

    Specializes in:
    - Research and investigation
    - Data analysis
    - Competitive analysis
    - Market research
    - Requirements analysis
    - User research
    """

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        """Get default configuration for the Analyst agent."""
        return AgentConfig(
            name="analyst",
            full_name="Mary",
            role="Analyst",
            category="specialists",
            description="Expert analyst specializing in research, data analysis, and generating actionable insights",
            capabilities=[
                "research",
                "data_analysis",
                "competitive_analysis",
                "market_research",
                "requirements_analysis",
                "user_research",
            ],
            temperature=0.5,  # Balanced for creative and analytical thinking
            metadata={
                "icon": "📊",
                "created_at": datetime.now().isoformat(),
            }
        )

    async def execute(self, task: AgentTask) -> AgentResult:
        """
        Execute an analysis task.

        Args:
            task: The task to execute

        Returns:
            AgentResult with analysis and insights
        """
        thinking_steps = await self.think(task)

        # Analyze task type
        task_lower = task.description.lower()

        if any(word in task_lower for word in ["research", "investigate", "study"]):
            output = await self._conduct_research(task)
        elif any(word in task_lower for word in ["data", "metrics", "analytics"]):
            output = await self._analyze_data(task)
        elif any(word in task_lower for word in ["competitor", "competitive"]):
            output = await self._competitive_analysis(task)
        elif any(word in task_lower for word in ["requirement", "spec"]):
            output = await self._analyze_requirements(task)
        else:
            output = await self._general_analysis(task)

        return AgentResult(
            success=True,
            output=output,
            thinking_steps=thinking_steps,
            artifacts={
                "insights": self._extract_insights(output),
                "recommendations": self._extract_recommendations(output),
            },
            metadata={
                "agent_name": self.name,
                "analysis_type": self._determine_analysis_type(task),
            }
        )

    async def think(self, task: AgentTask) -> List[str]:
        """Generate thinking steps for analysis tasks."""
        return [
            f"📚 Gathering information on: {task.description[:100]}...",
            "🔍 Analyzing patterns and trends",
            "📈 Processing data and identifying insights",
            "🎯 Formulating data-driven conclusions",
            "💡 Developing actionable recommendations",
        ]

    async def _conduct_research(self, task: AgentTask) -> str:
        """Conduct research on a topic."""
        return f"""# Research Report: {task.description}

## Executive Summary
This research investigates {task.description} through comprehensive analysis of available information, patterns, and trends.

## Key Findings
1. **Primary Insight**: Core analysis reveals significant patterns
2. **Secondary Insights**: Supporting observations and correlations
3. **Data Points**: Quantitative measures and statistics

## Detailed Analysis
### Topic Overview
- **Scope**: Comprehensive coverage of the subject matter
- **Methodology**: Multi-source research and validation
- **Limitations**: Known constraints and assumptions

### Findings
Based on research and analysis:
- Trend 1: Description and implications
- Trend 2: Description and implications
- Pattern 3: Description and implications

## Recommendations
1. **Immediate Action**: Specific steps to take now
2. **Short-term Strategy**: Actions for next 1-3 months
3. **Long-term Planning**: Strategic considerations for 6-12 months

## Sources
- Multi-source verification
- Cross-reference validation
- Expert consultation where applicable
"""

    async def _analyze_data(self, task: AgentTask) -> str:
        """Analyze data and metrics."""
        return f"""# Data Analysis: {task.description}

## Overview
Comprehensive analysis of available data with focus on actionable insights and trends.

## Data Summary
| Metric | Value | Trend |
|--------|-------|-------|
| Metric 1 | Value | 📈 Increasing |
| Metric 2 | Value | 📉 Decreasing |
| Metric 3 | Value | ➡️ Stable |

## Key Insights
1. **Trend Analysis**: Clear patterns in the data
2. **Anomalies**: Notable deviations from expected values
3. **Correlations**: Relationships between different metrics
4. **Opportunities**: Areas for improvement or growth

## Visual Analysis
```
[Data visualization would be included here]
Shows trends, patterns, and key data points
```

## Recommendations
Based on data analysis:
1. **Optimization**: Areas where performance can be improved
2. **Growth**: Opportunities for expansion
3. **Risk Mitigation**: Potential issues to address

## Next Steps
- Monitor key metrics
- Conduct deeper analysis on specific areas
- Implement recommended changes
- Track impact of interventions
"""

    async def _competitive_analysis(self, task: AgentTask) -> str:
        """Conduct competitive analysis."""
        return f"""# Competitive Analysis: {task.description}

## Market Landscape
Analysis of competitive positioning and opportunities.

## Competitor Overview
| Competitor | Strengths | Weaknesses | Market Share |
|------------|-----------|------------|--------------|
| Competitor A | Strength 1, Strength 2 | Weakness 1 | XX% |
| Competitor B | Strength 3 | Weakness 2, Weakness 3 | YY% |
| Our Position | Strength 4, Strength 5 | Weakness 4 | ZZ% |

## Analysis
### Competitive Advantages
1. **Our Strength 1**: Description and impact
2. **Our Strength 2**: Description and impact
3. **Unique Position**: What sets us apart

### Competitive Gaps
1. **Area for Improvement**: Description and priority
2. **Market Opportunity**: Unmet needs
3. **Threat Level**: Assessment of competitive pressure

## Strategic Recommendations
1. **Leverage Strengths**: Maximize competitive advantages
2. **Address Gaps**: Close critical capability gaps
3. **Differentiate**: Strengthen unique positioning
4. **Monitor**: Track competitive landscape changes

## Action Plan
- Short-term: Immediate actions to take
- Medium-term: Strategic initiatives
- Long-term: Vision for market leadership
"""

    async def _analyze_requirements(self, task: AgentTask) -> str:
        """Analyze and clarify requirements."""
        return f"""# Requirements Analysis: {task.description}

## Requirements Breakdown
Detailed analysis of functional and non-functional requirements.

## Functional Requirements
| ID | Requirement | Priority | Complexity | Status |
|----|-------------|----------|------------|--------|
| FR-001 | Description | High | Medium | Clarified |
| FR-002 | Description | Medium | Low | Clarified |
| FR-003 | Description | High | High | Needs Review |

## Non-Functional Requirements
| Category | Requirement | Metric | Priority |
|----------|-------------|--------|----------|
| Performance | Response time | < 200ms | High |
| Security | Encryption | AES-256 | Critical |
| Scalability | Concurrent users | 10K+ | Medium |

## Analysis
### Completeness
✓ Core requirements identified
⚠ Some edge cases need clarification
✓ Acceptance criteria defined

### Consistency
✓ No conflicting requirements found
✓ Requirements align with business goals
⚠ Some dependencies need clarification

### Feasibility
✓ Technically feasible
✓ Resource requirements realistic
⚠ Timeline may be aggressive

## Recommendations
1. **Clarify**: Address items needing review
2. **Prioritize**: Focus on critical path items
3. **Plan**: Account for dependencies
4. **Validate**: Confirm with stakeholders

## Updated Requirements
[Refined requirements list based on analysis]
"""

    async def _general_analysis(self, task: AgentTask) -> str:
        """General analysis task."""
        return f"""# Analysis: {task.description}

## Overview
Comprehensive analysis of the provided topic or request.

## Key Points
1. **Observation 1**: Detailed description
2. **Observation 2**: Detailed description
3. **Observation 3**: Detailed description

## Insights
- **Primary Finding**: Main conclusion from analysis
- **Supporting Evidence**: Data and observations
- **Implications**: What this means for the project

## Recommendations
Based on the analysis:
1. Specific action item
2. Specific action item
3. Specific action item

## Conclusion
Summary of analysis and key takeaways.
"""

    def _extract_insights(self, text: str) -> List[str]:
        """Extract key insights from output."""
        import re
        insights = re.findall(r'[•-]\s+\*\*(.+?)\*\*:\s*(.+)', text)
        return [f"{title}: {content}" for title, content in insights]

    def _extract_recommendations(self, text: str) -> List[str]:
        """Extract recommendations from output."""
        import re
        return re.findall(r'^\d+\.\s+\*\*(.+?)\*\*:\s*(.+)', text, re.MULTILINE)

    def _determine_analysis_type(self, task: AgentTask) -> str:
        """Determine the type of analysis performed."""
        task_lower = task.description.lower()

        if "research" in task_lower:
            return "research"
        elif "data" in task_lower or "metric" in task_lower:
            return "data_analysis"
        elif "competitor" in task_lower:
            return "competitive"
        elif "requirement" in task_lower:
            return "requirements"
        else:
            return "general"
