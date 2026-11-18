# Data model — KD-38

- `user_cosmetics (user_id, cosmetic_id, unlocked_at)` — sem mudança; só RPC escreve.
- `profiles.equipped jsonb` — `{ "hat"?: id, "apron"?: id, "theme"?: id }`; agora só por `set_equipped`.
- Local `kd:v1:cosmetics` (KD-23) — sem mudança de formato.
