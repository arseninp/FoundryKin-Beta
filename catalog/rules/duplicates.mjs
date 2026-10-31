/* Approved editor-equivalent classes, not arbitrary shared-texture deduplication. */
const own = (object, key) => Object.hasOwn(object, key);
export function duplicateRules(blocks, explicit = {}) {
  const rules = new Map();
  for (const id of Object.keys(blocks).sort()) {
    let target, reason;
    if (id.startsWith('waxed_')) {
      target = id.slice(6);
      if (target === 'copper') target = 'copper_block';
      reason = 'waxed variant shares the ordinary editor resources';
    } else if (id.startsWith('infested_')) {
      target = id.slice(9);
      reason = 'infested variant shares the ordinary editor resources';
    } else if (/^(?:dead_)?(?:tube|brain|bubble|fire|horn)_coral_wall_fan$/.test(id)) {
      target = id.replace('_coral_wall_fan', '_coral_fan');
      reason = 'approved wall coral fan duplicate of the ordinary editor fan';
    } else continue;
    if (!own(blocks, target)) throw new Error('Missing ordinary counterpart: ' + id + ' -> ' + target);
    rules.set(id, {target, reason});
  }
  for (const [id, rule] of Object.entries(explicit)) {
    if (!rule || typeof rule.target !== 'string' || typeof rule.reason !== 'string' || !rule.reason.trim() || !own(blocks, id) || !own(blocks, rule.target)) throw new Error('Invalid explicit duplicate rule: ' + id);
    if (rules.has(id) && rules.get(id).target !== rule.target) throw new Error('Conflicting duplicate rule: ' + id);
    rules.set(id, {target: rule.target, reason: rule.reason});
  }
  const result = Object.fromEntries(rules);
  for (const id of rules.keys()) {
    let target = id;
    const seen = new Set();
    while (own(result, target)) {
      if (seen.has(target)) throw new Error('Duplicate rule cycle: ' + id);
      seen.add(target);target = result[target].target;
    }
    result[id] = {...result[id], target};
  }
  return result;
}
