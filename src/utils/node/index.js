function isArrayValue(value) {
  return value.includes('[') && value.includes(']');
}

function isArrayCommaValue(value) {
  return !isArrayValue(value) && value.includes(',');
}

function parseToType(value) {
  return !isNaN(value) ? parseInt(value) : value;
}

function extractArrayValue(str) {
  if (typeof str === 'string' && str.includes('[') && str.includes(']')) {
    const regex = /\[(.*?)\]/;
    const match = regex.exec(str);
    if (match) {
      return match[1];
    }
  }
  return str;
}

function objectToArray(obj) {
  if (typeof obj !== 'object') {
    return obj;
  }
  const entries = Object.entries(obj);
  const result = entries.map(([key, value]) => {
    const item = {};
    item[key] = value;
    return item;
  });
  return result;
}

function getQueryParams(req) {
  const data = new URLSearchParams(req.url.split('?')[1]);

  const parseQuery = (query) =>
    [...query.entries()].reduce((result, [key, value]) => {
      const parts = key.split('.');
      const lastPart = parts.pop();
      const current = parts.reduce((obj, part) => obj[part] || (obj[part] = {}), result);

      if (lastPart.includes('$')) {
        const [field] = lastPart.split('.$');
        if (!current[field]) {
          current[field] = {};
        }
        if (field && typeof value !== 'undefined') {
          if (isArrayValue(value)) {
            const valueObj = parseQuery(new URLSearchParams(extractArrayValue(value)));
            current[field] = objectToArray(valueObj);
          } else if (isArrayCommaValue(value)) {
            current[field] = value.split(',');
          } else {
            current[field] = parseToType(value);
          }
        }
      } else {
        current[lastPart] = isArrayCommaValue(value) ? value.split(',') : parseToType(value);
      }

      return result;
    }, {});

  return parseQuery(data);
}

export {getQueryParams};
