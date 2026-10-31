# Review principles and handoff safety

Updated 2026-10-31. Verified repository HEAD before this documentation write: 5c5f9f4f449ba0aba3be6847cd09287f0d716130. Read CONTEXT first. Documentation is not an application release or a code fix.

## Workflow and write verification

- The owner curates behaviour/appearance, not code. Respond briefly in Russian. Own technical decisions/debugging; do not delegate scripts to the owner.
- Work in main. refactor-0.9 was merged/deleted; do not recreate it or refresh backup automatically. Code backup does not contain localStorage packs.
- Prepare coherent medium-sized packages: geometry, assignments, resources, state, preview, tests. Avoid isolated helpers, duplicate audits, huge rewrites and unnecessary cleanup.
- When a package is ready, request the write immediately rather than spending a separate turn announcing readiness. The owner withdrew mandatory per-commit remaining-count reports for productivity. Never invent remaining model counts.
- Every external write requires system confirmation with exact complete arguments/content. Execute only approved arguments. Verify actual saved content or full diff against the approved package, including all expected files. File counts and line statistics do not prove identity or correct file boundaries.
- After interruption inspect GitHub before retrying. Update documentation when requested, not after each model. Keep files below 25000 UTF-8 bytes by responsibility. No runtime patch loaders or one-off Actions migrations.

## Current blocking defect

The full 5c5f9f4 diff was checked in this pass. It changed five files although the request described eight. catalog/rules/utility-parts.mjs contains literal path/content headers and the intended dependencies.mjs source appended after its function, including a repeated chorusPlantResources import. The module is syntactically damaged. The actual dependencies.mjs still lacks chorus_flower/stem. The intended policy-test changes and chorus test file were not included in that commit.

Do not describe chorus as completed, or historical draft tests as proof of the saved package. First remove the misplaced tail, update the real dependency module, inspect/restore the agreed tests and verify the saved normalize→attach→preview→build chain. Preserve already committed chorus geometry/assignments unless a concrete defect requires changes. Do not silently mix this code repair into a documentation-only write.

## Scope and preservation

Do not restart committed work from stale checklists. Slime/honey_block/farmland/snow_layer assignments exist and the honey_block IDs match. Roots reuse cross; pot PNGs remain available without selecting potted geometry. Indexed cube states cover hives/crafter/suspicious blocks/bookshelf/heart. Composter/scaffolding have open structural geometry; piston backs use an ordinary head texture via an explicit dependency, including sticky pistons. Mushroom indexed selection is committed; do not reopen it as missing implementation. Cage spawner/vault surfaces and variants are committed without inner entities/items.

Chorus geometry exists but the package is broken/incomplete. Its base noside form does not include random noside1..3 decoration. Preserve this limitation explicitly rather than claiming full game-state reproduction.

Finish the agreed model scope without silently shrinking the catalog. Entities/cushion/bell were deferred. Signs/beds and other block entities require a shared source/inventory/geometry/material adapter. A dependency or inventory path is not that adapter and does not create a card. Make scope explicit before switching the main runtime. Unknown models never become cube fallbacks.

Distinguish duplicates, forms, states, growth stages and animation frames. Preserve owned paths, carried resources, icons, indexed repeats and old-ID routes. Shared PNG does not establish equivalent geometry. Waxed/infested require equivalence; oxidation remains; normal/deepslate ores stay separate. Do not restore obsolete stonecutter; use stonecutter_block.

Wall coral fans stay aliases of ordinary fans, without separate cards/models/mounting switches. Candle cake aliases preserve resources; ordinary candles remain separate. Do not weaken equivalence checks to reduce counters.

Inspect wood/colour/oxidation variants as classes. Preserve accepted geometry/UV unless fixing a concrete defect. Keep adult bamboo composite and implement shoot/adult forms separately. Show one centred amethyst stage. Potted azalea still needs Bedrock PNG/UV review. Doors currently implement closed form; repeater/comparator preserve accepted legacy geometry.

Edit slots must not control model states/geometry. Dependencies authorize specific shared roles, not arbitrary foreign paths or ownership transfers. Preserve PNG dimensions/alpha/atlases/frame strips. Gel volumes and material alpha policy are separate: committed geometry does not prove actual transparent rendering. Do not alter pixels or force opacity to manufacture success.

Preserve the light paper layout; centralize design tokens, dark colours remain unchosen. Visible text/help follows EN/RU; filenames/IDs are not translated. Playback remains separate from model state.

## Evidence and handoff

Separate committed source, runtime connection, expected registry counts, targeted mocks, real-input checks, full compiler/CI, actual Three/WebGL, Android/export acceptance. Registration and checksums do not establish visual correctness. Coverage counts source records, not cards or completed refactoring.

This pass read OLDCHAT13 and all six previous documents, checked recent commits, full final diff, actual dependencies and library test. It did not run tests, inspect every historical diff, obtain a fresh full coverage report or recheck HTML. Historical test claims remain historical. In OLDCHAT13 a later run of 26 saved redstone/structures/preview-parts tests was reported; that does not validate the damaged subsequent chorus commit.

Earlier mushroom research included acknowledged simplified dependencies/fabricated fixtures; those claims never proved real inputs. The later committed mushroom package implements synchronized native indices without changing common cube UV. Its targeted fixture tests still do not establish full pinned-input or WebGL acceptance.

Use existing tools/model-coverage.mjs/inputValidation, not another audit. inputValidation examines assigned records individually, not merged cards/icons/preview/render. Separate unresolved/missing builders/normalization/inventory/dependency/rendering errors. Missing data means not checked. Artifact workflow is not successful CI. Current full validate/tests/compile/CI and visual/export acceptance remain unconfirmed. Old 78/74 unresolved and the test expectation of 95 model types are not a fresh measured remainder.

Start new chats with CONTEXT/relevant code, not archives unless explicitly requested. Sandbox/files/attachments do not persist automatically. Chat/provider failure causes are unknown; do not assert application code or thread length as proven causes.

Never clear fk070_packs for cache issues. Recheck HTML before integration changes; keep working legacy until acceptance, then remove replaced runtime and synchronize loader/cache versions.
