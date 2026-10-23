# Runtime Track: Python

> Choose Python when the hard part of the product is data, models, or math — or when the team already lives here.

**Last verified: 2026-07-27** — every version below was checked against PyPI (`https://pypi.org/pypi/<name>/json`), python.org, and endoflife.date on this date. When refreshing this file, re-verify and update this line.

## When to choose this track

**Pick Python over the TypeScript/Node track when:**

- **ML, embeddings, or model inference is in the product path.** PyTorch, transformers, scikit-learn, and every vector-store client are Python-first. Reaching them from Node means an HTTP hop to a Python service — so just write the service in Python.
- **The work is data-shaped.** ETL, scoring, forecasting, notebook-to-production pipelines. Polars and pandas have no real Node equivalent.
- **Heavy scientific computing.** NumPy/SciPy/SymPy. Nothing else is close.
- **The team already writes Python.** A backend in a language your team debugs at 2am beats a theoretically better one they don't.
- **You need an internal tool yesterday.** Django's admin gives you a full CRUD UI over your models for free. Nothing in the JS ecosystem matches that time-to-first-useful-screen.

**Do NOT pick Python when:**

- **The frontend and backend want to share types.** This is the decisive one. With TypeScript end-to-end you get compile-time safety across the network boundary for free. In Python you regenerate an OpenAPI client and hope the CI job ran. If the product is a typed-API-plus-SPA, use `knowledge/runtime-tracks/ts-node.md`.
- **You want one deployable and one language.** A React frontend plus a Python API is two runtimes, two dependency managers, two CI paths.
- **Cold-start latency at the edge matters.** Python does not fit edge runtimes. Use the TypeScript or Go track.

## Pinned versions

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Language | CPython | 3.14.6 | Current stable (2026-06-10). 3.15 is in beta (b4), final due Oct 2026 |
| Language floor | CPython | 3.12 | Sane minimum: Django 6.0 requires ≥3.12. Never target <3.12 in new work |
| Toolchain | uv | 0.11.32 | The standard. Replaces pip + venv + pip-tools + pyenv + pipx. Still pre-1.0 (0.x) — pin the version in CI |
| Validation | pydantic | 2.13.4 | Pin `>=2.13,<3`. 2.14 is alpha-only; there is no v3 |
| Settings | pydantic-settings | 2.14.2 | Typed env config. Do not hand-roll `os.environ` reads |
| Lint + format | ruff | 0.16.0 | Replaces black, isort, flake8, pyupgrade. One tool |
| Type checker | mypy | 2.3.0 | The default. Astral's `ty` is at 0.0.64 — promising, not production |
| Tests | pytest | 9.1.1 | |
| HTTP client | httpx | 0.28.1 | Sync + async in one API |
| Logging | structlog | 26.1.0 | JSON logs out of the box |
| Errors | sentry-sdk | 2.66.1 | |
| **FastAPI sub-track** | | | |
| Framework | fastapi | 0.140.7 | Still 0.x by policy; it is production-stable and always has been |
| ASGI server | uvicorn | 0.51.0 | `granian` 2.7.9 is a faster Rust alternative — use it only if you have measured a bottleneck |
| ORM | sqlalchemy | 2.0.51 | Pin `>=2.0.51,<2.1`. **2.1 is in beta (2.1.0b3) — do not pin `^2.1`** |
| Migrations | alembic | 1.18.5 | |
| DB driver | psycopg | 3.3.4 | Postgres. Use `asyncpg` 0.31.0 only for fully-async SQLAlchemy engines |
| Async tests | pytest-asyncio | 1.4.0 | |
| Test factories | polyfactory | 3.3.0 | Generates instances from pydantic models |
| **Django sub-track** | | | |
| Framework | django | 6.0.7 | Current. 6.1 is at rc1 |
| Framework (LTS) | django | 5.2.16 | LTS, supported to 2028-04. **Pick this for anything that must not be touched for two years** |
| API layer | django-ninja | 1.6.2 | FastAPI-style, pydantic-based. Prefer over DRF for new work |
| API layer (legacy) | djangorestframework | 3.17.1 | Only when the team already knows DRF or you need its ecosystem |
| Auth | django-allauth | 65.18.0 | Social + email auth without writing it |
| Static files | whitenoise | 6.12.0 | Serve static assets from the app process; skip the CDN until you need it |
| Tests | pytest-django | 4.12.0 | Use pytest, not Django's runner |
| Test factories | factory-boy | 3.3.3 | |
| Prod server | gunicorn | 26.0.0 | With `uvicorn` workers for ASGI |
| **Background work** | | | |
| Queue | celery | 5.6.3 | The default when you need retries, scheduling, and a result backend |
| Broker | redis (client) | 8.0.1 | Redis as broker. Postgres-backed alternatives exist but Celery+Redis is the boring choice |
| **LLM SDKs** | | | |
| Anthropic | anthropic | 0.120.0 | Ships new versions weekly — pin exactly, bump deliberately |
| OpenAI | openai | 2.49.0 | Same cadence caveat |
| **Data** | | | |
| DataFrames | polars | 1.43.1 | Default for new pipelines — faster, lazy, better memory profile |
| DataFrames (legacy) | pandas | 3.0.5 | When an existing codebase or library requires it |

