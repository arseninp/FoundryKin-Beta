/* Diagnostic: every legacy resource id rejected by the admission step must have an active successor or an explicit reason. */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export const SUCCESSORS = {
  carpet: ['white_carpet'], chain: ['iron_chain'], concrete: ['white_concrete'], concretePowder: ['white_concrete_powder'],
  coral: ['tube_coral'], coral_block: ['tube_coral_block'], coral_fan: ['tube_coral_fan'], coral_fan_dead: ['dead_tube_coral_fan'],
  coral_fan_hang: ['tube_coral_wall_fan'], coral_fan_hang2: ['brain_coral_wall_fan'], coral_fan_hang3: ['fire_coral_wall_fan'],
  deprecated_anvil: ['anvil'], deprecated_purpur_block_1: ['purpur_block'], deprecated_purpur_block_2: ['purpur_pillar'],
  double_plant: ['sunflower', 'lilac'], double_stone_slab: ['double_stone_block_slab', 'smooth_stone_slab'], double_stone_slab2: ['double_stone_block_slab2', 'red_sandstone_slab'],
  double_stone_slab3: ['double_stone_block_slab3', 'end_stone_brick_slab'], double_stone_slab4: ['double_stone_block_slab4', 'mossy_cobblestone_slab'],
  double_wooden_slab: ['oak_double_slab', 'oak_slab'], fence: ['oak_fence'], grass: ['grass_block'], glowingobsidian: ['crying_obsidian', 'obsidian'],
  leaves: ['oak_leaves'], leaves2: ['acacia_leaves'], log: ['oak_log'], log2: ['acacia_log'], monster_egg: ['infested_stone'],
  planks: ['oak_planks'], red_flower: ['poppy'], sapling: ['oak_sapling'], seaLantern: ['sea_lantern'], shulker_box: ['undyed_shulker_box'],
  skull: ['skeleton_skull'], stained_glass: ['white_stained_glass'], stained_glass_pane: ['white_stained_glass_pane'],
  stained_hardened_clay: ['white_terracotta'], stone_slab: ['smooth_stone_slab', 'stone_block_slab'], stone_slab2: ['red_sandstone_slab', 'stone_block_slab2'],
  stone_slab3: ['end_stone_brick_slab', 'stone_block_slab3'], stone_slab4: ['mossy_cobblestone_slab', 'stone_block_slab4'],
  stonebrick: ['stone_bricks'], stonecutter: ['stonecutter_block'], tallgrass: ['short_grass'], tripWire: ['trip_wire'],
  wood: ['oak_wood'], wooden_slab: ['oak_slab'], wool: ['white_wool'], yellow_flower: ['dandelion']
};
export const INTERNAL = {
  end_gateway: 'kept as auxiliary render resource', lava_cauldron: 'kept as auxiliary render resource',
  info_update: 'internal placeholder block', info_update2: 'internal placeholder block', invisibleBedrock: 'internal placeholder block',
  movingBlock: 'technical block', netherreactor: 'removed from the game', pistonArmCollision: 'technical block', stickyPistonArmCollision: 'technical block', reserved6: 'reserved id'
};
export function check(blockIds, rejectedIds) {
  const have = new Set(blockIds), out = { resolved: [], missing: [], internal: [], unknown: [] };
  for (const id of rejectedIds) {
    if (Object.hasOwn(INTERNAL, id)) { out.internal.push({ id, reason: INTERNAL[id] }); continue; }
    const tried = SUCCESSORS[id];
    if (!tried) { out.unknown.push(id); continue; }
    const hit = tried.find(x => have.has(x));
    if (hit) out.resolved.push({ id, successor: hit }); else out.missing.push({ id, tried });
  }
  return out;
}
export async function main(args) {
  if (args.length !== 2) throw new Error('Usage: node tools/check-legacy-successors.mjs CATALOG_DIRECTORY REPORT_JSON');
  const [directory, output] = args;
  const report = JSON.parse(await readFile(resolve(directory, 'report.json'), 'utf8'));
  const blocks = new Set();
  for (const name of (await readdir(resolve(directory))).filter(n => /^blocks-\d+\.json$/.test(n))) Object.keys(JSON.parse(await readFile(resolve(directory, name), 'utf8'))).forEach(id => blocks.add(id));
  if (!blocks.size) throw new Error('No admitted blocks found');
  const rejected = report.rejected.filter(r => r.reason === 'not-in-release-registry').map(r => r.id);
  const result = check([...blocks], rejected);
  await writeFile(resolve(output), JSON.stringify({ schema: 1, admitted: blocks.size, rejectedChecked: rejected.length, ...result }, null, 1) + '\n');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
