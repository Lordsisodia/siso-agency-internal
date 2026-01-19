# BlackBox5 Roadmap System - Comprehensive Testing Strategy

**Date:** 2026-01-19
**Status:** Ready for Implementation
**Version:** 1.0

---

## Executive Summary

This document provides a complete testing strategy for the BlackBox5 Roadmap System, covering unit tests, integration tests, end-to-end tests, manual testing, data validation, edge cases, test automation, and success metrics.

**Testing Philosophy:**
- Test early, test often, test automatically
- Focus on critical paths and gate validations
- Mock filesystem for fast unit tests
- Real filesystem for integration tests
- Manual testing for UX validation

**Target Coverage:**
- Unit Tests: 85%+ code coverage
- Integration Tests: All component interactions
- E2E Tests: All major user workflows
- Performance: Sub-second gate validation

---

## 1. Test Plan Overview

### 1.1 Testing Pyramid

```
                    ▲
                   / \                  E2E Tests
                  /   \                 (10 tests)
                 /     \                - Full workflows
                /       \               - User scenarios
               /---------\
              /           \             Integration Tests
             /             \            (50 tests)
            /               \           - Component interactions
           /-----------------\          - Gate validations
          /                   \
         /                     \        Unit Tests
        /                       \       (200+ tests)
       /-------------------------\      - Individual functions
                                        - Data validation
                                        - Edge cases
```

**Breakdown:**
- **Unit Tests (70%)**: Fast, isolated tests of individual components
- **Integration Tests (20%)**: Component interaction tests
- **E2E Tests (10%)**: Full workflow validation

### 1.2 Success Criteria

#### Functional Requirements
- [ ] All 5 gates validate correctly
- [ ] All 12 link types work bidirectionally
- [ ] Stage transitions work for all 8 stages
- [ ] INDEX.yaml synchronization works
- [ ] Dependency tracking prevents circular deps
- [ ] File structure validates correctly

#### Non-Functional Requirements
- [ ] Gate validation completes in < 1 second
- [ ] INDEX.yaml updates complete in < 500ms
- [ ] File operations handle 1000+ improvements
- [ ] Tests complete in < 5 minutes (CI/CD)
- [ ] Memory usage stays within bounds

#### Quality Requirements
- [ ] 85%+ code coverage
- [ ] Zero critical bugs in gate logic
- [ ] All edge cases handled gracefully
- [ ] Clear error messages for failures

---

## 2. Unit Test Specification

### 2.1 Gate Validation Tests (45 tests)

#### Gate 1: Proposed → Research (10 tests)

```python
class TestGate1ProposedToResearch:
    """Test Initial Triage Gate"""

    def test_proposal_has_idea_articulated(self):
        """Validates proposal clearly articulates the idea"""
        # Check: What, Who, Why Now, Proposed Approach
        pass

    def test_category_domain_identified(self):
        """Validates category and domain fields exist"""
        # Check: category in allowed values
        # Check: domain in allowed values
        pass

    def test_priority_assessed(self):
        """Validates priority assigned with justification"""
        # Check: priority field exists
        # Check: priority in allowed values
        # Check: priority_justification exists
        pass

    def test_not_duplicate_existing_work(self):
        """Validates no duplicate in INDEX.yaml"""
        # Check: No matching title (85% similarity)
        # Check: No matching slug
        # Check: No matching description
        pass

    def test_within_blackbox5_scope(self):
        """Validates relates to BlackBox5 improvements"""
        # Check: Not project-specific
        # Check: Improves BlackBox5 system
        pass

    def test_gate_passes_with_all_criteria(self):
        """Gate passes when all criteria met"""
        # Expected: Auto-move to 01-research
        pass

    def test_gate_fails_missing_category(self):
        """Gate fails when category missing"""
        # Expected: Return to submitter with guidance
        pass

    def test_gate_fails_duplicate_detected(self):
        """Gate fails when duplicate found"""
        # Expected: Link to existing, mark as duplicate
        pass

    def test_gate_fails_out_of_scope(self):
        """Gate fails when out of scope"""
        # Expected: Redirect or reject
        pass

    def test_notification_sent_on_pass(self):
        """Notification sent to submitter on pass"""
        # Check: Notification triggered
        pass
```

#### Gate 2: Research → Design (12 tests)

```python
class TestGate2ResearchToDesign:
    """Test Feasibility Confirmation Gate"""

    def test_feasibility_study_completed(self):
        """Validates feasibility.md exists with required sections"""
        # Check: Technical Feasibility section
        # Check: Business Value section
        # Check: Cost Estimate section
        # Check: Conclusion is feasible/feasible_with_conditions
        pass

    def test_technology_options_evaluated(self):
        """Validates 2+ technology options evaluated"""
        # Check: Min 2 options
        # Check: Each has name, pros, cons, suitability
        # Check: Has recommendation
        pass

    def test_risks_identified(self):
        """Validates technical_risks.md exists"""
        # Check: Min 1 risk documented
        # Check: Each has description, impact, probability
        pass

    def test_mitigation_strategies_proposed(self):
        """Validates mitigation_strategies.md exists"""
        # Check: Each risk has mitigation
        pass

    def test_proof_of_concept_completed_when_required(self):
        """Validates POC completed for critical/large efforts"""
        # Condition: estimated_hours > 40 OR priority == 'critical'
        # Check: POC directory exists
        # Check: POC README with approach, results, conclusion
        pass

    def test_proof_of_concept_not_required_for_small_efforts(self):
        """Validates POC skipped for small efforts"""
        # Condition: estimated_hours <= 40 AND priority != 'critical'
        # Expected: No POC required
        pass

    def test_feasibility_confirmed_manually(self):
        """Validates manual feasibility confirmation"""
        # Check: Human approves feasibility
        pass

    def test_gate_fails_incomplete_feasibility(self):
        """Gate fails when feasibility study incomplete"""
        # Expected: Return to research
        pass

    def test_gate_fails_insufficient_tech_options(self):
        """Gate fails when < 2 technology options"""
        # Expected: Evaluate more options
        pass

    def test_gate_fails_missing_mitigation(self):
        """Gate fails when risks lack mitigation"""
        # Expected: Propose mitigations
        pass

    def test_manual_approval_required(self):
        """Validates manual approval from tech_lead/architect"""
        # Check: Approval in YAML
        pass

    def test_notifications_sent_on_decision(self):
        """Notifications sent on pass/fail"""
        # Check: tech_lead, architect notified on pass
        # Check: submitter, tech_lead notified on fail
        pass
```

#### Gate 3: Design → Planned (10 tests)

```python
class TestGate3DesignToPlanned:
    """Test Design Review Gate"""

    def test_technical_design_complete(self):
        """Validates design doc has all required sections"""
        # Check: Overview, System Architecture, Component Design
        # Check: Data Model, Implementation Strategy, Testing Strategy
        pass

    def test_architecture_diagrams_created(self):
        """Validates architecture diagrams exist"""
        # Check: System architecture diagram
        # Check: Component interactions shown
        # Check: Data flow shown
        pass

    def test_api_specifications_complete_when_applicable(self):
        """Validates API specs for API components"""
        # Condition: has_api_components == true
        # Check: Endpoints, request/response schemas, error codes
        pass

    def test_dependencies_documented(self):
        """Validates dependencies.yaml exists and valid"""
        # Check: YAML is valid
        # Check: All dependency IDs exist
        pass

    def test_security_review_completed_when_required(self):
        """Validates threat model for sensitive/critical work"""
        # Condition: handles_user_data OR has_authentication OR priority == 'critical'
        # Check: Threat model exists
        # Check: Security approval from security_lead
        pass

    def test_architecture_approved(self):
        """Validates manual approval from architect"""
        # Check: architect approval in YAML
        pass

    def test_gate_fails_incomplete_design(self):
        """Gate fails when sections missing"""
        # Expected: Return to design
        pass

    def test_gate_fails_missing_architecture_diagrams(self):
        """Gate fails when diagrams missing"""
        # Expected: Create diagrams
        pass

    def test_gate_fails_incomplete_api_specs(self):
        """Gate fails when API specs incomplete"""
        # Expected: Complete API specs
        pass

    def test_notifications_sent_on_decision(self):
        """Notifications sent on pass/fail"""
        pass
```

