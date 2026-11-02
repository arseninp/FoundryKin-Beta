# Review principles and handoff safety

Updated 2026-11-02. Verified code HEAD before this documentation write: cc5d4e20ac4ef0ed2c9ab66d955bee8d79154a1c. Read CONTEXT first. Documentation is not an application release or runtime acceptance.

## Workflow and write verification

- The owner curates behaviour/appearance, not code. Respond briefly in Russian. Own technical decisions/debugging; do not delegate scripts or TGA research to the owner.
- Work in main. refactor-0.9 was merged/deleted; do not recreate it or refresh backup automatically. Code backup does not contain localStorage packs. Never clear fk070_packs for cache issues.
- The owner requested small self-consistent packages after interrupted requests. Prepare material integration first, then eyeblossom card merging separately, then joint verification. Do not present an isolated component as a finished user feature.
- Do not add new permanent test files without separate agreement. The proposed fruit integration test was declined in OLDCHAT15; local checks do not require committing their harness. Existing tests were not removed by this decision. Audit their purpose later as requested, without blanket deletion or promises of automatic cleanup.
- Avoid duplicate audits, isolated diagnostic helpers, huge rewrites, runtime patch loaders and one-off Actions migrations. When ready, request the exact write immediately. Per-commit remaining-count reports are not mandatory; never invent counts.
- Every external write requires system confirmation of complete exact arguments/content. Execute only approved arguments. Verify full saved content or diff against every approved file, not just counts/statistics. Keep files below 25000 UTF-8 bytes by responsibility.
- After interruption inspect GitHub before retrying. Update documents when requested. Sandbox/files/attachments do not persist automatically. Provider failure causes are unknown; AI-model switching is not evidence of a FoundryKin 3D defect.

## Actual stopping point

Main ends at cc5d4e2, adding models/materials.mjs. Current catalog/preview.mjs does not import it. The subsequently declined integration request in OLDCHAT15 did not create a later commit. Do not ask the owner to resend that request or recreate already committed materials. Read the actual chain and prepare the integration afresh.

5720f66 added plant/glow bindings for open_eyeblossom and firefly_bush, immutable registry emissiveRoles and emissive_cross. Glow must use MeshBasicMaterial; a Lambert glow is an explicit error, not a usable approximation. createModelMaterials handles role-based Basic/Lambert materials, classified textures/userData.semi, updates and material disposal while borrowing textures. Integration must cover composite previews, cleanup and ownership, not merely add an import.

After material integration, separately merge closed/open eyeblossom into one card with explicit closed/open selection, preserving both source IDs, owned resources, saved-ID routes and the open glow layer. This merge is agreed but not committed. Do not switch legacy yet.

## Committed behaviour and preservation

Fruit composition/card links exist in 0fa7846/593f918: one pumpkin card with its own stem, one melon card with its own stem. Without stem shows fruit; with stem shows fruit plus an adjacent stem directed towards it. Do not replace fruit with a standalone stem, merge pumpkin with melon or ask the same UI question again. Preserve pumpkin variants, stage/attached/facing, source routes and owned PNGs.

f0df125 adds budding amethyst without growth or with one selected small/medium/large/cluster on one of six faces. Do not merge/remove amethyst cards. Growth resource is shared, not an owned edit slot of the block. Reuse existing builders/UV.

Seagrass, mangrove propagule, static kelp, closed cross and emissive plants are committed. Kelp A–D are not growth stages; retain all native resources and animation definitions. Static geometry is not accepted Bedrock side/UV/TGA playback. Library test now expects 103 types, not a successful run or accepted-card count.

Do not restart older work from stale checklists. Chorus corruption from 5c5f9f4 was repaired by 86b6d8f; it is not a current blocker. Cave vines, bulb/ice/anchor states, furnace front normalization, dragon egg, bamboo/shoot, torchflower/crop and stem already exist, alongside earlier models in CONTEXT.

Distinguish duplicates, forms, states, growth stages and animation frames. Preserve owned paths, carried resources, icons, indexed repeats and saved IDs. Shared PNG alone does not establish equivalent geometry. Waxed/infested require equivalence; oxidation and normal/deepslate remain separate. Use stonecutter_block, not obsolete stonecutter.

Wall coral fans remain aliases without separate mounting cards. Candle cake aliases preserve resources; ordinary candles stay separate. Bamboo/shoot and torchflower/crop preserve distinct source records, not aliases. Inspect wood/colour/oxidation variants as classes. Preserve accepted geometry/UV, including legacy repeater/comparator, unless fixing a concrete defect.

Edit slots must not control geometry/state. Dependencies authorize concrete shared roles, not arbitrary foreign paths or ownership transfers. Preserve PNG dimensions/alpha/atlases/frame strips; never alter pixels or force opacity to manufacture success. Gel geometry and alpha policy are separate. Stem age tint, potted azalea Bedrock UV, decorated pot patterns, active conduit and fire playback remain open.

Sign/bed and other block entities need a shared source/inventory/geometry/material adapter; inventory/dependency paths are not that adapter or a card. Entities/cushion/bell were deferred. Explicitly agree scope before switching the main runtime. Unknown models never become cube fallbacks; do not silently shrink the catalog.

Preserve the light paper layout; centralize design tokens, dark colours remain unchosen. Visible text/help follows EN/RU; filenames/IDs are not translated. Playback stays separate from model state.

## Evidence boundaries

This handoff read OLDCHAT15 in full and all six documents, inspected the latest 12 commits, current preview/forms/materials and the full five-file 5720f66 patch. It did not run tests, reread HTML, inspect every intermediate implementation/diff or perform a complete code audit. Other intermediate details are archive/history evidence.

OLDCHAT15 reports targeted local checks and syntax checks, including fruit composition/integration, amethyst, aquatic plants, propagule, emissive plants and materials. Those environments/reports are not carried into this session. Do not sum overlapping counts or claim fresh execution. Earlier targeted checks and recording-registry integration also do not prove complete pinned inputs, real geometry or WebGL.

Separate committed source, runtime connection, expected registry counts, targeted mocks, selected real-input checks, full compiler/CI, actual Three/WebGL and Android/export acceptance. Checksums and registration do not prove visual correctness. Earlier fabricated/simplified research fixtures were not real-input evidence.

Use existing model-coverage/inputValidation, not another audit. inputValidation examines assigned records individually, not merged cards/icons/preview/render. Distinguish unresolved/missing builders/normalization/inventory/dependency/rendering errors. Artifact workflow is not successful CI. Full validate/tests/compile/CI and visual/export acceptance remain unconfirmed; old 78/74 unresolved and 39 sign are historical.

Recheck HTML before integration changes. Preserve working legacy until agreed acceptance, then remove replaced runtime and synchronize FK_V/cache. Accept draw/undo/redo/Add/reopen/PNG/mcpack, Android, async/storage/import/dimensions/alpha/URL lifecycle before claiming completion.
