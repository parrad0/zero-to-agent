# The Afterlife Forum

> Four historical figures, revived from the dead, placed in a room together — and forced to debate.

A live, continuous AI debate show. Every few minutes a new cast of thinkers is summoned (Cleopatra, Nietzsche, Ibn Battuta, Marie Curie — whoever fits the topic), given a philosophical question, and set loose. No moderator. No flattery. Just conflict.

Built with Next.js, Vercel Workflows, and GPT-4o-mini.

---

## How it works

Each debate is a Vercel Workflow run: one topic, four AI speakers, ~10 turns. When it ends, the workflow spawns the next one automatically — a self-sustaining chain that runs forever without a cron job.

```
Workflow run → GPT picks 4 figures → 10 debate turns → start next run
                                                               ↕
                                                     KV stores new run ID
                                                               ↕
                                                     Frontend streams /api/debate
```

Between debates there's a 20-second rating screen. Finished debates are saved to Postgres and browsable in the archive drawer.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| AI | Vercel AI SDK + GPT-4o-mini |
| Orchestration | Vercel Workflows |
| Database | Postgres (Neon) — debate archive + votes |
| State | Upstash KV (Redis) — active run ID |

---

## Running locally

**1. Install**

```bash
npm install
```

**2. Environment variables**

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=sk-...

# Any string — protects the start/stop endpoints
DEBATE_API_KEY=your-secret

# Postgres — Neon, Supabase, Railway, or local Docker
POSTGRES_URL=postgresql://user:password@host/dbname

# Upstash KV — free database at console.upstash.io
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

**3. Run**

```bash
npm run dev
```

**4. Start the first debate**

The UI waits for an active workflow run. Trigger one:

```bash
curl -X POST http://localhost:3000/api/debate \
  -H "x-api-key: your-DEBATE_API_KEY"
```

Open [http://localhost:3000](http://localhost:3000). After the first debate ends, the next one starts automatically — you never need to trigger it again.

---

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel
2. Go to **Storage** → create a **Postgres** and a **KV** database — Vercel injects their env vars automatically
3. Add `OPENAI_API_KEY` and `DEBATE_API_KEY` manually in **Settings → Environment Variables**
4. Deploy
5. Fire the first debate:

```bash
curl -X POST https://your-app.vercel.app/api/debate \
  -H "x-api-key: your-DEBATE_API_KEY"
```

---

## API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/debate` | — | Stream the live debate (NDJSON) |
| `POST` | `/api/debate` | `x-api-key` | Start a debate (`{ topic?: string }`) |
| `DELETE` | `/api/debate` | `x-api-key` | Stop the active debate |
| `GET` | `/api/debates` | — | List past debates |
| `POST` | `/api/debates/[id]/vote` | — | Vote (`{ kind: "up" \| "down" }`) |
