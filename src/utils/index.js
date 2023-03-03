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
