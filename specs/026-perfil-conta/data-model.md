# Data Model: Perfil da conta

Sem mudança de schema.

- **profiles.display_name** `text unique`, check `^[A-Za-z0-9_]{3,20}$`. O cliente remove espaços das pontas e valida com a mesma regex antes de enviar.
- **user_settings.settings** `jsonb`: mesmo objeto de `kd:v1:settings` (`keyBindings`, `reduceEffects`).
- **Exclusão**: `delete_my_account()` apaga `auth.users`; `profiles` e dependentes saem por `on delete cascade` (KD-32).
