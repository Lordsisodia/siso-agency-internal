#!/usr/bin/env python3
"""
Questioning Strategies for different spec types
Each strategy defines question categories, priorities, and dependencies
"""

from typing import List, Dict, Any
from abc import ABC, abstractmethod
import sys
import os

# Add parent lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

try:
    from spec_types import StructuredSpec
except ImportError:
    StructuredSpec = object  # Type placeholder


class QuestioningStrategy(ABC):
    """Base class for questioning strategies."""

    @abstractmethod
    def get_question_categories(self) -> List[str]:
        """Get question categories for this strategy."""
        pass

    @abstractmethod
    def generate_questions(self, spec: StructuredSpec) -> List[Dict[str, Any]]:
        """Generate questions for the spec."""
        pass

    def _calculate_priority(self, category: str, context: Dict = None) -> str:
        """Calculate priority based on category and context."""
        high_priority_categories = [
            'user_authentication',
            'data_security',
            'core_functionality',
            'api_design'
        ]

        if category in high_priority_categories:
            return 'high'

        return 'medium'


class WebAppQuestioningStrategy(QuestioningStrategy):
    """Questioning strategy for web applications."""

    def get_question_categories(self) -> List[str]:
        return [
            'user_authentication',
            'data_management',
            'user_interface',
            'api_integration',
            'performance',
            'security',
            'deployment',
            'scaling'
        ]

    def generate_questions(self, spec: StructuredSpec) -> List[Dict[str, Any]]:
        questions = []

        # User Authentication
        questions.extend([
            {
                'question': 'What authentication methods are required (e.g., email/password, OAuth, SSO)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'user_authentication',
                'context': {
                    'section': 'overview',
                    'depends_on': ['user_stories']
                }
            },
            {
                'question': 'Do we need role-based access control (RBAC) or permission systems?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'user_authentication',
                'context': {'section': 'user_stories'}
            },
            {
                'question': 'What are the session management requirements (timeout, refresh tokens, etc.)?',
                'area': 'clarity',
                'priority': 'medium',
                'category': 'user_authentication',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Data Management
        questions.extend([
            {
                'question': 'What data entities need to be persisted (users, content, transactions, etc.)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'data_management',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What are the data relationships and constraints?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'data_management',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'Do we need data validation rules and sanitization?',
                'area': 'security',
                'priority': 'high',
                'category': 'data_management',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What are the data retention and backup requirements?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'data_management',
                'context': {'section': 'overview'}
            }
        ])

        # User Interface
        questions.extend([
            {
                'question': 'What devices and screen sizes need to be supported (desktop, tablet, mobile)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'user_interface',
                'context': {'section': 'overview'}
            },
            {
                'question': 'Do we need accessibility compliance (WCAG levels)?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'user_interface',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What UI framework or design system will be used?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'user_interface',
                'context': {'section': 'constitution', 'key': 'tech_stack'}
            },
            {
                'question': 'Are there real-time UI requirements (WebSockets, SSE, etc.)?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'user_interface',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # API Integration
        questions.extend([
            {
                'question': 'What external APIs need to be integrated (payment, analytics, etc.)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'api_integration',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What are the API rate limits and error handling requirements?',
                'area': 'clarity',
                'priority': 'medium',
                'category': 'api_integration',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'Do we need API versioning strategies?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'api_integration',
                'context': {'section': 'constitution', 'key': 'architectural_principles'}
            }
        ])

        # Performance
        questions.extend([
            {
                'question': 'What are the performance targets (page load time, API response time)?',
                'area': 'testability',
                'priority': 'high',
                'category': 'performance',
                'context': {'section': 'overview', 'key': 'success_criteria'}
            },
            {
                'question': 'What is the expected concurrent user load?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'performance',
                'context': {'section': 'overview'}
            },
            {
                'question': 'Do we need caching strategies (Redis, CDN, etc.)?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'performance',
                'context': {'section': 'constitution', 'key': 'tech_stack'}
            }
        ])

        # Security
        questions.extend([
            {
                'question': 'What security measures are needed (HTTPS, CSRF, XSS protection)?',
                'area': 'security',
                'priority': 'high',
                'category': 'security',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'Do we need to comply with data protection regulations (GDPR, CCPA)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'security',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What logging and monitoring is required for security?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'security',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Deployment
        questions.extend([
            {
                'question': 'What is the target deployment environment (AWS, GCP, Azure, self-hosted)?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'deployment',
                'context': {'section': 'constitution', 'key': 'tech_stack'}
            },
            {
                'question': 'What CI/CD pipeline is needed?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'deployment',
                'context': {'section': 'constitution', 'key': 'quality_standards'}
            },
            {
                'question': 'What are the staging and testing environment requirements?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'deployment',
                'context': {'section': 'overview'}
            }
        ])

        # Scaling
        questions.extend([
            {
                'question': 'What are the scaling requirements (vertical vs horizontal)?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'scaling',
                'context': {'section': 'overview'}
            },
            {
                'question': 'Do we need load balancing strategies?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'scaling',
                'context': {'section': 'constitution', 'key': 'architectural_principles'}
            }
        ])

        return questions


class MobileAppQuestioningStrategy(QuestioningStrategy):
    """Questioning strategy for mobile applications."""

    def get_question_categories(self) -> List[str]:
        return [
            'platform_support',
            'user_authentication',
            'device_features',
            'offline_support',
            'app_distribution',
            'performance',
            'security'
        ]

    def generate_questions(self, spec: StructuredSpec) -> List[Dict[str, Any]]:
        questions = []

        # Platform Support
        questions.extend([
            {
                'question': 'Which platforms need to be supported (iOS, Android, both)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'platform_support',
                'context': {'section': 'overview'}
            },
            {
                'question': 'Should we use native, cross-platform (React Native, Flutter), or PWA?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'platform_support',
                'context': {'section': 'constitution', 'key': 'tech_stack'}
            },
            {
                'question': 'What are the minimum OS version requirements?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'platform_support',
                'context': {'section': 'overview'}
            }
        ])

        # User Authentication
        questions.extend([
            {
                'question': 'What authentication methods are needed (biometric, social login, etc.)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'user_authentication',
                'context': {'section': 'user_stories'}
            },
            {
                'question': 'Do we need offline authentication support?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'user_authentication',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Device Features
        questions.extend([
            {
                'question': 'What device features need to be accessed (camera, GPS, notifications)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'device_features',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What permissions are required from users?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'device_features',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Offline Support
        questions.extend([
            {
                'question': 'What features should work offline?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'offline_support',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'How should data sync when connectivity is restored?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'offline_support',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # App Distribution
        questions.extend([
            {
                'question': 'How will the app be distributed (App Store, Play Store, Enterprise)?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'app_distribution',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What are the app store review requirements?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'app_distribution',
                'context': {'section': 'overview'}
            }
        ])

        return questions


class APIQuestioningStrategy(QuestioningStrategy):
    """Questioning strategy for API services."""

    def get_question_categories(self) -> List[str]:
        return [
            'api_design',
            'authentication',
            'data_validation',
            'error_handling',
            'rate_limiting',
            'documentation',
            'testing',
            'deployment'
        ]

    def generate_questions(self, spec: StructuredSpec) -> List[Dict[str, Any]]:
        questions = []

        # API Design
        questions.extend([
            {
                'question': 'What architectural style will be used (REST, GraphQL, gRPC)?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'api_design',
                'context': {'section': 'constitution', 'key': 'architectural_principles'}
            },
            {
                'question': 'What are the main API endpoints/resources?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'api_design',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What is the API versioning strategy?',
                'area': 'clarity',
                'priority': 'medium',
                'category': 'api_design',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Authentication
        questions.extend([
            {
                'question': 'What authentication mechanism will be used (JWT, OAuth, API keys)?',
                'area': 'security',
                'priority': 'high',
                'category': 'authentication',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'Do we need role-based access control (RBAC)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'authentication',
                'context': {'section': 'user_stories'}
            }
        ])

        # Data Validation
        questions.extend([
            {
                'question': 'What validation rules are needed for request data?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'data_validation',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What is the request/response data format (JSON, XML, etc.)?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'data_validation',
                'context': {'section': 'constitution', 'key': 'tech_stack'}
            }
        ])

        # Error Handling
        questions.extend([
            {
                'question': 'What error response format will be used?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'error_handling',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What HTTP status codes should be returned for different scenarios?',
                'area': 'clarity',
                'priority': 'medium',
                'category': 'error_handling',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Rate Limiting
        questions.extend([
            {
                'question': 'What are the rate limiting requirements?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'rate_limiting',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'How should rate limits be communicated to clients?',
                'area': 'clarity',
                'priority': 'medium',
                'category': 'rate_limiting',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Documentation
        questions.extend([
            {
                'question': 'What documentation format will be used (OpenAPI/Swagger)?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'documentation',
                'context': {'section': 'constitution', 'key': 'quality_standards'}
            },
            {
                'question': 'What level of detail is required in API documentation?',
                'area': 'clarity',
                'priority': 'medium',
                'category': 'documentation',
                'context': {'section': 'overview'}
            }
        ])

        return questions


class GeneralQuestioningStrategy(QuestioningStrategy):
    """Default/fallback questioning strategy for general specs."""

    def get_question_categories(self) -> List[str]:
        return [
            'project_scope',
            'requirements',
            'constraints',
            'success_criteria',
            'risks',
            'timeline'
        ]

    def generate_questions(self, spec: StructuredSpec) -> List[Dict[str, Any]]:
        questions = []

        # Project Scope
        questions.extend([
            {
                'question': 'What is the primary problem this project solves?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'project_scope',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What are the project boundaries (what is in/out of scope)?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'project_scope',
                'context': {'section': 'overview'}
            },
            {
                'question': 'Who are the target users or customers?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'project_scope',
                'context': {'section': 'overview'}
            }
        ])

        # Requirements
        questions.extend([
            {
                'question': 'What are the must-have vs nice-to-have features?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'requirements',
                'context': {'section': 'user_stories'}
            },
            {
                'question': 'Do we have sufficient user stories to cover all major use cases?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'requirements',
                'context': {'section': 'user_stories'}
            },
            {
                'question': 'Are all requirements clearly defined and unambiguous?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'requirements',
                'context': {'section': 'functional_requirements'}
            }
        ])

        # Constraints
        questions.extend([
            {
                'question': 'What are the technical constraints (platform, language, etc.)?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'constraints',
                'context': {'section': 'constitution', 'key': 'tech_stack'}
            },
            {
                'question': 'What are the budget and timeline constraints?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'constraints',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What are the team size and skill constraints?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'constraints',
                'context': {'section': 'overview'}
            }
        ])

        # Success Criteria
        questions.extend([
            {
                'question': 'What are the measurable success criteria?',
                'area': 'testability',
                'priority': 'high',
                'category': 'success_criteria',
                'context': {'section': 'overview'}
            },
            {
                'question': 'How will we know if the project is successful?',
                'area': 'testability',
                'priority': 'high',
                'category': 'success_criteria',
                'context': {'section': 'overview'}
            }
        ])

        # Risks
        questions.extend([
            {
                'question': 'What are the main technical risks?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'risks',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What are the mitigation strategies for identified risks?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'risks',
                'context': {'section': 'overview'}
            }
        ])

        # Timeline
        questions.extend([
            {
                'question': 'What are the key milestones and deadlines?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'timeline',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What is the phased delivery approach (MVP, v1, v2)?',
                'area': 'feasibility',
                'priority': 'medium',
                'category': 'timeline',
                'context': {'section': 'overview'}
            }
        ])

        return questions


# Strategy registry
_STRATEGIES = {
    'webapp': WebAppQuestioningStrategy,
    'mobile': MobileAppQuestioningStrategy,
    'api': APIQuestioningStrategy,
    'general': GeneralQuestioningStrategy
}


def get_strategy(spec_type: str) -> type:
    """
    Get questioning strategy class for spec type.

    Args:
        spec_type: Type of spec (webapp, mobile, api, general)

    Returns:
        QuestioningStrategy class
    """
    return _STRATEGIES.get(spec_type.lower(), GeneralQuestioningStrategy)


def list_strategies() -> List[str]:
    """List available questioning strategies."""
    return list(_STRATEGIES.keys())
