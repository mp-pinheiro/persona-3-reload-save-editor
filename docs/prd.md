# Persona 3 Reload Save Editor - PRD

## Target Audience

Persona 3 Reload players on PC who want to:
- Modify save values (money, stats, social links)
- Unlock achievements they missed
- Experiment with different builds without replaying 100+ hours
- Fix corrupted or stuck saves

## User Stories

### Primary

1. **Quick Edit** - As a player, I want to drag my save file onto a webpage and instantly edit my money, so I can buy items without grinding.

2. **Social Link Maxing** - As a player, I want to set all social links to max, so I can experience all relationship content.

3. **Achievement Unlock** - As a player, I want to see which achievements I'm close to completing and adjust my save accordingly.

### Secondary

4. **Save Validation** - As a player, I want to know if my save file is valid before uploading, so I don't waste time.

5. **Batch Editing** - As a player, I want to apply the same edit to multiple save slots, so I can maintain consistency across playthroughs.

## Functional Requirements

### Must Have (MVP)

| Feature | Description |
|---------|-------------|
| File Upload | Drag-and-drop or click to select .sav file |
| Decryption | Handle Persona 3's XOR + bit manipulation |
| GVAS Parsing | Parse Epic Games binary format |
| Basic Editing | Money, Social Stats (Academics/Charm/Courage) |
| Social Links | All 22 links, levels 0-10 |
| File Export | Download modified .sav file |
| Validation | Check file format before processing |

### Should Have (v1.0)

| Feature | Description |
|---------|-------------|
| Achievement Progress | Show progress towards each achievement |
| Story Flags | Good/bad ending toggle |
| Date/Time Edit | Change in-game day and time |
| Playtime Display | Show total playtime |
| Difficulty Edit | Change game difficulty |

### Could Have (Future)

| Feature | Description |
|---------|-------------|
| Compendium Editing | Modify Persona compendium |
| Inventory Editing | Add/remove items |
| Persona Stats | Edit equipped Persona |
| Import/Export JSON | Save/load edit configs |

## Non-Functional Requirements

| Requirement | Specification |
|-------------|----------------|
| Performance | Parse < 500ms, UI updates < 16ms (60fps) |
| Bundle Size | < 100KB gzipped |
| Browser Support | Chrome 120+, Edge 120+, Firefox 120+, Safari 17+ |
| Offline Capability | Service worker for offline use |
| Privacy | No data leaves the browser |
| Accessibility | WCAG 2.1 AA compliant |

## Technical Constraints

- Must run on GitHub Pages (static hosting only)
- No backend or API dependencies
- Must handle binary file manipulation in browser
- Must preserve exact binary format for game compatibility

## Success Criteria

- Can load, edit, and export a save file in under 30 seconds
- Exported save loads successfully in-game
- No reported save corruption issues
- Page loads in under 3 seconds on 4G connection
