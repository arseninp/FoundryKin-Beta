# FoundryKin architecture

## Current files
- app.html: application shell and screen markup.
- fk-app.js: screens/navigation, packs, storage, import/export and titles.
- fk-style.css: application styles.
- fk-grid.js: card UI, 3D snapshots, legacy editor integration patches.
- fk-editor.js: legacy editor loading, patches, integration API.
- fk-bg.js: model/card background and sticky search styles.
- index.html: legacy editor base, scheduled for replacement.

## Target organization (not implemented yet)
- app/: Create, pack screen, Finder, navigation, storage and import/export.
- cards/: card UI and edited-state indication.
- render/: models, textures, preview camera and centering.
- editor/: drawing canvas, tools, undo/redo, reset and layout.
- help/: help content, technical details and errors.
- config/: versions and localized labels.

Use explicit APIs, not source-string replacement, eval or synchronous loader wrappers. Separate rendering from card DOM and storage from screens. Replace the legacy index.html base and remove patches after regression testing loading/editing/saving/import/export. Update this file when ownership changes.

## Current scope
v0.8.21 changes interface only. Full removal of model 2D rendering follows device acceptance (see TODO.md). Drawing canvases remain.
