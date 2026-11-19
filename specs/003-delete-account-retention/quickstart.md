# Quickstart: Exclusão de conta e retenção

## Prerequisites

- Docker Desktop is running.
- Project dependencies are installed with `npm ci`.

## Validate locally

1. Start the local stack with `npm run db:start`.
2. Rebuild the database from migrations with `npm run db:reset`.
3. Run pgTAP tests with `npm run db:test`.
4. Run the Supabase database lint at warning level.

## Expected outcomes

- The account-deletion RPC is available only to authenticated callers.
- Calling the RPC removes a fictitious account and all of its game data.
- An unauthenticated call is rejected without data changes.
- The daily job `delete_expired_scores` is scheduled for 03:00 UTC.
- A score older than 90 days is removed while a score at the 90-day boundary and durable progression remain.
