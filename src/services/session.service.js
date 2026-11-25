// The rules of game sessions. Throws the kit's errors; never touches req or res.
const sessionRepository = require('../repositories/session.repository');
const questionSetRepository = require('../repositories/question-set.repository');
const gridRepository = require('../repositories/crossword-grid.repository');
const { constraintOf } = require('../errors/db-errors');
const { notFound, forbidden, conflict } = require('../errors/app-error');

async function findOrFail(code) {
  const session = await sessionRepository.findByCode(code);
  if (!session) throw notFound('SESSION_NOT_FOUND', `No game has the code ${code}.`);
  return session;
}

// Hub Contract rule 5: six digits. 100000 to 999999 never starts with 0.
function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Rule: only the owner of a question set (or an admin) may start a game with it.
// Rule: every game gets its own crossword grid (game_sessions.grid_id is UNIQUE).
async function create(setId, user) {
  const questionSet = await questionSetRepository.findById(setId);
  if (!questionSet) throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${setId}.`);
  if (questionSet.host_id !== user.user_id && user.role !== 'admin') {
    throw forbidden('This question set belongs to another host.');
  }

  const grid = await gridRepository.create();
  // A random code can already be in use. UNIQUE on join_code tells us, and we try again.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const code = randomCode();
    try {
      return await sessionRepository.create({
        set_id: questionSet.set_id,
        host_id: user.user_id,
        grid_id: grid.grid_id,
        join_code: code,
        shareable_link: `/join/${code}`,
      });
    } catch (error) {
      if (constraintOf(error) !== 'game_sessions_join_code_key') {
        await gridRepository.removeById(grid.grid_id);
        throw error;
      }
    }
  }
  await gridRepository.removeById(grid.grid_id);
  throw new Error('Could not find a free join code after 5 attempts.');
}

// Rule: which status may follow which.
const NEXT_STATUS = {
  WAITING: ['PLAYING', 'FINISHED'],
  PLAYING: ['FINISHED'],
  FINISHED: [],
};

// Rule: only the host of that game (or an admin) changes its status, and only
// along NEXT_STATUS. A finished game is history: it is never reopened or deleted.
async function changeStatus(code, status, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id && user.role !== 'admin') {
    throw forbidden('This game belongs to another host.');
  }
  if (!NEXT_STATUS[session.status].includes(status)) {
    throw conflict('INVALID_STATUS_CHANGE', `A ${session.status} game cannot become ${status}.`);
  }
  const changes = { status };
  if (status === 'PLAYING') changes.started_at = new Date();
  if (status === 'FINISHED') changes.ended_at = new Date();
  return sessionRepository.update(session, changes);
}

module.exports = { findOrFail, create, changeStatus, NEXT_STATUS };
