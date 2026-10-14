# Kwoka Admin

Operations console for Kwoka Fitness support and platform control. It manages characteristics shared by the **landing site** and **mobile app**: users, catalog, bookings, workouts, content, messaging, and feature flags.

## Run locally

```bash
cd admin
bun install
bun run dev
```

The app starts at [http://localhost:8081](http://localhost:8081).

Demo login: `admin@kwoka.fit` / `admin123`

Switch language with EN / ES in the header.

## AWS mocks

AWS is not wired yet. All APIs go through `src/lib/api.ts` with a localStorage mock database (`src/lib/seed.ts`). Set `VITE_USE_MOCKS=false` and `VITE_API_URL` when API Gateway is live — the same method names map to REST routes.

See `.env.example` and `../docs/aws-test-environment.md`.
