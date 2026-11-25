// The only file that queries the players table.
const { Player } = require('../models');

// The seat of one account in one session, or null. This one query is the rejoin rule.
function findSeat(sessionId, userId) {
  return Player.findOne({ where: { session_id: sessionId, user_id: userId } });
}
function countBySession(sessionId) {
  return Player.count({ where: { session_id: sessionId } });
}
function findAllBySession(sessionId) {
  return Player.findAll({
    where: { session_id: sessionId },
    order: [['score', 'DESC'], ['nickname', 'ASC']],
  });
}
async function colorsInSession(sessionId) {
  const players = await Player.findAll({ where: { session_id: sessionId }, attributes: ['player_color'] });
  return players.map((player) => player.player_color);
}
function create(data) {
  return Player.create(data);
}

module.exports = { findSeat, countBySession, findAllBySession, colorsInSession, create };