#### Gate 4: Planned → Active (8 tests)

```python
class TestGate4PlannedToActive:
    """Test Ready to Implement Gate"""

    def test_tasks_created_and_documented(self):
        """Validates task_breakdown.md exists"""
        # Check: Min 1 task
        # Check: All tasks have acceptance criteria
        # Check: All tasks have estimates
        # Check: All tasks linked to improvement
        pass

    def test_dependencies_resolved(self):
        """Validates all blocking dependencies complete"""
        # Check: All blocking deps in '05-completed'
        # Check: Pending deps have estimated dates
        pass

    def test_resources_allocated(self):
        """Validates team assignments for critical tasks"""
        # Check: All critical tasks have assignees
        # Check: All assignees are valid
        pass

    def test_timeline_estimated(self):
        """Validates schedule.md with milestones"""
        # Check: Start date exists
        # Check: Min 1 milestone
        # Check: Completion estimate exists
        pass

    def test_risk_mitigation_plan_in_place(self):
        """Validates mitigation for high/critical risks"""
        # Check: All high risks have mitigation
        # Check: All critical risks have contingency
        pass

    def test_implementation_approved(self):
        """Validates approval from tech_lead and product_owner"""
        # Check: Both approved
        pass

    def test_gate_fails_unresolved_blocking_dependencies(self):
        """Gate fails when blocking deps not complete"""
        # Expected: Resolve blocking dependencies
        pass

    def test_notifications_sent_on_decision(self):
        """Notifications sent on pass/fail"""
        pass
```

#### Gate 5: Active → Completed (10 tests)

```python
class TestGate5ActiveToCompleted:
    """Test Implementation Complete Gate"""

    def test_all_tasks_completed(self):
        """Validates all tasks checked and complete"""
        # Check: All tasks marked complete
        # Check: All acceptance criteria met
        pass

    def test_tests_passing(self):
        """Validates all tests passing"""
        # Check: All tests passing
        # Check: Coverage >= 80%
        # Check: No critical bugs
        pass

    def test_documentation_complete(self):
        """Validates required docs exist"""
        # Check: user_docs.md exists
        # Check: runbook.md exists
        # Check: api_docs.md exists (if has_api)
        pass

    def test_code_review_approved(self):
        """Validates code review approval"""
        # Check: Min 2 reviewers
        # Check: All comments addressed
        # Check: Approval from code_reviewer and tech_lead
        pass

    def test_deployment_successful_when_required(self):
        """Validates deployment when required"""
        # Condition: requires_deployment == true
        # Check: deployment_status is 'success'
        pass

    def test_actual_metrics_recorded(self):
        """Validates actual metrics in effort.yaml"""
        # Check: actual_hours exists
        # Check: completion_date exists
        # Check: quality_score exists
        pass

    def test_gate_fails_failing_tests(self):
        """Gate fails when tests failing"""
        # Expected: Fix failing tests
        pass

    def test_gate_fails_insufficient_coverage(self):
        """Gate fails when coverage < 80%"""
        # Expected: Increase coverage
        pass

    def test_gate_fails_missing_documentation(self):
        """Gate fails when docs missing"""
        # Expected: Complete documentation
        pass

    def test_notifications_sent_on_decision(self):
        """Notifications sent on pass/fail"""
        pass
```

### 2.2 Link Validation Tests (30 tests)

```python
class TestLinkValidation:
    """Test Semantic Linking System"""

    def test_create_hierarchical_link_parent_child(self):
        """Test parent_improvement link creation"""
        # Create A -> B (parent)
        # Validate B has parent_improvement: A
        # Validate A has children: [B]
        pass

    def test_create_dependency_link_depends_on(self):
        """Test depends_on link creation"""
        # Create A depends_on B
        # Validate B blocks A
        pass

    def test_bidirectional_consistency_blocks_blocked_by(self):
        """Test A blocks B → B blocked_by A"""
        # Create A blocks B
        # Validate B blocked_by A
        pass

    def test_bidirectional_consistency_implements_implemented_by(self):
        """Test A implements B → B implemented_by A"""
        pass

    def test_bidirectional_consistency_extends_extended_by(self):
        """Test A extends B → B extended_by A"""
        pass

    def test_prevent_circular_dependencies_direct(self):
        """Test A depends_on B, B depends_on A prevented"""
        # Attempt: A depends_on B, B depends_on A
        # Expected: Error - circular dependency
        pass

    def test_prevent_circular_dependencies_indirect(self):
        """Test A → B → C → A prevented"""
        # Attempt: A → B → C → A
        # Expected: Error - circular dependency
        pass

    def test_prevent_circular_dependencies_complex(self):
        """Test A → B → C → D → B prevented"""
        # Expected: Error - circular dependency
        pass

    def test_allow_circular_concurrent_with(self):
        """Test A concurrent_with B, B concurrent_with A allowed"""
        # This is intentional parallelism, not a dependency cycle
        # Expected: Success
        pass

    def test_validate_link_type_exists(self):
        """Test only valid link types allowed"""
        # Expected: 12 valid types
        pass

    def test_validate_linked_improvement_exists(self):
        """Test linked improvement ID exists in INDEX.yaml"""
        # Attempt: Link to non-existent ID
        # Expected: Error - improvement not found
        pass

    def test_update_link_in_both_directions(self):
        """Test updating link updates both directions"""
        # Create A blocks B
        # Update A blocks C
        # Validate B no longer blocked_by A
        # Validate C blocked_by A
        pass

    def test_delete_link_in_both_directions(self):
        """Test deleting link removes both directions"""
        # Create A blocks B
        # Delete link
        # Validate B no longer blocked_by A
        pass

    def test_multiple_links_same_type(self):
        """Test A depends_on B, C, D (multiple deps)"""
        # Expected: All in list
        pass

    def test_links_in_index_yaml(self):
        """Test links recorded in INDEX.yaml"""
        # Create A blocks B
        # Validate in INDEX.yaml links.blocking
        pass

    def test_relates_to_links(self):
        """Test relates_to associative links"""
        pass

    def test_see_also_links(self):
        """Test see_also external references"""
        pass

    def test_after_before_temporal_links(self):
        """Test temporal ordering links"""
        pass

    def test_concurrent_with_parallel_links(self):
        """Test parallel work links"""
        pass

    def test_conflicts_with_blocking_links(self):
        """Test conflict detection"""
        pass

    def test_implements_type_links(self):
        """Test implements relationship"""
        pass

    def test_refines_type_links(self):
        """Test refines relationship"""
        pass

    def test_replaces_type_links(self):
        """Test replaces relationship"""
        pass

    def test_deprecates_type_links(self):
        """Test deprecates relationship"""
        pass

    def test_parent_prd_epic_links(self):
        """Test parent PRD/epic links"""
        pass

    def test_related_tasks_links(self):
        """Test links to .blackbox5/tasks/"""
        pass
```

### 2.3 YAML Schema Validation Tests (25 tests)

