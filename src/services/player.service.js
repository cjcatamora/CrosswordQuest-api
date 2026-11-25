// Joining, and rejoining. Seven questions in a fixed order; the first "no" decides.
const crypto = require('crypto');
const sessionService = require('./session.service');
const playerRepository = require('../repositories/player.repository');
const gameInfo = require('../config/game-info');
const { constraintOf } = require('../errors/db-errors');
const { conflict } = require('../errors/app-error');

// players.player_color is UNIQUE per session, so a game has at most one seat per color.
const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
const MAX_SEATS = Math.min(gameInfo.max_players, COLORS.length);

async function freeColor(sessionId) {
  const used = await playerRepository.colorsInSession(sessionId);
  return COLORS.find((color) => !used.includes(color));
}

async function join(code, nickname, user) {
  const session = await sessionService.findOrFail(code);

  // Rejoin: this account already has a seat here. Same row, same score.
  const seat = await playerRepository.findSeat(session.session_id, user.user_id);
  if (seat) return { session, player: seat, created: false };

  // New seat: only while the game is waiting, and only if there is room.
  if (session.status === 'FINISHED') throw conflict('SESSION_ENDED', 'This game has ended.');
  if (session.status !== 'WAITING') {
    throw conflict('SESSION_NOT_JOINABLE', 'This game has already started.');
  }
  const seatsTaken = await playerRepository.countBySession(session.session_id);
  if (seatsTaken >= MAX_SEATS) throw conflict('SESSION_FULL', 'This game is full.');

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const player = await playerRepository.create({
        session_id: session.session_id,
        user_id: user.user_id,
        nickname,
        player_color: await freeColor(session.session_id),
        token: crypto.randomBytes(24).toString('hex'),
      });
      return { session, player, created: true };
    } catch (error) {
      const constraint = constraintOf(error);
      // The same account sent two join requests at once, and the other one won.
      if (constraint === 'players_session_user_unique') {
        const existing = await playerRepository.findSeat(session.session_id, user.user_id);
        return { session, player: existing, created: false };
      }
      // Two players took the same color at the same instant: pick again.
      if (constraint !== 'players_session_color_unique') throw error;   // a taken nickname -> 409 (constraint-map)
    }
  }
  throw conflict('SESSION_BUSY', 'Too many players joined at once. Please try again.');
}

// Rule: anyone may see who is in a game: nicknames and scores only.
async function list(code) {
  const session = await sessionService.findOrFail(code);
  return playerRepository.findAllBySession(session.session_id);
}

module.exports = { join, list };
