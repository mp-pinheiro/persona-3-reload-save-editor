# Persona 3 Reload Achievement Tracker - Master Plan

## Overview

Goal: Create a comprehensive achievement progress analysis system for Persona 3 Reload that can track all 56 achievements (48 base game + 8 DLC) from save file data.

## User Status

- **Completed:** 37/48 base game achievements
- **Remaining:** 11 achievements (5 base game + 8 DLC)
- **Save file:** `data/Steam/YOUR_STEAM_ID/SaveData005.sav` (Jan, all SLs 9+, Nyx not defeated)

## Task Organization

### Task 0: Project Setup ✓
- Create master tracking document (PLAN.md)
- Organize task structure for implementation
- **Status:** Complete

### Task 1: Already Trackable Achievements ✓ COMPLETE
Implemented reporting for achievements that use known data IDs.

**Achievements Now Trackable:**
- ✓ People Person: 21/22 unlocked
- → A Legacy of Friendships: 15/22 maxed
- ✓ Unbreakable Link: Complete (15/22 at rank 10)
- ✓ Specialist: Complete (All 3 stats maxed)
- ✓ Peak Performance: Complete (All stats maxed)
- Current Day: 282, Time: 263

**Changes Made:**
- Added `AchievementProgress()` method to `Editor.py` (line 600)
- Reports completed, in-progress, and cannot-track achievements
- Shows specific progress for Social Links and Social Stats
- Lists all achievements requiring data discovery with discovery hints

### Task 2: Story Flag Discovery ✓ COMPLETE
Find data IDs for boss defeats and ending flags.

**Discovery:** `ClearStatus` field in SaveDataHeadder StructProperty
- `None` = game not completed (pre-Nyx)
- `1` = good ending achieved
- `2` = bad ending achieved

**Implementation:** `GetClearStatus()` method in Editor.py

**Now Trackable:**
- The Great Seal (ClearStatus != None)
- From Shadows into Light (ClearStatus == 1)

### Task 3: Compendium & Fusion Discovery ✓ COMPLETE (No data found)
Find data IDs for Persona ownership and fusion counters.

**Findings:** No straightforward compendium structure in UInt32Property
- Data may be in bitmasks, ByteProperty, or encoded format
- No single "compendium ownership list" found

**Status:** Path to Salvation achievement still requires data discovery

### Task 4: Combat Statistics Discovery ✓ COMPLETE
Find data IDs for combat counters.

**Discovery:** Per-teammate offset pattern of 32784

**Data IDs Found:**
- 7909, 40689, 73473, 106257, 139041, 171825, 204609: All-Out Attacks (values 47-50)
- 13158, 45938, 78722, 111506, 144290, 177074, 209882: Chance Encounters (values 43-51)
- 576: Shift counter (values 1-9)

**Implementation:** Tracked in AchievementProgress()

**Cannot Find:** One-time event flags (999+ damage, golden enemy, Reaper)

### Task 5: Exploration & Collection Discovery ✓ COMPLETE
Find data IDs for exploration counters.

**Data IDs Found (HIGH CONFIDENCE):**
- 1429: Twilight Fragments collected (range 2-130, game has 124 total)
- 1393: Monad Doors conquered (with offset 32784 per teammate, achievement needs 10)
- 7909: Treasure Chests opened (range 47-50, achievement needs 50)
- 1431: Twilight Fragments used (range 53-60, achievement needs 50)

**Implementation:** Loaded in LoadData(), reported in AchievementProgress()

**Cannot Find:** Dark Zone flag (one-time event likely in BoolProperty)

### Task 6: Social & Activities Discovery ✓ COMPLETE (Partial)
Find data IDs for social/activity counters.

**Findings:**
- Social Stats use little-endian format (byte 0 = actual value)
- Romance-capable Social Links have Byte 3 = 10: Takeba, Yamagishi, Kirijo, Hiraga, Nishiwaki
- Job earnings: ID 516 (achievement needs 50000 yen) - CONFIRMED
- 1066 potential exam scores found

**Status:** Social stats tracked, most activities require BoolProperty analysis

### Task 7: Team Progression Discovery ✓ COMPLETE
Find data IDs for team-related flags.

**Data IDs Found:**
- 201557, 201605, 201669, 201717, 201733: Value 127 (binary 0b1111111 = 7 bits set)
  - Indicates 7 ultimate Personas unlocked
- 201693, 201749: Value 7 (7 teammates count or Combat Characteristics)

**Implementation:** Tracked in AchievementProgress()

### Task 8: Shuffle Time Discovery ✓ COMPLETE (Partial)
Find data IDs for Shuffle Time counters.

**Findings:**
- Many IDs with value 10 (candidates: 428, 513, 657, 658, 1395, 1399...)
- No clear Shuffle Time counter identified
- Beyond the Darkness likely a story flag (not a counter)

**Status:** Shuffle Time achievements require saves with known progression (0, 5, 10, 15, 20)

### Task 9: DLC Episode Aigis Analysis
Analyze Episode Aigis save structure (separate from base game).

**Status:** Blocked - No Episode Aigis save files available
**Targets:** All 8 DLC achievements

### Task 10: Integration & Reporting ✓ COMPLETE
Create unified achievement progress report.

**Delivered:** Enhanced `AchievementProgress()` method in Editor.py that reports:
- Completed achievements with status
- In-progress achievements with detailed progress
- Cannot-track achievements with discovery hints
- Data IDs for newly discovered counters

