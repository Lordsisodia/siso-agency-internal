"""
Example usage of the Logarithmic Enhanced Task Analyzer

Demonstrates how to analyze tasks with the multi-dimensional analyzer.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analyzers.log_enhanced_analyzer import LogEnhancedTaskAnalyzer


class Task:
    """Simple task object for demonstration"""

    def __init__(
        self,
        title: str,
        description: str = "",
        content: str = "",
        category: str = "",
        subcategory: str = "",
        domain: str = "",
        tech_stack: list = None,
        tier: int = 3,
        priority: str = "medium",
        deadline: str = None,
        blocks: list = None,
        blocked_by: list = None,
        parent_prd: str = None,
        parent_epic: str = None,
    ):
        self.title = title
        self.description = description
        self.content = content
        self.category = category
        self.subcategory = subcategory
        self.domain = domain
        self.tech_stack = tech_stack or []
        self.tier = tier
        self.priority = priority
        self.deadline = deadline
        self.blocks = blocks or []
        self.blocked_by = blocked_by or []
        self.parent_prd = parent_prd
        self.parent_epic = parent_epic


def example_1_simple_ui_task():
    """Example 1: Simple UI task"""
    print("\n" + "="*80)
    print("EXAMPLE 1: Simple UI Task")
    print("="*80)

    task = Task(
        title="Fix button alignment on login form",
        description="The login button is misaligned on mobile devices",
        content="""
        The login form button has incorrect padding on mobile screens.
        Need to adjust CSS to center the button properly.

        Files to modify:
        - frontend/components/LoginForm.tsx
        - frontend/styles/login.css

        This is a simple CSS fix that should take less than an hour.
        """,
        category="bug",
        subcategory="ui",
        domain="frontend",
        tech_stack=["react", "css"],
        tier=1,
        priority="high",
    )

    analyzer = LogEnhancedTaskAnalyzer()
    result = analyzer.analyze(task)
    analyzer.print_analysis(result)


def example_2_complex_backend_task():
    """Example 2: Complex backend feature"""
    print("\n" + "="*80)
    print("EXAMPLE 2: Complex Backend Feature")
    print("="*80)

    task = Task(
        title="Implement distributed caching layer",
        description="""
        Add Redis-based distributed caching to improve API performance.
        This requires architecture changes, database migration, and careful
        coordination across multiple services.
        """,
        content="""
        Design and implement a distributed caching layer using Redis:
        - Analyze current API bottlenecks
        - Design cache invalidation strategy
        - Implement Redis integration
        - Update all microservices
        - Database schema changes
        - Deployment pipeline updates
        - Performance testing
        - Documentation

        This is a critical infrastructure improvement that will significantly
        improve performance for all users. Revenue impact is estimated at
        $50K annually due to improved conversion rates.

        Must be completed before Q2 marketing launch.
        """,
        category="feature",
        subcategory="infrastructure",
        domain="backend",
        tech_stack=["python", "redis", "postgresql", "kubernetes"],
        tier=4,
        priority="critical",
        deadline="2025-02-15",
        blocks=["TASK-2025-02-20-001", "TASK-2025-02-20-002"],
        parent_prd="PRD-001-scalability",
        parent_epic="EPIC-001-performance",
    )

    analyzer = LogEnhancedTaskAnalyzer()
    result = analyzer.analyze(task)
    analyzer.print_analysis(result)


def example_3_research_task():
    """Example 3: Research/Investigation task"""
    print("\n" + "="*80)
    print("EXAMPLE 3: Research Task")
    print("="*80)

    task = Task(
        title="Evaluate vector database options for RAG implementation",
        description="""
        Research and compare vector database solutions for implementing
        retrieval-augmented generation in our AI assistant.
        """,
        content="""
        We need to implement RAG for our AI assistant. Research required:

        1. Compare vector database options:
           - Pinecone
           - Weaviate
           - Milvus
           - pgvector
           - Chroma

        2. Evaluate based on:
           - Performance benchmarks
           - Cost at scale (1M+ vectors)
           - Ease of integration
           - Hosting requirements
           - Community support

        3. Proof of concept with top 2 choices

        4. Recommendation with detailed analysis

        This research is critical for our Q2 AI roadmap. Need results
        within 2 weeks to inform architecture decisions.
        """,
        category="research",
        subcategory="technology",
        domain="backend",
        tech_stack=["python", "machine-learning", "ai"],
        tier=3,
        priority="high",
    )

    analyzer = LogEnhancedTaskAnalyzer()
    result = analyzer.analyze(task)
    analyzer.print_analysis(result)


def example_4_refactoring_task():
    """Example 4: Code refactoring"""
    print("\n" + "="*80)
    print("EXAMPLE 4: Refactoring Task")
    print("="*80)

    task = Task(
        title="Refactor authentication module for better testability",
        description="""
        The current authentication module has tight coupling and is
        difficult to test. Refactor to improve code quality.
        """,
        content="""
        Refactor the authentication module to:
        - Separate concerns (auth, validation, persistence)
        - Improve test coverage (currently at 30%)
        - Reduce technical debt
        - Make code more maintainable

        Files involved:
        - backend/auth/authenticator.py (500 lines)
        - backend/auth/validator.py (200 lines)
        - backend/auth/storage.py (150 lines)

        This is technical debt reduction work. While not urgent,
        it will improve developer productivity and reduce bugs.

        No external dependencies. Can be done independently.
        """,
        category="refactor",
        subcategory="code-quality",
        domain="backend",
        tech_stack=["python"],
        tier=2,
        priority="medium",
    )

    analyzer = LogEnhancedTaskAnalyzer()
    result = analyzer.analyze(task)
    analyzer.print_analysis(result)


def main():
    """Run all examples"""
    print("\n" + "="*80)
    print("LOGARITHMIC ENHANCED TASK ANALYZER - EXAMPLE USAGE")
    print("="*80)

    # Run examples
    example_1_simple_ui_task()
    example_2_complex_backend_task()
    example_3_research_task()
    example_4_refactoring_task()

    print("\n" + "="*80)
    print("EXAMPLES COMPLETE")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
