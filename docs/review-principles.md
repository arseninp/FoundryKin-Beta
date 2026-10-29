# Review principles and handoff safety

Updated 2026-10-29. Verified code baseline: 502d4b457b59d1299fe88fd2e2a6ac0fd0e6799e. Read CONTEXT.md first.

## Owner and workflow

- The owner curates behaviour and appearance, not source code. Use Russian and make technical decisions; do not ask them to debug files or run scripts.
- One reported defect means inspect the analogous class: wood types, colours, oxidation stages, live/dead coral. Preserve accepted geometry and UV unless a concrete defect requires changes.
- Work in main. refactor-0.9 was merged and deleted. backup=304bc4a preserves main at 6bd8b58 before the merge. Do not recreate branches or refresh this backup automatically.
- Move coherent groups through data, assignments, geometry, preview and tests. Do not substitute an endless sequence of disconnected helpers or duplicated audits for integration.

## Catalog meaning

The catalog is a user-facing collection, not a list of internal game IDs. Distinguish exact duplicates, geometry forms, model states, growth stages and animation frames. One shared PNG does not prove equivalent objects.

- Preserve unique resource paths AND indexed alternatives, including repeated entries. Do not guess a state by the selected editing slot.
- Keep one group for furnace/lit_furnace and analogous approved pairs; retain all unique files. Prefixes suggest candidates, not unconditional merges.
- Waxed/infested duplicates keep compatible old-ID routes. Normal/deepslate ores remain distinct.
- Pumpkin plain/carved/lit belongs together; pitcher crop/plant resources stay accessible. Bamboo shoot and mature bamboo should become one selectable growth group; keep the accepted mature composite. Bamboo blocks, fence and gate are separate objects/models.
- Potted azalea textures are already declared in blocks.json; add the potted form instead of treating those textures as absent. Amethyst alternatives should render one selected stage, not a display of four stages together.
- Preserve correct compound plants, stems and petals. End portal/gateway are frontal sprites; Nether portal is a vertical plane; end portal frame is a distinct model.
- Icons use explicit roles. File paths and IDs are not translated. All UI/help text must consistently follow EN/RU via localization, without mixed-language fragments.

## Evidence

Distinguish code written, connected runtime, owner acceptance, local stub tests, real-input tests, full CI, actual Three/WebGL and export regression. Registration or a matching SHA is not visual correctness. The full new compiler and browser integration are not confirmed complete.

Do not call every record without textures a technical block: some need alternative resource preparation. Do not restore rejected legacy definitions just to inflate coverage.

## Writes and interruptions

- Resolve targets, present the exact complete write arguments and contents, then write only what was approved. Verify the resulting commit and file list.
- After cancellation, retry, deleted messages or a network interruption, inspect GitHub before claiming a write failed or retrying it. Commit 502d4b4 did persist before the owner's later refusal; repeated statements that f95deda was still HEAD were wrong.
- Do not attribute code quality to an assumed model switch. The assistant cannot establish provider availability or the cause of thread failures from code.
- Keep files below 25000 UTF-8 bytes by responsibility, not minification. No one-off Actions migrations, PATCHES/srcdoc or runtime patch loaders. Validation remains read-only.
- Include loader/version changes when changing the live application. Current HTML/FK_V are 0.9.1 despite the v0.9.2 commit message. Documentation does not change versions.
- GitHub backup is not a backup of localStorage packs. Never clear user data to solve cache issues; preserve PNG paths and user storage keys.
- Change reports should be concise. Provide short English Find names only when there is something new to check; explicitly say when a package is not connected and phone testing is premature.
