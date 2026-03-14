# Persona 3 Reload Save Editor - Technical Specification

## Architecture Decision: Svelte + Vite

**Choice**: Svelte 5 with SvelteKit static adapter and Vite

**Rationale**:
- Smallest bundle size among frameworks (~6.4kb gzipped)
- Compile-time reactivity = near-vanilla performance
- First-class static site generation for GitHub Pages
- TypeScript support for binary parsing safety

## File Structure

```
src/
├── lib/
│   ├── crypto/
│   │   └── decrypt.ts          # XOR + bit manipulation
│   ├── gvas/
│   │   ├── reader.ts           # Binary parsing (DataView wrappers)
│   │   ├── writer.ts           # Binary serialization
│   │   ├── types.ts            # Property type definitions
│   │   └── parser.ts           # GVAS structure parser
│   ├── save/
│   │   ├── data-ids.ts         # Known data ID constants
│   │   ├── structures.ts       # Social link, stat definitions
│   │   └── queries.ts          # LoadByNameN equivalent
│   └── ui/
│       └── stores.ts           # Svelte stores for state
├── routes/
│   └── +page.svelte            # Main editor page
└── app.css
static/
└── data/                       # Sample saves for testing
```

## Core Algorithms

### 1. Decryption (port of Editor.py XORshift)

```typescript
const KEY = 'ae5zeitaix1joowooNgie3fahP5Ohph';

export function decryptSave(data: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length);
    const keyLen = KEY.length;

    for (let i = 0; i < data.length; i++) {
        const keyIdx = i % keyLen;
        const bVar1 = data[i] ^ KEY.charCodeAt(keyIdx);
        result[i] = ((bVar1 >> 4) & 3) | ((bVar1 & 3) << 4) | (bVar1 & 0xcc);
    }

    return result;
}

export function encryptSave(data: Uint8Array): Uint8Array {
    // Inverse of decrypt (for export)
    const result = new Uint8Array(data.length);
    const keyLen = KEY.length;

    for (let i = 0; i < data.length; i++) {
        const keyIdx = i % keyLen;
        const bVar1 = ((data[i] >> 4) & 3) | ((data[i] & 3) << 4) | (data[i] & 0xcc);
        result[i] = bVar1 ^ KEY.charCodeAt(keyIdx);
    }

    return result;
}
```

### 2. Binary Reader (struct.unpack equivalent)

```typescript
export class BinaryReader {
    private view: DataView;
    private offset = 0;

    constructor(buffer: ArrayBuffer) {
        this.view = new DataView(buffer);
    }

    uint32(): number {
        const value = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return value;
    }

    int32(): number {
        const value = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return value;
    }

    bytes(length: number): Uint8Array {
        const bytes = new Uint8Array(this.view.buffer, this.offset, length);
        this.offset += length;
        return bytes;
    }

    string(length: number): string {
        const bytes = this.bytes(length);
        return new TextDecoder('utf-8').decode(bytes);
    }
}
```

### 3. GVAS Property Parser

```typescript
interface GVASProperty {
    type: string;
    name: string;
    value: unknown;
}

export function parseProperty(reader: BinaryReader): GVASProperty {
    const name = reader.string(reader.int32());
    const type = reader.string(reader.int32());
    const size = reader.uint32();

    switch (type) {
        case 'UInt32Property':
            return { name, type, value: reader.uint32() };
        case 'IntProperty':
            return { name, type, value: reader.int32() };
        case 'StructProperty':
            return parseStruct(reader, name);
        // ... other types
    }
}
```

### 4. Save Query (LoadByNameN equivalent)

```typescript
interface SaveProperty {
    type: string;
    header: number;
    value: number | string | SaveProperty[];
}

export function findById(
    properties: SaveProperty[],
    type: string,
    header: number,
    id: number
): number | null {
    for (const prop of properties) {
        if (prop.type === type && prop.header === header) {
            // For little-endian UInt32, extract byte 0
            if (typeof prop.value === 'number') {
                const bytes = new DataView(new ArrayBuffer(4));
                bytes.setUint32(0, prop.value, true);
                return bytes.getUint8(0);
            }
        }
    }
    return null;
}

// Usage: Social Link level
const slLevel = findById(saveData, 'UInt32Property', 0, 5304);
```

## Component Architecture

```svelte
<!-- routes/+page.svelte -->
<script lang="ts">
    import SaveUploader from '$lib/components/SaveUploader.svelte';
    import EditorPanel from '$lib/components/EditorPanel.svelte';
    import { saveFile, parsedSave } from '$lib/ui/stores';

    let showEditor = false;
</script>

<main>
    {#if !$parsedSave}
        <SaveUploader />
    {:else}
        <EditorPanel />
    {/if}
</main>
```

```svelte
<!-- components/SaveUploader.svelte -->
<script lang="ts">
    import { decryptSave } from '$lib/crypto/decrypt';
    import { parseSave } from '$lib/gvas/parser';

    let files: FileList | null = null;
    let error = '';
    let loading = false;

    async function handleFile(file: File) {
        loading = true;
        error = '';
        try {
            const buffer = await file.arrayBuffer();
            const decrypted = decryptSave(new Uint8Array(buffer));
            const save = parseSave(decrypted);
            parsedSave.set(save);
        } catch (e) {
            error = e.message;
        }
        loading = false;
    }
</script>

<div class="drop-zone" class:loading>
    <input type="file" accept=".sav" bind:files />
    <p>Drop your SaveDataXX.sav file here</p>
</div>
```

## Data IDs Reference

```typescript
// src/lib/save/data-ids.ts
export const DATA_IDS = {
    // Social Links (5304-5346)
    SOCIAL_LINKS: {
        SEES: 5304,
        TOMOCHIKA: 5306,
        YAMAGISHI: 5308,
        KIRIJO: 5310,
        ODAGIRI: 5312,
        KITAMURA: 5314,
        TAKEBA: 5316,
        MIYAMOTO: 5318,
        FUSHIMI: 5320,
        MAYA: 5322,
        HIRAGA: 5324,
        NISHIWAKI: 5326,
        MAIKO: 5328,
        PHAROS: 5330,
        BEBE: 5332,
        TANAKA: 5334,
        MUTATSU: 5336,
        HAYASE: 5338,
        SUEMITSU: 5340,
        KAMIKI: 5342,
        NYX_TEAM: 5344,
        AIGIS: 5346,
    },

    // Social Stats
    ACADEMICS: 5356,   // max 230
    CHARM: 5358,       // max 100
    COURAGE: 5360,     // max 80

    // Other
    MONEY: 7261,
    PLAYTIME: 12836,
    DIFFICULTY: 388,
    DAY_COUNTER: 1932,
} as const;
```

## Build Configuration

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        target: 'esnext',
        minify: 'terser',
    },
});
```

```typescript
 // svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
    kit: {
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: 'index.html',
            precompress: false,
            strict: true
        })
    }
};
```

## GitHub Actions Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

## Dependencies

```json
{
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

No runtime dependencies - all binary handling is native browser APIs.

## Migration Path from Python

1. Copy decryption logic → `src/lib/crypto/decrypt.ts`
2. Port SavConverter → `src/lib/gvas/` module
3. Extract data IDs → `src/lib/save/data-ids.ts`
4. Build UI components incrementally
5. Test with real save files from `data/` directory
6. Deploy to GitHub Pages

## Testing Strategy

- Unit tests for crypto (verified bit-exact with Python output)
- Integration tests with sample saves
- Browser tests on Chrome/Firefox/Safari
- Import/Export round-trip validation
