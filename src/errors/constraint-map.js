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
module.exports = {
  // question_sets.name is UNIQUE (not named in the migration: <table>_<column>_key).
  question_sets_name_key: {
    status: 409,
    code: 'QUESTION_SET_NAME_TAKEN',
    message: 'A question set with that name already exists.',
  },
  // game_sessions.set_id -> question_sets (named in the restric-set-delete migration, NO ACTION).
  game_sessions_set_id_fkey: {
    status: 409,
    code: 'QUESTION_SET_IN_USE',
    message: 'This question set was used in a game and cannot be deleted.',
  },
  // players (session_id, nickname) is UNIQUE (named in the create-players migration).
  players_session_nickname_unique: {
    status: 409,
    code: 'NICKNAME_TAKEN',
    message: 'That nickname is already used in this game.',
  },
  // solved_words (session_id, clue_id) is UNIQUE: a clue can be solved once per game.
  // No endpoint reaches it yet; it is ready for the module that records answers.
  solved_words_session_clue_unique: {
    status: 409,
    code: 'CLUE_ALREADY_SOLVED',
    message: 'This clue has already been solved in this game.',
  },
};
