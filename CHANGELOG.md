# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2026-03-17

### Added
- Clone persona feature: empty protagonist slots show "Clone from" dropdown to copy a filled slot
- Persona slot level requirement warnings for protagonist slots 7-12

### Changed
- Protagonist persona slots expanded from 7 to 12
- Persona updates use upsert to create properties for previously empty slots

### Fixed
- FileEndProperty now serialized last regardless of property order in array
- Persona stat decode/encode byte order corrected for little-endian UInt32 layout (St/Ma/En/Ag were shuffled)

## [1.0.6] - 2026-03-17

### Added
- upsertUInt32Property and createUInt32Property for inserting new save properties
- insertBeforeFileEnd helper to maintain correct property ordering

## [1.0.5] - 2026-03-14

### Changed
- README features section updated to reflect current web editor tabs and capabilities

## [1.0.4] - 2026-03-14

### Added
- Combat tab with character stat editing (level, EXP, HP, SP)
- Persona slot editor with persona selection, level, EXP, and skill assignment
- Persona stat editing (St/Ma/En/Ag/Lu) per slot
- SkillSelect component with searchable dropdown
- combat-data.ts with character definitions, persona/skill name lists, and encode/decode helpers
- combat-queries.ts for reading and writing combat data from save properties

## [1.0.3] - 2026-03-14

### Fixed
- Achievement classification uses computed completion status instead of hardcoded arrays
- Progress values capped to max (Eagle Eye no longer shows 150/124)

### Changed
- Moved Shrouded Assassin and Making the Dream Work to "cannot track" due to unreliable data IDs
- Disabled achievements tab behind feature flag until more achievements are supported
- Removed unused AllOutAttackBase, AllOutAttackOffset, and ChanceEncounters data IDs

### Added
- Feature flags config (`lib/config/features.ts`)
- Export warning modal on download with disclaimer

## [1.0.2] - 2026-03-14

### Added
- Day counter shows mapped calendar date (April 2009 - March 2010)
- SummaryCard displays date alongside day number (e.g. "305 - (2010-01-31)")
- DateTimeEditor hint shows full calendar date (e.g. "January 31, 2010")

### Removed
- Redundant "Current:" hints from Money, Difficulty, and Time of Day editors

## [1.0.1] - 2026-03-14

### Fixed
- Playtime displays correctly by converting 30fps frame counts to hours/minutes
- Difficulty labels use P3R names (Peaceful/Merciless instead of Beginner/Maniac)
- Difficulty now reads from UInt32Property data ID 388 instead of header UInt16
- Time of day values mapped to all nine in-game periods

### Added
- Social stat tier indicators (Slacker through Genius, etc.) on summary and editor
- Tier threshold markers on stat progress bars and sliders
- Social stat sliders allow values up to 999 (beyond max tier threshold)

### Changed
- Renamed `playtimeSeconds` to `playtimeFrames` in SaveSummary interface
- Renamed `SOCIAL_STAT_MAX` to `SOCIAL_STAT_THRESHOLD` for clarity
- Footer link points to project repository instead of upstream converter

## [1.0.0] - 2026-03-14

### Added
- Web-based save editor (Svelte 5 + SvelteKit, static adapter)
- GVAS binary parser and serializer ported from Python to TypeScript
- XOR encryption/decryption for P3R save files
- Save summary with character name, playtime, day, difficulty, money
- Social stats editor with sliders (Academics, Charm, Courage)
- Money editor with max button
- Social links editor with per-link level dropdowns
- Difficulty editor (Peaceful through Merciless)
- Date and time editor (day counter, time of day)
- Story flags editor (game completion status)
- Achievement progress tracker (completed, in progress, cannot track)
- Export modified save with re-encryption
- GitHub Actions workflow for GitHub Pages deployment
- Project documentation (PRD, technical spec, vision, achievement tracker)

### Changed
- Updated README with web version quick start
- Updated CLAUDE.md with web tool reference

### Removed
- Obsolete CONTEXT.md and PLAN.md planning documents

## [0.0.0] - 2026-03-13

### Added
- Comprehensive achievement progress tracking system
- Support for tracking 56 Persona 3 Reload achievements (48 base game + 8 DLC)
- `AchievementProgress()` method to display achievement progress from save data
- Story progression tracking via `GetClearStatus()` method (Nyx defeat, ending flags)
- Job earnings tracking for "The Grindset Mindset" achievement
- `CLAUDE.md` with project context for AI agents
- `CONTEXT.md` with detailed implementation context and data ID reference
- `PLAN.md` as master tracking document for achievement tracking implementation
- `CHANGELOG.md` following Keep a Changelog format

### Fixed
- Corrected exploration data IDs (previous IDs were from incorrect save comparison)
- Twilight Fragments: 1449 → 1429
- Monad Doors: 1451 → 1393 (with offset 32784 per teammate)
- Twilight Fragments Used: 13110 → 1431

### Data IDs Discovered
- **Story Flags**: `ClearStatus` in SaveDataHeadder StructProperty (None=pre-Nyx, 1=good ending, 2=bad ending)
- **Exploration**: 1429 (Twilight Fragments), 1393 (Monad Doors), 7909 (Treasure Chests), 1431 (Fragments Used)
- **Combat**: 7909 (All-Out Attacks), 576 (Shift), 13158 (Chance Encounters), per-teammate offset 32784
- **Activities**: 516 (Job Earnings, achievement needs 50000 yen)
- **Team**: 201557 (Ultimate Personas), 201693 (Combat Characteristics), 201605, 201669, 201717, 201733
- **Social Links**: 5304-5346 (22 Social Links, byte 0 = level 0-10)
- **Social Stats**: 5356 (Academics, max 230), 5358 (Charm, max 100), 5360 (Courage, max 80)
- **Date/Time**: 1932 (Day counter), 1933 (Time of day), 1934 (Day skip flag)
- **Other**: 7261 (Money), 12836 (Playtime), 388 (Difficulty)

### Known Limitations
- Compendium ownership data (Messiah fusion) not yet mapped
- Individual boss defeat flags not discovered
- One-time event flags (999+ damage, golden enemy, Reaper) likely stored in BoolProperty (not UInt32Property)
- Episode Aigis DLC uses separate save structure - not supported
