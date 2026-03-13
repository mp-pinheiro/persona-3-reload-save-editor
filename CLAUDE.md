# Persona 3 Reload Save Editor - Context for AI Agents

## CRITICAL: DO NOT RUN Editor.py INTERACTIVELY

**Editor.py HAS CODE AT THE BOTTOM THAT ENTERS INTERACTIVE MODE.**

If you run ANY script that:
- Imports Editor.py
- Imports Persona3Save
- Uses `from Editor import *`

**IT WILL HANG WAITING FOR USER INPUT.**

## IMPORTANT: PRESERVE USER DATA

**DO NOT delete or modify the `data/` directory.** This contains the user's actual save files and test data. When running cleanup operations, always preserve:
- `data/Steam/YOUR_STEAM_ID/` - User's personal save files
- `data/Mod/` - Comparison saves for testing

## ALWAYS Use This Pattern for Testing Save Data

```python
# CORRECT - Direct save processing without Editor.py
import json, binascii, tempfile, os
from SavConverter import sav_to_json, read_sav

# Decrypt and load save
save_path = "data/Steam/YOUR_STEAM_ID/SaveData005.sav"
with open(save_path, "rb") as f:
    data1 = f.read()

key = 'ae5zeitaix1joowooNgie3fahP5Ohph'
keylen = len(key)
filesize = os.path.getsize(save_path)
crypt_data = bytearray(filesize)
for i in range(filesize):
    key_idx = i % keylen
    bVar1 = data1[i] ^ ord(key[key_idx])
    crypt_data[i] = (bVar1 >> 4 & 3 | (bVar1 & 3) << 4 | bVar1 & 0xcc)

# Convert to JSON
with tempfile.NamedTemporaryFile(mode='wb', suffix='.sav', delete=False) as temp_file:
    temp_file.write(crypt_data)
    temp_file_path = temp_file.name

json_data = sav_to_json(read_sav(temp_file_path), string=True)
os.remove(temp_file_path)

js = json.loads(json_data)
```

## How to Replicate Editor.py Functions Without Importing

```python
# Replicate LoadByNameN without importing Editor.py
def LoadByNameN(js, name, header, nvar):
    for i in js[:]:
        if i["type"] == name:
            if int.from_bytes(binascii.unhexlify(str(i["padding"])), byteorder="little") == nvar:
                return i.get("value")
    return None

# Example usage:
academics = LoadByNameN(js, "UInt32Property", 0, 5356)
```

## Testing Syntax Only

```bash
# This is SAFE - only checks syntax, doesn't run code
python3 -m py_compile Editor.py

# This is also SAFE
python3 -c "import ast; ast.parse(open('Editor.py').read())"
```

## What NEVER To Do

```bash
# BAD - Will hang in interactive mode
python3 -c "from Editor import Persona3Save"

# BAD - Will hang
python3 test_script.py  # if test_script.py imports Editor

# BAD - Will hang
python3 Editor.py < any_input

# BAD - Will hang
cd /path/to/project && python3
>>> import Editor
```

## If You Need to Test Editor.py Changes

1. Make changes with Edit tool
2. Check syntax: `python3 -m py_compile Editor.py`
3. Create test using SavConverter directly (see pattern above)
4. NEVER import Editor.py

## Project Overview

A Python save editor for Persona 3 Reload that can read, modify, and write save files in GVAS format.

### File Structure

- `Editor.py` - Main save editor with interactive CLI (NEVER RUN DIRECTLY)
- `SavConverter.py` - GVAS JSON conversion utilities (SAFE to import)
- `PLAN.md` - Master tracking document for achievement tracker implementation

### Known Data IDs

```python
# Social Links (5304-5346) - Byte 0 of little-endian UInt32 = level (0-10)
5304: SEES, 5306: Tomochika, 5308: Yamagishi, 5310: Kirijo, 5312: Odagiri,
5314: Kitamura, 5316: Takeba, 5318: Miyamoto, 5320: Fushimi, 5322: Maya,
5324: Hiraga, 5326: Nishiwaki, 5328: Maiko, 5330: Pharos, 5332: Bebe,
5334: Tanaka, 5336: Mutatsu, 5338: Hayase, 5340: Suemitsu, 5342: Kamiki,
5344: Nyx Annihilation Team, 5346: Aigis

# Social Stats (max values)
5356: Academics (max 230), 5358: Charm (max 100), 5360: Courage (max 80)

# Date/Time
1932: Day counter, 1933: Time of day, 1934: Day skip flag

# Other
7261: Money, 12836: Playtime, 388: Difficulty
```

### Social Link Data Format

```python
value = LoadByNameN(js, "UInt32Property", 0, sl_id)
if value:
    bytes_val = value.to_bytes(4, 'little')
    level = bytes_val[0]  # 0-10
```

## Available Save Files

### Mod Saves (for comparison):
- `data/Mod/SaveData001.sav` - 01/31 day save (early game)
- `data/Mod/SaveData002.sav` - Bad ending NG+ (post-Nyx)
- `data/Mod/SaveData003.sav` - Good ending NG+ (90%+ compendium)

### Steam Saves (user's progress):
- `data/Steam/YOUR_STEAM_ID/SaveData005.sav` - Jan, all SLs 9+, Nyx not defeated

## Discovery Findings (from agents)

### Story Flags (Task 3 - Complete)
- `ClearStatus` in SaveDataHeadder StructProperty (header index 1)
- None = pre-Nyx, 1 = good ending, 2 = bad ending

### Combat Counters (Task 5 - Complete)
- Per-teammate offset pattern: 32784
- All-Out Attack candidates: IDs 7909, 40689, 73473, 106257, 139041, 171825, 204609
- Chance Encounter candidates: IDs 13158, 45938, 78722, 111506, 144290, 177074, 209882
- Shift candidate: ID 576

### Exploration Counters (Corrected)
- 1429: Twilight Fragments collected (game has 124 total)
- 1393: Monad Doors conquered (with offset 32784 per teammate)
- 1431: Twilight Fragments used (achievement needs 50)
- 7909: Treasure Chests opened (achievement needs 50)

### Activities Counters
- 516: Job earnings (achievement needs 50000 yen) - CONFIRMED

### Compendium (Task 4 - Complete)
- No straightforward structure in UInt32Property
- May be bitmasks, ByteProperty, or other encoding

## Current Task: Achievement Progress Tracker

Implementing comprehensive achievement analysis (see PLAN.md).

### Where to Add New Methods

Add methods in the `Persona3Save` class, typically after existing edit methods.

## Important

- Always use `Edit` tool for modifications, NOT `Write`
- Test syntax with `python3 -m py_compile Editor.py`
- Use `git diff` to verify changes
- **NEVER import or run Editor.py directly**
- **Always use SavConverter directly for save data testing**
