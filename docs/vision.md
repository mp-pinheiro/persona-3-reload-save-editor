# Persona 3 Reload Save Editor - Vision

## Goal

Create a fast, reliable browser-based save editor for Persona 3 Reload that runs entirely client-side on GitHub Pages, eliminating the need for Python installation or PyScript's limitations.

## Problem Statement

The current Python implementation requires users to:
1. Install Python and dependencies
2. Run CLI tools or deal with slow PyScript web assembly
3. Work around browser file system restrictions

Players want a simple "drag-save-file, edit, download" experience that just works.

## Core Principles

1. **Client-Side Only** - No server, no API calls, complete privacy
2. **Fast** - Near-instant parsing and editing (< 1 second for typical save)
3. **Simple** - One page, drag-drop interface, no setup required
4. **Reliable** - Bit-exact save file output, no corruption
5. **Extensible** - Easy to add new editable fields as game updates

## Success Metrics

- Load time: < 2 seconds initial page load
- Parse time: < 500ms for a typical .sav file
- Bundle size: < 100KB gzipped for the entire app
- Browser support: Chrome/Edge/Firefox/Safari (last 2 years)

## Non-Goals

- Multi-save editing in one session (nice to have later)
- Save file hosting or cloud storage (privacy concern)
- Real-time collaboration
- Mobile-first design (mobile support OK, not primary)
