# Review principles

Updated 2026-10-28 for code baseline caaff4609af0a5b51a52e5caeca976c7674da31a.

## The owner's review

The owner scrolls through the English catalog alphabetically and reports problem points. A report is a representative example, not a request to inspect that sibling only. The review has reached T; this is not proof that every block or every export path has passed.

- Check and fix the same defect throughout the analogous class: all coral types and dead variants, wood types, colours, copper stages. State justified exceptions; do not wait for a separate complaint about each sibling.
- Preserve accepted geometry unless there is a concrete new defect. Do not rescale or turn the editor model merely to improve a card.
- Do not merge unrelated resources automatically. Normal and deepslate ores stay separate; duplicate lit definitions using the same resources can be hidden. Preserve distinct state textures in slots.
- Keep one pumpkin card containing plain sides, carved face, lit face and top. Crop/plant pitcher resources belong to one flower entry. Bamboo fence and gate remain separate accepted models.
- End portal means the original frontal sprite. End portal frame means the frame body and eye. Nether portal is a vertical plane. Never substitute one for another based on a truncated label.
- Pink petals and wildflowers include green stems. Tripwire hook includes an attached-string preview when the string slot is selected; tripwire itself remains a separate block.

## Communication and verification

Use Russian, concise explanations, and do not ask the owner to debug source code. End change reports with a short English list of object names to paste into Find, not JS filenames or a verbose changelog.

Separate implemented code, owner acceptance, local tests, CI and browser/export verification. Never claim all tests passed because an older stub suite passed. A Java model is a geometry reference, not proof of Bedrock UV or tint. When a repeated visual fix fails, inspect the complete coordinate frame and actual source models instead of making another arbitrary offset.

Heads currently use the skull-to-soul_sand placeholder and are deferred to the entity phase with signs. Do not repeat the obsolete claim that all heads and signs are already finished.

## Writes and continuity

- Edit application source directly on main. Do not use one-off Actions migrations to rewrite it. Keep read-only validation and purpose-built generators separate.
- A write confirmation must contain the exact full target and arguments. files must be an array of path/content objects, never a JSON string, a summary or see placeholder. Send precisely the approved package; verify the resulting commit before reporting success.
- Include all required loader/version changes in the package. Current FK_V 0.8.92 and blocks-b ?v=0.8.93 are a known inconsistency, not a synchronized release. Documentation updates do not silently change code versions.
- Code backup and localStorage pack backup are different. Verify the existing backup branch before large code changes; do not create dated branches or clear user storage automatically.
- Keep files under 25000 UTF-8 bytes by responsibility, not by minifying code. Preserve actual resource paths.
- This file and CONTEXT.md are persistent project instructions. Read them on handoff; do not promise that every future conversation automatically remembers the project.
