# Achievement Tracker - Data Discovery Results

## Overview

Comprehensive achievement progress analysis system for Persona 3 Reload. Tracks all 56 achievements (48 base game + 8 DLC) from save file data.

## User Status

- **Completed:** 37/48 base game achievements
- **Remaining:** 11 achievements (5 base game + 8 DLC)
- **Save File:** `data/Steam/YOUR_STEAM_ID/SaveData005.sav` (Jan, all SLs 9+, Nyx not defeated)

## Fully Trackable Achievements (14)

| Achievement | Data ID | Requirement | User Status |
|-------------|---------|-------------|-------------|
| People Person | 5304-5346 | 22 Social Links unlocked | 21/22 |
| A Legacy of Friendships | 5304-5346 | 22 Social Links maxed | 15/22 |
| Unbreakable Link | 5304-5346 | 1 SL at rank 10 | ✓ |
| Specialist | 5356, 5358, 5360 | 1 Social Stat maxed | ✓ |
| Peak Performance | 5356, 5358, 5360 | All Social Stats maxed | ✓ |
| The Grindset Mindset | 516 | 50000 yen from jobs | ? |
| Briefcase Burglar | 7909 | 50 Treasure Chests | ✓ (50/50) |
| Glimpse of the Depths | 1393 | 10 Monad Doors | 8/10 |
| Eagle Eye | 1429 | 124 Twilight Fragments | 7/124 |
| Shattered Plumes | 1431 | 50 Twilight Fragments used | ✓ (60/50) |
| Making the Dream Work | 7909 | 50 All-Out Attacks | ✓ (50/50) |
| Shrouded Assassin | 13158 | 50 Chance Encounters | ✓ (51/50) |
| The Great Seal | ClearStatus | Defeat Nyx | ✗ (pre-Nyx) |
| From Shadows into Light | ClearStatus | Good ending | ✗ |
| A Newfound Strength | 201557-201733 | All 7 Ultimate Personas | ✓ |

## Partially Trackable (4)

- **There's No "I" in "Team"** - ID 576 (Shift counter), unclear meaning
- **Through Thick and Thin** - IDs 201693, 201749 (Combat Characteristics)
- **The Fool's Journey** - Many candidate IDs with value 10
- **The Power of Choice** - Not clearly identified

## Cannot Track (Requires Research)

- Path to Salvation (Messiah fusion - compendium data structure unknown)
- Individual boss defeat achievements (story flags not found)
- One-time combat events (999+ damage, golden enemy, Reaper - likely BoolProperty)
- Dark Zone encounter (likely BoolProperty)
- Most social/activity achievements (require save comparisons)

## DLC (Blocked)

All 8 Episode Aigis achievements - uses separate save structure, no saves available for analysis.

## Data ID Reference

| Category | IDs | Description |
|----------|-----|-------------|
| Social Links | 5304-5346 (even) | Level in byte 0 of little-endian UInt32 |
| Social Stats | 5356, 5358, 5360 | Academics (230), Charm (100), Courage (80) |
| Exploration | 1429, 1393, 7909, 1431 | Fragments, Monad, Chests, Fragments Used |
| Combat | 576, 13158, +offset 32784 | Shift, Encounters, per-teammate |
| Team | 201557-201733, 201693, 201749 | Ultimate Personas, Combat Characteristics |
| Story | ClearStatus | In SaveDataHeadder (None=pre-Nyx, 1=good, 2=bad) |

## Discovery Methods Used

1. **Save Comparison** - Compare saves at different progression points
2. **Counter Identification** - Look for values incrementing toward thresholds
3. **Per-Teammate Pattern** - Discovered offset of 32784
4. **Bitmask Recognition** - Value 127 (0b1111111) = 7 flags set

## Implementation

- **Method:** `AchievementProgress()` in Editor.py (line 600)
- **CLI Command:** `achievement progress` or `achievements`
- **Story Status:** `GetClearStatus()` method for ending detection
