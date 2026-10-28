/* Block-to-item links are data policy, never responsibilities of model builders. */
const own = (object, key) => Object.hasOwn(object, key);
const COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
const LINKS = {
  brewing_stand: 'brewing_stand', cake: 'cake', campfire: 'campfire', soul_campfire: 'soul_campfire', cauldron: 'cauldron', flower_pot: 'flower_pot', hopper: 'hopper', lever: 'lever',
  frame: 'item_frame', glow_frame: 'glow_item_frame', iron_chain: 'chain', reeds: 'reeds', kelp: 'kelp', nether_wart: 'nether_wart', hanging_roots: 'hanging_roots', nether_sprouts: 'nether_sprouts',
  redstone_wire: 'redstone_dust', trip_wire: 'string', unpowered_repeater: 'repeater', powered_repeater: 'repeater', unpowered_comparator: 'comparator', powered_comparator: 'comparator',
  pitcher_plant: 'pitcher_pod', torchflower_crop: 'torchflower_seeds', wheat: 'seeds_wheat', beetroot: 'seeds_beetroot', carrots: 'carrot', potatoes: 'potato', pumpkin_stem: 'seeds_pumpkin', melon_stem: 'seeds_melon',
  sweet_berry_bush: 'sweet_berries', cave_vines: 'glow_berries', standing_sign: 'sign', wall_sign: 'sign'
};
const SIGN_KEYS = {oak: 'sign', darkoak: 'sign_darkoak', dark_oak: 'sign_darkoak', crimson: 'crimson_sign_item', warped: 'warped_sign_item', mangrove: 'mangrove_sign', bamboo: 'bamboo_sign', cherry: 'cherry_sign', pale_oak: 'pale_oak_sign', poplar: 'poplar_sign'};
export function blockIconLinks(blocks, atlas) {
  const result = [];
  for (const id of Object.keys(blocks).sort()) {
    if (/^(waxed_|infested_)/.test(id)) continue;
    let reference = own(LINKS, id) ? LINKS[id] : null;
    if (!reference && /_door$/.test(id)) reference = id;
    if (!reference && /_hanging_sign$/.test(id)) {
      const wood = id.replace(/_hanging_sign$/, '');
      reference = 'sign_' + (wood === 'dark_oak' ? 'darkoak' : wood) + '_hanging';
    }
    if (!reference && /_(standing|wall)_sign$/.test(id)) {
      const wood = id.replace(/_(standing|wall)_sign$/, '');
      reference = own(SIGN_KEYS, wood) ? SIGN_KEYS[wood] : 'sign_' + wood;
    }
    if (!reference && id.endsWith('_bed')) {
      const color = COLORS.indexOf(id.slice(0, -4));
      if (color >= 0) reference = {item: 'bed', variant: color};
    }
    if (!reference) continue;
    const key = typeof reference === 'string' ? reference : reference.item;
    if (!own(atlas, key)) throw new Error('Missing item-atlas link: ' + id + ' -> ' + key);
    result.push([id, [reference]]);
  }
  return Object.fromEntries(result);
}
