# Potions the Game

## Introduction

**Potions the Game** is:
- Web-based
- Real-time 
- Multiplayer

## Technologies

**Potions the Game** uses:
- **Ably** for real-time communication between client and server.
- **Phaser** for client-side web sprite rendering.
- **Supabase** for centralized management of state in Postgres. Active game state does not interact with Supabase at all; it is only used for entry/transition between worlds.
- **SQLite** for managing all in-world state.
- **TypeScript** as the ubiquitous language across all packages.

## Packages

### Client
The client is the static HTML/JS presentation layer for the game. It communicates with the auth-server to retrieve credentials and opens a WebSocket to Ably for communicating with a game server.

### Auth-server
The auth-server is a web server that the client interacts with to retrieve credentials for a game world.

### Common
The common package contains shared interfaces between the client and the server. It includes pathfinding and movement interpolation logic, enabling the client to preemptively handle movement for smooth gameplay without waiting for the server.

### Server
The server runs the game world as a background worker. It ticks every half-second, managing all interactions in the game world. It uses the common library to send messages to the client and the Converse library to handle conversations. This is the main place where you should focus your attention for understanding how the game world works.

### Converse
Converse manages conversations, which can be envisioned as navigating a knowledge graph between players.

### World-generator
The world-generator creates random terrain to populate worlds for the server. You will not need to worry about this package initially.

## Installation

**Note**: The initial version of these instructions does not follow the principle of least privilege. This will be addressed during the first weeks of class.

To install the game, clone the repository and follow these steps:

### Setup Ably
1. Register for an Ably account at [ably.com](https://ably.com).
2. Go to **API Keys** and copy the root key. This will be used as your `ABLY_API_KEY` later.

### Setup Supabase
1. Register for a Supabase account at [supabase.com](https://supabase.com) and create a new project.
2. Run `sql/setup.sql` in the query editor of your project.
3. Execute:
   ```sql
   INSERT INTO worlds (world_id, ably_api_key) VALUES ('test-world', '<ABLY_API_KEY>');
   ```
   Replace `<ABLY_API_KEY>` with the API key from the Ably setup.
4. Go to **Settings -> API** and copy the project URL. This will be your `SUPABASE_URL`.
5. Copy the service key, which will be your `SUPABASE_SERVICE_KEY`.

### Configure `.env` Files
1. In the **auth-server** package, create a `.env` file with the following values:
   ```
   ABLY_API_KEY=<your Ably API key>
   SUPABASE_SERVICE_KEY=<your Supabase service key>
   SUPABASE_URL=<your Supabase URL>
   ```
2. In the **server** package, create a `.env` file with:
   ```
   ABLY_API_KEY=<your Ably API key>
   ```
3. In the **client** package, create a `.env` file with:
   ```
   SERVER_URL=http://localhost:3000/
   ```
   This will point to your auth-server.

### Build
1. In your root folder, execute:
   ```
   pnpm install
   pnpm build
   ```
2. In the **server** package, execute:
   ```
   pnpm run create test-world
   ```
   to build your world.

### Run!
1. In the **auth-server** package, execute:
   ```
   pnpm dev
   ```
   This starts the auth-server at [http://localhost:3000/](http://localhost:3000/). Keep it running in a separate terminal.

3. Then, in the **server** package, execute:
   ```
   pnpm dev test-world
   ```
   This starts your server. Keep it running in a separate terminal.
4. In the **client** package, execute:
   ```
   pnpm start
   ```
   This should take you to [http://127.0.0.1:8080/](http://127.0.0.1:8080/), where you can click "Start" to enter your game.