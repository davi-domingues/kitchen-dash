# Contract: `delete_my_account`

## Caller

- Role: `authenticated` only.
- Identity source: authenticated session.

## Invocation

```sql
select public.delete_my_account();
```

## Result

- The function returns no application payload.
- On success, the caller's authentication identity and all associated game data no longer exist.

## Errors

| Condition | SQLSTATE | Message |
| --- | --- | --- |
| No authenticated identity | `28000` | `not_authenticated` |

## Authorization

- `anon` and `public` do not receive execute permission.
- The function operates only on the identity matching the caller's authenticated session.
