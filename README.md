<p align="center">
  <h1 align="center">The Architect</h1>
  <p align="center">
    <strong>A Claude Code meta-agent that designs complete software blueprints.</strong>
  </p>
  <p align="center">
    Describe what you want to build. Get a complete blueprint. Let Claude Code build it for you.
  </p>
  <p align="center">
    <a href="https://tododeia.com">tododeia.com</a> &middot;
    <a href="#english">English</a> &middot;
    <a href="#español">Español</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/Hainrixz/the-architect/releases/latest"><img src="https://img.shields.io/github/v/release/Hainrixz/the-architect?sort=semver&style=for-the-badge&label=release&color=blueviolet" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/Claude_Code-Plugin-blueviolet?style=for-the-badge" alt="Claude Code Plugin" />
  <img src="https://img.shields.io/badge/Blueprints-Markdown-blue?style=for-the-badge" alt="Markdown Blueprints" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/by-tododeia.com-black?style=for-the-badge" alt="by tododeia.com" />
</p>

---

# English

## What is The Architect?

Imagine you want to build a house. Before anyone picks up a hammer, you need a **blueprint** — a detailed plan that shows every room, every wall, every pipe, and every wire. Without it, the builders wouldn't know what to do.

**The Architect does this for software.**

```
You describe it     →  "a SaaS for restaurant reservations, team accounts, Stripe"
The Architect designs it  →  interviews you, picks the stack, writes the blueprint
Claude Code builds it     →  reads the blueprint, ships the project step by step
```

It does **not** write application code. It designs systems and produces blueprints — self-contained markdown files that a *different* Claude Code instance, with zero prior context, can build from without asking you a single question.

---

## Install

### Plugin (recommended)

Two commands, inside any Claude Code session:

```
/plugin marketplace add Hainrixz/the-architect
/plugin install the-architect@soyenriquerocha
```

Then type `/architect` — **in any directory**. Your blueprints are written to `./blueprints/` in whatever folder you're working in, never inside the plugin.

### Clone (still works, exactly as in v1)

```bash
git clone https://github.com/Hainrixz/the-architect.git
cd the-architect
claude
```

Claude Code reads `CLAUDE.md` and becomes The Architect. Same interview, same gates, same output — blueprints land in `./blueprints/` inside the clone. The slash commands and subagents are plugin-only; clone mode runs the same flow conversationally.