```python
class TestYAMLValidation:
    """Test YAML Frontmatter Validation"""

    def test_valid_proposal_yaml(self):
        """Test valid proposal YAML passes validation"""
        pass

    def test_missing_required_field_id(self):
        """Test missing 'id' field fails"""
        # Expected: Error - required field missing
        pass

    def test_missing_required_field_title(self):
        """Test missing 'title' field fails"""
        pass

    def test_missing_required_field_status(self):
        """Test missing 'status' field fails"""
        pass

    def test_invalid_status_value(self):
        """Test invalid status value fails"""
        # Attempt: status: "invalid"
        # Expected: Error - invalid status
        # Allowed: proposed, research, design, planned, active, completed, cancelled, backlog
        pass

    def test_invalid_category_value(self):
        """Test invalid category value fails"""
        # Allowed: feature, bugfix, refactor, research, infrastructure
        pass

    def test_invalid_domain_value(self):
        """Test invalid domain value fails"""
        # Allowed: agents, skills, memory, tools, cli, infrastructure
        pass

    def test_invalid_priority_value(self):
        """Test invalid priority value fails"""
        # Allowed: critical, high, medium, low, backlog
        pass

    def test_invalid_date_format(self):
        """Test invalid date format fails"""
        # Required: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
        pass

    def test_invalid_progress_range(self):
        """Test progress outside 0.0-1.0 fails"""
        # Attempt: progress: 1.5
        # Expected: Error - progress must be 0.0-1.0
        pass

    def test_empty_id_field(self):
        """Test empty id field fails"""
        pass

    def test_empty_title_field(self):
        """Test empty title field fails"""
        pass

    def test_optional_fields_allowed(self):
        """Test optional fields can be omitted"""
        # Optional: estimated_hours, actual_hours, git_branch, etc.
        pass

    def test_list_fields_are_lists(self):
        """Test list fields are actual lists"""
        # Check: tags, depends_on, blocks, etc. are lists
        pass

    def test_metadata_is_dict(self):
        """Test metadata is a dictionary"""
        pass

    def test_review_status_validation(self):
        """Test review_status in allowed values"""
        # Allowed: not-reviewed, in-review, approved, rejected
        pass

    def test_slug_format_validation(self):
        """Test slug is kebab-case"""
        # Required: lowercase, hyphens, max 50 chars
        pass

    def test_id_format_validation(self):
        """Test ID matches pattern {TYPE}-{NUMBER}-{SLUG}"""
        # Pattern: ^[A-Z]+-\d{4}-[a-z0-9-]+$
        pass

    def test_yaml_parse_error_caught(self):
        """Test invalid YAML syntax caught"""
        # Attempt: Invalid YAML
        # Expected: Parse error
        pass

    def test_duplicate_field_error(self):
        """Test duplicate field error caught"""
        pass

    def test_yaml_frontmatter_delimiters(self):
        """Test YAML frontmatter has proper delimiters"""
        # Required: --- at start and end
        pass

    def test_mixed_array_types_error(self):
        """Test mixed types in array error"""
        # depends_on should be list of dicts, not mixed
        pass

    def test_nested_field_validation(self):
        """Test nested object structure validation"""
        # Validate: depends_on[].id, depends_on[].type, etc.
        pass

    def test_field_type_coercion(self):
        """Test type coercion works"""
        # String numbers converted to int/float
        pass
```

### 2.4 File System Tests (40 tests)

```python
class TestFileSystemOperations:
    """Test File System Operations"""

    def test_create_proposal_directory(self):
        """Test creating PROPOSAL-{id}-{slug}/ directory"""
        pass

    def test_create_proposal_main_file(self):
        """Test creating PROPOSAL-{id}-{slug}.md file"""
        pass

    def test_create_triage_subdirectory(self):
        """Test creating triage/ subdirectory"""
        pass

    def test_create_attachments_subdirectory(self):
        """Test creating attachments/ subdirectory"""
        pass

    def test_move_proposal_to_research(self):
        """Test moving PROPOSAL-* to RESEARCH-***"""
        # Validate: Directory renamed
        # Validate: File renamed
        # Validate: YAML updated (status, stage)
        pass

    def test_move_research_to_design(self):
        """Test moving RESEARCH-* to DESIGN-***"""
        pass

    def test_move_design_to_planned(self):
        """Test moving DESIGN-* to PLAN-***"""
        pass

    def test_move_planned_to_active(self):
        """Test moving PLAN-* to ACTIVE-***"""
        pass

    def test_move_active_to_completed(self):
        """Test moving ACTIVE-* to COMPLETED-***"""
        # Validate: Moved to date-based archive
        # Validate: 05-completed/YYYY/MM/
        pass

    def test_move_to_cancelled(self):
        """Test moving any stage to CANCELLED-***"""
        pass

    def test_move_to_backlog(self):
        """Test moving any stage to BACKLOG-***"""
        pass

    def test_file_already_exists_error(self):
        """Test error when target file exists"""
        # Expected: Error - file exists
        pass

    def test_source_file_missing_error(self):
        """Test error when source file missing"""
        # Expected: Error - source not found
        pass

    def test_directory_creation_fails_permission_denied(self):
        """Test permission denied handled gracefully"""
        pass

    def test_file_write_fails_disk_full(self):
        """Test disk full handled gracefully"""
        pass

    def test_create_research_subdirectories(self):
        """Test creating all research subdirectories"""
        # findings/, risks/, sources/
        pass

    def test_create_design_subdirectories(self):
        """Test creating all design subdirectories"""
        # architecture/, specs/, security/, performance/, risks/
        pass

    def test_create_planned_subdirectories(self):
        """Test creating all planned subdirectories"""
        # tasks/, timeline/, resources/, readiness/, risk_management/
        pass

    def test_create_active_subdirectories(self):
        """Test creating all active subdirectories"""
        # 9 subdirectories
        pass

    def test_create_completed_subdirectories(self):
        """Test creating all completed subdirectories"""
        # delivery/, retrospective/, metrics/, demos/, documentation/
        pass

    def test_create_cancelled_subdirectories(self):
        """Test creating all cancelled subdirectories"""
        # reason/, alternatives/, artifacts/, lessons/
        pass

    def test_create_backlog_subdirectories(self):
        """Test creating all backlog subdirectories"""
        # priority/, rough_estimates/, links/
        pass

    def test_read_yaml_frontmatter(self):
        """Test reading YAML from markdown file"""
        pass

    def test_write_yaml_frontmatter(self):
        """Test writing YAML to markdown file"""
        pass

    def test_preserve_markdown_content(self):
        """Test markdown content preserved during YAML update"""
        pass

    def test_delete_improvement_directory(self):
        """Test deleting improvement directory"""
        pass

    def test_copy_improvement_directory(self):
        """Test copying improvement directory"""
        pass

    def test_list_improvements_in_stage(self):
        """Test listing all improvements in a stage"""
        pass

    def test_count_improvements_by_stage(self):
        """Test counting improvements by stage"""
        pass

    def test_find_improvement_by_id(self):
        """Test finding improvement by ID across stages"""
        pass

    def test_find_improvement_by_slug(self):
        """Test finding improvement by slug across stages"""
        pass

    def test_special_characters_in_directory_name(self):
        """Test special characters handled in directory names"""
        pass

    def test_long_directory_names_truncated(self):
        """Test long names are handled (max 255 chars)"""
        pass

    def test_unicode_in_file_names(self):
        """Test unicode characters in file names"""
        pass

    def test_case_sensitive_file_systems(self):
        """Test behavior on case-sensitive file systems"""
        pass

    def test_symlinks_handled_correctly(self):
        """Test symlinks handled correctly"""
        pass

    def test_file_locking_for_concurrent_access(self):
        """Test file locking prevents concurrent write conflicts"""
        pass
```

### 2.5 Content Validation Tests (35 tests)

