<!--
  The Architect — pull request template.
  Keep the headings. Delete the HTML comments. Tick the boxes that apply.
-->

## Read this first

- [ ] **This PR does NOT contain a generated blueprint or a project built from one.**

This is the single most common mistake here. The Architect is the tool that *writes* blueprints —
it is not a place to store them. v2 writes to `./blueprints/` in **your** working directory, and
that output belongs in your project's repo, not this one.

- Want to show off a blueprint? → [Discussions › Show and tell](https://github.com/Hainrixz/the-architect/discussions/categories/show-and-tell)
- Blueprint came out wrong? → [open a blueprint quality issue](https://github.com/Hainrixz/the-architect/issues/new?template=blueprint-quality.yml)

PRs consisting of generated output are closed without review.

---

## What this changes

<!-- Two sentences. What was wrong or missing, and what this PR does about it. -->

## Why

<!-- The failure this prevents, or the brief it unblocks. Link the issue if there is one: Closes #123 -->

---

## Type of change

<!-- Tick every one that applies. -->

- [ ] **New shape** — a file in `knowledge/shapes/` (needs an accepted [new shape issue](https://github.com/Hainrixz/the-architect/issues/new?template=new-shape.yml) first)
- [ ] **Capability** — new or edited file in `knowledge/capabilities/`
- [ ] **Runtime track refresh** — version pins in `knowledge/runtime-tracks/`
- [ ] **Skills registry** — an entry in `knowledge/skills-registry.md`
- [ ] **Plugin surface** — `commands/`, `agents/`, `skills/`, `.claude-plugin/`
- [ ] **Interview or templates** — `questions/`, `templates/`
- [ ] **Docs** — `README.md`, `CLAUDE.md`, `.github/`
- [ ] **Fix** — broken cross-reference, CI, typo

---

## Checklist

Each item is a rule CI or review will check anyway. The reasoning behind them is in
[CONTRIBUTING.md](https://github.com/Hainrixz/the-architect/blob/main/CONTRIBUTING.md).

### Always

- [ ] **Version pins appear only in `knowledge/runtime-tracks/`.** No library version anywhere in
      `knowledge/shapes/` or `knowledge/capabilities/` — link to the track instead. Standards
      (WCAG 2.2, Manifest V3, OAuth 2.1, HTTP status codes) are not version pins and are fine.
- [ ] **`Last verified:` date updated** on every knowledge file I touched.
- [ ] Every cross-reference I wrote points at a file that actually exists, at its exact path.
- [ ] Every build step I wrote has an observable *Done when* a script could check today, on this
      machine, without a human or an external approval queue.
- [ ] No removed skill names: `/deep-research`, `/seo-audit`, `/pdf-design`, `/shadcn-ui`,
      `/chrome-bridge-automation`, `/web-reader`, `/humanizer`. And no slash prefix on
      auto-activating skills (`ui-ux-pro-max`, `frontend-design`, `playwright-cli`, `find-skills`).
- [ ] Knowledge files are in English, opinionated, table-first, and emoji-free.
- [ ] CI is green (`.github/workflows/validate.yml`).

### If this adds or edits a shape

- [ ] **Classification reciprocity holds.** Every shape my `## Is this your project?` → *No if*
      list points at now points back at mine. I edited those files too — reciprocity is
      bidirectional and one-way edges are the reason briefs never reach a shape.
- [ ] `saas-webapp.md` still offers an exit to all 13 other shapes; every other shape has ≥ 3.
- [ ] Names a default runtime track and lists its core capabilities by real file path.
- [ ] Ends with `## See also` linking at least two real manifest paths.

### If this touches version pins (`knowledge/runtime-tracks/`)

- [ ] Every pin was read from the **live registry or the published package**, not from memory and
      not from a search result. Registry beats search; the package's own types beat both.
- [ ] The `Last verified` line at the top of the track states today's date.
- [ ] Anything I could not verify says so in the file rather than guessing.

### If this adds a skill to `knowledge/skills-registry.md`

- [ ] The **install command is verified** — I ran it, or read it from the skill's own README today.
- [ ] The invocation form is correct: a leading `/` only if it is genuinely a slash command.
      No slash means it auto-activates, and writing it with a slash is a silent no-op.
- [ ] Repo, license, and star count are real and stated.
- [ ] The reference **degrades gracefully** — if the skill is absent, the workflow falls back to the
      knowledge base or built-in `WebSearch`/`WebFetch` and keeps going.

---

## How I verified this

<!--
  Concrete. "Ran /architect on <brief>, got shape X, blueprint had 20/20 sections."
  "Ran the validate workflow locally." "Checked npm dist-tags for each pin."
  "Reviewed by eye" is not verification.
-->
