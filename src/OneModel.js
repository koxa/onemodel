/**
 * OneModel is a ClientModel when in Browser, otherwise it's ServerModel if common js modules exist
 */
let Parent;
if (process.env.WEBPACK_TARGET === 'node') {
  // it's NodeJS
  Parent = require('./server/model/ServerModel').default;
} else if (process.env.WEBPACK_TARGET === 'web') {
  Parent = require('./client/model/ClientModel').default;
} else {
  throw new Error('Unable to certainly determine environment to export OneModel');
}

class OneModel extends Parent {}

export default OneModel;