```python
class TestContentValidation:
    """Test Content Validation"""

    def test_markdown_has_required_sections(self):
        """Test markdown has required sections"""
        # Required: ## Overview, ## Details, ## Next Steps
        pass

    def test_markdown_section_format(self):
        """Test section headers formatted correctly"""
        # Required: ## Title (not #, ###, etc.)
        pass

    def test_markdown_has_non_empty_content(self):
        """Test markdown has content beyond frontmatter"""
        pass

    def test_markdown_code_blocks_valid(self):
        """Test code blocks are properly formatted"""
        pass

    def test_markdown_links_valid(self):
        """Test markdown links are valid"""
        # Check: [text](url) format
        # Check: URLs are valid
        pass

    def test_markdown_image_references_valid(self):
        """Test image references are valid"""
        pass

    def test_task_breakdown_has_acceptance_criteria(self):
        """Test tasks have acceptance criteria"""
        pass

    def test_task_breakdown_has_estimates(self):
        """Test tasks have effort estimates"""
        pass

    def test_feasibility_study_has_conclusion(self):
        """Test feasibility study has clear conclusion"""
        # Allowed: feasible, feasible_with_conditions, not_feasible
        pass

    def test_risk_has_impact_level(self):
        """Test risks have impact (high/medium/low)"""
        pass

    def test_risk_has_probability_level(self):
        """Test risks have probability (high/medium/low)"""
        pass

    def test_technology_option_has_pros_cons(self):
        """Test technology options have pros and cons"""
        pass

    def test_architecture_diagram_references_valid(self):
        """Test diagram file references exist"""
        pass

    def test_api_spec_has_endpoints(self):
        """Test API spec has at least one endpoint"""
        pass

    def test_api_spec_endpoint_has_method(self):
        """Test API endpoint has HTTP method"""
        # Allowed: GET, POST, PUT, DELETE, PATCH
        pass

    def test_api_spec_endpoint_has_path(self):
        """Test API endpoint has path"""
        pass

    def test_api_spec_endpoint_has_request_schema(self):
        """Test API endpoint has request schema"""
        pass

    def test_api_spec_endpoint_has_response_schema(self):
        """Test API endpoint has response schema"""
        pass

    def test_timeline_has_start_date(self):
        """Test timeline has start date"""
        pass

    def test_timeline_has_milestones(self):
        """Test timeline has at least one milestone"""
        pass

    def test_milestone_has_date(self):
        """Test milestone has target date"""
        pass

    def test_milestone_has_description(self):
        """Test milestone has description"""
        pass

    def test_retrospective_has_lessons_learned(self):
        """Test retrospective has lessons learned"""
        pass

    def test_retrospective_has_what_went_well(self):
        """Test retrospective has successes"""
        pass

    def test_retrospective_has_what_could_improve(self):
        """Test retrospective has improvements"""
        pass

    def test_metrics_has_actual_hours(self):
        """Test metrics has actual hours spent"""
        pass

    def test_metrics_has_quality_score(self):
        """Test metrics has quality score"""
        pass

    def test_cancellation_reason_specified(self):
        """Test cancelled improvements have reason"""
        pass

    def test_backlog_priority_score_exists(self):
        """Test backlog items have priority score"""
        pass

    def test_git_branch_format_valid(self):
        """Test git branch name is valid"""
        # Pattern: feature/PROPOSAL-001-async-execution
        pass

    def test_git_pr_format_valid(self):
        """Test git PR reference is valid"""
        # Pattern: #123
        pass

    def test_tags_are_lowercase(self):
        """Test tags are lowercase"""
        pass

    def test_tags_use_hyphens_not_spaces(self):
        """Test tags use hyphens, not spaces"""
        pass
```

### 2.6 INDEX.yaml Tests (25 tests)

```python
class TestIndexYaml:
    """Test INDEX.yaml Management"""

    def test_index_yaml_created_on_init(self):
        """Test INDEX.yaml created when roadmap initialized"""
        pass

    def test_index_yaml_has_system_metadata(self):
        """Test INDEX.yaml has system section"""
        # Required: version, name, updated
        pass

    def test_index_yaml_has_improvements_section(self):
        """Test INDEX.yaml has improvements section"""
        # Required: proposed, research, design, planned, active, completed, cancelled, backlog
        pass

    def test_index_yaml_has_status_summary(self):
        """Test INDEX.yaml has status section"""
        # Required: total, by_stage, by_priority, by_domain
        pass

    def test_index_yaml_has_dependencies_section(self):
        """Test INDEX.yaml has dependencies section"""
        # Required: blocking, blocked
        pass

    def test_add_improvement_to_index(self):
        """Test adding improvement to INDEX.yaml"""
        pass

    def test_remove_improvement_from_index(self):
        """Test removing improvement from INDEX.yaml"""
        pass

    def test_update_improvement_in_index(self):
        """Test updating improvement in INDEX.yaml"""
        pass

    def test_move_improvement_between_stages_in_index(self):
        """Test moving improvement updates INDEX.yaml"""
        pass

    def test_index_yaml_total_count_accurate(self):
        """Test total count matches actual improvements"""
        pass

    def test_index_yaml_by_stage_counts_accurate(self):
        """Test by_stage counts match actual"""
        pass

    def test_index_yaml_by_priority_counts_accurate(self):
        """Test by_priority counts match actual"""
        pass

    def test_index_yaml_by_domain_counts_accurate(self):
        """Test by_domain counts match actual"""
        pass

    def test_index_yaml_updated_timestamp_auto_updated(self):
        """Test updated timestamp auto-updates on change"""
        pass

    def test_index_yaml_dependencies_section_updated(self):
        """Test dependencies section updated on link change"""
        pass

    def test_index_yaml_atomic_write(self):
        """Test INDEX.yaml written atomically"""
        # Prevent corruption on crash
        pass

    def test_index_yaml_backup_created(self):
        """Test backup created before update"""
        # INDEX.yaml.backup
        pass

    def test_index_yaml_recover_from_backup(self):
        """Test recovery from backup if corruption detected"""
        pass

    def test_index_yaml_parse_error_caught(self):
        """Test parse error caught and reported"""
        pass

    def test_index_yaml_lock_for_concurrent_access(self):
        """Test file lock prevents concurrent writes"""
        pass

    def test_index_yaml_search_by_id(self):
        """Test searching INDEX.yaml by ID"""
        pass

    def test_index_yaml_search_by_title(self):
        """Test searching INDEX.yaml by title"""
        pass

    def test_index_yaml_filter_by_stage(self):
        """Test filtering INDEX.yaml by stage"""
        pass

    def test_index_yaml_filter_by_priority(self):
        """Test filtering INDEX.yaml by priority"""
        pass

    def test_index_yaml_filter_by_domain(self):
        """Test filtering INDEX.yaml by domain"""
        pass
```

---

## 3. Integration Test Specification

### 3.1 Stage Transition Tests (20 tests)

```python
class TestStageTransitions:
    """Test Complete Stage Transitions"""

    def test_full_lifecycle_proposed_to_completed(self):
        """Test: Proposed → Research → Design → Planned → Active → Completed"""
        # Create proposal in 00-proposed
        # Pass Gate 1 → Move to 01-research
        # Pass Gate 2 → Move to 02-design
        # Pass Gate 3 → Move to 03-planned
        # Pass Gate 4 → Move to 04-active
        # Pass Gate 5 → Move to 05-completed
        # Validate: All stages visited, all gates passed
        pass

    def test_proposed_to_cancelled(self):
        """Test: Proposed → Cancelled"""
        # Create proposal
        # Fail Gate 1 or manually cancel
        # Move to 06-cancelled
        # Validate: Reason documented
        pass

    def test_research_to_cancelled(self):
        """Test: Research → Cancelled (infeasible)"""
        # Complete research
        # Find not feasible
        # Move to 06-cancelled
        # Validate: Feasibility study shows not_feasible
        pass

    def test_design_to_cancelled(self):
        """Test: Design → Cancelled (too complex)"""
        # Complete design
        # Find too complex or risky
        # Move to 06-cancelled
        pass

    def test_planned_to_cancelled(self):
        """Test: Planned → Cancelled (deprioritized)"""
        # Complete planning
        # Deprioritize
        # Move to 06-cancelled
        pass

    def test_proposed_to_backlog(self):
        """Test: Proposed → Backlog (good idea, not now)"""
        # Create proposal
        # Move to 07-backlog
        # Validate: Priority score exists
        pass

    def test_backlog_to_proposed(self):
        """Test: Backlog → Proposed (promoted)"""
        # From 07-backlog
        # Promote to 00-proposed
        # Validate: Can proceed through gates
        pass

    def test_research_to_design_with_conditions(self):
        """Test: Research → Design (feasible with conditions)"""
        # Feasibility: feasible_with_conditions
        # Conditions documented
        # Pass to design with conditions noted
        pass

    def test_design_to_planned_security_approval(self):
        """Test: Design → Planned (with security approval)"""
        # Design requires security review
        # Get security_lead approval
        # Pass to planned
        pass

    def test_planned_to_active_with_dependencies(self):
        """Test: Planned → Active (deps resolved)"""
        # Has dependencies
        # All deps completed
        # Pass to active
        pass

    def test_planned_blocked_by_unresolved_dependencies(self):
        """Test: Planned blocked by unresolved dependencies"""
        # Has blocking dependencies
        # Deps not complete
        # Gate 4 fails
        pass

    def test_active_to_completed_with_deployment(self):
        """Test: Active → Completed (with deployment)"""
        # Requires deployment
        # Deploy successfully
        # Move to completed
        pass

    def test_active_to_completed_without_deployment(self):
        """Test: Active → Completed (no deployment needed)"""
        # No deployment required
        # Tests pass, docs complete
        # Move to completed
        pass

    def test_return_to_research_from_design(self):
        """Test: Design → Research (more info needed)"""
        # In design phase
        # Need more research
        # Return to 01-research
        # Validate: Can re-enter design later
        pass

    def test_return_to_design_from_planned(self):
        """Test: Planned → Design (design incomplete)"""
        # In planning phase
        # Design incomplete
        # Return to 02-design
        pass

    def test_return_to_planned_from_active(self):
        """Test: Active → Planned (planning incomplete)"""
        # In active phase
        # Planning inadequate
        # Return to 03-planned
        pass

    def test_skip_research_stage(self):
        """Test: Proposed → Design (research waived)"""
        # Simple improvement
        # Research waived
        # Pass directly to design
        pass

    def test_skip_design_stage(self):
        """Test: Research → Planned (design waived)"""
        # Straightforward implementation
        # Design waived
        # Pass directly to planned
        pass

    def test_concurrent_improvements(self):
        """Test: Multiple improvements in parallel"""
        # A and B both in active
        # A concurrent_with B
        # Both can proceed
        pass

    def test_sequential_improvements_with_blocking(self):
        """Test: A must complete before B starts"""
        # B depends_on A
        # A completes
        # B unblocks
        pass
```

