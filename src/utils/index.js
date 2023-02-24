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

export function convertToUrlQuery(query) {
  if (typeof query === 'object' && Object.keys(query).length) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'object') {
        if (Object.keys(value).length) {
          params.append(key, JSON.stringify(value));
        }
      } else if (typeof value !== 'undefined' && value !== '') {
        params.append(key, value);
      }
    }
    const queryStr = params.toString();
    return queryStr ? '?' + params.toString() : '';
  }
  return '';
}

export function parseObject(obj) {
  if (typeof obj === 'string') {
    try {
      return JSON.parse(obj);
    } catch {
      return obj;
    }
  }
  return obj;
}

export function parseQuery(obj) {
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = parseObject(value);
    }
    return result;
  }
  return obj;
}
