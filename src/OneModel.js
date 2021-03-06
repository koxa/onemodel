import ServerModel from "./server/model/ServerModel";
import ClientModel from "./client/model/ClientModel";

/**
 * OneModel is a ClientModel when in Browser, otherwise it's ServerModel if common js modules exist
 */
let Parent;
if (typeof window === "undefined" && module && module.exports) { // it's NodeJS
    Parent = ServerModel;
} else if (window) {
    Parent = ClientModel;
} else {
    throw new Error('Unable to certainly determine environment to export OneModel');
}

class OneModel extends Parent {
}

export default OneModel;