### 3.2 Link Management Tests (15 tests)

```python
class TestLinkManagement:
    """Test Link Management Integration"""

    def test_create_bidirectional_link(self):
        """Test creating link updates both directions"""
        # A blocks B
        # Validate: B blocked_by A
        pass

    def test_update_bidirectional_link(self):
        """Test updating link updates both directions"""
        # A blocks B
        # Change to A blocks C
        # Validate: B no longer blocked_by A
        # Validate: C blocked_by A
        pass

    def test_delete_bidirectional_link(self):
        """Test deleting link removes both directions"""
        # A blocks B
        # Delete link
        # Validate: B no longer blocked_by A
        pass

    def test_link_creates_index_entry(self):
        """Test link creates INDEX.yaml entry"""
        # A blocks B
        # Validate: INDEX.yaml dependencies.blocking has entry
        pass

    def test_link_deletion_removes_index_entry(self):
        """Test link deletion removes INDEX.yaml entry"""
        # A blocks B
        # Delete link
        # Validate: INDEX.yaml entry removed
        pass

    def test_multiple_links_from_same_source(self):
        """Test A blocks B, C, D"""
        # Validate: All in blocks list
        # Validate: All in INDEX.yaml
        pass

    def test_multiple_links_to_same_target(self):
        """Test A, B, C all block D"""
        # Validate: D blocked_by A, B, C
        pass

    def test_dependency_chain(self):
        """Test A → B → C → D"""
        # Create chain
        # Validate: All links exist
        # Validate: INDEX.yaml has all
        pass

    def test_complex_dependency_graph(self):
        """Test: A blocks B, C; B blocks D; C blocks D"""
        #      A
        #     / \
        #    B   C
        #     \ /
        #      D
        # Validate: All links correct
        pass

    def test_relates_to_does_not_affect_gates(self):
        """Test relates_to links don't block gates"""
        # A relates_to B
        # A can proceed even if B not complete
        pass

    def test_blocks_prevents_gate_pass(self):
        """Test blocks link prevents gate"""
        # A blocks B
        # B tries to pass gate
        # Expected: B blocked
        pass

    def test_depends_on_prevents_gate_pass(self):
        """Test depends_on prevents gate"""
        # A depends_on B
        # B not complete
        # Expected: A blocked
        pass

    def test_auto_unblock_on_dependency_completion(self):
        """Test auto-unblock when dependency completes"""
        # A depends_on B
        # B completes
        # Expected: A auto-unblocks
        pass

    def test_notification_on_block(self):
        """Test notification sent when blocked"""
        # A blocks B
        # Expected: B notified
        pass

    def test_notification_on_unblock(self):
        """Test notification sent when unblocked"""
        # A blocks B
        # A completes
        # Expected: B notified (unblocked)
        pass

    def test_link_persistence_across_moves(self):
        """Test links persist when improvements move"""
        # A blocks B (both in 03-planned)
        # Move A to 04-active
        # Validate: Link still exists
        pass
```

### 3.3 Dependency Resolution Tests (10 tests)

```python
class TestDependencyResolution:
    """Test Dependency Resolution"""

    def test_resolve_blocking_dependencies(self):
        """Test all blocking dependencies resolved"""
        # A depends_on B (blocking)
        # B completes
        # Expected: A unblocked
        pass

    def test_optional_dependencies_ignore(self):
        """Test optional dependencies don't block"""
        # A recommends B (optional)
        # B not complete
        # Expected: A can proceed
        pass

    def test_partial_blocking_some_resolved(self):
        """Test partial blocking (some resolved, some not)"""
        # A depends_on B, C (both blocking)
        # B completes, C not complete
        # Expected: A still blocked
        pass

    def test_transitive_blocking(self):
        """Test transitive blocking (A → B → C)"""
        # C blocks B, B blocks A
        # Expected: A blocked by C (transitive)
        pass

    def test_circular_dependency_detection(self):
        """Test circular dependency detected and prevented"""
        # Attempt: A depends_on B, B depends_on A
        # Expected: Error - circular dependency
        pass

    def test_complex_circular_dependency_detection(self):
        """Test complex circular dependency detected"""
        # Attempt: A → B → C → A
        # Expected: Error - circular dependency
        pass

    def test_dependency_resolution_order(self):
        """Test dependencies resolved in correct order"""
        # C depends_on B, B depends_on A
        # All in 03-planned
        # Expected: Can only activate A, then B, then C
        pass

    def test_cross_stage_dependencies(self):
        """Test dependencies across stages"""
        # A in 04-active depends_on B in 03-planned
        # Expected: A blocked
        pass

    def test_dependency_completion_unblocks_all(self):
        """Test completing dependency unblocks all dependents"""
        # B blocks A, C, D
        # B completes
        # Expected: A, C, D all unblocked
        pass

    def test_dependency_graph_visualization(self):
        """Test dependency graph can be visualized"""
        # Create complex graph
        # Generate visualization
        # Expected: Valid graph output
        pass
```

### 3.4 Notification System Tests (5 tests)

```python
class TestNotificationSystem:
    """Test Notification System"""

    def test_notification_on_gate_pass(self):
        """Test notification sent when gate passes"""
        # Pass Gate 1
        # Expected: Submitter notified
        pass

    def test_notification_on_gate_fail(self):
        """Test notification sent when gate fails"""
        # Fail Gate 2
        # Expected: Submitter, tech_lead notified
        pass

    def test_notification_on_block(self):
        """Test notification sent when blocked"""
        # A blocks B
        # Expected: B notified
        pass

    def test_notification_on_unblock(self):
        """Test notification sent when unblocked"""
        # A completes, unblocking B
        # Expected: B notified
        pass

    def test_notification_on_stage_transition(self):
        """Test notification on stage transition"""
        # Move to 04-active
        # Expected: Team notified
        pass
```

---

## 4. End-to-End Test Scenarios

### 4.1 Complete Workflow Tests (10 scenarios)

#### Scenario 1: Happy Path - Simple Feature
```python
def test_e2e_simple_feature():
    """
    Complete lifecycle for a simple feature improvement

    Steps:
    1. Create proposal in 00-proposed
    2. Pass Gate 1 (Initial Triage)
    3. Move to 01-research
    4. Conduct research (skip POC - small effort)
    5. Pass Gate 2 (Feasibility)
    6. Move to 02-design
    7. Create design (skip security review - no user data)
    8. Pass Gate 3 (Design Review)
    9. Move to 03-planned
    10. Create task breakdown
    11. Pass Gate 4 (Ready to Implement)
    12. Move to 04-active
    13. Implement feature
    14. Pass tests
    15. Pass Gate 5 (Implementation Complete)
    16. Move to 05-completed/2026/01-january/
    17. Create retrospective

    Expected:
    - All gates passed
    - All files created
    - INDEX.yaml updated at each step
    - No errors
    """
    pass
```

