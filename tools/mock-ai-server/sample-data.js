/**
 * Mock AI Analysis Response — matches the exact contract agreed with the AI team.
 *
 * Field names, nesting, and types are IDENTICAL to the real AI service response.
 * Only numeric values (fatigue_index, minutes_played) are slightly randomized.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a random integer between min and max (inclusive). */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Picks a random element from an array. */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Static data pool
// ---------------------------------------------------------------------------

const MATCH_RESULTS = ['Win', 'Draw', 'Loss'];
const FORMATIONS = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '3-4-3'];
const INJURY_RISKS = ['Low', 'Medium', 'High'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

const PLAYERS = [
  { player_id: 'p_10', name: 'Mohamed Salah', position: 'RW' },
  { player_id: 'p_08', name: 'Pedri', position: 'CM' },
  { player_id: 'p_01', name: 'Thibaut Courtois', position: 'GK' },
  { player_id: 'p_04', name: 'Dani Carvajal', position: 'RB' },
  { player_id: 'p_03', name: 'Eder Militao', position: 'CB' },
  { player_id: 'p_05', name: 'Antonio Rudiger', position: 'CB' },
  { player_id: 'p_23', name: 'Ferland Mendy', position: 'LB' },
  { player_id: 'p_15', name: 'Federico Valverde', position: 'CM' },
  { player_id: 'p_22', name: 'Jude Bellingham', position: 'AM' },
  { player_id: 'p_07', name: 'Vinícius Júnior', position: 'LW' },
  { player_id: 'p_09', name: 'Karim Benzema', position: 'ST' },
];

const TEAM_DRILLS = [
  {
    focusCode: 'PRESS_RESISTANCE',
    linkedOpponentFeature: 'HIGH_PRESS_INTENSITY',
    targetedPositions: ['D', 'M'],
  },
  {
    focusCode: 'OFFENSIVE_TRANSITION_WING',
    linkedOpponentFeature: 'SLOW_TRANSITION_DEFENSE',
    targetedPositions: ['F', 'M'],
  },
  {
    focusCode: 'DEFENSIVE_SHAPE_RECOVERY',
    linkedOpponentFeature: 'COUNTER_ATTACK_THREAT',
    targetedPositions: ['D', 'M'],
  },
  {
    focusCode: 'SET_PIECE_DEFENSE',
    linkedOpponentFeature: 'SET_PIECE_DOMINANCE',
    targetedPositions: ['D', 'GK'],
  },
];

const INDIVIDUAL_DRILLS = [
  { playerId: 138572, playerName: 'Dani Carvajal', drillCode: '1V1_DEFENDING_WIDE' },
  { playerId: 868812, playerName: 'Vinícius Júnior', drillCode: 'FINISHING_INSIDE_BOX' },
  { playerId: 293847, playerName: 'Jude Bellingham', drillCode: 'PRESS_TRIGGER_TIMING' },
  { playerId: 129384, playerName: 'Federico Valverde', drillCode: 'BOX_TO_BOX_ENDURANCE' },
];

// ---------------------------------------------------------------------------
// Response builder
// ---------------------------------------------------------------------------

function buildMockAnalysis(eventId, teamId) {
  return {
    event_id: eventId,
    team_id: teamId,
    analysis_timestamp: new Date().toISOString(),

    match_context: {
      opponent_id: 'team_' + String(randInt(1, 999)).padStart(3, '0'),
      match_result: pick(MATCH_RESULTS),
      team_formation: pick(FORMATIONS),
    },

    players_analysis: PLAYERS.map(function (player) {
      return {
        player_id: player.player_id,
        name: player.name,
        position: player.position,
        minutes_played: pick([45, 60, 70, 75, 80, 85, 90]),
        fatigue_and_risk: {
          fatigue_index: randInt(25, 92),
          injury_risk_level: pick(INJURY_RISKS),
        },
      };
    }),

    trainingPlan: {
      teamDrills: TEAM_DRILLS.slice(0, randInt(2, 4)).map(function (drill) {
        return {
          focusCode: drill.focusCode,
          priority: pick(PRIORITIES),
          linkedOpponentFeature: drill.linkedOpponentFeature,
          targetedPositions: drill.targetedPositions,
        };
      }),

      individualDrills: INDIVIDUAL_DRILLS.slice(0, randInt(2, 4)).map(function (drill) {
        return {
          playerId: drill.playerId,
          playerName: drill.playerName,
          drillCode: drill.drillCode,
        };
      }),
    },
  };
}

module.exports = { buildMockAnalysis };
