# Tasks: Exclusão de conta e retenção

**Input**: Design documents from `/specs/003-delete-account-retention/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/delete_my_account.md

**Tests**: pgTAP tests are required by the issue and must be written before the migration implementation.

## Phase 1: Setup

- [X] T001 Create the pgTAP test scaffold in `supabase/tests/delete_my_account_test.sql`

## Phase 2: Foundational

- [X] T002 Define permissions and error expectations for `delete_my_account` in `supabase/tests/delete_my_account_test.sql`

## Phase 3: User Story 1 - Excluir a própria conta (Priority: P1) 🎯 MVP

**Goal**: An authenticated player can completely erase only their own account and game data.

**Independent Test**: A fictitious user invoking the RPC no longer exists in authentication, profile, settings, scores, best scores, statistics, or cosmetics; unauthenticated and anonymous callers cannot perform the action.

- [X] T003 [US1] Write account-deletion and authorization assertions in `supabase/tests/delete_my_account_test.sql`
- [X] T004 [US1] Implement `delete_my_account` with owner validation, fixed search path, restricted execute grants, and identity deletion in `supabase/migrations/20261119122306_delete_my_account_and_score_retention.sql`

## Phase 4: User Story 2 - Manter apenas histórico recente (Priority: P2)

**Goal**: Expired score history is deleted daily without affecting durable progression.

**Independent Test**: A score older than 90 days is removed, a score at the boundary remains, and a record and statistics row remain unchanged.

- [X] T005 [US2] Write retention-boundary, durable-progression, and job-schedule assertions in `supabase/tests/delete_my_account_test.sql`
- [X] T006 [US2] Enable and schedule the `delete_expired_scores` daily job at 03:00 UTC in `supabase/migrations/20261119122306_delete_my_account_and_score_retention.sql`

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T007 [P] Document the approved schedule and retention behavior in `docs/SYSTEM_DESIGN.md`
- [ ] T008 Run the database reset, pgTAP suite, advisors/lint, and application quality gates from `specs/003-delete-account-retention/quickstart.md`

## Dependencies & Execution Order

- T001 and T002 precede both user stories.
- T003 precedes T004.
- T005 precedes T006.
- T004 and T006 modify the same migration and are completed sequentially.
- T007 and T008 follow implementation.

## Implementation Strategy

1. Establish tests and expected permissions.
2. Implement and validate complete account deletion.
3. Implement and validate score retention.
4. Document the approved schedule and run all gates.