#### Scenario 2: Complex Feature with Dependencies
```python
def test_e2e_complex_feature_with_dependencies():
    """
    Complex feature with dependencies and security review

    Steps:
    1. Create PROPOSAL-001 (Base feature)
    2. Take PROPOSAL-001 through to completion
    3. Create PROPOSAL-002 (Depends on PROPOSAL-001)
    4. PROPOSAL-002 should be blocked until 001 completes
    5. Complete PROPOSAL-001
    6. Verify PROPOSAL-002 auto-unblocks
    7. Take PROPOSAL-002 through to completion

    Expected:
    - Dependency enforced
    - Unblock notification sent
    - Both features complete successfully
    """
    pass
```

#### Scenario 3: Cancelled Due to Infeasibility
```python
def test_e2e_cancelled_infeasible():
    """
    Research shows infeasible, move to cancelled

    Steps:
    1. Create proposal
    2. Move to research
    3. Conduct research
    4. Find not feasible
    5. Move to 06-cancelled
    6. Document reason and alternatives

    Expected:
    - Properly cancelled
    - Reason documented
    - Lessons learned captured
    - INDEX.yaml updated
    """
    pass
```

#### Scenario 4: Backlog and Promote
```python
def test_e2e_backlog_promote():
    """
    Move to backlog, then promote later

    Steps:
    1. Create proposal
    2. Move to 07-backlog (good idea, not now)
    3. Document priority score and rationale
    4. Later, promote back to 00-proposed
    5. Proceed through gates

    Expected:
    - Backlog item created
    - Priority score exists
    - Promotion works
    - Continues through lifecycle
    """
    pass
```

#### Scenario 5: Return to Previous Stage
```python
def test_e2e_return_to_previous_stage():
    """
    Need more info, return to research from design

    Steps:
    1. Create proposal
    2. Move through research to design
    3. In design, realize need more research
    4. Return to 01-research
    5. Complete additional research
    6. Return to 02-design
    7. Continue to completion

    Expected:
    - Can return to previous stage
    - No duplicate IDs
    - Progress preserved
    - Can move forward again
    """
    pass
```

#### Scenario 6: Parallel Work with Concurrent Links
```python
def test_e2e_parallel_work():
    """
    Two improvements can proceed in parallel

    Steps:
    1. Create PROPOSAL-001 and PROPOSAL-002
    2. Link: 001 concurrent_with 002
    3. Move both to active
    4. Work on both simultaneously

    Expected:
    - Both can proceed
    - No blocking between them
    - Both complete successfully
    """
    pass
```

#### Scenario 7: Security Review Required
```python
def test_e2e_security_review():
    """
    Feature requires security review

    Steps:
    1. Create proposal (handles user data)
    2. Move through to design
    3. Create threat model
    4. Request security_lead approval
    5. Get approval
    6. Pass Gate 3
    7. Continue to completion

    Expected:
    - Threat model created
    - Security approval obtained
    - Gate passes with approval
    """
    pass
```

#### Scenario 8: Large Effort Requires POC
```python
def test_e2e_large_effort_with_poc():
    """
    Large effort requires proof of concept

    Steps:
    1. Create proposal (estimated 60 hours)
    2. Move to research
    3. Create POC
    4. Validate POC successful
    5. Pass Gate 2
    6. Continue to completion

    Expected:
    - POC created
    - POC results documented
    - Gate requires POC
    - Gate passes with POC
    """
    pass
```

#### Scenario 9: Deployment Required
```python
def test_e2e_with_deployment():
    """
    Feature requires deployment

    Steps:
    1. Take feature through to active
    2. Complete implementation
    3. Deploy
    4. Record deployment success
    5. Pass Gate 5
    6. Move to completed

    Expected:
    - Deployment documented
    - Deployment status is 'success'
    - Gate requires deployment
    - Gate passes with deployment
    """
    pass
```

#### Scenario 10: Multiple Related Improvements
```python
def test_e2e_related_improvements():
    """
    Epic with multiple related improvements

    Steps:
    1. Create EPIC-001 (parent improvement)
    2. Create PROPOSAL-001, 002, 003 (children)
    3. Link all to EPIC-001
    4. Complete all children
    5. Complete epic

    Expected:
    - Parent-child links work
    - All children track parent
    - Epic tracks children
    - All complete successfully
    """
    pass
```

### 4.2 Edge Case Scenarios (10 scenarios)

#### Scenario 11: Circular Dependency Attempt
```python
def test_e2e_circular_dependency_attempt():
    """
    Attempt to create circular dependency

    Steps:
    1. Create PROPOSAL-001, 002, 003
    2. Attempt: 001 depends_on 002
    3. Attempt: 002 depends_on 003
    4. Attempt: 003 depends_on 001
    5. Expected: Error on step 4

    Expected:
    - Error detected
    - Clear error message
    - No circular dependency created
    """
    pass
```

#### Scenario 12: Concurrent Modification
```python
def test_e2e_concurrent_modification():
    """
    Two users modify same improvement simultaneously

    Steps:
    1. User A opens PROPOSAL-001
    2. User B opens PROPOSAL-001
    3. User A saves changes
    4. User B saves changes
    5. Expected: Conflict detected

    Expected:
    - Conflict detected
    - Both versions preserved
    - Manual resolution required
    """
    pass
```

#### Scenario 13: Missing File Recovery
```python
def test_e2e_missing_file_recovery():
    """
    Required file is missing

    Steps:
    1. Create improvement
    2. Delete required file (e.g., feasibility.md)
    3. Attempt to pass gate
    4. Expected: Gate fails

    Expected:
    - Gate fails
    - Clear error message
    - Instructions to fix
    """
    pass
```

#### Scenario 14: Invalid YAML Recovery
```python
def test_e2e_invalid_yaml_recovery():
    """
    YAML frontmatter is corrupted

    Steps:
    1. Create improvement
    2. Corrupt YAML (manual edit)
    3. Attempt to load
    4. Expected: Parse error

    Expected:
    - Parse error caught
    - Clear error message
    - Line number of error
    - Backup available
    """
    pass
```

#### Scenario 15: Special Characters in Names
```python
def test_e2e_special_characters():
    """
    Improvement title has special characters

    Steps:
    1. Create proposal with title: "Fix: Bug's @#$% issue!"
    2. Slug should be: "fix-bugs-issue"
    3. All operations work

    Expected:
    - Special chars handled
    - Slug is clean
    - All operations work
    """
    pass
```

#### Scenario 16: Very Long Title
```python
def test_e2e_very_long_title():
    """
    Title exceeds maximum length

    Steps:
    1. Create proposal with 200-char title
    2. Expected: Truncation or error

    Expected:
    - Title truncated (50 chars for slug)
    - Full title preserved in YAML
    - All operations work
    """
    pass
```

#### Scenario 17: Rapid Stage Transitions
```python
def test_e2e_rapid_transitions():
    """
    Move through stages rapidly

    Steps:
    1. Create proposal
    2. Quickly move: proposed → research → design → planned
    3. All within 1 minute
    4. Expected: All updates work

    Expected:
    - All transitions work
    - INDEX.yaml updated correctly
    - No race conditions
    """
    pass
```

#### Scenario 18: Large Number of Improvements
```python
def test_e2e_many_improvements():
    """
    System with 100+ improvements

    Steps:
    1. Create 100 improvements
    2. Distribute across stages
    3. Create various links
    4. Run operations

    Expected:
    - All operations complete
    - Performance acceptable
    - No corruption
    """
    pass
```

#### Scenario 19: Unicode in Content
```python
def test_e2e_unicode_content():
    """
    Content has unicode characters

    Steps:
    1. Create proposal with emojis, unicode
    2. Title: "Feature: Add 🚀 support"
    3. Content has Chinese, Arabic, etc.
    4. Expected: All work

    Expected:
    - Unicode handled
    - No encoding errors
    - All operations work
    """
    pass
```

#### Scenario 20: Disk Full Scenario
```python
def test_e2e_disk_full():
    """
    Disk full during operation

    Steps:
    1. Fill disk (simulate)
    2. Attempt to create improvement
    3. Expected: Graceful error

    Expected:
    - Error caught
    - No corruption
    - Clear error message
    - Can retry when space available
    """
    pass
```

---

## 5. Test Data Strategy

### 5.1 Test Data Generation

