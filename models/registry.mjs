/* Explicit model registry. Invalid registrations never partially change the registry. */
const KEY = /^[a-z][a-z0-9_-]*$/;
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function validKey(value) {
  return typeof value === 'string' && KEY.test(value);
}
function describe(entry) {
  if (!isObject(entry) || !Object.hasOwn(entry, 'id') || !validKey(entry.id) || typeof entry.build !== 'function') throw new Error('Invalid model registration');
  const scale = entry.scale === undefined ? 1 : entry.scale;
  const mode = entry.mode === undefined ? 'volume' : entry.mode;
  if (typeof scale !== 'number' || !Number.isFinite(scale) || scale <= 0) throw new Error('Invalid model scale: ' + entry.id);
  if (mode !== 'volume' && mode !== 'sprite') throw new Error('Invalid model mode: ' + entry.id);
  return Object.freeze({id: entry.id, build: entry.build, scale, mode});
}
export function createModelRegistry() {
  const entries = new Map();
  let sealed = false;
  function register(batch) {
    if (sealed) throw new Error('Model registry is sealed');
    if (!Array.isArray(batch)) throw new Error('Model registrations must be an array');
    const pending = new Map();
    for (const candidate of batch) {
      const entry = describe(candidate);
      if (entries.has(entry.id) || pending.has(entry.id)) throw new Error('Duplicate model: ' + entry.id);
      pending.set(entry.id, entry);
    }
    for (const [id, entry] of pending) entries.set(id, entry);
  }
  function get(id) {
    if (!validKey(id) || !entries.has(id)) throw new Error('Unknown model key');
    return entries.get(id);
  }
  function build(id, environment) {
    const entry = get(id);
    if (!isObject(environment)) throw new Error('Missing model environment');
    return entry.build(environment);
  }
  function validate(records) {
    if (!isObject(records)) throw new Error('Invalid model assignments');
    for (const [id, record] of Object.entries(records)) {
      if (!isObject(record) || !Object.hasOwn(record, 'model') || !validKey(record.model)) throw new Error('Missing model for object: ' + id);
      get(record.model);
    }
  }
  return Object.freeze({register, get, build, validate,
    has: id => validKey(id) && entries.has(id),
    ids: () => [...entries.keys()].sort(),
    seal() { sealed = true; }
  });
}
