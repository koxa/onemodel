function getQueryParams(req) {
  const data = new URLSearchParams(req.url.split('?')[1]);

  const isArrayValue = (value) => {
    return value.includes(',');
  };

  const parseToType = (value) => {
    return !isNaN(value) ? parseInt(value) : value;
  };

  return [...data.entries()].reduce((result, [key, value]) => {
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
          current[field] = value.split(',');
        } else {
          current[field] = parseToType(value);
        }
      }
    } else {
      current[lastPart] = isArrayValue(value) ? value.split(',') : parseToType(value);
    }

    return result;
  }, {});
}

module.exports = { getQueryParams };
