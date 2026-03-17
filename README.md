# Game Agent Decision Engine

A reusable, self-hosted, game-agnostic AI decision engine for moddable games.

This project is **not SaaS**. A developer downloads it, runs it locally or on their own server, and connects their game to it through a small adapter layer.

The engine is meant to handle the **decision-making layer** for NPCs, bots, survivors, companions, enemies, civilians, or any other game agents. The game itself still owns sensing, movement, combat execution, navigation, animation, and all low-level mechanics.

## What this engine is for

Use this engine when you want a game agent to:

- react to danger in a believable way
- make higher-level survival or tactical decisions
- factor in needs like food, water, safety, or health
- maintain lightweight memory over time
- reuse the same decision logic across multiple games

This engine is designed to be generic. It should work with survival games, shooters, sandbox games, simulators, or any moddable title where you can collect agent state and execute returned decisions.

## Core design idea

Keep this split clean:

- **Your game adapter senses and executes**
- **This service interprets and decides**

In practice, that means:

### Your game code should handle

- reading world state from the game
- detecting nearby enemies, players, creatures, events, loot, cover, etc.
- converting that into `UniversalAgentState`
- pathfinding and movement
- aiming, shooting, melee, door use, animation, inventory interaction
- final safety checks before executing any returned decision
- interrupting a current plan when the in-game situation changes suddenly

### This service should handle

- threat and need assessment
- fast local reaction recommendations via `/react`
- slower strategic replanning via `/decide`
- memory updates via `/reflect`
- LLM-assisted high-level planning when appropriate

## Included

- `POST /evaluate` — deterministic threat / need / combat assessment
- `POST /react` — fast deterministic reflex / tactical recommendation
- `POST /decide` — deterministic or hybrid strategic plan generation
- `POST /reflect` — write memory events and create/update long-term summaries
- SQLite-backed memory store
- strict Zod schemas
- TypeScript project structure designed for self-hosted use and local modification

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Health check:

```bash
curl http://localhost:8787/health
```

## Ollama quick setup

This project can talk to either OpenAI or a local Ollama server by changing env vars.

### Run with Ollama

If Ollama is not already running:

```bash
ollama serve
```

In another terminal:

```bash
ollama pull qwen2.5:7b-instruct
```

Then use the included `.env` / `.env.example` values and start the app:

```bash
npm run dev
```

### Confirm the real model path is being used

- Check startup logs for `provider`, `modelName`, and `baseURL`.
- Hit `GET /health` and confirm it reports the Ollama provider.
- Call `POST /decide` and look for logs beginning with `[llm] attempting`.
- Successful strategic LLM decisions append `source:openai` to `constraints` because the OpenAI SDK is used against an OpenAI-compatible endpoint. Fallback decisions append `source:fallback`.
- Fast `/react` responses append `source:react`.

## SQLite persistence

By default the engine uses a file-based SQLite database so memory survives restarts:

```env
DB_PATH=./data/agent-memory.sqlite
```

That is the recommended default for real integrations because `/reflect` and long-term summaries are only really useful if they persist between runs.

If you want a fully ephemeral test run instead, set:

```env
DB_PATH=:memory:
```

In memory mode, all stored events and long-term summaries disappear when the process exits.

## Engine modes

Set `ENGINE_MODE` in `.env`:

- `deterministic` — rules + scoring only
- `hybrid` — deterministic scoring + LLM-assisted strategic planning

## High-level integration guide for game developers

A developer integrating this engine into a game should think in terms of an **adapter**.

Your adapter is the thin layer that sits between your game and this service.

### At a high level, the adapter does 4 things

1. **Collect state** from the game
2. **Normalize it** into `UniversalAgentState`
3. **Call the service** at the right times
4. **Translate the returned decision** into in-game behavior

That’s the whole pattern.

## Recommended integration flow

### Step 1: Decide what stays inside the game

Do **not** try to make this service control every tiny action.

