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
  let queryString = '';

  for (let key in params) {
    let value = params[key];
    let fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      queryString += `${encodeURIComponent(fullKey)}=${encodeURIComponent(value.join(','))}&`;
    } else if (typeof value === 'object') {
      queryString += convertToQueryString(value, fullKey);
    } else {
      queryString += `${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}&`;
    }
  }

  return queryString;
}
