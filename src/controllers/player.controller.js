const { matchedData } = require('express-validator');
const playerService = require('../services/player.service');

async function join(req, res) {
  const { code, nickname } = matchedData(req);
  const { session, player, created } = await playerService.join(code, nickname, req.user);

  // 201 Created for a new seat, 200 OK when the account already had one (rejoin).
  // The token is the caller's own seat key; it is never shown in the player list.
  res.status(created ? 201 : 200).json({
    player_id: player.player_id,
    nickname: player.nickname,
    color: player.player_color,
    score: player.score,
    streak: player.streak,
    token: player.token,
    rejoined: !created,
    session: { code: session.join_code, status: session.status },
  });
}

// Nicknames, colors and scores only. Never school_id, full name, email or token.
async function list(req, res) {
  const { code } = matchedData(req);
  const players = await playerService.list(code);
  res.status(200).json(players.map((player) => ({
    nickname: player.nickname,
    color: player.player_color,
    score: player.score,
    streak: player.streak,
  })));
}

module.exports = { join, list };