#### Small Dataset (10 improvements)
```yaml
# test_data_small.yaml
improvements:
  - id: "PROPOSAL-001"
    title: "Async Agent Execution"
    category: "feature"
    domain: "agents"
    priority: "high"
    stage: "00-proposed"
    complexity: "medium"

  - id: "PROPOSAL-002"
    title: "ChromaDB Performance"
    category: "feature"
    domain: "memory"
    priority: "medium"
    stage: "01-research"
    complexity: "low"

  # ... 8 more improvements
```

#### Medium Dataset (50 improvements)
```yaml
# test_data_medium.yaml
# Distribution:
# - 10 proposed
# - 5 research
# - 8 design
# - 10 planned
# - 7 active
# - 5 completed
# - 3 cancelled
# - 2 backlog
```

#### Large Dataset (100 improvements)
```yaml
# test_data_large.yaml
# Distribution:
# - 20 proposed
# - 10 research
# - 15 design
# - 20 planned
# - 15 active
# - 10 completed
# - 5 cancelled
# - 5 backlog
```

### 5.2 Edge Case Data

```yaml
# test_data_edge_cases.yaml
edge_cases:
  - title: "Empty Title"
    title: ""
    expected: "error"

  - title: "Very Long Title"
    title: "A" * 200
    expected: "truncate"

  - title: "Special Characters"
    title: "Fix: Bug's @#$% issue!"
    expected: "success"

  - title: "Unicode Characters"
    title: "Feature: Add 🚀 support for 中文"
    expected: "success"

  - title: "All Stages"
    test: "create_improvement_in_each_stage"

  - title: "All Categories"
    test: "create_improvement_for_each_category"

  - title: "All Domains"
    test: "create_improvement_for_each_domain"

  - title: "All Priorities"
    test: "create_improvement_for_each_priority"
```

### 5.3 Dependency Graph Test Data

```yaml
# test_data_dependencies.yaml
dependency_graphs:
  simple_chain:
    - A depends_on B
    - B depends_on C
    - C depends_on D

  diamond:
    - D depends_on B
    - D depends_on C
    - B depends_on A
    - C depends_on A

  complex:
    - H depends_on D
    - H depends_on E
    - D depends_on B
    - E depends_on B
    - E depends_on C
    - B depends_on A
    - C depends_on A

  circular_attempt:
    - A depends_on B
    - B depends_on C
    - C depends_on A  # Should fail
```

### 5.4 Link Type Test Data

```yaml
# test_data_links.yaml
link_types:
  hierarchical:
    - parent_improvement
    - parent_prd
    - parent_epic
    - children

  dependency:
    - depends_on
    - blocks
    - blocked_by
    - recommends

  associative:
    - relates_to
    - see_also

  temporal:
    - after
    - before
    - concurrent_with
    - conflicts_with

  type:
    - implements
    - extends
    - refines
    - replaces
    - deprecates
```

---

## 6. Test Automation Plan

### 6.1 Framework Choice

**Primary Framework: pytest**
- Already used in project
- Excellent fixtures support
- Powerful parametrization
- Good async support
- Built-in assertion rewriting

**Additional Tools:**
```yaml
testing:
  framework: "pytest>=7.4.0"
  async: "pytest-asyncio>=0.21.0"
  coverage: "pytest-cov>=4.1.0"
  mocking: "pytest-mock>=3.12.0"

  filesystem:
    mocking: "pyfakefs>=5.3.0"  # Mock filesystem for unit tests
    temp: "tempfile>=3.10"       # Real temp dirs for integration tests

  validation:
    yaml: "pyyaml>=6.0.1"
    jsonschema: "jsonschema>=4.20.0"
    markdown: "markdown>=3.5.0"
```

### 6.2 Test Structure

```
.blackbox5/tests/roadmap/
├── __init__.py
├── conftest.py                    # Roadmap-specific fixtures
├── test_units/                    # Unit tests
│   ├── test_gates.py              # Gate validation
│   ├── test_links.py              # Link validation
│   ├── test_yaml_validation.py    # YAML schema
│   ├── test_filesystem.py         # File operations
│   ├── test_content.py            # Content validation
│   └── test_index.py              # INDEX.yaml
├── test_integration/              # Integration tests
│   ├── test_transitions.py        # Stage transitions
│   ├── test_links.py              # Link management
│   ├── test_dependencies.py       # Dependency resolution
│   └── test_notifications.py      # Notifications
├── test_e2e/                      # E2E tests
│   ├── test_workflows.py          # Complete workflows
│   └── test_edge_cases.py         # Edge case scenarios
├── test_performance/              # Performance tests
│   ├── test_gate_speed.py         # Gate validation speed
│   ├── test_index_speed.py        # INDEX.yaml speed
│   └── test_scalability.py        # Large dataset tests
└── fixtures/                      # Test fixtures
    ├── test_data.py               # Test data generators
    ├── fake_improvements.py       # Fake improvement factories
    └── test_filesystem.py         # Filesystem fixtures
```

### 6.3 CI/CD Integration

```yaml
# .github/workflows/test-roadmap.yml
name: Test Roadmap System

on:
  push:
    paths:
      - '.blackbox5/roadmap/**'
      - '.blackbox5/tests/roadmap/**'
  pull_request:
    paths:
      - '.blackbox5/roadmap/**'
      - '.blackbox5/tests/roadmap/**'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -e .[test]
      - run: pytest .blackbox5/tests/roadmap/test_units/ -v --cov=roadmap --cov-report=xml

  integration-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -e .[test]
      - run: pytest .blackbox5/tests/roadmap/test_integration/ -v

  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -e .[test]
      - run: pytest .blackbox5/tests/roadmap/test_e2e/ -v

  performance-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -e .[test]
      - run: pytest .blackbox5/tests/roadmap/test_performance/ -v
```

### 6.4 Test Fixtures

```python
# .blackbox5/tests/roadmap/conftest.py
"""
Roadmap system test fixtures
"""

import pytest
from pathlib import Path
from tempfile import TemporaryDirectory
from datetime import datetime
import yaml

@pytest.fixture
def temp_roadmap_dir():
    """Create a temporary roadmap directory"""
    with TemporaryDirectory(prefix="roadmap_test_") as temp_dir:
        roadmap_dir = Path(temp_dir) / "roadmap"
        roadmap_dir.mkdir(parents=True)

        # Create stage directories
        for stage in [
            "00-proposed", "01-research", "02-design", "03-planned",
            "04-active", "05-completed/2026/01-january",
            "06-cancelled", "07-backlog"
        ]:
            (roadmap_dir / stage).mkdir(parents=True, exist_ok=True)

        # Create templates directory
        (roadmap_dir / "templates").mkdir()

        yield roadmap_dir

@pytest.fixture
def sample_proposal_yaml():
    """Sample valid proposal YAML"""
    return {
        "id": "PROPOSAL-0001",
        "title": "Async Agent Execution",
        "slug": "async-agent-execution",
        "status": "proposed",
        "stage": "00-proposed",
        "created_at": "2026-01-19T10:00:00Z",
        "updated_at": "2026-01-19T10:00:00Z",
        "category": "feature",
        "domain": "agents",
        "priority": "high",
        "depends_on": [],
        "blocks": [],
        "blocked_by": [],
        "relates_to": [],
        "tags": ["agents", "async", "performance"],
        "progress": 0.0,
        "review_status": "not-reviewed"
    }

@pytest.fixture
def fake_improvement_factory(temp_roadmap_dir):
    """Factory to create fake improvements"""
    def create_improvement(
        id: str,
        stage: str,
        title: str = "Test Improvement",
        **kwargs
    ) -> Path:
        """Create a fake improvement file"""
        stage_dir = temp_roadmap_dir / stage
        file_path = stage_dir / f"{id}-{title.lower().replace(' ', '-')}.md"

        yaml_content = {
            "id": id,
            "title": title,
            "slug": title.lower().replace(" ", "-"),
            "status": stage.replace("0", "").replace("-", ""),
            "stage": stage,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            **kwargs
        }

        markdown_content = f"---\n{yaml.dump(yaml_content)}---\n\n# {title}\n\nTest content."
        file_path.write_text(markdown_content)

        return file_path

    return create_improvement

@pytest.fixture
def mock_filesystem():
    """Mock filesystem for unit tests"""
    from pyfakefs import fake_filesystem
    fs = fake_filesystem.FakeFilesystem()
    fake_open = fake_filesystem.FakeFileOpen(fs)
    yield fs, fake_open
```