## Setup

```bash
# One-time: install uv (no Python needed first — it bootstraps its own)
curl -LsSf https://astral.sh/uv/install.sh | sh

# FastAPI service
uv init --python 3.14 my-api && cd my-api
uv add "fastapi[standard]==0.140.7" "pydantic==2.13.4" "pydantic-settings==2.14.2" \
       "sqlalchemy>=2.0.51,<2.1" "alembic==1.18.5" "psycopg[binary]==3.3.4" \
       "httpx==0.28.1" "structlog==26.1.0"
uv add --dev "pytest==9.1.1" "pytest-asyncio==1.4.0" "ruff==0.16.0" "mypy==2.3.0" "polyfactory==3.3.0"
uv run alembic init -t async migrations

# Django project
uv init --python 3.14 my-app && cd my-app
uv add "django==6.0.7" "django-ninja==1.6.2" "psycopg[binary]==3.3.4" \
       "whitenoise==6.12.0" "django-allauth==65.18.0" "gunicorn==26.0.0" "uvicorn==0.51.0"
uv add --dev "pytest==9.1.1" "pytest-django==4.12.0" "factory-boy==3.3.3" "ruff==0.16.0" "mypy==2.3.0"
uv run django-admin startproject config .

# Background work (either sub-track)
uv add "celery[redis]==5.6.3" "redis==8.0.1"
```

`uv add` writes `pyproject.toml` and `uv.lock`. **Commit `uv.lock`.** Never use `pip install` in a uv project — it writes outside the lock.

## Conventions

### FastAPI layout

```
src/app/
  main.py            # FastAPI() instance + router registration ONLY
  config.py          # pydantic-settings Settings class, one instance
  api/v1/            # routers, one module per resource
  schemas/           # pydantic request/response models
  models/            # SQLAlchemy declarative models
  services/          # business logic — no FastAPI imports allowed here
  db.py              # engine, session factory, get_session dependency
migrations/          # alembic
tests/
```

Rules that keep this from rotting:

- **Routers are thin.** Parse input, call a service, shape the response. Any router over ~40 lines has business logic in it — move it to `services/`.
- **`services/` must not import from `fastapi`.** This is the boundary that makes the logic testable and reusable from a Celery task or a CLI.
- **Separate the pydantic schema from the ORM model.** Never return a SQLAlchemy object from a route.
- **Async all the way down or sync all the way down.** A blocking DB call inside an `async def` route stalls the event loop. Mixing is the single most common FastAPI performance bug.
- **One `Settings` instance, imported everywhere.** No `os.getenv` scattered through the codebase.

### Django layout

```
config/              # settings/, urls.py, asgi.py, wsgi.py
apps/
  accounts/          # models.py, admin.py, api.py, services.py, tests/
  billing/
static/  templates/
```

- **Split settings into `config/settings/{base,dev,prod}.py`.** A single `settings.py` with `if DEBUG:` branches becomes unreviewable.
- **Fat models, thin views — but put multi-model workflows in `services.py`.** A model method that touches three other models belongs in a service.
- **Register everything in `admin.py`.** The admin is the reason you picked Django; a model that isn't registered is wasted leverage.
- **Custom user model from commit one.** Swapping `AUTH_USER_MODEL` after the first migration is a multi-day migration you will not want.

### Shared

- `ruff` config lives in `pyproject.toml`. Line length 100. Enable at minimum `E,F,I,UP,B,SIM`.
- Type-annotate every public function. `mypy --strict` on `services/` even if the rest is looser.
- Max ~300 lines per module. Split by domain, not by layer, once a package exceeds ~8 files.

## Testing / Lint / Build commands

