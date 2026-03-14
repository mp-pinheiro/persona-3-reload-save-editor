# Persona 3 Reload Save Editor - Quick Reference

## Part 1: Save Editor (Python)

### CRITICAL: DO NOT START DEV SERVER, YOU ARE SANDBOXED

**Check if the server is already running on port 3000/3001. If not ASK USER TO START IT.**

### CRITICAL: DO NOT RUN Editor.py INTERACTIVELY

**Editor.py HAS CODE AT THE BOTTOM THAT ENTERS INTERACTIVE MODE.**

If you run ANY script that:
- Imports Editor.py
- Imports Persona3Save
- Uses `from Editor import *`

**IT WILL HANG WAITING FOR USER INPUT.**

### Preserving User Data

**DO NOT delete or modify the `data/` directory.** This contains the user's actual save files and test data.

### Testing Save Data (Safe Pattern)

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

### Replicating LoadByNameN Without Importing

```python
def LoadByNameN(js, name, header, nvar):
    for i in js[:]:
        if i["type"] == name:
            if int.from_bytes(binascii.unhexlify(str(i["padding"])), byteorder="little") == nvar:
                return i.get("value")
    return None

academics = LoadByNameN(js, "UInt32Property", 0, 5356)
```

### Testing Syntax Only

```bash
python3 -m py_compile Editor.py
python3 -c "import ast; ast.parse(open('Editor.py').read())"
```

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

# Exploration (achievement tracking)
1429: Twilight Fragments collected (124 total in game)
1393: Monad Doors conquered (achievement needs 10)
7909: Treasure Chests opened (achievement needs 50)
1431: Twilight Fragments used (achievement needs 50)

# Combat
576: Shift counter
13158: Chance Encounters (achievement needs 50)
7909, 40689, 73473, 106257, 139041, 171825, 204609: All-Out Attacks
Per-teammate offset: 32784

# Team Progression
201557, 201605, 201669, 201717, 201733: Ultimate Personas (value 127 = all 7)
201693, 201749: Combat Characteristics (value 7)

# Activities
516: Job earnings (achievement needs 50000 yen)

# Other
7261: Money, 12836: Playtime, 388: Difficulty
```

### Social Link Level Parsing

```python
value = LoadByNameN(js, "UInt32Property", 0, sl_id)
if value:
    bytes_val = value.to_bytes(4, 'little')
    level = bytes_val[0]  # 0-10
```

### Story Flags

- `ClearStatus` in SaveDataHeadder StructProperty (header index 1)
- None = pre-Nyx, 1 = good ending, 2 = bad ending

### File Structure

- `Editor.py` - Main save editor with CLI (NEVER RUN DIRECTLY)
- `SavConverter/` - GVAS format handling (SavReader.py, SavWriter.py, SavToJson.py, JsonToSav.py, SavProperties.py)
- `web/` - PyScript implementation (deprecated, being replaced)

### Available Save Files

**Mod Saves (for comparison):**
- `data/Mod/SaveData001.sav` - 01/31 day save (early game)
- `data/Mod/SaveData002.sav` - Bad ending NG+ (post-Nyx)
- `data/Mod/SaveData003.sav` - Good ending NG+ (90%+ compendium)

**Steam Saves (user's progress):**
- `data/Steam/YOUR_STEAM_ID/SaveData005.sav` - Jan, all SLs 9+, Nyx not defeated

---

## Part 2: Web Tool (JavaScript)

### Architecture

**Tech Stack:** Svelte 5 + SvelteKit static adapter + Vite

- Runs entirely client-side (no server)
- Deployed to GitHub Pages
- Binary handling via native DataView/ArrayBuffer APIs

### Documentation

- `docs/vision.md` - Goals, principles, success metrics
- `docs/prd.md` - User stories, feature priorities (MVP/v1.0/future)
- `docs/spec.md` - Technical spec, algorithms, implementation details

### Key Algorithms to Port

**Decryption:**
```typescript
const KEY = 'ae5zeitaix1joowooNgie3fahP5Ohph';
for (let i = 0; i < data.length; i++) {
    const keyIdx = i % KEY.length;
    const bVar1 = data[i] ^ KEY.charCodeAt(keyIdx);
    result[i] = ((bVar1 >> 4) & 3) | ((bVar1 & 3) << 4) | (bVar1 & 0xcc);
}
```

**Binary Reading (DataView):**
```typescript
const view = new DataView(arrayBuffer);
const value = view.getUint32(offset, true); // true = little-endian
```

### JS Project Structure (Planned)

```
src/
├── lib/
│   ├── crypto/decrypt.ts      # XOR + bit manipulation
│   ├── gvas/                  # GVAS parsing (reader, writer, parser, types)
│   ├── save/                  # Data IDs, structures, queries
│   └── ui/stores.ts           # Svelte state
├── routes/+page.svelte        # Main editor page
└── app.css
```

### MVP Features

| Feature | Description |
|---------|-------------|
| File Upload | Drag-and-drop .sav file |
| Decryption | Persona 3 XOR + bit manipulation |
| GVAS Parsing | Epic Games binary format |
| Basic Editing | Money, Social Stats, Social Links |
| File Export | Download modified .sav file |

### Achievement Tracking

See `docs/achievement-tracker.md` for comprehensive achievement data discovery results.

---

## Important

- Always use `Edit` tool for modifications, NOT `Write`
- Test syntax with `python3 -m py_compile Editor.py`
- **NEVER import or run Editor.py directly**
- **Always use SavConverter directly for save data testing**
