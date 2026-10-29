/* Compile approved duplicate relationships; never merge by one shared PNG. */
import {resourceSignature} from './resources.mjs';
export function compileAliases(records, requested) {
  const aliases = {}, decisions = [];
  for (const id of Object.keys(requested).sort()) {
    const rule = requested[id];
    if (!rule || typeof rule.target !== 'string' || typeof rule.reason !== 'string' || !rule.reason.trim()) throw new Error('Invalid alias rule: ' + id);
    if (id === rule.target) throw new Error('Self alias: ' + id);
    if (!Object.hasOwn(records, id) || !Object.hasOwn(records, rule.target)) throw new Error('Missing alias endpoint: ' + id);
    aliases[id] = rule.target;
  }
  function canonical(id) {
    const visited = new Set();
    while (Object.hasOwn(aliases, id)) {
      if (visited.has(id)) throw new Error('Alias cycle: ' + id);
      visited.add(id); id = aliases[id];
    }
    return id;
  }
  for (const id of Object.keys(aliases)) {
    const target = canonical(id);
    if (resourceSignature(records[id]) !== resourceSignature(records[target])) throw new Error('Alias would lose model, state or resource: ' + id);
    aliases[id] = target;
    decisions.push({id, target, reason: requested[id].reason});
  }
  return {aliases, visible: Object.keys(records).filter(id => !Object.hasOwn(aliases, id)).sort(), decisions};
}
