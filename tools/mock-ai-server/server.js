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

const express = require('express');
const { buildMockAnalysis } = require('./sample-data');

const app = express();
const PORT = 8001;

app.use(express.json());

// ---------------------------------------------------------------------------
// Health check — matches the real AI service contract
// ---------------------------------------------------------------------------
app.get('/health', function (_req, res) {
  res.json({ status: 'ok', service: 'mock-ai-server', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// POST /analyze — the main endpoint
// ---------------------------------------------------------------------------
app.post('/analyze', function (req, res) {
  const simulate = req.query.simulate;
  const event_id = req.body.event_id;
  const team_id = req.body.team_id;

  // Log incoming request
  console.log('');
  console.log('--- POST /analyze ---');
  console.log('  event_id: ' + (event_id || '(missing)'));
  console.log('  team_id:  ' + (team_id || '(missing)'));
  if (simulate) console.log('  simulate: ' + simulate);

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
    console.log('  [TIMEOUT] Hanging for 30 seconds...');
    setTimeout(function () {
      res.json(buildMockAnalysis(event_id, team_id));
    }, 30000);
    return;
  }

  if (simulate === 'error') {
    console.log('  [ERROR] Returning 500');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Simulated AI processing failure',
    });
    return;
  }

  if (simulate === 'invalid') {
    console.log('  [INVALID] Returning malformed response');
    res.json({ garbage: true, not_a_valid_analysis: 42 });
    return;
  }

  if (simulate === 'slow') {
    console.log('  [SLOW] Delaying 5 seconds...');
    setTimeout(function () {
      var analysis = buildMockAnalysis(event_id, team_id);
      console.log('  [OK] Returned analysis (' + analysis.players_analysis.length + ' players)');
      res.json(analysis);
    }, 5000);
    return;
  }

  // --- Normal response ---
  var analysis = buildMockAnalysis(event_id, team_id);
  console.log('  [OK] Returned analysis (' + analysis.players_analysis.length + ' players)');
  res.json(analysis);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, function () {
  console.log('');
  console.log('========================================');
  console.log('  Mock AI Analysis Server');
  console.log('========================================');
  console.log('  Running on:  http://localhost:' + PORT);
  console.log('');
  console.log('  Endpoints:');
  console.log('    POST /analyze     - Match analysis');
  console.log('    GET  /health      - Health check');
  console.log('');
  console.log('  Failure simulation (query param):');
  console.log('    ?simulate=timeout - 30s delay');
  console.log('    ?simulate=error   - HTTP 500');
  console.log('    ?simulate=invalid - Malformed response');
  console.log('    ?simulate=slow    - 5s delay + valid data');
  console.log('========================================');
  console.log('');
  console.log('Waiting for requests...');
});
