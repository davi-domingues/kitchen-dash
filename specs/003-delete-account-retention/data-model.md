# Data model: Exclusão de conta e retenção

## Existing entities affected

### Account

- **Identity**: `auth.users.id`.
- **Deletion rule**: only the authenticated owner may request deletion.
- **Relationships**: removal cascades to `profiles`; the existing dependent game-data relations cascade from that profile.

### Score history

- **Identity**: `scores.id`, with a unique `match_id`.
- **Retention boundary**: rows with `created_at < now() - interval '90 days'` are expired.
- **Performance support**: the existing `(created_at)` index supports the expiration predicate.

### Durable progression

- **Entities**: `best_scores` and `player_stats`.
- **Retention rule**: score-history cleanup does not delete or update these rows.
- **Account-deletion rule**: they are removed with their owner through the existing cascade.

### Retention schedule

- **Identity**: job name `delete_expired_scores`.
- **Schedule**: daily at `03:00 UTC`.
- **Action**: remove expired rows from score history.
