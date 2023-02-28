/**
 * OneModel is a ClientModel when in Browser, otherwise it's ServerModel if common js modules exist
 */
let Parent;
if (process.env.WEBPACK_TARGET === 'node') {
  // it's NodeJS
  Parent = require('./server/store/ServerStore').default;
} else if (process.env.WEBPACK_TARGET === 'web') {
  Parent = require('./client/store/ClientStore').default;
} else {
  throw new Error('Unable to certainly determine environment to export OneModel');
}

class OneStore extends Parent {}

export default OneStore;
