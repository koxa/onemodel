export function isClass(v) {
  return typeof v === "function" && /^\s*class\s+/.test(v.toString());
}

export function isLiteralObject(obj) {
  return (obj && typeof obj === "object" && obj.constructor === Object);
}

export function getFilter(filterObj) {
  if (filterObj && typeof filterObj === "object" && Object.keys(filterObj).length) {
    let filters = {};
    for (const key in filterObj) {
      if (typeof filterObj[key] !== "undefined" && filterObj[key] !== null) {
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
      if (key === "$and" || key === "$or") {
        const arrayQueryParts = value.map((element) => convertToQueryString(element));
        queryParts.push(
          `${encodeURIComponent(fullKey)}=${encodeURIComponent(`[${arrayQueryParts.join("&")}]`)}`
        );
      } else {
        queryParts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value.join(","))}`);
      }
    } else if (typeof value === "object" && value !== null) {
      queryParts.push(convertToQueryString(value, fullKey));
    } else {
      queryParts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }

  return queryParts.join("&");
}

export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
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

export function deepMerge(target, source) {
  switch (typeof target) {
    case "undefined":
    case "boolean":
    case "number":
    case "bigint":
    case "string":
    case "symbol":
    case "function":
      return source; // source value takes priority and will override target
    case "object": // objects can be {}, array, null
      if (typeof source !== "object") {
        return source; // if types don't match source takes priority //todo: should we take 'undefined' as value ?
      }
      if (target === null) {
        return source;
      } else if (Array.isArray(target)) {
        if (Array.isArray(source)) {
          target.push(...source); // simply append all source elements to target, won't check for uniqueness
          return target;
        } else {
          return source;
        }
      } else if (target.constructor === Object) {
        if (source.constructor === Object) {
          for (let prop in source) {
            target[prop] = deepMerge(target[prop], source[prop]);
          }
          return target;
        } else {
          return source;
        }
      }
      throw new Error("Unknown object prototype for target" + target);
    default:
      throw new Error("Unsupported deepMerge type");
  }
}