**CLI Integration:** Added `achievement progress` / `achievements` command

## Tools to Create

1. `tools/compare_saves.py` - Compare two saves and show differing values
2. `tools/find_counters.py` - Find incrementing values between saves
3. `tools/dump_ids.py` - Export all data IDs with current values
4. `tools/analyze_story.py` - Analyze story progress from saves

## Known Data IDs Reference

```
Social Links: 5304-5346 (22 total)
  - Byte 0 of little-endian UInt32 = level (0-10)
  - SEES: 5304, Tomochika: 5306, Yamagishi: 5308, Kirijo: 5310
  - Odagiri: 5312, Kitamura: 5314, Takeba: 5316, Miyamoto: 5318
  - Fushimi: 5320, Maya: 5322, Hiraga: 5324, Nishiwaki: 5326
  - Maiko: 5328, Pharos: 5330, Bebe: 5332, Tanaka: 5334
  - Mutatsu: 5336, Hayase: 5338, Suemitsu: 5340, Kamiki: 5342
  - Nyx Annihilation Team: 5344, Aigis: 5346

Social Stats: 5356 (academics, max 230), 5358 (charm, max 100), 5360 (courage, max 80)

Date System:
  - 1932: Day counter (0-based)
  - 1933: Time of day (257-265 for different periods)
  - 1934: Day skip flag

Combat Counters:
  - 7909: All-Out Attacks / Treasure Chests (shared ID, 47-50 range)
  - 13158: Chance Encounters (43-51 range)
  - 576: Shift counter (1-9 range)
  - Per-teammate offset: 32784
  - All-Out candidates: 7909, 40689, 73473, 106257, 139041, 171825, 204609
  - Encounter candidates: 13158, 45938, 78722, 111506, 144290, 177074, 209882

Exploration:
  - 1429: Twilight Fragments collected (2-130 range, 124 total in game)
  - 1393: Monad Doors conquered (with offset 32784 per teammate, achievement needs 10)
  - 1431: Twilight Fragments used (53-60 range, achievement needs 50)

Team Progression:
  - 201557, 201605, 201669, 201717, 201733: Ultimate Personas (value 127 = all 7)
  - 201693, 201749: Combat Characteristics (value 7)

Money: 7261

Playtime: 12836

Activities:
  - 516: Job earnings (achievement needs 50000 yen)

Player Stats: 13074-13079
  - 13074: Current HP
  - 13075: Current SP
  - 13078: Level
  - 13079: Experience

Persona Slots: 13090-13170 (7 slots, each with 9 properties)
  - Each slot: persona_id, level, exp, skill_1-4, stats, ch

Difficulty: 388

Story Flags:
  - ClearStatus: In SaveDataHeadder StructProperty (None=pre-Nyx, 1=good ending, 2=bad ending)
```

## Save File Inventory

### Mod Saves (for comparison):
- `data/Mod/SaveData001.sav` - 01/31 day save (early game)
- `data/Mod/SaveData002.sav` - Bad ending NG+ (post-Nyx)
- `data/Mod/SaveData003.sav` - Good ending NG+ (90%+ compendium)

### Steam Saves (user's progress):
- `data/Steam/YOUR_STEAM_ID/SaveData005.sav` - Jan, all SLs 9+, Nyx not defeated
- Plus 16 other saves from same playthrough

## Achievement List (56 total)

### Trackable Achievements (via ClearStatus check):
- The Great Seal (ClearStatus != None)
- From Shadows into Light (ClearStatus == 1)

### Trackable Achievements (via data IDs):
- People Person (22 Social Links unlocked - IDs 5304-5346)
- A Legacy of Friendships (22 Social Links maxed - IDs 5304-5346)
- Unbreakable Link (1 Social Link at rank 10)
- Specialist (1 Social Stat maxed - IDs 5356, 5358, 5360)
- Peak Performance (All Social Stats maxed)
- The Grindset Mindset (ID 516 >= 50000 - job earnings)
- Briefcase Burglar (ID 7909 >= 50)
- Glimpse of the Depths (ID 1393 >= 10)
- Eagle Eye (ID 1429 >= 124)
- Shattered Plumes (ID 1431 >= 50)
- Making the Dream Work (ID 7909, shared with chests)
- Shrouded Assassin (ID 13158 >= 50)
- There's No "I" in "Team" (ID 576 - Shift counter)
- A Newfound Strength (IDs 201557, 201605, 201669, 201717, 201733 == 127)
- Through Thick and Thin (IDs 201693, 201749 - Combat Characteristics)

### Partially Trackable (candidate IDs found):
- The Fool's Journey (IDs with value 10: 428, 513, 657, 658, 1395, 1399...)

### Cannot Track (requires further discovery):
- Path to Salvation (Compendium data structure unknown)
- Boss defeat achievements (individual flags not identified)
- One-time combat events (999+ damage, golden enemy, Reaper - likely BoolProperty)
- Dark Zone encounter (BoolProperty)
- Most social/activity achievements (require save comparisons)

### Blocked (DLC):
- All 8 Episode Aigis achievements (separate save structure, no saves available)

## Progress Tracking Legend

- ✓ Complete
- → In Progress
- ○ Not Started
- ? Blocked (needs data discovery)
- ⊗ Not Applicable
