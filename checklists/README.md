# Checklists Directory

This directory contains **reusable checklist files** that can be referenced by multiple scenarios.

## Philosophy

**One file = one checklist = one contribution**

This structure enables:
- ✅ Parallel contributions without merge conflicts
- ✅ Easy updates - change once, apply everywhere
- ✅ Clear ownership and version control
- ✅ Modularity and reusability

## File Structure

Each checklist is a standalone JSON file:

```json
{
  "id": "checklist-id",
  "title": "Descriptive Title",
  "description": "Explanation of what this checklist covers",
  "tags": ["tag1", "tag2"],
  "items": [
    "Step 1 with specific detail",
    "Step 2 with actionable instructions",
    "Step 3 with sources or context"
  ]
}
```

## Naming Convention

- Use kebab-case: `passport-renewal.json`
- Be specific: `h1b-attorney-retention.json` not `attorney.json`
- Prefix scenario-specific lists: `gulf-go-bag-locate.json`
- Generic lists need no prefix: `emergency-savings.json`

## Using Checklists in Scenarios

### Option 1: Reference by ID (Recommended)
```json
{
  "id": "a1",
  "type": "action",
  "label": "Register on MADAD",
  "checklistId": "madad-registration"
}
```

### Option 2: Inline (For Unique Cases)
```json
{
  "id": "a1",
  "type": "action",
  "label": "Scenario-specific action",
  "checklist": [
    "Unique step that won't be reused",
    "Another one-off instruction"
  ]
}
```

## Adding a New Checklist

1. Create `checklists/your-checklist-id.json`
2. Add the ID to `checklists/index.json`
3. Reference it in scenarios using `"checklistId": "your-checklist-id"`

## Checklist Categories

### Essential (All Scenarios)
- `passport-renewal` - Passport validity maintenance
- `document-storage` - Digital backup of critical documents
- `family-contacts` - Emergency contact information
- `emergency-savings` - Financial buffer planning

### Gulf Region Specific
- `madad-registration` - MEA portal registration
- `gulf-check-in-protocol` - Communication with family in India
- `gulf-go-bag-locate` - Pre-evacuation preparation
- `gulf-family-contacts-extended` - Extended contact details

### US H1B Specific
- `h1b-baseline-prep` - Baseline preparation during normal times
- `h1b-attorney-retention` - Legal counsel engagement
- `h1b-i140-options` - Immigration pathway understanding
- `h1b-financial-prep` - H1B-specific financial planning

## Contributing

When contributing a checklist:
1. Ask: "Will this be reused across scenarios or levels?"
   - YES → Create standalone checklist file
   - NO → Use inline checklist in scenario
2. Be specific and actionable
3. Include sources where possible
4. Test that your checklist loads correctly

## Backward Compatibility

Both `checklistId` and inline `checklist` are supported. The app:
1. Loads all checklists at startup
2. Resolves `checklistId` references
3. Falls back to inline `checklist` if ID not found
4. Works fine if `checklists/` directory is missing
