/**
 * Mock AI Analysis Server
 *
 * A standalone Express server that simulates the AI microservice API.
 * Implements the exact same contract (POST /analyze, GET /health)
 * so the NestJS backend can develop and test without the real AI service.
 *
 * Usage:
 *   npm run mock:ai
 *
 * Failure simulation (via query params):
 *   POST /analyze?simulate=timeout   → Hangs for 30s (test client timeout)
 *   POST /analyze?simulate=error     → Returns HTTP 500
 *   POST /analyze?simulate=invalid   → Returns malformed JSON
 *   POST /analyze?simulate=slow      → Delays 5s, then returns valid data
 */

import express, { Request, Response } from 'express';
import { buildMockAnalysis } from './sample-data';

const app = express();
const PORT = 8001;

app.use(express.json());

// ---------------------------------------------------------------------------
// Health check — matches the real AI service contract
// ---------------------------------------------------------------------------
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'mock-ai-server', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// POST /analyze — the main endpoint
// ---------------------------------------------------------------------------
app.post('/analyze', async (req: Request, res: Response) => {
  const simulate = req.query.simulate as string | undefined;
  const { event_id, team_id } = req.body;

  // Log incoming request
  console.log(`\n📥 POST /analyze`);
  console.log(`   event_id: ${event_id || '(missing)'}`);
  console.log(`   team_id:  ${team_id || '(missing)'}`);
  if (simulate) console.log(`   🧪 simulate: ${simulate}`);

  // --- Validate request body ---
  if (!event_id || !team_id) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Both "event_id" and "team_id" are required in the request body.',
    });
    return;
  }

  // --- Failure simulation modes ---
  if (simulate === 'timeout') {
    console.log('   ⏳ Simulating timeout (30 seconds)...');
    await delay(30000);
    res.json(buildMockAnalysis(event_id, team_id));
    return;
  }

  if (simulate === 'error') {
    console.log('   💥 Simulating server error (500)');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Simulated AI processing failure',
    });
    return;
  }

  if (simulate === 'invalid') {
    console.log('   🗑️  Simulating invalid/malformed response');
    res.json({ garbage: true, not_a_valid_analysis: 42 });
    return;
  }

  if (simulate === 'slow') {
    console.log('   🐌 Simulating slow response (5 seconds)...');
    await delay(5000);
  }

  // --- Normal response ---
  const analysis = buildMockAnalysis(event_id, team_id);

  console.log(`   ✅ Returning analysis (${analysis.players_analysis.length} players)`);
  res.json(analysis);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         🤖 Mock AI Analysis Server              ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Running on:  http://localhost:${PORT}              ║`);
  console.log('║                                                  ║');
  console.log('║  Endpoints:                                      ║');
  console.log('║    POST /analyze     → Match analysis            ║');
  console.log('║    GET  /health      → Health check              ║');
  console.log('║                                                  ║');
  console.log('║  Failure simulation (query param):               ║');
  console.log('║    ?simulate=timeout → 30s delay                 ║');
  console.log('║    ?simulate=error   → HTTP 500                  ║');
  console.log('║    ?simulate=invalid → Malformed response        ║');
  console.log('║    ?simulate=slow    → 5s delay + valid data     ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
