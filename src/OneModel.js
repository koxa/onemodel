/**
 * OneModel is a ClientModel when in Browser, otherwise it's ServerModel if common js modules exist
 */

//todo: optimize code and check when imported fromm node or webpack or web
let Parent;
if (process.env.WEBPACK_TARGET) { // if compiling via webpack
  if (process.env.WEBPACK_TARGET === 'node') {
    // it's NodeJS
    Parent = (await import('./server/model/ServerModel.js')).default;
  } else if (process.env.WEBPACK_TARGET === 'web') {
    Parent = (await import('./client/model/ClientModel.js')).default;
  } else {
    throw new Error('Unknown webpack target');
  }
} else {
  Parent = (await import( './server/model/ServerModel.js')).default;
}
class OneModel extends Parent {}
export default OneModel;