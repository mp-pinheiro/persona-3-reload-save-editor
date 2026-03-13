# Persona 3 Reload Save Editor

A Python-based save editor for Persona 3 Reload that can read, modify, and write save files in GVAS format.

**Note:** Data IDs have been updated for the current game version (+4 offset after game updates).

## Features

- Edit Money, Firstname, Lastname
- Edit Character stats (MC, Yukari, Junpei)
- Edit Playtime, Difficulty
- Edit Social Link levels and points
- Edit Social Stats (Academics, Charm, Courage)
- Edit Personas (level, exp, skills, stats)
- **NEW:** Achievement Progress Tracking - view progress toward all 56 achievements
- **NEW:** Job Earnings tracking for "The Grindset Mindset"
- **NEW:** Corrected exploration IDs (Twilight Fragments, Monad Doors, etc.)

## Usage

1. Place `SavConverter/` folder in the same directory as `Editor.py`
2. Run: `python3 Editor.py`
3. Enter the path to your `.sav` file when prompted
4. Type `help` to see all available commands
5. Type `achievements` to see achievement progress

**Important:** The editor creates automatic backups in `{save-path}/backup/{timestamp}_{filename}.sav` whenever you save.

## Platform Compatibility

Tested with Steam version. May work with:
- Microsoft Store version (untested)
- PS4/PS5 saves require decryption first (see: https://www.youtube.com/watch?v=QA1lLxn_klA)

## Warning

External save modification can damage your save file. Use at your own risk. The editor creates backups, but always keep your own backups.

## Project Origins

**Originally by:** [RealDarkCraft](https://github.com/RealDarkCraft/persona-3-reload-save-editor)

This project is no longer a fork and is now actively developed with assistance from [Claude](https://claude.ai/code), an AI coding assistant by Anthropic.

## Credits

- Base GVAS conversion: [afkaf/Python-GVAS-JSON-Converter](https://github.com/afkaf/Python-GVAS-JSON-Converter)

## License

This project maintains the original license and attributions from the upstream project.
