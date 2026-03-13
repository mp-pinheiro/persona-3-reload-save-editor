# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
