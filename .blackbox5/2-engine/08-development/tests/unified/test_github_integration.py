#!/usr/bin/env python3
"""
Test Suite for GitHubManager
=============================

Tests the GitHub integration system adapted from CCPM.

Run tests:
    pytest .blackbox5/tests/test_github_integration.py -v

Run with coverage:
    pytest .blackbox5/tests/test_github_integration.py --cov=.blackbox5/integration/github -v

Environment variables required:
    GITHUB_TOKEN: Your GitHub Personal Access Token
    GITHUB_REPO: Test repository in "owner/repo" format

Create test PAT at: https://github.com/settings/tokens
Required scopes: repo, issues, pull_requests
"""

import os
import sys
import pytest
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from integration.github.GitHubManager import (
    GitHubManager,
    GitHubIssue,
    GitHubPR,
    create_manager_from_env
)


# -------------------------------------------------------------------------
# Test Configuration
# -------------------------------------------------------------------------

# Skip integration tests if no token provided
pytestmark = pytest.mark.skipif(
    not os.environ.get("GITHUB_TOKEN"),
    reason="GITHUB_TOKEN environment variable not set"
)

# Get test configuration from environment
TEST_TOKEN = os.environ.get("GITHUB_TOKEN")
TEST_REPO = os.environ.get("GITHUB_REPO", "owner/repo")


# -------------------------------------------------------------------------
# Fixtures
# -------------------------------------------------------------------------

@pytest.fixture
def github_manager():
    """Create GitHubManager instance for testing."""
    return GitHubManager(token=TEST_TOKEN, repo=TEST_REPO)


@pytest.fixture
def mock_requests():
    """Mock requests library for unit tests."""
    with patch("integration.github.GitHubManager.requests") as mock:
        mock.Session.return_value = MagicMock()
        yield mock


@pytest.fixture
def sample_issue_response():
    """Sample GitHub API issue response."""
    return {
        "number": 123,
        "title": "Test Issue",
        "body": "Test issue body",
        "state": "open",
        "html_url": "https://github.com/owner/repo/issues/123",
        "labels": [
            {"name": "bug"},
            {"name": "high-priority"}
        ],
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
    }


@pytest.fixture
def sample_pr_response():
    """Sample GitHub API PR response."""
    return {
        "number": 456,
        "title": "Test PR",
        "body": "Test PR body",
        "state": "open",
        "html_url": "https://github.com/owner/repo/pull/456",
        "head": {"ref": "feature-branch"},
        "base": {"ref": "main"},
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
    }


# -------------------------------------------------------------------------
# Unit Tests (Mocked)
# -------------------------------------------------------------------------

class TestGitHubManagerInit:
    """Test GitHubManager initialization."""

    def test_init_with_token(self, mock_requests):
        """Test initialization with explicit token."""
        manager = GitHubManager(token="test_token", repo="owner/repo")
        assert manager.token == "test_token"
        assert manager.repo == "owner/repo"

    def test_init_with_env_token(self, mock_requests):
        """Test initialization with token from environment."""
        with patch.dict(os.environ, {"GITHUB_TOKEN": "env_token"}):
            manager = GitHubManager(repo="owner/repo")
            assert manager.token == "env_token"

    def test_init_missing_token(self, mock_requests):
        """Test that missing token raises ValueError."""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="GitHub token required"):
                GitHubManager(repo="owner/repo")

    def test_headers_set_correctly(self, mock_requests):
        """Test that session headers are set correctly."""
        mock_session = MagicMock()
        mock_requests.Session.return_value = mock_session

        GitHubManager(token="test_token", repo="owner/repo")

        expected_headers = {
            "Authorization": "token test_token",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "BlackBox5-GitHubManager/1.0"
        }
        mock_session.headers.update.assert_called_once_with(expected_headers)


