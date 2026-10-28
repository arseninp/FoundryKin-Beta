/* Explicit model dispatch. Modules register builders; none replace another builder. */
const KEY = /^[a-z][a-z0-9_-]*$/;
function descriptor(entry) {
  if (!entry || !KEY.test(entry.id) || typeof entry.build !== 'function') throw new Error('Invalid model registration');
  const scale = entry.scale ?? 1, mode = entry.mode ?? 'volume';
  if (!Number.isFinite(scale) || scale <= 0 || !['volume', 'sprite'].includes(mode)) throw new Error('Invalid model view: ' + entry.id);
  return Object.freeze({id: entry.id, build: entry.build, scale, mode});
}
export function createModelRegistry() {
  const models = new Map();
  let sealed = false;
  function register(entries) {
    if (sealed) throw new Error('Model registry is sealed');
    if (!Array.isArray(entries)) throw new Error('Model registrations must be an array');
    const prepared = entries.map(descriptor), seen = new Set();
    for (const entry of prepared) {
      if (seen.has(entry.id) || models.has(entry.id)) throw new Error('Duplicate model: ' + entry.id);
      seen.add(entry.id);
    }
    for (const entry of prepared) models.set(entry.id, entry);
  }
  function get(id) {
    if (!models.has(id)) throw new Error('Unknown model: ' + id);
    return models.get(id);
  }
  function build(id, environment) {
    const model = get(id);
    if (!environment || typeof environment !== 'object') throw new Error('Missing model environment');
    return model.build(environment);
  }
  function validate(records) {
    for (const [id, record] of Object.entries(records)) {
      if (!record || typeof record.model !== 'string') throw new Error('Missing model for object: ' + id);
      get(record.model);
    }
  }
  return Object.freeze({register, get, build, validate,
    has: id => models.has(id),
    ids: () => [...models.keys()].sort(),
    seal() { sealed = true; }
  });
}
