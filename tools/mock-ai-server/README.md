# Mock AI Analysis Server

A standalone Express server that simulates the AI microservice during development.

## Quick Start

```bash
# From project root:
npm run mock:ai
```

Server runs on `http://localhost:8001`.

## Endpoints

| Method | Route      | Description                    |
| ------ | ---------- | ------------------------------ |
| POST   | `/analyze` | Returns mock match analysis    |
| GET    | `/health`  | Health check                   |

## Request Format

```json
POST /analyze
Content-Type: application/json

{
  "event_id": "14023985",
  "team_id": "44"
}
```

## Failure Simulation

Add `?simulate=` query parameter to test error handling:

| Parameter             | Behavior                                |
| --------------------- | --------------------------------------- |
| `?simulate=timeout`   | Hangs for 30 seconds (test your timeout)|
| `?simulate=error`     | Returns HTTP 500                        |
| `?simulate=invalid`   | Returns malformed/garbage JSON          |
| `?simulate=slow`      | Delays 5 seconds, then returns valid data|

## Switching to Real AI Service

When the AI team has their API ready:

1. Open `.env.development.local`
2. Change `AI_SERVICE_URL=http://localhost:8001` → `AI_SERVICE_URL=http://ai-team-server:8000`
3. Done. No code changes needed.
