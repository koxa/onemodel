export function isClass(v: unknown) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}