Your game should still own:

- movement and pathfinding
- cover usage implementation
- shooting and melee implementation
- interaction with doors, containers, inventory, UI, vehicles, etc.
- animation state
- hard safety rules and legality checks

This service should return the **high-level action**, not the exact button presses.

Example:

- engine returns `AVOID_ENTITY`
- your game code decides how to run away, where cover is, what route to take, and whether sprinting is allowed

### Step 2: Build a `UniversalAgentState` payload

Your game must translate its own data into the engine’s generic schema.

That usually means mapping your game’s concepts into fields like:

- `agent` — identity, archetype, personality traits
- `body` — health, stamina, hunger, thirst, bleeding, fatigue
- `equipment` — weapons, food, medical, tools, clothing
- `environment` — biome, weather, light, visibility, cover, noise
- `positionContext` — region type, safety rating, nearby points of interest
- `perception` — nearby entities and recent events
- `memory` — short-term and long-term memory strings
- `capabilities` — what the agent can actually do in this game
- `actionSpace` — what actions are legal for this specific agent right now
- `currentPlan` — what the agent is already doing and how long it has been doing it

The better your payload, the better the engine’s decisions.

### Step 3: Call the right endpoint for the situation

Use each endpoint for a different purpose.

#### `POST /evaluate`
Use when you want a deterministic assessment only.

Good for:
- debugging
- telemetry
- tuning threat and need scoring
- visualizing what the engine thinks without asking for a decision

#### `POST /react`
Use for **fast local reflex/tactical behavior**.

Good for:
- immediate danger
- hiding
- quick disengagement
- urgent healing
- close-range tactical reactions

Call this frequently or on high-signal events.

Typical triggers:
- enemy spotted nearby
- gunshots heard nearby
- hostile creature closes distance
- bleeding starts
- cover is lost
- a tactical plan is interrupted

#### `POST /decide`
Use for **strategic planning**.

Good for:
- finding food or water
- deciding whether to explore, retreat, hide, engage, or observe
- choosing longer-horizon behavior for the next several seconds
- personality-driven or memory-influenced choices

Do **not** spam this every frame or every second unless you truly need to.

Typical triggers:
- no current plan
- plan expired
- plan completed
- plan failed
- needs changed meaningfully
- world state changed enough to require a new strategy

#### `POST /reflect`
Use after important events to write memory.

Good examples:
- agent was ambushed at a location
- agent found food in a type of structure
- a target was friendly or hostile
- an engagement succeeded or failed badly
- a route or region proved dangerous

## Recommended update cadence

This engine works best with a layered approach.

### Fast loop inside your game
Your game should still run its own immediate logic at normal game speed.

Examples:
- taking damage
- moving to cover
- reloading
- dodging
- responding to melee range danger

### Suggested service cadence

- `/react`: every 250ms–1000ms, or only on meaningful events
- `/decide`: every 10–30 seconds, or when replanning is needed
- `/reflect`: event-driven only

The exact numbers depend on your game.

## How to map returned decisions into your game

This service returns generic decisions like:

- `MOVE_TO_POINT`
- `LOOT_NEARBY_STRUCTURE`
- `HIDE`
- `AVOID_ENTITY`
- `ENGAGE_TARGET`
- `HEAL_SELF`
- `SEARCH_FOR_FOOD`
- `SEARCH_FOR_WATER`
- `OBSERVE_AREA`
- `RETREAT`
- `INTERACT`
- `CRAFT`

Your adapter should interpret those in the context of your game.

### Example mapping

`AVOID_ENTITY` might mean:
- pick nearby cover
- move away from last known hostile direction
- keep line of sight broken
- do not fire unless directly threatened

`LOOT_NEARBY_STRUCTURE` might mean:
- choose the nearest safe searchable structure
- enter it
- search containers or loot points
- stop if danger spikes

`HEAL_SELF` might mean:
- move to safety first
- use your game’s healing item or animation
- block healing if the agent is still under active attack

