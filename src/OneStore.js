import ServerStore from './server/store/ServerStore';
import ClientStore from './client/store/ClientStore';

/**
 * OneModel is a ClientModel when in Browser, otherwise it's ServerModel if common js modules exist
 */
let Parent;
if (typeof window === 'undefined' && module) {
  // it's NodeJS
  Parent = ServerStore;
} else if (typeof window !== 'undefined') {
  Parent = ClientStore;
} else {
  throw new Error('Unable to certainly determine environment to export OneModel');
}

class OneStore extends Parent {}

export default OneStore;
