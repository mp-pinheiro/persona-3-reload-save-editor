# Persona 3 Reload Save Editor - Web Edition

A fast, client-side only save editor for Persona 3 Reload that runs entirely in your browser.

## Features

- Runs entirely client-side -- save data never leaves your browser
- Money, Social Stats (Academics, Charm, Courage), all 22 Social Links
- Story flags (ending status)
- Achievement progress tracking

## Usage

1. Visit the website (or deploy locally)
2. Drag and drop your `.sav` file or click to browse
3. Edit values using the intuitive interface
4. Click "Download Modified Save" to export
5. Replace your original save file with the downloaded one

### Save File Location

Steam: `Steam/steamapps/common/P3R/save/<Steam ID>/SaveDataXXX.sav`

## Development

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000` to test locally.

## Building

```bash
npm run build
```

The built files will be in `build/`.

## Credits

Based on the excellent [Python-GVAS-JSON-Converter](https://github.com/afkaf/Python-GVAS-JSON-Converter) by afkaf.

## License

MIT
