"""
Tests for Vibe Kanban Integration
==================================

Demonstrates Vibe Kanban card management operations.
"""

import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

import pytest

# Add parent directory to path for imports
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))


# =============================================================================
# Test Fixtures
# =============================================================================


@pytest.fixture
def mock_api_response():
    """Mock API response for card creation."""
    return {
        "id": 1,
        "title": "Test Card",
        "description": "Test description",
        "status": "todo",
        "position": 0,
        "created_at": "2025-01-18T10:00:00Z",
        "updated_at": "2025-01-18T10:00:00Z",
    }


@pytest.fixture
def vibe_manager():
    """Create VibeKanbanManager instance for testing."""
    from integration.vibe import VibeKanbanManager

    manager = VibeKanbanManager(
        api_url="http://localhost:3001",
        memory_path="/tmp/test_vibe_memory",
    )
    yield manager

    # Cleanup
    asyncio.run(manager.close())


# =============================================================================
# Card Creation Tests
# =============================================================================


@pytest.mark.asyncio
async def test_create_card(vibe_manager, mock_api_response):
    """Test creating a new card in the backlog."""
    with patch.object(vibe_manager.client, "post", new=AsyncMock()) as mock_post:
        mock_post.return_value = Mock(
            json=Mock(return_value=mock_api_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.create_card(
            title="Implement feature X",
            description="Add feature X to the system",
            column=vibe_manager.Column.BACKLOG,
        )

        assert card.id == 1
        assert card.title == "Test Card"
        assert card.status == vibe_manager.CardStatus.TODO
        assert card.column == vibe_manager.Column.BACKLOG
        mock_post.assert_called_once()


@pytest.mark.asyncio
async def test_create_card_in_doing(vibe_manager, mock_api_response):
    """Test creating a card directly in the doing column."""
    # Update mock to return in_progress status
    mock_response = mock_api_response.copy()
    mock_response["status"] = "in_progress"

    with patch.object(vibe_manager.client, "post", new=AsyncMock()) as mock_post:
        mock_post.return_value = Mock(
            json=Mock(return_value=mock_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.create_card(
            title="Fix critical bug",
            description="Users cannot login",
            column=vibe_manager.Column.DOING,
        )

        assert card.status == vibe_manager.CardStatus.IN_PROGRESS
        assert card.column == vibe_manager.Column.DOING


@pytest.mark.asyncio
async def test_create_card_from_spec(vibe_manager, mock_api_response):
    """Test creating a card from a specification."""
    from integration.vibe import CardSpec

    spec = CardSpec(
        title="Add authentication",
        description="Implement OAuth2 login",
        acceptance_criteria=[
            "User can login with Google",
            "User can login with GitHub",
            "Session persists across restarts",
        ],
        labels=["priority:high", "type:feature"],
    )

    with patch.object(vibe_manager.client, "post", new=AsyncMock()) as mock_post:
        mock_post.return_value = Mock(
            json=Mock(return_value=mock_api_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.create_card_from_spec(spec)

        assert card.title == "Test Card"
        # Verify the description includes acceptance criteria
        call_args = mock_post.call_args
        payload = call_args[1]["json"]
        assert "Acceptance Criteria" in payload["description"]


# =============================================================================
# Card Movement Tests
# =============================================================================


@pytest.mark.asyncio
async def test_move_card_to_done(vibe_manager, mock_api_response):
    """Test moving a card from backlog to done."""
    # Update mock to return done status
    mock_response = mock_api_response.copy()
    mock_response["status"] = "done"

    with patch.object(vibe_manager.client, "patch", new=AsyncMock()) as mock_patch:
        mock_patch.return_value = Mock(
            json=Mock(return_value=mock_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.move_card(
            card_id=1,
            column=vibe_manager.Column.DONE,
        )

        assert card.status == vibe_manager.CardStatus.DONE
        assert card.column == vibe_manager.Column.DONE
        mock_patch.assert_called_once()


@pytest.mark.asyncio
async def test_move_card_to_review(vibe_manager, mock_api_response):
    """Test moving a card to review column."""
    # Update mock to return in_review status
    mock_response = mock_api_response.copy()
    mock_response["status"] = "in_review"

    with patch.object(vibe_manager.client, "patch", new=AsyncMock()) as mock_patch:
        mock_patch.return_value = Mock(
            json=Mock(return_value=mock_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.move_card(
            card_id=1,
            column=vibe_manager.Column.IN_REVIEW,
        )

        assert card.status == vibe_manager.CardStatus.IN_REVIEW
        assert card.column == vibe_manager.Column.IN_REVIEW


# =============================================================================
# Status Update Tests
# =============================================================================


@pytest.mark.asyncio
async def test_update_card_status_to_in_progress(vibe_manager, mock_api_response):
    """Test updating card status to in_progress (moves to doing column)."""
    # Update mock to return in_progress status
    mock_response = mock_api_response.copy()
    mock_response["status"] = "in_progress"

    with patch.object(vibe_manager.client, "patch", new=AsyncMock()) as mock_patch:
        mock_patch.return_value = Mock(
            json=Mock(return_value=mock_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.update_card_status(
            card_id=1,
            status=vibe_manager.CardStatus.IN_PROGRESS,
        )

        assert card.status == vibe_manager.CardStatus.IN_PROGRESS
        assert card.column == vibe_manager.Column.DOING


@pytest.mark.asyncio
async def test_update_card_status_to_done(vibe_manager, mock_api_response):
    """Test updating card status to done (moves to done column)."""
    # Update mock to return done status
    mock_response = mock_api_response.copy()
    mock_response["status"] = "done"

    with patch.object(vibe_manager.client, "patch", new=AsyncMock()) as mock_patch:
        mock_patch.return_value = Mock(
            json=Mock(return_value=mock_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.update_card_status(
            card_id=1,
            status=vibe_manager.CardStatus.DONE,
        )

        assert card.status == vibe_manager.CardStatus.DONE
        assert card.column == vibe_manager.Column.DONE


# =============================================================================
# Status to Column Mapping Tests
# =============================================================================


def test_status_to_column_mapping():
    """Test that statuses map to correct columns."""
    from integration.vibe import STATUS_TO_COLUMN, CardStatus, Column

    assert STATUS_TO_COLUMN[CardStatus.TODO] == Column.BACKLOG
    assert STATUS_TO_COLUMN[CardStatus.IN_PROGRESS] == Column.DOING
    assert STATUS_TO_COLUMN[CardStatus.IN_REVIEW] == Column.IN_REVIEW
    assert STATUS_TO_COLUMN[CardStatus.DONE] == Column.DONE
    assert STATUS_TO_COLUMN[CardStatus.BLOCKED] == Column.BLOCKED


# =============================================================================
# Query Tests
# =============================================================================


@pytest.mark.asyncio
async def test_get_card(vibe_manager, mock_api_response):
    """Test fetching a single card by ID."""
    with patch.object(vibe_manager.client, "get", new=AsyncMock()) as mock_get:
        mock_get.return_value = Mock(
            json=Mock(return_value=mock_api_response),
            raise_for_status=Mock(),
        )

        card = await vibe_manager.get_card(card_id=1)

        assert card.id == 1
        assert card.title == "Test Card"
        mock_get.assert_called_once()


@pytest.mark.asyncio
async def test_list_cards_by_status(vibe_manager):
    """Test listing cards filtered by status."""
    mock_response = {
        "cards": [
            {
                "id": 1,
                "title": "Card 1",
                "description": "Description 1",
                "status": "todo",
                "position": 0,
            },
            {
                "id": 2,
                "title": "Card 2",
                "description": "Description 2",
                "status": "todo",
                "position": 1,
            },
        ]
    }

    with patch.object(vibe_manager.client, "get", new=AsyncMock()) as mock_get:
        mock_get.return_value = Mock(
            json=Mock(return_value=mock_response),
            raise_for_status=Mock(),
        )

        cards = await vibe_manager.list_cards(status=vibe_manager.CardStatus.TODO)

        assert len(cards) == 2
        assert all(c.status == vibe_manager.CardStatus.TODO for c in cards)


# =============================================================================
# Comment Tests
# =============================================================================


@pytest.mark.asyncio
async def test_add_comment(vibe_manager):
    """Test adding a comment to a card."""
    mock_response = {
        "id": 1,
        "body": "This is a comment",
        "author": "BlackBox5",
        "created_at": "2025-01-18T10:00:00Z",
    }

    with patch.object(vibe_manager.client, "post", new=AsyncMock()) as mock_post:
        mock_post.return_value = Mock(
            json=Mock(return_value=mock_response),
            raise_for_status=Mock(),
        )

        comment = await vibe_manager.add_comment(
            card_id=1,
            comment="This is a comment",
        )

        assert comment["body"] == "This is a comment"
        mock_post.assert_called_once()


# =============================================================================
# Integration Test (Demonstrates Full Workflow)
# =============================================================================


@pytest.mark.asyncio
async def test_full_card_workflow(vibe_manager):
    """
    Demonstrate complete Vibe Kanban card workflow.

    This test shows:
    1. Creating a card in backlog
    2. Moving it to doing (in_progress)
    3. Adding a progress comment
    4. Moving it to review
    5. Moving it to done
    """
    # Mock responses for different states
    responses = {
        "todo": {
            "id": 1,
            "title": "Implement Feature X",
            "description": "Add feature X with acceptance criteria",
            "status": "todo",
            "position": 0,
            "created_at": "2025-01-18T10:00:00Z",
            "updated_at": "2025-01-18T10:00:00Z",
        },
        "in_progress": {
            "id": 1,
            "title": "Implement Feature X",
            "description": "Add feature X with acceptance criteria",
            "status": "in_progress",
            "position": 0,
            "created_at": "2025-01-18T10:00:00Z",
            "updated_at": "2025-01-18T11:00:00Z",
        },
        "in_review": {
            "id": 1,
            "title": "Implement Feature X",
            "description": "Add feature X with acceptance criteria",
            "status": "in_review",
            "position": 0,
            "created_at": "2025-01-18T10:00:00Z",
            "updated_at": "2025-01-18T12:00:00Z",
        },
        "done": {
            "id": 1,
            "title": "Implement Feature X",
            "description": "Add feature X with acceptance criteria",
            "status": "done",
            "position": 0,
            "created_at": "2025-01-18T10:00:00Z",
            "updated_at": "2025-01-18T13:00:00Z",
        },
    }

    with patch.object(vibe_manager.client, "post", new=AsyncMock()) as mock_post, \
         patch.object(vibe_manager.client, "patch", new=AsyncMock()) as mock_patch:

        # Setup mock returns
        mock_post.return_value = Mock(
            json=Mock(return_value=responses["todo"]),
            raise_for_status=Mock(),
        )

        def patch_return_value(*args, **kwargs):
            # Check what status is being set
            payload = kwargs.get("json", {})
            status = payload.get("status", "todo")
            return Mock(
                json=Mock(return_value=responses.get(status, responses["todo"])),
                raise_for_status=Mock(),
            )

        mock_patch.return_value = Mock(
            json=Mock(side_effect=patch_return_value),
            raise_for_status=Mock(),
        )

        # Step 1: Create card in backlog
        print("\n1. Creating card in backlog...")
        card = await vibe_manager.create_card(
            title="Implement Feature X",
            description="Add feature X with acceptance criteria",
            column=vibe_manager.Column.BACKLOG,
        )
        assert card.column == vibe_manager.Column.BACKLOG
        print(f"   ✅ Card created: {card.title} in {card.column}")

        # Step 2: Move to doing (start work)
        print("\n2. Moving card to doing...")
        card = await vibe_manager.move_card(card.id, vibe_manager.Column.DOING)
        assert card.column == vibe_manager.Column.DOING
        assert card.status == vibe_manager.CardStatus.IN_PROGRESS
        print(f"   ✅ Card moved to: {card.column} ({card.status})")

        # Step 3: Add progress comment
        print("\n3. Adding progress comment...")
        mock_post.return_value = Mock(
            json=Mock(return_value={
                "id": 1,
                "body": "Progress update",
            }),
            raise_for_status=Mock(),
        )
        await vibe_manager.add_comment(
            card.id,
            "Implemented core logic, now testing",
        )
        print("   ✅ Comment added")

        # Step 4: Move to review
        print("\n4. Moving card to review...")
        card = await vibe_manager.move_card(card.id, vibe_manager.Column.IN_REVIEW)
        assert card.column == vibe_manager.Column.IN_REVIEW
        assert card.status == vibe_manager.CardStatus.IN_REVIEW
        print(f"   ✅ Card moved to: {card.column} ({card.status})")

        # Step 5: Complete and move to done
        print("\n5. Moving card to done...")
        card = await vibe_manager.move_card(card.id, vibe_manager.Column.DONE)
        assert card.column == vibe_manager.Column.DONE
        assert card.status == vibe_manager.CardStatus.DONE
        print(f"   ✅ Card moved to: {card.column} ({card.status})")

        print("\n✅ Full workflow demonstration complete!")


# =============================================================================
# Run Tests
# =============================================================================


if __name__ == "__main__":
    print("Vibe Kanban Integration Tests")
    print("=" * 50)

    # Run the full workflow demonstration
    print("\nRunning full workflow demonstration...\n")
    pytest.main([__file__, "-v", "-s", "-k", "test_full_card_workflow"])
