# Mini-Games

A minimal monorepo for a small web app with multiple mini‑games. The first game, TicTacToe, supports Single vs AI, Local 2‑Player, and Online 2‑Player modes. The repo contains a React + TypeScript frontend (Vite) and a Node.js + Express + Socket.IO backend.

## Features

- TicTacToe modes: Single vs AI (easy), Local 2P, Online 2P
- Online rooms with short codes, live board sync via Socket.IO
- Winning line highlight, end-of-game banner (winner/draw), modern UI styling
- Turn indicator, restart/play-again, and back actions
- Score persistence (localStorage) for Single/Local modes
- Placeholders for Bingo and Connect‑the‑Dots

## Tech Stack

- Client: React, TypeScript, Vite, Socket.IO client
- Server: Node.js, Express, Socket.IO, CORS
- Monorepo: npm workspaces

## Project Layout

```
mini-games/
  package.json
  server/
    package.json
    tsconfig.json
    .env.example
    src/
      index.ts
      tictactoe/
        rooms.ts
        events.ts
  client/
    package.json
    tsconfig.json
    vite.config.ts
    .env.example
    index.html
    src/
      main.tsx
      App.tsx
      router.tsx
      styles.css
      components/
        Menu.tsx
        GameCard.tsx
      games/
        tictactoe/
          TicTacToePage.tsx
          Board.tsx
          ScoreBar.tsx
          ModeSelect.tsx
          logic.ts
          ai.ts
          online/
            Lobby.tsx
            Room.tsx
            socket.ts
        placeholders/
          BingoPlaceholder.tsx
          ConnectDotsPlaceholder.tsx
```

## Requirements

- Node.js 18+
- npm 8+

## Installation

1) Install dependencies at the repo root:

```
npm install
```

2) Optional: configure environment variables. Defaults work for local dev.

- Server env (defaults shown):
  - `PORT=5174`
  - `ALLOWED_ORIGIN=http://localhost:5173`
- Client env (default shown):
  - `VITE_SERVER_URL=http://localhost:5174`

Copy examples if desired:

```
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Note: The server reads `process.env` directly. If you use `.env` files, run your server with a tool that loads them or export variables in your shell.

## Development

Runs server (5174) and client (5173) together.

```
npm run dev
```

Open the client at:

```
http://localhost:5173
```

Health check for the server:

```
http://localhost:5174/health
```

## Build

```
npm run build
```

- Server output: `server/dist`
- Client output: `client/dist`

## Start

Starts the compiled server only.

```
npm start
```

To preview the built client separately:

```
npm run preview -w client
```

## Using TicTacToe

- From Home, open TicTacToe
- Pick a mode:
  - Single vs AI: You are Player (X), AI is O; easy logic (win > block > random)
  - Local 2P: Player 1 (X) vs Player 2 (O) on the same device
  - Online 2P: Create a room (copy the code) or join by code; the server validates moves, tracks turns, detects wins/draws, and notifies on disconnects
- Scores for Single/Local are saved in `localStorage` keys: `ttt_x`, `ttt_o`, `ttt_draws`
 - Counters start at 0 on each app load and update after completed games
 - The UI theme reflects the current turn: X in red, O in blue

## Notes

- CORS and Socket.IO are preconfigured for `http://localhost:5173` (client) and `http://localhost:5174` (server)
- If you change ports or origins, update `server/.env` and `client/.env`

This README will be updated as the app evolves.
