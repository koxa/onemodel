import { applyProps, addMixins } from "../utils/mixins.js";

class BaseArray extends Array {
  constructor() {
    super();
    Object.defineProperty(this, this.constructor.getClientIdAttr(), {
      value: this.constructor.generateClientId(),
      enumerable: false,
      writable: false,
      configurable: false
    });

    //apply mixin constructors (copy mixin instance properties to this, starting with oldest mixin)
    if (Array.isArray(this.constructor.__appliedMixins)) {
      for (let cls of this.constructor.__appliedMixins) {
        // you can't apply es6 class constructor directly to this
        // that's why you have to instantiate it and then copy own props to this
        const clsObj = new cls(...arguments);
        applyProps(this, clsObj);
      }
    }
  }

  //todo: combine this duplicated code into single Base which can extend either from Array or Object
  /**
   * Applies a chain of prototypes for each object in array
   * 1) Will apply static properties in chain starting with the oldest prototype
   * 2) Will instantiate object and then apply dynamic properties in chain starting with the oldest prototype
   * @param mixins
   * @returns {Base}
   */
  static addMixins(...mixins) {
    return addMixins(this, mixins);
  }

  static async extend(config = {}) {
    //todo: make this common with model base
    const newClass = class extends this {
    };
    const fullConfig = newClass.setConfig(config);
    if (fullConfig.adaptor) {
      switch (fullConfig.adaptor.type) {
        case "mysql":
          try {
            const { default: MySQLServerStoreAdaptor } = await import ("../server/store/adaptors/MySQLServerStoreAdaptor.js");
            newClass.addMixins(MySQLServerStoreAdaptor);
            newClass.setConfig({ mysql: fullConfig.adaptor }); //todo: fix this later
          } catch (err) {
            console.log("Unable to load MySQL Server Store Adaptor", err);
          }
          break;
        default:
          throw new Error("Unknown adaptor type while extending " + this.name);
      }
    }
    return newClass;
  }

  static getClientIdAttr() {
    //todo: move to _config ?
    return "__cid";
  }

  static generateClientId() {
    return (this.__lastClientId = this.__lastClientId ? ++this.__lastClientId : 1);
  }

  toJSON() {
    return this;
  }
}

export default BaseArray;
