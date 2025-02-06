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

Previously you were required to setup Ably, Supabase and several `.env` files manually. Now terraform will do this for you.

### Steps:

**1. Create your `terraform.tfvars` file.** This will hold your account tokens for all providers.
- Run `cp terraform/terraform.tfvars.example terraform/terraform.tfvars`. This will create your `terraform.tfvars` from the example.

**2. Go grab your supabase credentials.**
- In the supabase dashboard, go to your organization settings - creating an organization if you don't have one already. Copy the "Organization slug" and paste it into your newly created `terraform.tfvars` file as your `supabase_organization_id`.
- Again in the supabase dashboard, navigate to "Access tokens". Create an access token and paste it into your newly created `terraform.tfvars` file as your `supabase_access_token`.
- (optional) Change the default `supabase_db_pass` in your `terraform.tfvars` file.

**3. Go grab your ably account token.**
- Create an Ably account if you don't have one already. On the dashboard, navigate to Account > My Access Tokens. Create a new token,checking all of the permissions boxes. Copy the token and paste it into your newly created `terraform.tfvars` file as your `ably_account_token`. 

**4. Spin up all your resources with a single command.**

*Setup (you only need to do this once)*
- Download terraform if it's not already installed. You can download it [here](https://developer.hashicorp.com/terraform/install?product_intent=terraform).
- Verify that you have access to the CLI by running `terraform --version`.
- Download PostgreSQL if it's not already installed. You can download it [here](https://www.postgresql.org/download/).
- Verify that you have access to the CLI by running `psql --version`.
- Run `terraform init` in the `/terraform` directory.
> NOTE FOR WINDOWS USERS: You can use [Git Bash](https://sps-lab.org/post/2024_windows_bash/) or WSL to run bash scripts, but make sure you're in an environment where `terraform` and `psql` areavailable. If you don't want to figure out how to run bash scripts, you can just keep running `terraform apply` until it succeeds.


*Run the command*
- Run the bash script `terraform/automatic_retry_apply.sh`. This will run terraform apply in a loop until it succeeds. This is necessary because Supabase sometimes takes a few minutes to spin up the database pooler and for some reason whoever wrote the terraform provider didn't handle this. 

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


### For VS Code Quick Build: 
Run a script to automatically run build/run commands on VS Code.
- For macOS:
```
chmod +x start_game.sh
Ctrl+Shift+P (Command Palette) > Tasks: Run Task > Start All (or the specific component you want to run)
```
- For Windows Powershell:
  (use wsl)

### Quick Build and Run
Run a script to automatically run all the build/run commands. `./setup.[ext] [options]`
- For Windows PowerShell:
  ```
  ./setup.ps1 --all
  ```
- For macOS:
  ```
  ./setup.sh --all
  ```
- Additional options:
  - `--build`
  - `--create-world`
  - `--auth-server`
  - `--server`
  - `--client`
  - `--all`

## Migrations
### Supabase CLI Setup

In order to migrate supabase tables we need to use the supabase CLI and connect it to our remote database.
You can skip these steps by going to the migrations section, copying the SQL there and putting it into the supabase SQL editor.
However, once you set this up it'll work for all future migrations.

**1. Install the supabase CLI.**
- Follow the instructions [here](https://supabase.com/docs/guides/local-development/cli/getting-started). 

**2. Connect the CLI to your supabase database.**
- Run `supabase login` and follow the prompts to log in.
- Run `supabase link` and follow the prompts to link your CLI to your supabase project.

**3. Run the migrations.**
- Run `supabase db push` to run the migrations in the `/migrations` directory.

### Terraform Migration
- Run `terraform apply` in the `/terraform` directory to apply the migrations.