| Task | Command |
|---|---|
| Install deps (dev) | `uv sync` |
| Install deps (prod) | `uv sync --frozen --no-dev` |
| Run a command in the env | `uv run <cmd>` |
| Dev server (FastAPI) | `uv run fastapi dev src/app/main.py` |
| Dev server (Django) | `uv run python manage.py runserver` |
| Tests | `uv run pytest` |
| Tests + coverage | `uv run pytest --cov=src --cov-report=term-missing` |
| Lint | `uv run ruff check .` |
| Format | `uv run ruff format .` |
| Type check | `uv run mypy src` |
| Migration: create (FastAPI) | `uv run alembic revision --autogenerate -m "add users"` |
| Migration: apply (FastAPI) | `uv run alembic upgrade head` |
| Migration: create (Django) | `uv run python manage.py makemigrations` |
| Migration: apply (Django) | `uv run python manage.py migrate` |
| Celery worker | `uv run celery -A app.worker worker -l info` |
| Celery beat | `uv run celery -A app.worker beat -l info` |
| Prod server (FastAPI) | `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| Prod server (Django) | `uv run gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker` |

## Deployment notes

- **Container is the default.** Multi-stage Dockerfile: build stage runs `uv sync --frozen --no-dev` into `/app/.venv`; runtime stage copies the venv onto a `python:3.14-slim` base. Use the official `ghcr.io/astral-sh/uv` image for the build stage.
- **Platforms that just work:** Railway, Render, Fly.io, Google Cloud Run. All detect `uv.lock`. Vercel and Cloudflare Workers do not run this track — do not promise a user they will.
- **Serverless is a poor fit.** Cold starts are seconds, not milliseconds, once you import a data or ML dependency. Run a long-lived container.
- **Workers deploy separately from the web process.** Same image, different command. Scale them independently — they have completely different load curves.
- **Migrations run as a release step, not at container start.** Two replicas booting simultaneously will both try to migrate.
- **Health check** at `/health` that touches the DB. A process that is up but cannot reach Postgres should fail the check.

## Gotchas

- **uv is pre-1.0 (0.11.x).** It is production-ready and the ecosystem default, but minor bumps have shipped behavior changes. Pin the uv version in CI (`astral-sh/setup-uv@v9` with an explicit `version: 0.11.32`), not just your dependencies.
- **SQLAlchemy 2.1 is in beta.** `2.1.0b3` shipped 2026-06-27. Pin `>=2.0.51,<2.1`. A `^2.1` or unpinned install can pull a beta.
- **Pydantic 2.14 is alpha-only.** `2.14.0a1` is the newest 2.14 artifact. Pin `>=2.13,<3` — resolvers ignore pre-releases by default, but a `--prerelease=allow` flag or a transitive dep can defeat that.
- **Django 6.0 requires Python ≥3.12.** Django 5.2 LTS accepts 3.10+. If you are stuck on an older Python, you are on 5.2, not 6.0 — and that is a fine place to be until 2028.
- **`pandas` is at 3.0 and requires Python ≥3.11.** The 2.x → 3.x jump changed copy-on-write semantics and default dtypes. If you are starting fresh, use `polars` and skip the migration entirely.
- **The `anthropic` and `openai` SDKs ship multiple releases per week.** Pin exact versions. An unpinned LLM SDK is the most likely source of a "worked yesterday" build failure in this track.
- **Never hand-write model IDs, prices, or API parameters for Claude.** Invoke the bundled `claude-api` skill before writing any LLM call. It is authoritative and current; your memory is not.
- **Celery 5.x on Windows is unsupported.** If any developer is on Windows, they need WSL2 or a devcontainer.
- **`pytest-asyncio` 1.x changed the default loop scope.** Set `asyncio_mode = "auto"` in `pyproject.toml` or every async test silently skips.
- **Django's `runserver` is not a production server.** It is single-threaded and has no timeout handling. Gunicorn with uvicorn workers, always.
- **`ty` (Astral's type checker) is at 0.0.64.** Watch it; do not ship on it. `mypy` 2.x is the answer today.

## Shapes that use this track

- `knowledge/shapes/api-backend.md` — the FastAPI sub-track's home turf
- `knowledge/shapes/agent-app.md` — LLM orchestration, tool loops, and evals all live in Python
- `knowledge/shapes/data-pipeline-analytics.md` — polars, Celery beat, warehouse clients
- `knowledge/shapes/internal-tool.md` — Django admin is the fastest path to a working internal CRUD surface
- `knowledge/shapes/automation-bot-integration.md` — webhook receivers and scheduled jobs
- `knowledge/shapes/content-community-platform.md` — Django when editorial workflow and moderation UI matter more than a bespoke frontend

## See also

- `knowledge/runtime-tracks/ts-node.md` — the default alternative; pick it when the frontend and backend should share types
- `knowledge/runtime-tracks/go.md` — when you want a single static binary and Python's concurrency story is the bottleneck
- `knowledge/runtime-tracks/rails-laravel.md` — the other batteries-included path; compare directly against the Django sub-track
- `knowledge/capabilities/database.md` — choosing the datastore before choosing the ORM
- `knowledge/capabilities/ai-llm-integration.md` — where the `anthropic` and `openai` SDKs get wired in
- `knowledge/capabilities/testing.md` — the testing strategy this track's pytest setup implements
- `knowledge/stack-compatibility.md` — known-bad cross-axis combinations