class TestRepositoryDetection:
    """Test repository auto-detection."""

    def test_repo_auto_detect_from_git(self, mock_requests):
        """Test repository auto-detection from git config."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value.stdout = "https://github.com/test-owner/test-repo.git\n"

            manager = GitHubManager(token="test_token")
            assert manager.repo == "test-owner/test-repo"

    def test_repo_auto_detect_ssh_url(self, mock_requests):
        """Test repository detection with SSH URL."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value.stdout = "git@github.com:test-owner/test-repo.git\n"

            manager = GitHubManager(token="test_token")
            assert manager.repo == "test-owner/test-repo"

    def test_repo_auto_detect_failure(self, mock_requests):
        """Test that explicit repo is used when auto-detection fails."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value.stdout = ""

            manager = GitHubManager(token="test_token", repo="explicit/repo")
            assert manager.repo == "explicit/repo"


# -------------------------------------------------------------------------
# Integration Tests (Real GitHub API)
# -------------------------------------------------------------------------

@pytest.mark.integration
class TestGitHubManagerIssues:
    """Test issue management with real GitHub API."""

    def test_create_issue(self, github_manager):
        """Test creating a GitHub issue."""
        # Create issue with unique title
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        title = f"Test Issue {timestamp}"
        body = "This is a test issue created by GitHubManager tests."

        issue = github_manager.create_issue(
            title=title,
            body=body,
            labels=["test", "automated"]
        )

        assert isinstance(issue, GitHubIssue)
        assert issue.number > 0
        assert issue.title == title
        assert issue.state == "open"
        assert "test" in issue.labels
        assert "automated" in issue.labels
        assert issue.html_url.startswith("https://github.com/")

        # Cleanup: close the issue
        github_manager.update_status(issue.number, "closed")

    def test_get_issue(self, github_manager):
        """Test retrieving an issue."""
        # First create an issue
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        created = github_manager.create_issue(
            title=f"Get Test {timestamp}",
            body="Test issue for get_issue()"
        )

        # Now retrieve it
        issue = github_manager.get_issue(created.number)

        assert issue.number == created.number
        assert issue.title == created.title
        assert issue.state == "open"

        # Cleanup
        github_manager.update_status(issue.number, "closed")

    def test_update_status_to_closed(self, github_manager):
        """Test updating issue status to closed."""
        # Create issue
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        issue = github_manager.create_issue(
            title=f"Status Test {timestamp}",
            body="Test issue for status update"
        )

        assert issue.state == "open"

        # Update to closed
        updated = github_manager.update_status(issue.number, "closed")
        assert updated.state == "closed"

    def test_update_status_to_open(self, github_manager):
        """Test reopening an issue."""
        # Create and close issue
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        issue = github_manager.create_issue(
            title=f"Reopen Test {timestamp}",
            body="Test issue for reopening"
        )
        github_manager.update_status(issue.number, "closed")

        # Reopen
        updated = github_manager.update_status(issue.number, "open")
        assert updated.state == "open"

        # Cleanup
        github_manager.update_status(issue.number, "closed")

    def test_add_comment(self, github_manager):
        """Test adding a comment to an issue."""
        # Create issue
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        issue = github_manager.create_issue(
            title=f"Comment Test {timestamp}",
            body="Test issue for comments"
        )

        # Add comment
        comment_text = f"Test comment at {datetime.now().isoformat()}"
        response = github_manager.add_comment(issue.number, comment_text)

        assert "id" in response
        assert response["body"] == comment_text

        # Verify comment appears in list
        comments = github_manager.list_comments(issue.number)
        assert any(c["body"] == comment_text for c in comments)

        # Cleanup
        github_manager.update_status(issue.number, "closed")

    def test_update_issue_with_labels(self, github_manager):
        """Test updating issue with new labels."""
        # Create issue
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        issue = github_manager.create_issue(
            title=f"Label Test {timestamp}",
            body="Test issue for labels",
            labels=["initial-label"]
        )

        assert "initial-label" in issue.labels

        # Update with new labels
        updated = github_manager.update_issue(
            issue.number,
            labels=["updated-label-1", "updated-label-2"]
        )

        # Note: GitHub API returns all labels, not just the new ones
        # The update_issue method replaces all labels
        assert len(updated.labels) >= 2

        # Cleanup
        github_manager.update_status(issue.number, "closed")


@pytest.mark.integration
class TestGitHubManagerPRs:
    """Test pull request management with real GitHub API.

    Note: These tests require a test repository with a branch to create PRs from.
    Skip if repository doesn't have suitable branches.
    """

    def test_create_pr(self, github_manager):
        """Test creating a pull request."""
        # This test requires a branch to create PR from
        # Skip if not configured
        if not os.environ.get("TEST_PR_BRANCH"):
            pytest.skip("TEST_PR_BRANCH not set")

        branch = os.environ["TEST_PR_BRANCH"]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        pr = github_manager.create_pr(
            branch=branch,
            title=f"Test PR {timestamp}",
            body="This is a test PR created by GitHubManager tests",
            base="main",
            labels=["test", "automated"]
        )

        assert isinstance(pr, GitHubPR)
        assert pr.number > 0
        assert pr.head_ref == branch
        assert pr.base_ref == "main"
        assert pr.state == "open"

    def test_get_pr(self, github_manager):
        """Test retrieving a PR."""
        # This requires an existing PR number
        pr_number = os.environ.get("TEST_PR_NUMBER")
        if not pr_number:
            pytest.skip("TEST_PR_NUMBER not set")

        pr = github_manager.get_pr(int(pr_number))

        assert isinstance(pr, GitHubPR)
        assert pr.number == int(pr_number)

    def test_list_prs(self, github_manager):
        """Test listing PRs."""
        prs = github_manager.list_prs(state="open")

        assert isinstance(prs, list)
        for pr in prs:
            assert isinstance(pr, GitHubPR)
            assert pr.number > 0

    def test_add_pr_comment(self, github_manager):
        """Test adding a comment to a PR."""
        pr_number = os.environ.get("TEST_PR_NUMBER")
        if not pr_number:
            pytest.skip("TEST_PR_NUMBER not set")

        comment_text = f"Test PR comment at {datetime.now().isoformat()}"
        response = github_manager.add_pr_comment(int(pr_number), comment_text)

        assert "id" in response
        assert response["body"] == comment_text


@pytest.mark.integration
class TestGitHubManagerRepository:
    """Test repository operations."""

    def test_check_repository_safe(self, github_manager):
        """Test repository safety check."""
        is_safe = github_manager.check_repository_safe()

        # Should be True for repositories we have write access to
        assert isinstance(is_safe, bool)

    def test_get_default_branch(self, github_manager):
        """Test getting default branch."""
        # Use reflection to access private method
        branch = github_manager._get_default_branch()

        assert isinstance(branch, str)
        assert branch in ["main", "master", "develop"]


# -------------------------------------------------------------------------
# Convenience Function Tests
# -------------------------------------------------------------------------

class TestConvenienceFunctions:
    """Test convenience functions."""

    def test_create_manager_from_env(self):
        """Test creating manager from environment variables."""
        with patch.dict(os.environ, {
            "GITHUB_TOKEN": "test_token",
            "GITHUB_REPO": "test/repo"
        }):
            manager = create_manager_from_env()
            assert manager.token == "test_token"
            assert manager.repo == "test/repo"

    def test_create_manager_from_env_missing_token(self):
        """Test error when GITHUB_TOKEN not set."""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="GITHUB_TOKEN environment variable"):
                create_manager_from_env()


# -------------------------------------------------------------------------
# Error Handling Tests
# -------------------------------------------------------------------------

class TestErrorHandling:
    """Test error handling."""

    def test_update_status_invalid_status(self, github_manager):
        """Test that invalid status raises ValueError."""
        with pytest.raises(ValueError, match="Invalid status"):
            github_manager.update_status(123, "invalid")

    def test_invalid_token(self):
        """Test behavior with invalid token."""
        with pytest.raises(Exception):  # requests.HTTPError
            manager = GitHubManager(token="invalid_token", repo="owner/repo")
            manager.create_issue("Test", "Body")


# -------------------------------------------------------------------------
# CCPM Pattern Tests
# -------------------------------------------------------------------------

class TestCCPMPatterns:
    """Test patterns adapted from CCPM."""

    @pytest.mark.integration
    def test_epic_issue_creation(self, github_manager):
        """Test creating an epic-style issue (CCPM pattern)."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Create epic issue with CCPM-style structure
        epic_title = f"Epic: Test Feature {timestamp}"
        epic_body = """# Epic: Test Feature

## Overview
This is a test epic to demonstrate CCPM-style issue creation.

## Key Decisions
- Decision 1
- Decision 2

## Stats
Total tasks: 3
Parallel tasks: 2 (can be worked on simultaneously)
Sequential tasks: 1 (has dependencies)
"""

        epic = github_manager.create_issue(
            title=epic_title,
            body=epic_body,
            labels=["epic", f"epic:test-feature-{timestamp}", "feature"]
        )

        assert "epic" in epic.labels
        assert epic.title.startswith("Epic:")

        # Cleanup
        github_manager.update_status(epic.number, "closed")

    @pytest.mark.integration
    def test_task_issue_creation(self, github_manager):
        """Test creating a task-style issue (CCPM pattern)."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Create task issue
        task_title = f"Task: Implement test feature {timestamp}"
        task_body = """# Task: Implement Test Feature

