// A database rule was broken -> what the client should hear.
// The key is the constraint name from YOUR migration. PostgreSQL names a
// foreign key "<table>_<column>_fkey" when the migration does not name it.
// Write one entry for each constraint a client can hit. Example:
//
//   uq_player_nickname: {
//     status: 409,
//     code: 'NICKNAME_TAKEN',
//     message: 'That nickname is already used in this game.',
//   },
//
// A constraint that is not listed here still answers 409, with the code CONFLICT.
module.exports = {
  // question_sets.name is UNIQUE (Sequelize/PostgreSQL name it <table>_<column>_key).
  question_sets_name_key: {
    status: 409,
    code: 'QUESTION_SET_NAME_TAKEN',
    message: 'A question set with that name already exists.',
  },
  // game_sessions.set_id points at the set (see the restrict-set-delete migration).
  game_sessions_set_id_fkey: {
    status: 409,
    code: 'QUESTION_SET_IN_USE',
    message: 'This question set is used by a game session, so it cannot be deleted.',
  },
};