### 6.5 Test Isolation

**Unit Tests:**
- Use `pyfakefs` for complete filesystem isolation
- No real files created
- Fast execution

**Integration Tests:**
- Use real temporary directories
- Clean up after each test
- Isolate from real roadmap data

**E2E Tests:**
- Use dedicated test roadmap directory
- Use test INDEX.yaml
- Never touch production data

### 6.6 Running Tests

```bash
# Run all roadmap tests
pytest .blackbox5/tests/roadmap/ -v

# Run only unit tests
pytest .blackbox5/tests/roadmap/test_units/ -v

# Run only integration tests
pytest .blackbox5/tests/roadmap/test_integration/ -v

# Run only E2E tests
pytest .blackbox5/tests/roadmap/test_e2e/ -v

# Run with coverage
pytest .blackbox5/tests/roadmap/ --cov=roadmap --cov-report=html

# Run specific test
pytest .blackbox5/tests/roadmap/test_units/test_gates.py::test_proposal_has_idea_articulated -v

# Run parallel (fast)
pytest .blackbox5/tests/roadmap/ -n auto

# Run performance tests
pytest .blackbox5/tests/roadmap/test_performance/ -v
```

---

## 7. Success Metrics

### 7.1 Functional Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Gate Validation Success | 100% | All gates pass when criteria met |
| Link Consistency | 100% | Bidirectional links always consistent |
| INDEX.yaml Accuracy | 100% | Counts match actual files |
| Stage Transitions | 100% | All transitions work correctly |
| Dependency Resolution | 100% | All dependencies resolved correctly |
| Circular Dependency Prevention | 100% | No circular dependencies created |

### 7.2 Quality Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Code Coverage | 85%+ | pytest-cov |
| Test Pass Rate | 100% | All tests pass in CI/CD |
| Critical Bugs | 0 | Zero critical bugs in gate logic |
| Error Message Clarity | 90%+ | Clear, actionable error messages |

### 7.3 Performance Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Gate Validation Speed | < 1s | Time from request to decision |
| INDEX.yaml Update Speed | < 500ms | Time to write and validate |
| File Creation Speed | < 100ms | Time to create improvement file |
| Link Creation Speed | < 200ms | Time to create bidirectional link |
| Large Dataset Operations | < 5s | Operations on 100 improvements |

### 7.4 Usability Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Template Clarity | 90%+ | Users understand what to fill in |
| Workflow Ease | 4/5 stars | User feedback survey |
| Documentation Quality | 90%+ | Users can find answers |
| Error Recovery | 95%+ | Users can recover from errors |

### 7.5 Reliability Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Crash-Free Operations | 100% | No crashes on valid input |
| Data Corruption | 0 | Zero corruption incidents |
| Backup Success | 100% | All backups created successfully |
| Recovery Success | 100% | Can recover from all failures |

---

## 8. Immediate Next Steps

### 8.1 Phase 1: Foundation (Week 1)

**Day 1-2: Test Infrastructure**
```bash
# 1. Create test directory structure
mkdir -p .blackbox5/tests/roadmap/{test_units,test_integration,test_e2e,test_performance,fixtures}

# 2. Create conftest.py with fixtures
# - temp_roadmap_dir
# - sample_proposal_yaml
# - fake_improvement_factory
# - mock_filesystem

# 3. Install test dependencies
pip install pytest pytest-cov pytest-mock pyfakefs
```

**Day 3-4: First Unit Tests**
```python
# Start with critical path:
# 1. test_yaml_validation.py (25 tests)
#    - Focus on schema validation
#    - Test required fields
#    - Test field values
#
# 2. test_gates.py (Gate 1 only, 10 tests)
#    - Test proposed → research gate
#    - Test all criteria
#    - Test pass/fail scenarios
```

**Day 5: First Integration Test**
```python
# test_transitions.py (1 test)
# - Full lifecycle: proposed → completed
# - Validate all stages
# - Validate all gates
# - Validate INDEX.yaml updates
```

### 8.2 Phase 2: Core Coverage (Week 2)

**Week 2 Goals:**
- Complete all unit tests (200+ tests)
- Complete gate validation tests (45 tests)
- Complete link validation tests (30 tests)
- Achieve 85%+ code coverage

**Checklist:**
- [ ] All YAML validation tests passing
- [ ] All gate tests passing
- [ ] All link tests passing
- [ ] All filesystem tests passing
- [ ] All content validation tests passing
- [ ] All INDEX.yaml tests passing
- [ ] Coverage report shows 85%+

### 8.3 Phase 3: Integration & E2E (Week 3)

**Week 3 Goals:**
- Complete all integration tests (50 tests)
- Complete all E2E scenarios (20 tests)
- Test with real data from .blackbox5/

**Checklist:**
- [ ] All stage transition tests passing
- [ ] All link management tests passing
- [ ] All dependency resolution tests passing
- [ ] All notification tests passing
- [ ] All 20 E2E scenarios passing
- [ ] Migrated 5 existing improvements to test

### 8.4 Phase 4: Performance & Edge Cases (Week 4)

**Week 4 Goals:**
- Complete all performance tests
- Complete all edge case tests
- Stress test with large datasets
- Document any issues found

**Checklist:**
- [ ] All performance tests passing
- [ ] All edge case tests passing
- [ ] Tested with 100 improvements
- [ ] Performance benchmarks met
- [ ] All known issues documented

### 8.5 Quick Wins to Validate Design

**Quick Win 1: Create First Improvement (Day 1)**
```bash
# Manual test - create first proposal
python -m roadmap.cli create proposal \
  --title "Async Agent Execution" \
  --category feature \
  --domain agents \
  --priority high

# Expected: PROPOSAL-0001 created in 00-proposed/
# Validate: File exists, YAML valid, INDEX.yaml updated
```

**Quick Win 2: Validate First Gate (Day 2)**
```python
# Automated test - validate gate logic
python -m pytest .blackbox5/tests/roadmap/test_units/test_gates.py::test_proposal_has_idea_articulated -v

# Expected: Test passes
```

**Quick Win 3: Complete Lifecycle (Day 3)**
```python
# E2E test - full lifecycle
python -m pytest .blackbox5/tests/roadmap/test_e2e/test_workflows.py::test_e2e_simple_feature -v

# Expected: Test passes, all stages visited
```

**Quick Win 4: Test Real Data (Day 4)**
```bash
# Migrate existing improvement
python -m roadmap.migrate --source docs/implementation-plan.md

# Expected: Successfully migrated to roadmap system
```

**Quick Win 5: Performance Check (Day 5)**
```python
# Performance test
python -m pytest .blackbox5/tests/roadmap/test_performance/test_gate_speed.py -v

# Expected: Gate validation < 1s
```

---

## 9. Testing Checklist

### 9.1 Before Implementation Starts

- [ ] Test infrastructure set up
- [ ] Fixtures created
- [ ] Test data generators ready
- [ ] CI/CD pipeline configured
- [ ] Coverage reporting enabled

### 9.2 During Implementation

- [ ] Write test before code (TDD)
- [ ] All tests passing
- [ ] Coverage increasing
- [ ] No regressions
- [ ] Performance acceptable

### 9.3 Before Release

- [ ] All 200+ unit tests passing
- [ ] All 50 integration tests passing
- [ ] All 20 E2E scenarios passing
- [ ] 85%+ code coverage
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Known issues documented

### 9.4 After Release

- [ ] Monitor for bugs
- [ ] Track error rates
- [ ] Gather user feedback
- [ ] Update tests for bugs found
- [ ] Continuously improve

---

## 10. Conclusion

This testing strategy provides:

**Comprehensive Coverage:**
- 200+ unit tests
- 50 integration tests
- 20 E2E scenarios
- All edge cases covered

**Practical Automation:**
- pytest-based
- CI/CD integration
- Fast execution
- Clear reporting

**Quality Assurance:**
- 85%+ coverage target
- Performance benchmarks
- Usability metrics
- Reliability targets

**Immediate Action:**
- Clear next steps
- Quick wins identified
- Phased approach
- Success criteria defined

The roadmap system will be thoroughly tested and ready for production use following this strategy.
