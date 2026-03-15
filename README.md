# Crisis Preparedness Framework
### For Indian Nationals Abroad

**An open-source, community-maintained decision framework. Scenarios for Gulf conflict, H1B visa crisis, and more.**

> **Live app:** [arvindkandhare.github.io/expat-safety-flowchart](https://arvindkandhare.github.io/expat-safety-flowchart)

---

## What this is

An interactive flowchart tool that answers: *"Something is going wrong where I live. What do I do, in what order?"*

Five threat levels — GREEN through BLACK — with decision trees, action checklists, and dual-track guidance for both the person abroad and their family in India.

Scenarios are modular JSON files. Contributors add new scenarios or update existing ones without touching the application code.

---

## Current status

| Scenario | Current Level | Last Updated |
|---|---|---|
| Gulf Regional Conflict | 🟡 YELLOW (Watch) | March 2026 |
| H1B / US Visa Crisis | 🟡 YELLOW (Watch) | March 2026 |

---

## Repository structure

```
/
├── index.html              # App shell — loads React + app.js
├── app.js                  # Application code — do not edit for scenario contributions
├── scenarios/
│   ├── index.json          # Scenario registry — add new scenarios here
│   ├── gulf.json           # Gulf Regional Conflict
│   ├── h1b.json            # H1B / US Visa Crisis
│   └── TEMPLATE.json       # Blank template for new scenarios
├── docs/
│   ├── FLOWCHART.md        # Gulf crisis flowchart in Mermaid (static reference)
│   ├── PREPAREDNESS.md     # Full tiered preparedness guide (prose)
│   └── country-addenda/    # Country-specific detail files
│       ├── UAE.md
│       ├── KUWAIT.md
│       ├── SAUDI.md
│       └── QATAR-OMAN-BAHRAIN.md
├── README.md
└── CONTRIBUTING.md
```

---

## How to contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details. Short version:

- **New scenario:** Copy `TEMPLATE.json`, fill it in, add one line to `index.json`, open a PR
- **Update existing scenario:** Edit the scenario JSON, cite your source in the PR description
- **Fix a contact number:** Edit the checklist item in the relevant JSON, verify it still works, cite source

Every contribution requires a source. This is non-negotiable — wrong information in a crisis costs lives.

---

## Disclaimer

This is an **informational resource** compiled from publicly available government advisories, MEA press releases, and verified news sources. It is **not** official government guidance. Information changes rapidly during a crisis. Always verify with your nearest Indian Embassy or the MEA before acting.

All contributors are responsible for citing sources. Unverified information will not be merged.

---

## ⚠️ Important caveat about social media sources

**WhatsApp and X/Twitter are ONLY starting points for awareness — not sources of truth.**

When this framework references monitoring @MEAIndia or using WhatsApp for communication:
- These are **alerting mechanisms** — they tell you something may be happening
- They are NOT verification mechanisms — never act on social media alone
- Always cross-check with: official embassy websites, direct embassy calls, MADAD portal, government press releases

**This tool itself is also just one source.** We invite you to:
- Submit corrections via GitHub issues or pull requests
- Add missing information with proper citations
- Report outdated guidance
- Contribute alternative perspectives with verifiable sources

**In a real crisis:** Embassy phone call > Embassy website > Official MEA statement > Everything else

---

## Key contacts (verify before use)

| Resource | Detail |
|---|---|
| MEA India Control Room | +91-11-23011954 |
| MADAD Helpline (India) | 1800-11-3090 |
| MADAD Portal | madad.gov.in |
| MEA on X/Twitter | @MEAIndia |

Full embassy contact list: see [docs/FLOWCHART.md](docs/FLOWCHART.md)

---

## Sources used in initial version

- MEA India advisories, February-March 2026
- Indian Embassy Kuwait notice, March 10 2026
- Indian Embassy UAE advisory, February 28 2026
- Tribune India: MEA Special Control Room helplines
- The Week: Toll-free numbers for Indians in Gulf, February 28 2026
- US Embassy Kuwait security alert, March 9 2026

---

*This repository is not affiliated with the Government of India or the Ministry of External Affairs.*
