# Potions the Game

[![OtterWise Coverage](https://img.shields.io/endpoint?url=https://otterwise.app/badge/github/sloalchemist/potions/coverage)](https://otterwise.app/github/sloalchemist/potions)

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

> **Note**: YOU NEED TOKENS! Copying your current Ably and Supabase API keys will not work. You need account tokens.

**1. Create your `terraform.tfvars` file.** This will hold your account tokens for all providers.

- From the project root, run `cp terraform/terraform.tfvars.example terraform/terraform.tfvars`. This will create your `terraform.tfvars` from the example.

**2. Go grab your supabase credentials.**

- In the supabase dashboard, go to your organization settings - creating an organization if you don't have one already. Copy the "Organization slug" and paste it into your newly created `terraform.tfvars` file as your `supabase_organization_id`.
- Again in the supabase dashboard, navigate to "Access tokens". Create an access token and paste it into your newly created `terraform.tfvars` file as your `supabase_access_token`.
- (optional) Change the default `supabase_db_pass` in your `terraform.tfvars` file.

> **Note**: You are only allowed 2 active supabase projects at a time on the free tier. Because terraform will create a new one, you need to make sure you only have at most 1 active supabase project before running `terraform apply`.

**3. Go grab your ably account token.**

- Create an Ably account if you don't have one already. On the dashboard, navigate to Account > My Access Tokens. Create a new token, **checking all of the permissions boxes**. Copy the token and paste it into your newly created `terraform.tfvars` file as your `ably_account_token`.

**4. Download and start docker desktop.**

- Download [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- **Make sure the daemon is running before proceeding**. You can do this visually in the docker desktop app or using any of the methods described [here](https://chatgpt.com/share/67ace93b-7a4c-8003-8eed-e599196ddb2a).
- Create an account on Docker in the desktop app to allow you to pull docker images from the docker hub.

**4. Run Terraform**

Dev Terraform now run in a docker container so you don't need to worry about downloading Terraform, supabase-cli, psql, jq or anything else. Depending on your operating system, use one of the following helper scripts to run terraform commands in docker:

**For macOS:**

Use `./tf.sh <any_terraform_command>`
**Quick Start**: Run `./tf.sh` with no command line arguments which will automatically run `terraform init` followed by `terraform apply` in the docker container

**For Windows:**

Use `./tf.ps1 <any_terraform_command>`
**Quick Start**: Run `./tf.ps1` with no command line arguments which will automatically run `terraform init` followed by `terraform apply` in the docker container

> **IMPORTANT NOTE FOR WINDOWS**
> All files ending in .sh or .tf must use LF line endings. The tf script automatically checks for this and will let you know if you need to convert them.
>
> **To convert line endings**: You will need to cleanly pull the repo by running the following commands (these will remove any uncommited changes so make sure to commit or stash them)
>
> On main run:
> `git fetch` > `git pull` > `git rm --cached -r .` > `git reset --hard`
>
> After running these commands (and possibly restarting your editor), you should see that your editor's line endings are LF for .sh and .tf files (shown in the bottom right of vscode). If it's still showing CRLF, you can manually force your editor to use LF line endings. Look this up.
>
> The tf script should verify that your line endings are correct and let you know if they aren't.
>
> If you're getting an error similar to the following, your line endings are probably set to CRLF without the sh script catching it. DM Alfred Madere.
>
> **CRLF line endings error** > `Output: /bin/bash: line 1: set: -
│ set: usage: set [-abefhkmnptuvxBCEHPT] [-o option-name] [--] [-] [arg ...]
│ /bin/bash: line 5: $'\r': command not found
│ /bin/bash: -c: line 9: syntax error near unexpected token `|'
> ' /bin/bash: -c: line 9: `    | jq -r '.status')`

**TERRAFORM STATE PROBLEMS**

Your state may become out of sync for several reasons. 

1. If you manually delete or create projects in provider dashboards
2. You delete your state file without also deleting all provisioned resources (Supabase or Ably projects)
3. You change your credentials while resources are still provisioned (up and running)
4. Any other way in which resources change without running a terraform command

**HOW TO RESYNC YOUR STATE**

1. You need to manually delete your /terraform/terraform.tfstate file and /terraform/terraform.tfstate.backup. 
2. In their respective dashboards, delete your supabase potions-dev project and ably potions-dev projects. 
3. In extreme cases, delete any running Docker containers or images associated with terraform using Docker Desktop. If this is necessary please reach out to Alfred Madere or Nick Perlich on Slack so we can find the root of the problem.
4. Rerun /tf.ps1 for Windows or /tf.sh for MacOS.

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

2. Then, in the **server** package, execute:
   ```
   pnpm dev test-world
   ```
   This starts your server. Keep it running in a separate terminal.
3. In the **client** package, execute:
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

> Note: Migrations are now automatically run by running `terraform apply` so the following steps are not necessary unless you choose to setup manually.

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

## Saving Server Data with Supabase

Developers/players will now be able to save their world data to Supabase. This means any hard work you do is no longer erased when you close the server.

**Update Server .env**

- In you server .env add the following
- SUPABASE_URL=
- SUPABASE_SERVICE_KEY=
- Your URL and Service key can be found in your auth server .env

**How this works**
- The first time you start the server, your server data will be uploaded to Supabase in an automatically generated bucket.
- The next time you start your server, the data will be downloaded from Supabase.
- Data will also be saved every 10 minutes the server is running.
- You can manually save with the cheat code SHIFT+S
- If you want to reset your world, stop the server, delete all the files in your bucket on the Supabase website, rebuild, then start your server.

**DB Errors**
On the off chance you receive an error while running the server, you can always reset with the last bullet point above.

 - Running "pnpm run create your-world-name" creates a world with the name your-world-name and saves it to Supabase.
 - Running "pnpm dev your-world-name" will load the data for the world your-world-name, if it exists.
 - Data will also be saved every 10 minutes the server is running.
 - If you want to reset your world, run the create script, as it overwrites all data with that world name and creates a fresh one.
 - You can manually save with the cheat code SHIFT+G 

 **DB Errors**
 On the off chance you receive an error while running the server, you can always reset with the last bullet point above.

### Database Setup for New Worlds

To add new worlds and assign characters to the correct world, run the following SQL commands in Supabase:

#### 1. Add New Worlds
Insert the `world_id` and corresponding `ably_api_key` for the worlds you're adding:

```sql
INSERT INTO worlds (world_id, ably_api_key) 
VALUES ('fire-world', 'your_ably_api_key');

INSERT INTO worlds (world_id, ably_api_key) 
VALUES ('water-world', 'your_ably_api_key');
```
Your ably_api_key is the same across worlds so you can use the same one that you are already using for test-world.

#### 2. Assign Characters to Worlds
Set the current_world_id for the character to ensure they are in the correct world.
See the id column in your worlds table for the corresponding id.
To assign a character to the Fire World:

```sql
UPDATE characters
SET current_world_id = 'id' -- fire-world
WHERE character_id = 'your_current_character_id';
```

To assign a character to the Water World (world_id = 3):
```sql
UPDATE characters
SET current_world_id = 'id' -- water-world
WHERE character_id = 'your_current_character_id';
```

#### 3. Notes

- Replace `'your_ably_api_key'` with your ably api key. The ably api key should be the same across worlds.
- Replace `'your_current_character_id'` with the specific character's ID that you are using. You can find this by running the game and checking the `auth-server` terminal output, where you’ll see a message like `Player joined! 1f238661-9a4a-4d1a-92e6-9178f76f6dba`. This is the `character_id` for the player that joined.


## LLM Setup (OPTIONAL)

**1. Download Ollama**

- Download Ollama from [this site](https://ollama.com/download)

**2. Run Bash Command**

- Run `ollama run deepseek-r1:1.5b` in your terminal

**3. Make a Redis Account**

- Make a Redis Account at [this link](https://redis.io/)

**4. Create a Database**

- Click Cache
- Choose the Essentials package for $0
- Choose 30MB
- Create database

**5. Create `.env` files**

- Open the `.env` file in the **server package**
- Navigate to your database and find the public endpoint. This contains the REDIS_HOST and REDIS_PORT
- In your `.env` file add the following lines:

LLM_FLAG=true

REDIS_HOST=

REDIS_PORT=

REDIS_PASSWORD=

- Fill in the REDIS_HOST with the first half of the public endpoint (everything before the colon)
- Fill in the REDIS_PORT with the second half of the public endpoint (everything after the colon)
- Scroll down and click on the **Security** tab
- Copy the password and paste it into the REDIS_PASSWORD
- Create a new `.env` file in the **llm package**
- Add the REDIS_PORT, REDIS_HOST, and REDIS_PASSWORD to the `.env` file in the **llm package**
- Open Ollama
- In packages/llm run `npx ts-node src/redisWorker.ts`