The service gives the **intent**. Your game implements the **how**.

## Capabilities and action space matter

Two of the most important fields are:

- `capabilities`
- `actionSpace`

Use them to prevent bad decisions before they happen.

Examples:

- if the agent cannot craft in your game, set `canCraft: false`
- if an injured animal cannot use weapons, set `canUseWeapons: false`
- if a current state makes looting impossible, do not include `LOOT_NEARBY_STRUCTURE` in `actionSpace`

This keeps the engine grounded in what is actually possible.

## Validate decisions in the game too

Even though this service validates output, your game should still perform final runtime checks before execution.

Examples:

- target point is still reachable
- target still exists
- structure is still valid to loot
- healing item is still available
- weapon is still equipped
- cover still exists
- decision is still safe in the current frame

Treat the returned decision as a **recommended action**, not an unquestionable command.

## Handle interrupts locally

A strategic plan should be interruptible.

Example:

- current plan says `SEARCH_FOR_FOOD`
- suddenly an armed hostile appears nearby
- your game should stop the current plan and call `/react`
- once the danger passes, you can resume the current plan or ask `/decide` for a new one

This is a big part of making agents feel responsive.

## Keep payloads concise and relevant

Do not dump your whole game state into the service.

Prefer:
- the most relevant nearby entities
- recent high-signal events
- short memory summaries
- the current plan summary
- only the capabilities and actions that matter right now

This helps both deterministic logic and LLM-assisted planning.

## A simple implementation pattern

At a high level, many developers will use something like this:

1. Game detects current agent state
2. Adapter builds `UniversalAgentState`
3. On immediate risk, call `/react`
4. Otherwise, keep executing current plan
5. When a plan becomes stale, invalid, or complete, call `/decide`
6. Execute the returned decision in-game
7. On important outcomes, call `/reflect`

## Example curl

```bash
curl -X POST http://localhost:8787/decide \
  -H 'Content-Type: application/json' \
  --data @examples/agent-state.json
```

## Example developer checklist

When integrating into a new game, make sure you have:

- a way to gather agent state from the game
- a mapper to convert it into `UniversalAgentState`
- a runtime executor that can translate generic decisions into game-specific actions
- a place to call `/react` for immediate danger
- a place to call `/decide` for strategic replanning
- a place to call `/reflect` after major events
- local guards that reject impossible or unsafe actions

## Suggested project structure on the game side

A game-specific adapter often ends up looking something like:

```text
my-game/
  adapter/
    collectState.*
    mapToUniversalAgentState.*
    callEngine.*
    translateDecision.*
    executeDecision.*
    writeReflection.*
```

The exact language and file structure are up to you.

## Endpoints

### `POST /evaluate`
Returns interpreted scores from a raw agent state.

### `POST /react`
Returns a fast deterministic reaction when immediate local action is more appropriate than slow strategic planning.

### `POST /decide`
Returns a validated high-level plan using:
- deterministic mode
- hybrid mode (deterministic + LLM-assisted strategic planning)

### `POST /reflect`
Stores new memory events and refreshes a simple long-term summary.

## Suggested next steps

1. Build a game-specific adapter for your target game.
2. Start with `/evaluate` and `/react` first so you can tune state mapping and immediate behavior.
3. Add `/decide` only after you have stable in-game execution of returned decisions.
4. Add `/reflect` after you know which events are worth remembering.
5. Tune payload size, capability flags, and action space for your game.
6. Only then start tuning prompts or model choice.

## Final note

This engine is intended to be a reusable, downloadable decision layer that developers run themselves. It is not meant to replace the core runtime logic inside a game. The strongest integrations will keep fast action logic in the game and use this engine for interpretation, reaction recommendations, strategic planning, and memory.

This is currently experimental and we welcome pull requests from developers for additions and fixes. You can also post in the issues section if you run into any problems or have any feature requests.
