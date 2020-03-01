import {ServerModel, ClientModel} from "../../index";

/**
 * Model is a ClientModel when in Browser, otherwise it's ServerModel if common js modules exist
 */
let Parent;
if (module && module.exports) { // it's NodeJS
    Parent = ServerModel;
} else if (window) {
    Parent = ClientModel;
} else {
    throw new Error('Unable to certainly determine environment to export Model');
}

class Model extends Parent {
}

export default Model;
