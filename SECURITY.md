# Security Policy

## What this repo is

The Architect ships no executable code. There is no server, no build step, no dependency tree, no
compiled artifact. What it ships is **text that goes into a language model's context and shapes what
that model does next** — knowledge files, prompts, slash commands, and subagent definitions.

That changes the threat model completely. There is no memory corruption here and no supply chain in
the usual sense. What there is: **a repo whose entire output is instructions that another agent will
execute with real permissions on a real machine.** Everything below follows from that.

## Supported versions

| Version | Supported |
|---|---|
| 2.x | Yes |
| 1.x | No — upgrade |

Fixes ship on the latest release. There are no backports.

---

## Reporting a vulnerability

**Do not open a public issue.** A working prompt-injection payload is a live exploit the moment it is
posted, and anyone reading the issue can copy it.

**Preferred route — GitHub private vulnerability reporting.** Go to
[the repo's Security tab](https://github.com/Hainrixz/the-architect/security) and choose
**Report a vulnerability**. The report is visible only to the maintainer, and a fix can be developed
in a private fork before anything becomes public.

**If that is unavailable to you,** contact the maintainer privately through
[@Hainrixz](https://github.com/Hainrixz) or [tododeia.com](https://tododeia.com). Send a heads-up
first and the details second — do not put a payload in a public message.

### What to include

- The file and the exact text — a line number, or the paragraph quoted.
- What an agent reading it would be induced to do.
- Whether it has been merged, or is only in an open PR.
- A minimal reproduction if you have one: the brief you gave The Architect, and what came out.

### What to expect

| Stage | Timeline |
|---|---|
| Acknowledgement | 3 business days |
| Initial assessment — real, needs-more-info, or out of scope | 7 days |
| Fix in a release | Depends on severity; a merged injection is treated as urgent |
| Public disclosure | After the fix ships, coordinated with you |

This is maintained by one person. If you have heard nothing in a week, ping again — that is a dropped
message, not a policy.

Reporters are credited in [CHANGELOG.md](CHANGELOG.md) unless you would rather not be. Say which.

---

## The threat model

### 1. Prompt injection through a contributed knowledge file

**The main risk in this repo.** Every file in `knowledge/`, `questions/`, `templates/`, `commands/`,
and `agents/` is read directly into an agent's context and treated as instruction. A pull request
that adds a plausible-looking shape or capability is also a pull request that adds text to the
context of every future session that reads it.

An injection here does not need to look like an attack. It needs to look like guidance:

- A "pitfall" that recommends disabling a permission check "to avoid a common friction".
- A build step whose verify command quietly pipes a remote script into a shell.
- A capability that recommends a specific package which happens to be typosquatted.
- Text addressed past the reader to the agent — "ignore previous instructions", or a hidden
  instruction inside an HTML comment, a code fence, or a `See also` link.
- A generated `CLAUDE.md` template that tells the target project's builder to skip its own rules.

**What we do about it:** every PR is read line by line, not skimmed for diff size. Install commands
are verified against upstream. New shapes and capabilities are checked for text that addresses the
agent rather than the reader. [CONTRIBUTING.md](CONTRIBUTING.md) exists partly for this — the checks
it imposes make injection harder to smuggle in.

**What you can do:** if you spot instruction-shaped text in a knowledge file that has no business
being there, report it privately. It may be sloppy authoring rather than an attack, and we will treat
it the same either way.

### 2. A malicious install command in the skills registry

`knowledge/skills-registry.md` names third-party skills and, next to each one, **a command a user is
expected to run.** That is the highest-consequence line in the repo: someone reads it, trusts it, and
pastes it into a shell.

A wrong or hostile entry there is remote code execution with a helpful tone.

Rules that exist because of this:

- No skill is listed without an install command copied from the upstream repo's own README or run by
  a maintainer.
- License, star count, and last-push are read from the live GitHub API and dated in the file.
- Registry entries name a repo you can go read before running anything.

If a listed skill's upstream repo is transferred, deleted, or compromised, **report it** — the entry
needs to come out of the registry immediately, and there is no automation watching for that.

### 3. A blueprint that instructs a builder to do something harmful

The Architect writes plans. It does not execute them. **The builder does** — usually a fresh Claude
Code session with file-write and shell access to your machine.

So a defect in a blueprint is not a documentation defect. It is a defect in something that will be
run. A build step can install a package, write a file anywhere in the project, hit the network, or
run an arbitrary command as a "verify" step.

**Review a blueprint before you hand it to an autonomous builder.** Read at least:

| Section | Look for |
|---|---|
| 2 — Tech Stack, 11 — Dependencies | Packages you do not recognize. Check the name character by character; typosquats are one edit away from the real thing |
| 9 — Build Order | Every verify command. Anything that pipes a download into a shell, touches a path outside the project, or runs with elevated privileges |
| 10 — Environment Setup | Where secrets come from and where they are written |
| 12 — Deployment | Anything that would push to a real environment during the build |
| 14 — Security & Secrets | That it exists and says something specific about your project |
| 19 — Agent Workspace | The generated `CLAUDE.md`, `AGENTS.md` and `.claude/settings.json` — these become standing instructions and permissions in your project |

Three specifics worth calling out:

- **Never run a build with permission prompts disabled** because a blueprint is long and the prompts
  are tedious. The prompts are the only thing between a plan and your filesystem.
- **The blueprint is only as trustworthy as the session that produced it.** If you pasted a
  third-party spec, an RFP, a PDF, or a reference URL into the interview, that content was in the
  model's context while the blueprint was written and could have influenced it. Review harder in that
  case.
- **Blueprints for existing repos (`/architect-brownfield`) touch code you already have.** Read the
  rollback and the parity plan before the first step, not after.

### 4. Secrets in a generated blueprint

A blueprint is a design document, and design documents get committed and shared. The Architect is
built to reference secrets by env var name and never by value — but it writes what the interview gave
it. **If you paste a real API key into the conversation, expect it to appear in the output.**

Grep a blueprint before you share it or commit it to a public repo. If a real credential got in,
rotate it — do not just edit the file, because it is in the git history the moment it is committed.

---

## Out of scope

Report these upstream, not here:

- Vulnerabilities in third-party skills, plugins, or packages named in the registry or recommended in
  a blueprint. **Do tell us anyway** if the project is compromised, so the entry can be removed.
- Vulnerabilities in Claude Code itself — report those to Anthropic.
- Vulnerabilities in an application built from a blueprint. That code is yours; the blueprint is a
  plan, not an audit.
- A stale version pin in `knowledge/runtime-tracks/`. That is expected drift and a normal issue or
  PR — unless the pinned version has a known CVE, in which case report it privately and we will treat
  it as a security fix.

---

## See also

- [CONTRIBUTING.md](CONTRIBUTING.md) — the review bar every contributed file has to clear
- [VERSIONING.md](VERSIONING.md) — how a security fix is versioned and released
- [CHANGELOG.md](CHANGELOG.md) — where fixes and credits are recorded