## Specification
Implement a test feature for GitHubManager.

## File Changes
- Add new module
- Update tests

## Acceptance Criteria
1. [ ] Functionality implemented
2. [ ] Tests pass
3. [ ] Documentation updated

## Dependencies
- Depends on: None
- Blocks: None
"""

        task = github_manager.create_issue(
            title=task_title,
            body=task_body,
            labels=["task", f"epic:test-feature-{timestamp}"]
        )

        assert "task" in task.labels

        # Cleanup
        github_manager.update_status(task.number, "closed")

    @pytest.mark.integration
    def test_progress_update_comment(self, github_manager):
        """Test adding a progress update comment (CCPM pattern)."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Create issue
        issue = github_manager.create_issue(
            title=f"Progress Test {timestamp}",
            body="Test issue for progress updates"
        )

        # Add progress update comment (CCPM style)
        progress_comment = f"""## 🔄 Progress Update - {datetime.now().isoformat()}

### ✅ Completed Work
- Created initial implementation
- Added tests

### 🔄 In Progress
- Adding error handling
- Implementing rate limiting

### 📝 Technical Notes
- Using requests library for HTTP calls
- Token-based authentication

### 📊 Acceptance Criteria Status
- ✅ Criterion 1
- 🔄 Criterion 2
- □ Criterion 3

### 🚀 Next Steps
- Complete error handling
- Add unit tests
- Update documentation

---
*Progress: 60% | Synced from local updates at {datetime.now().isoformat()}*
"""

        response = github_manager.add_comment(issue.number, progress_comment)

        assert "id" in response
        assert response["body"].startswith("## 🔄 Progress Update")

        # Cleanup
        github_manager.update_status(issue.number, "closed")


# -------------------------------------------------------------------------
# Test Execution
# -------------------------------------------------------------------------

def run_tests():
    """Run tests programmatically."""
    pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--color=yes"
    ])


if __name__ == "__main__":
    run_tests()
