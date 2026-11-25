# CrosswordQuest API

Backend API for **CrosswordQuest**, a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Christine Joy T. Catamora (cjcatamora), BSCS 3-1
- Group and game concept: Group 6 CrosswordQuest

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone https://github.com/cjcatamora/CrosswordQuest-api.git
cd CrosswordQuest-api
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | your_game_slug | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

Until login exists, send the `X-Demo-User` header with a school ID (for example `2099-0001`) to say who is calling.

| Method | Path | Who may call it | What it does | Success | Errors |
|---|---|---|---|---|---|
| GET | /health | Anyone | Is the API up and can it reach the database? | 200 (503 when the database is down) | |
| GET | /game-info | Anyone | Slug, name, group, developer, description, player limits, version | 200 | |
| GET | /results | The Hub (`X-Hub-Key` header) | Finished games, every player, and the top 3. Optional `?since=` | 200 | 401 |
| GET | /question-sets | Host or admin | A host's own sets (an admin sees all) | 200 | 401, 403 |
| POST | /question-sets | Host or admin | Create a set. Body: `{ "name": "..." }` | 201 | 400, 401, 403, 409 |
| GET | /question-sets/:id | Owner or admin | One set | 200 | 400, 401, 403, 404 |
| PATCH | /question-sets/:id | Owner or admin | Rename a set. Body: `{ "name": "..." }` | 200 | 400, 401, 403, 404, 409 |
| DELETE | /question-sets/:id | Owner or admin | Delete a set that no game has used | 204 | 400, 401, 403, 404, 409 |
| POST | /sessions | Host or admin | Start a game. Body: `{ "set_id": 1 }`. The server makes the 6-digit code | 201 | 400, 401, 403, 404 |
| GET | /sessions/:code | Anyone | Read one game by its code | 200 | 400, 404 |
| PATCH | /sessions/:code | Host of that game (or admin) | Change the status. Body: `{ "status": "PLAYING" }` or `"FINISHED"` | 200 | 400, 401, 403, 404, 409 |
| POST | /sessions/:code/players | Any account | Join, or rejoin. Body: `{ "nickname": "Ana" }` | 201 new seat, 200 rejoin | 400, 401, 404, 409 |
| GET | /sessions/:code/players | Anyone | Nicknames, colors and scores | 200 | 400, 404 |

Status flow: WAITING to PLAYING to FINISHED. A FINISHED game is never reopened or deleted.

Test accounts (fictional): host `2099-0001`, second host `2099-0007`, players `2099-0002` and `2099-0003`.

## What "completed" means in my game

A player completed the game when they solved at least one word (they have a row in `solved_words`) in a game that reached FINISHED. A player who joined but left early without solving any word is not completed.

## Tables

| # | Table | Purpose |
|---|---|---|
| 1 | users | Host and player accounts |
| 2 | question_sets | Topic banks of clues |
| 3 | crossword_grids | Generated grids and their size (8x8 to 12x12) |
| 4 | clues | Crossword clues with direction, position, text and server-only answer |
| 5 | game_sessions | Sessions with shareable link, 6-digit join code and status |
| 6 | players | Players with nickname, color, token, score and streak |
| 7 | device_info | Device and browser used by each player |
| 8 | solved_words | Which player solved which clue, points awarded and time |

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |
