export function isClass(v) {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

export function getFilter(filterObj) {
  if (filterObj && typeof filterObj === 'object' && Object.keys(filterObj).length) {
    let filters = {};
    for (const key in filterObj) {
      if (typeof filterObj[key] !== 'undefined' && filterObj[key] !== null) {
        filters[key] = filterObj[key];
      }
    }
    return Object.keys(filters).length ? filters : undefined;
  }
}

export function convertToQueryString(params, parentKey = null) {
  const queryParts = [];

  for (const [key, value] of Object.entries(params)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      if (key === '$and' || key === '$or') {
        const arrayQueryParts = value.map((element) => convertToQueryString(element));
        queryParts.push(
          `${encodeURIComponent(fullKey)}=${encodeURIComponent(`[${arrayQueryParts.join('&')}]`)}`,
        );
      } else {
        queryParts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value.join(','))}`);
      }
    } else if (typeof value === 'object' && value !== null) {
      queryParts.push(convertToQueryString(value, fullKey));
    } else {
      queryParts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }

  return queryParts.join('&');
}

export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null ||
    obj1 === undefined ||
    obj2 === undefined
  ) {
    return false;
  }

  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