**Prerequisites:** [Claude Code](https://claude.com/claude-code) and a Claude subscription. Nothing else.

### Pick your path: quick or full

There are two entry points, and the difference is real. Choose before you start.

| | [`/architect-quick`](commands/architect-quick.md) | [`/architect`](commands/architect.md) |
|---|---|---|
| **Questions** | 3, in one message | 12–16, across 6–7 messages |
| **How long, end to end** | ~10 minutes | ~40–60 minutes |
| **Use it when** | You already know the stack, or the build is small and you mostly want the plan written down | You intend to hand the result to an autonomous builder and walk away |
| **What you give up** | Smart defaults for everything you weren't asked | Nothing — but it costs you an hour |
| **What you keep** | Both gates, EARS acceptance criteria, verify commands, the confirmation gate | Same |

Quick mode is genuinely faster than v1's default — three questions, one message, defaults stated out loud so you can veto them. Full mode is the one to use when nobody will be around to answer the builder's questions later.

---

## How it works

Four phases. You talk, it designs, it generates.

| Phase | What happens | What you do |
|---|---|---|
| **1. Discovery** | 2–3 questions. Classifies your project into one of **14 shapes**, and asks first whether this is new code or existing code. | Answer |
| **2. Deep dive** | Shape-specific questions. Picks the runtime track and the capabilities. The `stack-researcher` subagent verifies every version against the live registries. | Answer 3–5 |
| **3. Architecture** | One dense message: stack table, how it fits together, what v1 includes and what it explicitly excludes, rough build phases. **Both gates run here.** | Confirm or adjust |
| **4. Generate** | Picks bundle or single file from the step count and says which. Then: `blueprint-writer` composes, `blueprint-validator` audits until it returns PASS, files are written to `./blueprints/`. | Wait |

### How long Phase 4 takes: 20–30 minutes, silently

This is the part nobody warns you about, so here it is up front. Once you confirm the architecture, generation runs **roughly 20–30 minutes for a bundle, 10–15 for a single file**, and produces no output until it is finished. That time is real work — a live registry call for every version pin, a full composition pass, and at least one validator round trip — but from your side it looks like nothing happening.

The Architect is required to tell you the estimate before it starts. If it doesn't, that's a bug. Go make coffee; what comes back is a file path and the first command to run.

### The two gates (new in v2)

Phase 4 does not run until both pass. Neither is optional.

**Gate A — zero `[NEEDS CLARIFICATION]` markers.** Before presenting anything, The Architect scans its own draft and emits a marker for every decision still underspecified — scope boundaries, delete semantics, who can see whose data, who owns the API keys. Each marker is closed one of three ways: you answer it, you confirm a stated default, or it becomes an explicit Non-Goal. Entering generation with an open marker is forbidden.

> The failure it prevents: a blueprint that *reads* as complete because the gaps were quietly filled with plausible guesses, and a builder agent that implements the guess at 2am with nobody to ask.

**Gate B — adversarial pre-mortem.** Eight angles aimed at killing the plan before it's generated: false assumptions, market, competition, viability, unit economics, execution, the six-months-out obituary, and the blind spot nobody in the conversation is looking at. The 3–7 findings that survive their own rebuttal become Risk Register entries or Non-Goals. If one invalidates the architecture, it goes back to redesign instead of shipping as a "risk". Uses `/abogado-del-diablo` when installed; runs inline otherwise — the gate is mandatory, only the tooling is optional.

---

## What you get

A blueprint with **20 fixed sections**. Section 9, the build order, is what the other 19 exist to support.

**Every build step carries four fields: `Do`, `Done when`, `Verify`, `Checkpoint`.** This is the anti-drift fix. In v1, steps had no definition of done — so an autonomous builder had no stopping condition, over-built, and declared victory on work that never ran.

Here's one real step, abridged from the worked example in [`templates/blueprint-template.md`](templates/blueprint-template.md):

````markdown
#### Step 7 — Stripe checkout and subscription webhook

**Do**
Wire paid signup end to end. Create:
- `src/lib/stripe.ts` — the SDK client, reading `STRIPE_SECRET_KEY`
- `src/app/api/checkout/route.ts` — creates a Checkout Session for the signed-in user
- `src/app/api/webhooks/stripe/route.ts` — signature-verified receiver, raw-body parsing
- `src/lib/billing/sync-subscription.ts` — the single writer to `subscriptions`
- migration `007_subscriptions.sql` — `subscriptions` + `webhook_events` (dedupe ledger)

**Done when**
- [ ] WHEN a POST arrives at `/api/webhooks/stripe` with an invalid `Stripe-Signature` header THE SYSTEM SHALL respond `400` and write zero rows to `subscriptions`.
- [ ] WHEN `checkout.session.completed` is received for a known customer THE SYSTEM SHALL upsert exactly one `subscriptions` row with `status='active'` and a non-null `current_period_end`.
- [ ] WHEN the same Stripe event `id` is delivered twice THE SYSTEM SHALL return `200` both times and leave the `subscriptions` row count unchanged.
- [ ] WHEN `STRIPE_WEBHOOK_SECRET` is unset at boot THE SYSTEM SHALL fail startup with a named error, not serve traffic that silently accepts unsigned payloads.

**Verify**
```bash
pnpm test src/app/api/webhooks/stripe          # expect: 6 passed, 0 skipped
pnpm typecheck                                  # expect: exit 0

stripe listen --forward-to localhost:3000/api/webhooks/stripe &
stripe trigger checkout.session.completed
psql "$DATABASE_URL" -c \
  "select status, count(*) from subscriptions group by status;"
# expect: active | 1

stripe trigger checkout.session.completed       # same fixture, replayed
psql "$DATABASE_URL" -c "select count(*) from subscriptions;"
# expect: 1  (idempotent — not 2)
```

**Checkpoint**
```bash
git add -A && git commit -m "step 7: stripe checkout + subscription webhook"
git tag step-07-billing
# rollback target if step 8 goes wrong: git reset --hard step-07-billing
```
````

Acceptance criteria use EARS form — **WHEN** `<trigger>` **THE SYSTEM SHALL** `<observable response>`. "It looks right", "billing works", "is wired up" are banned; the validator fails a blueprint that contains them. Every criterion must be decidable by a script, today, without leaving the machine. Anything that genuinely needs a human or a store review queue moves to a post-build launch checklist — written down, but not a build gate.

### Output layout

**The Architect picks the mode and tells you which, in one line.** It is derived from the step count — **12 steps or more gets a bundle, 11 or fewer gets a single file** — because packaging is a consequence of the design, not a question worth interrupting you for. Say so at any point and your preference wins instead. Both land under `./blueprints/` in your working directory, and both carry identical acceptance criteria and verify commands.

**Bundle** — for parallel builders, multi-week builds, or resumable state:

```
./blueprints/<project-slug>/
├── blueprint.md          # the 20-section narrative artifact
├── tasks.json            # the machine-readable task DAG
├── epics/
│   ├── 01-<name>.md
│   └── 02-<name>.md
└── workspace/            # copied INTO the target project root by the builder
    ├── CLAUDE.md
    ├── AGENTS.md
    └── .claude/
        ├── settings.json
        ├── skills/<name>/SKILL.md
        └── rules/<name>.md
```

`workspace/` exists so the builder copies **one directory** into the project root — `cp -R workspace/. <project-root>/` and the agent configuration is in place.

**Single file** — one builder, a build measured in days, nothing to resume:

```
./blueprints/<project-slug>-blueprint.md
```

Everything inline. One file to send, paste, or commit anywhere.

---

## The 14 shapes

v1 had 6 archetypes. v2 has 14 shapes, and they're stack-agnostic — a shape describes *what a thing is*, never what it's written in.

| Shape | What it covers | Default track | |
|---|---|---|---|
| [SaaS Web Application](knowledge/shapes/saas-webapp.md) | Sign up, log in, manage something that's yours. The default web shape. | TypeScript / Node | |
| [Marketing / Content Site](knowledge/shapes/marketing-site.md) | Landing pages, portfolios, docs. Content-first, near-zero client JS. | TypeScript / Node | |
| [Mobile App](knowledge/shapes/mobile-app.md) | App Store / Play Store, release trains, platform review. | Mobile native | |
| [API / Backend Service](knowledge/shapes/api-backend.md) | Headless, consumed over the network by other software or agents. | TypeScript / Node | |
| [Internal Tool / Admin Dashboard](knowledge/shapes/internal-tool.md) | CRUD and charts for a known authenticated team. Never public. | TypeScript / Node | |
| [Content & Community Platform](knowledge/shapes/content-community-platform.md) | Content plus identity plus a social graph. Publications, memberships, courses. | TypeScript / Node | *renamed* |
| [Agent App](knowledge/shapes/agent-app.md) | The model *is* the product. Prompt → tool → trace → eval, not CRUD. | TypeScript / Node | **new** |
| [Generative Media App](knowledge/shapes/generative-media-app.md) | Credit-metered async generation — headshots, ad reels, voice, music, 3D. | TypeScript / Node | **new** |
| [E-commerce Storefront](knowledge/shapes/ecommerce-storefront.md) | Browse, cart, checkout, pay, fulfil, return. | TypeScript / Node | **new** |
| [CLI / Library / MCP Server](knowledge/shapes/cli-library-mcp.md) | The consumer is a developer or an agent. An API surface plus a distribution channel. | Go | **new** |
| [Browser Extension](knowledge/shapes/browser-extension.md) | Lives inside the browser, augments pages the user already visits, ships through store review. | TypeScript / Node | **new** |
| [Desktop App](knowledge/shapes/desktop-app.md) | Signed, self-updating, owns its local data, touches the filesystem and OS permissions. | TypeScript / Node | **new** |
| [Automation / Bot / Integration](knowledge/shapes/automation-bot-integration.md) | A trigger fires, work runs, a result lands elsewhere — and it survives failure unattended. | TypeScript / Node | **new** |
| [Data Pipeline & Analytics](knowledge/shapes/data-pipeline-analytics.md) | Move data out, reshape it, put answers in front of a named human on a schedule. | Python | **new** |

Ambiguous brief? It names the two candidates, says which it would pick and why, and asks the one question that decides it.

---

## The 3-axis knowledge split

**This is the intellectual core of v2.** v1 hardcoded its stack into 13 separate files — every archetype carried its own table of frameworks and versions. Refreshing one library meant editing thirteen files, so nobody did, and the knowledge base went stale in four months. v2 separates three orthogonal questions so a refresh edits **one file**, and a subagent verifies the numbers live at design time anyway.

| Axis | Directory | Answers | Version pins? |
|---|---|---|---|
| **Shape** | [`knowledge/shapes/`](knowledge/shapes/) (14) | *What is it?* | **Never** |
| **Runtime track** | [`knowledge/runtime-tracks/`](knowledge/runtime-tracks/) (5) | *What is it written in?* | **Yes — only here** |
| **Capability** | [`knowledge/capabilities/`](knowledge/capabilities/) (18) | *What does it do?* | **Never** |

A shape says "the project's ORM" and links to its track. Only the track names a package and a number. And even the track is treated as a **cache, not a source of truth**: the `stack-researcher` report produced in *this* session outranks it, always. A stale cached pin never overrides a live registry check.

### The three subagents

| Agent | Job |
|---|---|
| [`stack-researcher`](agents/stack-researcher.md) | Resolves every version against authoritative registries before it's written. Flags prereleases, unmaintained packages, and anything it could not verify. **The anti-staleness fix.** |
| [`blueprint-writer`](agents/blueprint-writer.md) | Composes and writes the deliverable in isolated context, so a long generation doesn't flood the interview thread. |
| [`blueprint-validator`](agents/blueprint-validator.md) | Adversarially audits the finished blueprint and returns PASS or FAIL with line references. Nothing is presented to you until it passes. |

If a version cannot be verified, the blueprint says *"verify before install"* rather than guessing. An honest gap beats a wrong pin.

---

## Commands

| Command | What it does |
|---|---|
| [`/architect`](commands/architect.md) | Full interview — four phases, both gates, validator-gated output |
| [`/architect-quick`](commands/architect-quick.md) | Fast-track: three questions, smart defaults, **same** confirmation gate |
| [`/architect-brownfield`](commands/architect-brownfield.md) | Design a change against an existing codebase |
| [`/architect-next`](commands/architect-next.md) | Resume a build — reads `tasks.json`, prints the next unblocked task with its criteria and verify command |
| [`/architect-refresh`](commands/architect-refresh.md) | Re-verify every pin in an existing blueprint against live registries; report what moved and what breaks |
| [`/architect-audit`](commands/architect-audit.md) | Re-run the validator over an existing blueprint or bundle |

`/architect-next` is what lets a long build survive across sessions: a fresh context with no memory gets one question answered — *what do I do next, and how do I know when it's done?*

---

## Brownfield: it works on code that already exists

Most coding-agent work is not greenfield. `/architect-brownfield` reads a repo and emits a blueprint for a **change** — a feature, a refactor, an integration, or a migration.

It starts with a Phase 0 that doesn't exist in the greenfield flow: **map the repo before asking anything.**

| What it reads | Where |
|---|---|
| Runtime track | Package manifest + lockfile, language version files, container base image |
| Framework and topology | Entry points, routing directory, server/client split, workspace layout |
| Conventions | Naming, module boundaries, error handling, the linter config that's actually enforced |
| Data layer | Migrations, schema files, ORM usage sites |
| Test setup | Runner, location, naming, coverage floor |
| CI and deploy | Workflow files, deploy config, env var surface |
| Existing agent instructions | `CLAUDE.md` / `AGENTS.md` — **these outrank the plugin's defaults** |

Then it prints a Repo Map and asks you to correct anything it read wrong. Your correction is cheaper than its assumption.

Standing rules: it never proposes rewriting working code you didn't ask it to touch, and your repo's conventions beat this plugin's defaults. Migrations additionally get a parity-and-cutover section with a shadow-run diff, abort criteria, and a decommission plan.

---

## Companion skills

All optional. If one isn't installed, The Architect falls back to its own knowledge base or built-in `WebSearch`/`WebFetch`, says so in one line, and keeps going. It never blocks generation on a missing skill.

**A leading `/` means it really is a slash command. No slash means it auto-activates — writing it with a slash is a silent no-op.**

### Used *by* The Architect, during design

| Skill | What it adds | Install |
|---|---|---|
| `/last30days` | What people actually said about a stack or niche **this month** | `/plugin marketplace add mvanhorn/last30days-skill` |
| `ui-ux-pro-max` | The concrete visual system — palette hexes, type scale, component style | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`<br>`/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` |
| `emil-design-eng` | Motion and interaction — easing, duration budgets, enter/exit behavior | `npx skills@latest add emilkowalski/skills` |
| `agent-browser` | Reference-site analysis, any URL → clean markdown | `npm install -g agent-browser` |
| `browser-harness` | Escalation: drives your **real logged-in Chrome** when the reference site needs auth | Paste the setup prompt from [the repo README](https://github.com/browser-use/browser-harness) |
| `find-skills` | Discovers installable build-phase skills to name in the blueprint | `npx skills add vercel-labs/skills --skill find-skills -g` |
| `pdf` | Reads client-supplied spec PDFs, RFPs, brand guides during discovery | `/plugin marketplace add anthropics/skills`<br>`/plugin install document-skills@anthropic-agent-skills` |

### Recommended *in* the blueprint, for the builder

| Skill | Recommended for | Install |
|---|---|---|
| `frontend-design` | Any project with a UI | `/plugin marketplace add anthropics/skills`<br>`/plugin install example-skills@anthropic-agent-skills` |
| `playwright-cli` | E2E testing | `npm install -g @playwright/cli@latest`<br>`playwright-cli install --skills` |
| `/claude-seo-ai:audit` `:geo` `:fix` `:score` | Public-facing surfaces — classic SEO **and** being citable by AI answer engines | `/plugin marketplace add Hainrixz/claude-seo-ai`<br>`/plugin install claude-seo-ai@claude-seo-ai` |
| `/humanizalo` | Marketing copy and written content (EN/ES) | `git clone https://github.com/Hainrixz/humanizalo.git ~/.claude/skills/humanizalo` |

Every recommended skill goes into blueprint Section 18 **with its install command** — naming a skill the builder can't install breaks the self-contained promise.

Full registry with licenses, star counts, and fallbacks: [`knowledge/skills-registry.md`](knowledge/skills-registry.md).

---

## Project structure

```
the-architect/
├── .claude-plugin/
│   ├── plugin.json                # plugin manifest
│   └── marketplace.json           # marketplace: soyenriquerocha
├── CLAUDE.md                      # clone-mode entrypoint
├── skills/architect/SKILL.md      # plugin-mode entrypoint — the state machine
├── commands/                      # 6 slash commands
├── agents/                        # 3 subagents
├── knowledge/
│   ├── shapes/                    # 14 — what it is        (no version pins)
│   ├── runtime-tracks/            #  5 — what it's written in  (ONLY place pins live)
│   ├── capabilities/              # 18 — what it does       (no version pins)
│   ├── skills-registry.md         # skill names, install commands, fallbacks
│   └── stack-compatibility.md     # known-bad combinations, cross-axis
├── questions/                     # the single source for the interview flow
│   ├── phase-1-discovery.md
│   ├── phase-2-branches.md
│   ├── phase-3-confirmation.md
│   └── phase-4-generate.md
└── templates/
    ├── blueprint-template.md      # the 20-section output skeleton
    ├── claude-md-template.md      # CLAUDE.md for the target project
    ├── tasks-schema.md            # tasks.json field contract
    └── epic-template.md           # epic file format
```

**Runtime tracks:** `ts-node.md` · `python.md` · `go.md` · `rails-laravel.md` · `mobile-native.md`

**Capabilities:** `auth` · `database` · `deployment` · `api-design` · `frontend-architecture` · `testing` · `styling` · `state-management` · `ai-llm-integration` · `agent-loop` · `credit-metering` · `payments-rails` · `realtime-voice` · `sync-and-collab` · `availability-engine` · `enterprise-readiness` · `accessibility` · `observability`

`questions/` is the single source for the interview. `CLAUDE.md` reads it by relative path; `skills/architect/SKILL.md` reads the same files via `${CLAUDE_PLUGIN_ROOT}/questions/…`. Nothing is duplicated.

---

## Upgrading from v1

Nothing breaks. Your v1 blueprints are still markdown and still build. But the repo moved.

| v1 | v2 |
|---|---|
| `knowledge/archetypes/` — 6 files, each with its own hardcoded stack table | `knowledge/shapes/` — 14 files, stack-agnostic, zero version pins |
| `knowledge/building-blocks/` — 8 decision guides | `knowledge/capabilities/` — 18 |
| Versions scattered across 13 files | `knowledge/runtime-tracks/` — 5 files, the only place a pin may appear |
| `archetypes/content-platform.md` | `shapes/content-community-platform.md` |
| Blueprints written to `output/` inside the repo | `./blueprints/` in **your** working directory |
| 16 sections | 20 sections — CLAUDE.md is now §19.1, not §15 |
| Build steps with no definition of done | `Do` + `Done when` + `Verify` + `Checkpoint` on every step |
| Clone only | Plugin **or** clone |
| No subagents, no slash commands | 3 subagents, 6 commands |

**What to actually do:**

1. **Install the plugin** (see [Install](#install)). You no longer need to `cd` into a clone to design something.
2. **Audit an old blueprint:** `/architect-audit path/to/old-blueprint.md`. It will **FAIL** — v1 blueprints have no acceptance criteria. That's expected, not a bug; the report tells you exactly which steps have no stopping condition.
3. **Un-rot the numbers:** `/architect-refresh path/to/old-blueprint.md` re-verifies every pin against the live registries and reports what moved, what breaks, and what to change. Add `--apply` to edit in place.
4. **Regenerate if it's worth it.** For anything you haven't started building, a fresh `/architect` run is faster than patching a v1 blueprint into v2 shape.

Custom archetypes you added under `knowledge/archetypes/`? Port them to `knowledge/shapes/` and strip the version numbers out into a runtime track. That's the whole migration.

---

## Contributing

Contributions welcome — open an [issue or PR](https://github.com/Hainrixz/the-architect/issues). The highest-value places to help:

- **New shapes** — a project type the 14 don't cover, in `knowledge/shapes/`
- **Capabilities** — sharper decision matrices in `knowledge/capabilities/`
- **Runtime tracks** — a new ecosystem, or a refresh of an existing track's pins
- **Translations** — the interview runs in the user's language; more coverage helps

Two rules for any PR touching `knowledge/`: **no version number outside `runtime-tracks/`**, and **every build step gets an observable "Done when".**

---

## License

MIT. See [LICENSE](LICENSE).

---

## Built by [tododeia.com](https://tododeia.com) · [@soyenriquerocha](https://github.com/Hainrixz)

---
---

# Español

## ¿Qué es The Architect?

Imagina que quieres construir una casa. Antes de que alguien agarre un martillo, necesitas un **plano** — un plan detallado que muestre cada cuarto, cada pared, cada tubería y cada cable. Sin él, los constructores no sabrían qué hacer.

**The Architect hace esto para software.**

```
Tú lo describes        →  "un SaaS de reservaciones de restaurante, cuentas de equipo, Stripe"
The Architect lo diseña →  te entrevista, elige el stack, escribe el blueprint
Claude Code lo construye →  lee el blueprint y arma el proyecto paso a paso
```

**No** escribe código de aplicación. Diseña sistemas y produce blueprints — archivos markdown autocontenidos desde los que *otra* instancia de Claude Code, sin contexto previo, puede construir sin hacerte una sola pregunta.

---

## Instalación

### Plugin (recomendado)

Dos comandos, dentro de cualquier sesión de Claude Code:

```
/plugin marketplace add Hainrixz/the-architect
/plugin install the-architect@soyenriquerocha
```

Luego escribe `/architect` — **en cualquier directorio**. Tus blueprints se escriben en `./blueprints/` de la carpeta donde estés trabajando, nunca dentro del plugin.

### Clon (sigue funcionando, igual que en v1)

```bash
git clone https://github.com/Hainrixz/the-architect.git
cd the-architect
claude
```

Claude Code lee `CLAUDE.md` y se convierte en The Architect. Misma entrevista, mismos gates, mismo resultado — los blueprints caen en `./blueprints/` dentro del clon. Los slash commands y los subagentes son exclusivos del plugin; en modo clon el flujo corre conversacionalmente.

**Prerequisitos:** [Claude Code](https://claude.com/claude-code) y una suscripción a Claude. Nada más.

### Elige tu camino: rápido o completo

Hay dos puntos de entrada y la diferencia es real. Elige antes de empezar.

| | [`/architect-quick`](commands/architect-quick.md) | [`/architect`](commands/architect.md) |
|---|---|---|
| **Preguntas** | 3, en un solo mensaje | 12–16, en 6–7 mensajes |
| **Cuánto tarda, de punta a punta** | ~10 minutos | ~40–60 minutos |
| **Úsalo cuando** | Ya sabes qué stack quieres, o el build es chico y solo quieres el plan por escrito | Vas a entregarle el resultado a un constructor autónomo y te vas a ir |
| **Qué sacrificas** | Defaults inteligentes en todo lo que no te preguntó | Nada — pero te cuesta una hora |
| **Qué conservas** | Los dos gates, criterios EARS, comandos de verificación, el gate de confirmación | Igual |

El modo rápido es de verdad más rápido que el default de v1 — tres preguntas, un mensaje, y los defaults dichos en voz alta para que puedas vetarlos. El modo completo es el que quieres cuando nadie va a estar ahí para responderle las dudas al constructor después.

---

## Cómo funciona

Cuatro fases. Tú hablas, él diseña, él genera.

| Fase | Qué pasa | Qué haces tú |
|---|---|---|
| **1. Descubrimiento** | 2–3 preguntas. Clasifica tu proyecto en uno de los **14 shapes**, y pregunta primero si es código nuevo o código existente. | Respondes |
| **2. Profundización** | Preguntas específicas del shape. Elige el runtime track y las capabilities. El subagente `stack-researcher` verifica cada versión contra los registros en vivo. | Respondes 3–5 |
| **3. Arquitectura** | Un solo mensaje denso: tabla de stack, cómo encaja todo, qué incluye v1 y qué excluye explícitamente, fases de construcción. **Aquí corren los dos gates.** | Confirmas o ajustas |
| **4. Generar** | Elige bundle o archivo único según el número de pasos y te dice cuál. Luego: `blueprint-writer` compone, `blueprint-validator` audita hasta dar PASS, los archivos se escriben en `./blueprints/`. | Esperas |

### Cuánto tarda la Fase 4: 20–30 minutos, en silencio

Esta es la parte que nadie te advierte, así que va por delante. Una vez que confirmas la arquitectura, la generación corre **unos 20–30 minutos para un bundle, 10–15 para un archivo único**, y no produce nada hasta terminar. Ese tiempo es trabajo real — una llamada en vivo al registry por cada versión, una pasada completa de composición, y al menos una vuelta del validador — pero desde tu lado se ve como si no pasara nada.

The Architect está obligado a darte el estimado antes de empezar. Si no lo hace, es un bug. Ve por un café; lo que regresa es una ruta de archivo y el primer comando que hay que correr.

### Los dos gates (nuevos en v2)

La Fase 4 no corre hasta que ambos pasen. Ninguno es opcional.

**Gate A — cero marcadores `[NEEDS CLARIFICATION]`.** Antes de presentar nada, The Architect revisa su propio borrador y emite un marcador por cada decisión aún subespecificada — límites de alcance, semántica de borrado, quién puede ver los datos de quién, quién es dueño de las API keys. Cada marcador se cierra de tres maneras: lo respondes, confirmas un default declarado, o se convierte en un Non-Goal explícito. Entrar a generación con un marcador abierto está prohibido.

> La falla que evita: un blueprint que *se lee* completo porque los huecos se rellenaron en silencio con suposiciones plausibles, y un agente constructor que implementa la suposición a las 2am sin nadie a quién preguntarle.

**Gate B — pre-mortem adversarial.** Ocho ángulos apuntados a matar el plan antes de generarlo: premisas falsas, mercado, competencia, viabilidad, economía unitaria, ejecución, el obituario a seis meses, y el punto ciego que nadie en la conversación está mirando. Los 3–7 hallazgos que sobreviven a su propia refutación se vuelven entradas del Risk Register o Non-Goals. Si alguno invalida la arquitectura, se rediseña en vez de enviarlo como "riesgo". Usa `/abogado-del-diablo` si está instalada; si no, corre inline — el gate es obligatorio, solo la herramienta es opcional.

---

## Qué obtienes

Un blueprint con **20 secciones fijas**. La Sección 9, el orden de construcción, es a lo que sirven las otras 19.

**Cada paso de construcción lleva cuatro campos: `Do`, `Done when`, `Verify`, `Checkpoint`.** Este es el arreglo contra la deriva. En v1 los pasos no tenían definición de terminado — así que un constructor autónomo no tenía condición de parada, sobre-construía, y cantaba victoria sobre trabajo que nunca corrió.

Aquí un paso real, abreviado del ejemplo trabajado en [`templates/blueprint-template.md`](templates/blueprint-template.md):

````markdown
#### Step 7 — Stripe checkout and subscription webhook

**Do**
Wire paid signup end to end. Create:
- `src/lib/stripe.ts` — the SDK client, reading `STRIPE_SECRET_KEY`
- `src/app/api/checkout/route.ts` — creates a Checkout Session for the signed-in user
- `src/app/api/webhooks/stripe/route.ts` — signature-verified receiver, raw-body parsing
- `src/lib/billing/sync-subscription.ts` — the single writer to `subscriptions`
- migration `007_subscriptions.sql` — `subscriptions` + `webhook_events` (dedupe ledger)

**Done when**
- [ ] WHEN a POST arrives at `/api/webhooks/stripe` with an invalid `Stripe-Signature` header THE SYSTEM SHALL respond `400` and write zero rows to `subscriptions`.
- [ ] WHEN `checkout.session.completed` is received for a known customer THE SYSTEM SHALL upsert exactly one `subscriptions` row with `status='active'` and a non-null `current_period_end`.
- [ ] WHEN the same Stripe event `id` is delivered twice THE SYSTEM SHALL return `200` both times and leave the `subscriptions` row count unchanged.
- [ ] WHEN `STRIPE_WEBHOOK_SECRET` is unset at boot THE SYSTEM SHALL fail startup with a named error, not serve traffic that silently accepts unsigned payloads.

**Verify**
```bash
pnpm test src/app/api/webhooks/stripe          # expect: 6 passed, 0 skipped
pnpm typecheck                                  # expect: exit 0

stripe listen --forward-to localhost:3000/api/webhooks/stripe &
stripe trigger checkout.session.completed
psql "$DATABASE_URL" -c \
  "select status, count(*) from subscriptions group by status;"
# expect: active | 1

stripe trigger checkout.session.completed       # same fixture, replayed
psql "$DATABASE_URL" -c "select count(*) from subscriptions;"
# expect: 1  (idempotent — not 2)
```

**Checkpoint**
```bash
git add -A && git commit -m "step 7: stripe checkout + subscription webhook"
git tag step-07-billing
# rollback target if step 8 goes wrong: git reset --hard step-07-billing
```
````

Los criterios de aceptación usan forma EARS — **WHEN** `<disparador>` **THE SYSTEM SHALL** `<respuesta observable>`. "Se ve bien", "el cobro funciona", "quedó conectado" están prohibidos; el validador reprueba un blueprint que los contenga. Cada criterio tiene que poder decidirlo un script, hoy, sin salir de la máquina. Lo que de verdad necesita a un humano o una cola de revisión de tienda se va a un checklist de lanzamiento post-build — queda escrito, pero no es un gate de construcción.

### Formato de salida

**The Architect elige el modo y te dice cuál, en una línea.** Lo deriva del número de pasos — **12 pasos o más va en bundle, 11 o menos en archivo único** — porque el empaquetado es consecuencia del diseño, no una pregunta que valga la pena interrumpirte. Dilo en cualquier momento y tu preferencia gana. Ambos caen bajo `./blueprints/` en tu directorio de trabajo, y ambos llevan exactamente los mismos criterios de aceptación y comandos de verificación.

**Bundle** — para constructores en paralelo, builds de semanas, o estado reanudable:

```
./blueprints/<project-slug>/
├── blueprint.md          # el artefacto narrativo de 20 secciones
├── tasks.json            # el DAG de tareas legible por máquina
├── epics/
│   ├── 01-<name>.md
│   └── 02-<name>.md
└── workspace/            # el constructor lo copia DENTRO de la raíz del proyecto
    ├── CLAUDE.md
    ├── AGENTS.md
    └── .claude/
        ├── settings.json
        ├── skills/<name>/SKILL.md
        └── rules/<name>.md
```

`workspace/` existe para que el constructor copie **un solo directorio** a la raíz del proyecto — `cp -R workspace/. <project-root>/` y la configuración del agente ya está puesta.

**Archivo único** — un constructor, un build de días, nada que reanudar:

```
./blueprints/<project-slug>-blueprint.md
```

Todo inline. Un archivo para mandar, pegar o commitear donde sea.

---

## Los 14 shapes

v1 tenía 6 arquetipos. v2 tiene 14 shapes, y son agnósticos al stack — un shape describe *qué es una cosa*, nunca en qué está escrita.

| Shape | Qué cubre | Track por defecto | |
|---|---|---|---|
| [SaaS Web Application](knowledge/shapes/saas-webapp.md) | Te registras, entras, administras algo tuyo. El shape web por defecto. | TypeScript / Node | |
| [Marketing / Content Site](knowledge/shapes/marketing-site.md) | Landings, portafolios, docs. Contenido primero, casi cero JS en cliente. | TypeScript / Node | |
| [Mobile App](knowledge/shapes/mobile-app.md) | App Store / Play Store, trenes de release, revisión de plataforma. | Mobile native | |
| [API / Backend Service](knowledge/shapes/api-backend.md) | Sin UI propia, consumido por otro software o por agentes. | TypeScript / Node | |
| [Internal Tool / Admin Dashboard](knowledge/shapes/internal-tool.md) | CRUD y gráficas para un equipo autenticado y conocido. Nunca público. | TypeScript / Node | |
| [Content & Community Platform](knowledge/shapes/content-community-platform.md) | Contenido más identidad más grafo social. Publicaciones, membresías, cursos. | TypeScript / Node | *renombrado* |
| [Agent App](knowledge/shapes/agent-app.md) | El modelo *es* el producto. Prompt → tool → trace → eval, no CRUD. | TypeScript / Node | **nuevo** |
| [Generative Media App](knowledge/shapes/generative-media-app.md) | Generación asíncrona medida por créditos — headshots, reels, voz, música, 3D. | TypeScript / Node | **nuevo** |
| [E-commerce Storefront](knowledge/shapes/ecommerce-storefront.md) | Catálogo, carrito, checkout, pago, envío, devolución. | TypeScript / Node | **nuevo** |
| [CLI / Library / MCP Server](knowledge/shapes/cli-library-mcp.md) | El consumidor es un dev o un agente. Una superficie de API más un canal de distribución. | Go | **nuevo** |
| [Browser Extension](knowledge/shapes/browser-extension.md) | Vive dentro del navegador, aumenta páginas que el usuario ya visita, pasa por revisión de tienda. | TypeScript / Node | **nuevo** |
| [Desktop App](knowledge/shapes/desktop-app.md) | Firmada, se auto-actualiza, es dueña de sus datos locales, toca el filesystem y permisos del SO. | TypeScript / Node | **nuevo** |
| [Automation / Bot / Integration](knowledge/shapes/automation-bot-integration.md) | Se dispara un evento, corre el trabajo, el resultado aterriza en otro lado — y sobrevive fallos sin supervisión. | TypeScript / Node | **nuevo** |
| [Data Pipeline & Analytics](knowledge/shapes/data-pipeline-analytics.md) | Sacar datos, reformarlos, poner respuestas frente a un humano con nombre, en horario. | Python | **nuevo** |

¿Brief ambiguo? Nombra los dos candidatos, dice cuál elegiría y por qué, y hace la única pregunta que lo decide.

---

## La división de conocimiento en 3 ejes

**Este es el núcleo intelectual de v2.** v1 tenía el stack hardcodeado en 13 archivos distintos — cada arquetipo cargaba su propia tabla de frameworks y versiones. Refrescar una librería significaba editar trece archivos, así que nadie lo hacía, y la base de conocimiento se puso rancia en cuatro meses. v2 separa tres preguntas ortogonales para que un refresh edite **un solo archivo**, y de todos modos un subagente verifica los números en vivo al momento de diseñar.

| Eje | Directorio | Responde | ¿Versiones? |
|---|---|---|---|
| **Shape** | [`knowledge/shapes/`](knowledge/shapes/) (14) | *¿Qué es?* | **Nunca** |
| **Runtime track** | [`knowledge/runtime-tracks/`](knowledge/runtime-tracks/) (5) | *¿En qué está escrito?* | **Sí — solo aquí** |
| **Capability** | [`knowledge/capabilities/`](knowledge/capabilities/) (18) | *¿Qué hace?* | **Nunca** |

Un shape dice "el ORM del proyecto" y enlaza a su track. Solo el track nombra un paquete y un número. Y hasta el track se trata como **caché, no como fuente de verdad**: el reporte de `stack-researcher` producido en *esta* sesión le gana, siempre. Un pin cacheado y viejo jamás sobrescribe una verificación en vivo del registro.

### Los tres subagentes

| Agente | Trabajo |
|---|---|
| [`stack-researcher`](agents/stack-researcher.md) | Resuelve cada versión contra registros autoritativos antes de que se escriba. Marca prereleases, paquetes sin mantenimiento, y todo lo que no pudo verificar. **El arreglo contra el desfase.** |
| [`blueprint-writer`](agents/blueprint-writer.md) | Compone y escribe el entregable en contexto aislado, para que una generación larga no inunde el hilo de la entrevista. |
| [`blueprint-validator`](agents/blueprint-validator.md) | Audita adversarialmente el blueprint terminado y devuelve PASS o FAIL con referencias de línea. No se te presenta nada hasta que pase. |

Si una versión no se puede verificar, el blueprint escribe *"verify before install"* en vez de adivinar. Un hueco honesto es mejor que un pin equivocado.

---

## Comandos

| Comando | Qué hace |
|---|---|
| [`/architect`](commands/architect.md) | Entrevista completa — cuatro fases, ambos gates, salida validada |
| [`/architect-quick`](commands/architect-quick.md) | Vía rápida: tres preguntas, defaults inteligentes, **el mismo** gate de confirmación |
| [`/architect-brownfield`](commands/architect-brownfield.md) | Diseña un cambio sobre un codebase existente |
| [`/architect-next`](commands/architect-next.md) | Reanuda un build — lee `tasks.json` y muestra la siguiente tarea desbloqueada con sus criterios y su comando de verificación |
| [`/architect-refresh`](commands/architect-refresh.md) | Reverifica cada pin de un blueprint existente contra los registros en vivo; reporta qué se movió y qué se rompe |
| [`/architect-audit`](commands/architect-audit.md) | Vuelve a correr el validador sobre un blueprint o bundle existente |

`/architect-next` es lo que permite que un build largo sobreviva entre sesiones: un contexto nuevo sin memoria obtiene la respuesta a una pregunta — *¿qué sigue, y cómo sé cuándo está terminado?*

---

## Brownfield: ahora funciona sobre código que ya existe

La mayoría del trabajo de un agente de código no es greenfield. `/architect-brownfield` lee un repo y emite un blueprint de **cambio** — una feature, un refactor, una integración o una migración.

Arranca con una Fase 0 que no existe en el flujo greenfield: **mapear el repo antes de preguntar nada.**

| Qué lee | Dónde |
|---|---|
| Runtime track | Manifiesto de paquetes + lockfile, archivos de versión de lenguaje, imagen base del contenedor |
| Framework y topología | Entry points, directorio de rutas, split servidor/cliente, layout del workspace |
| Convenciones | Nombres, límites de módulos, manejo de errores, la config del linter que de verdad se aplica |
| Capa de datos | Migraciones, archivos de esquema, sitios de uso del ORM |
| Setup de tests | Runner, ubicación, nombres, piso de cobertura |
| CI y deploy | Archivos de workflow, config de despliegue, superficie de variables de entorno |
| Instrucciones de agente existentes | `CLAUDE.md` / `AGENTS.md` — **estas le ganan a los defaults del plugin** |

Después imprime un Repo Map y te pide que corrijas lo que haya leído mal. Tu corrección sale más barata que su suposición.

Reglas permanentes: nunca propone reescribir código que funciona y que no pediste tocar, y las convenciones de tu repo le ganan a los defaults del plugin. Las migraciones además llevan una sección de paridad y cutover con diff de shadow-run, criterios de aborto y plan de decomiso.

---

## Skills complementarias

Todas opcionales. Si alguna no está instalada, The Architect usa su propia base de conocimiento o el `WebSearch`/`WebFetch` integrado, lo dice en una línea, y sigue. Nunca bloquea la generación por una skill ausente.

**Un `/` al inicio significa que sí es un slash command. Sin `/` significa que se auto-activa — escribirla con slash es un no-op silencioso.**

### Las usa The Architect, durante el diseño

| Skill | Qué aporta | Instalación |
|---|---|---|
| `/last30days` | Lo que realmente se dijo de un stack o nicho **este mes** | `/plugin marketplace add mvanhorn/last30days-skill` |
| `ui-ux-pro-max` | El sistema visual concreto — hexes de paleta, escala tipográfica, estilo de componentes | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`<br>`/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` |
| `emil-design-eng` | Movimiento e interacción — easing, presupuestos de duración, entrada/salida | `npx skills@latest add emilkowalski/skills` |
| `agent-browser` | Análisis de sitios de referencia, cualquier URL → markdown limpio | `npm install -g agent-browser` |
| `browser-harness` | Escalada: maneja tu **Chrome real con sesión iniciada** cuando el sitio pide login | Pega el prompt de setup del [README del repo](https://github.com/browser-use/browser-harness) |
| `find-skills` | Descubre skills instalables de fase de construcción para nombrarlas en el blueprint | `npx skills add vercel-labs/skills --skill find-skills -g` |
| `pdf` | Lee PDFs de especificación, RFPs y guías de marca durante el descubrimiento | `/plugin marketplace add anthropics/skills`<br>`/plugin install document-skills@anthropic-agent-skills` |

### Recomendadas en el blueprint, para quien construye

| Skill | Recomendada para | Instalación |
|---|---|---|
| `frontend-design` | Cualquier proyecto con UI | `/plugin marketplace add anthropics/skills`<br>`/plugin install example-skills@anthropic-agent-skills` |
| `playwright-cli` | Testing E2E | `npm install -g @playwright/cli@latest`<br>`playwright-cli install --skills` |
| `/claude-seo-ai:audit` `:geo` `:fix` `:score` | Superficies públicas — SEO clásico **y** ser citable por motores de respuesta IA | `/plugin marketplace add Hainrixz/claude-seo-ai`<br>`/plugin install claude-seo-ai@claude-seo-ai` |
| `/humanizalo` | Copy de marketing y contenido escrito (EN/ES) | `git clone https://github.com/Hainrixz/humanizalo.git ~/.claude/skills/humanizalo` |

Cada skill recomendada entra en la Sección 18 del blueprint **con su comando de instalación** — nombrar una skill que quien construye no puede instalar rompe la promesa de autocontención.

Registro completo con licencias, estrellas y respaldos: [`knowledge/skills-registry.md`](knowledge/skills-registry.md).

---

## Estructura del proyecto

```
the-architect/
├── .claude-plugin/
│   ├── plugin.json                # manifiesto del plugin
│   └── marketplace.json           # marketplace: soyenriquerocha
├── CLAUDE.md                      # punto de entrada en modo clon
├── skills/architect/SKILL.md      # punto de entrada en modo plugin — la máquina de estados
├── commands/                      # 6 slash commands
├── agents/                        # 3 subagentes
├── knowledge/
│   ├── shapes/                    # 14 — qué es              (sin versiones)
│   ├── runtime-tracks/            #  5 — en qué está escrito (ÚNICO lugar con versiones)
│   ├── capabilities/              # 18 — qué hace            (sin versiones)
│   ├── skills-registry.md         # nombres de skills, instalación, respaldos
│   └── stack-compatibility.md     # combinaciones conocidas como malas, entre ejes
├── questions/                     # la fuente única del flujo de entrevista
│   ├── phase-1-discovery.md
│   ├── phase-2-branches.md
│   ├── phase-3-confirmation.md
│   └── phase-4-generate.md
└── templates/
    ├── blueprint-template.md      # el esqueleto de 20 secciones
    ├── claude-md-template.md      # CLAUDE.md para el proyecto destino
    ├── tasks-schema.md            # contrato de campos de tasks.json
    └── epic-template.md           # formato de archivo de épica
```

**Runtime tracks:** `ts-node.md` · `python.md` · `go.md` · `rails-laravel.md` · `mobile-native.md`

**Capabilities:** `auth` · `database` · `deployment` · `api-design` · `frontend-architecture` · `testing` · `styling` · `state-management` · `ai-llm-integration` · `agent-loop` · `credit-metering` · `payments-rails` · `realtime-voice` · `sync-and-collab` · `availability-engine` · `enterprise-readiness` · `accessibility` · `observability`

`questions/` es la fuente única de la entrevista. `CLAUDE.md` la lee por ruta relativa; `skills/architect/SKILL.md` lee los mismos archivos vía `${CLAUDE_PLUGIN_ROOT}/questions/…`. Nada se duplica.

---

## Migrar desde v1

No se rompe nada. Tus blueprints de v1 siguen siendo markdown y siguen sirviendo para construir. Pero el repo se movió.

| v1 | v2 |
|---|---|
| `knowledge/archetypes/` — 6 archivos, cada uno con su tabla de stack hardcodeada | `knowledge/shapes/` — 14 archivos, agnósticos al stack, cero versiones |
| `knowledge/building-blocks/` — 8 guías de decisión | `knowledge/capabilities/` — 18 |
| Versiones repartidas en 13 archivos | `knowledge/runtime-tracks/` — 5 archivos, el único lugar donde puede aparecer un pin |
| `archetypes/content-platform.md` | `shapes/content-community-platform.md` |
| Blueprints escritos en `output/` dentro del repo | `./blueprints/` en **tu** directorio de trabajo |
| 16 secciones | 20 secciones — CLAUDE.md ahora es §19.1, no §15 |
| Pasos de construcción sin definición de terminado | `Do` + `Done when` + `Verify` + `Checkpoint` en cada paso |
| Solo clon | Plugin **o** clon |
| Sin subagentes, sin slash commands | 3 subagentes, 6 comandos |

**Qué hacer en concreto:**

1. **Instala el plugin** (ver [Instalación](#instalación)). Ya no necesitas hacer `cd` a un clon para diseñar algo.
2. **Audita un blueprint viejo:** `/architect-audit ruta/al/blueprint-viejo.md`. Va a dar **FAIL** — los blueprints v1 no tienen criterios de aceptación. Eso es lo esperado, no un bug; el reporte te dice exactamente qué pasos no tienen condición de parada.
3. **Desoxida los números:** `/architect-refresh ruta/al/blueprint-viejo.md` reverifica cada pin contra los registros en vivo y reporta qué se movió, qué se rompe y qué cambiar. Agrega `--apply` para editar en el lugar.
4. **Regenera si vale la pena.** Para cualquier cosa que no hayas empezado a construir, correr `/architect` de nuevo es más rápido que parchar un blueprint v1 a forma v2.

¿Tenías arquetipos propios en `knowledge/archetypes/`? Pásalos a `knowledge/shapes/` y saca los números de versión a un runtime track. Esa es toda la migración.

---

## Contribuir

Las contribuciones son bienvenidas — abre un [issue o PR](https://github.com/Hainrixz/the-architect/issues). Dónde más ayuda:

- **Nuevos shapes** — un tipo de proyecto que los 14 no cubren, en `knowledge/shapes/`
- **Capabilities** — matrices de decisión más afiladas en `knowledge/capabilities/`
- **Runtime tracks** — un ecosistema nuevo, o un refresh de los pins de un track existente
- **Traducciones** — la entrevista corre en el idioma del usuario; más cobertura ayuda

Dos reglas para cualquier PR que toque `knowledge/`: **ningún número de versión fuera de `runtime-tracks/`**, y **cada paso de construcción lleva un "Done when" observable.**

---

## Licencia

MIT. Ver [LICENSE](LICENSE).

---

## Construido por [tododeia.com](https://tododeia.com) · [@soyenriquerocha](https://github.com/Hainrixz)

# Analisis-de-eventos-e-incidentes
