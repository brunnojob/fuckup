# Repository Insights

Analysis of public GitHub repositories, including languages, contributors, commits, issue duration, and observable structural criteria.

## Run

Requirements: React, TypeScript, Vercel Functions, and Supabase.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

## Behavior

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Reports are stored in `bd_runs` under the authenticated account. Queries inspect up to 100 records per collection and are subject to GitHub's public rate limits. Root-level criteria do not establish the quality of all source code; the application does not promise follower or star increases.

## Result synchronization

The [operations archive](https://vercel-home-telemetry-api.vercel.app/laboratory.html?project=fuckup) stores execution results. Supabase migrations are in the [API repository](https://github.com/brunnojob/vercel-home-telemetry-api/tree/main/supabase/migrations).

```sh
python cloud/sync.py enqueue result.json --project fuckup
python cloud/sync.py sync
```

Set `BRUNNODEV_ACCESS_TOKEN` to your session token. The SQLite outbox retains reports until the server confirms persistence; identical content does not create duplicate records. Tokens are not stored in source code. To run the synchronization tests:

```sh
python -m unittest discover -s cloud
```
