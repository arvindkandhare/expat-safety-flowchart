# Contributing

This project is community-maintained. The goal is a reliable, actionable resource for Indians abroad during a crisis. That goal only works if every contribution is accurate and sourced.

---

## Ground rules

**1. Every addition needs a source.**
Link to the MEA advisory, the embassy press release, or the verified news article in your PR description. No source = PR not merged. No exceptions.

**2. Be specific.**
"The embassy has a helpline" is not useful. "+965 6550 1946, 24x7, as of March 10 2026" is useful.

**3. Date your information.**
Every fact should include when it was accurate. Gulf crisis situations change daily.

**4. Flag stale information.**
If you know something has changed, open an Issue before submitting a correction.

**5. Do not add unverified information.**
No WhatsApp forwards. No rumours. No speculation about military outcomes.

---

## How to add a new scenario

A scenario is a single JSON file in the `scenarios/` folder. Contributors never touch `index.html` or `app.js`. A broken scenario file cannot break other scenarios.

**Step 1: Copy the template**
Copy `scenarios/TEMPLATE.json` and rename it — e.g. `scenarios/uganda.json`

**Step 2: Fill it in**
The JSON structure is documented in `TEMPLATE.json`. Each scenario has:
- Metadata: `id`, `label`, `subtitle`, `currentLevel`, `disclaimer`
- `levels[]`: five levels GREEN through BLACK, each with:
  - `color`, `textColor`, `label`, `name`
  - `description` — one sentence situation summary
  - `officialTrigger` — what official sources say
  - `observableTrigger` — what you can see yourself
  - `flow` — nodes and edges (see existing scenarios for examples)

**Step 3: Register it**
Add one entry to `scenarios/index.json`:
```json
{
  "id": "uganda",
  "file": "uganda.json",
  "label": "Uganda / Regime Atrocity",
  "subtitle": "Indian nationals facing political violence or persecution",
  "currentLevel": 1
}
```

**Step 4: Open a PR**
- Title: `New scenario: [name]`
- Description: who this affects, your subject matter expertise or community connection, sources used

---

## How to update an existing scenario

Edit only the relevant scenario JSON file (`gulf.json`, `h1b.json`, etc).

- **Contact number changed:** Update the checklist item, add source URL in PR description
- **New overland route:** Add to relevant action node checklist, cite source
- **Level trigger changed:** Update `officialTrigger` or `observableTrigger`, explain why

PR title format: `Update [scenario]: [what changed] ([date])`

---

## How to update currentLevel

When the real-world situation changes tier, update `currentLevel` in both:
1. The scenario JSON file (e.g. `gulf.json`)
2. `scenarios/index.json`

This changes the "NOW" badge in the UI.

---

## Node types reference

| Type | Shape in UI | When to use |
|---|---|---|
| `start` | Oval | First node only |
| `decision` | Diamond | Yes/No branch point |
| `action` | Rectangle | Something to do — add a `checklist` array |
| `end` | Rounded rect | Terminal outcome |

---

## What we do NOT want

- Unverified WhatsApp forwards
- Political commentary or editorialising
- Speculation about military outcomes
- Personal stories (this is a reference document)
- Duplicate contact information across multiple nodes

---

## Review process

- New scenarios: reviewed within 72 hours; maintainer may request expert review for sensitive scenarios (persecution, asylum, medical evacuation)
- Contact number updates: independently verified before merge
- Structural changes to existing scenarios: discussed in Issue first

PRs for active crises (currentLevel 3+) are prioritised.

---

*Questions? Open an Issue.*
