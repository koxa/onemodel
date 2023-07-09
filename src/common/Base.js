import { applyProps, addMixins } from '../utils/mixins.js';

class Base {
  /**
   * Applies a chain of prototypes for each object in array
   * 1) Will apply static properties in chain starting with the oldest prototype
   * 2) Will instantiate object and then apply dynamic properties in chain starting with the oldest prototype
   * @param mixins
   * @returns {Base}
   */
  static addMixins(mixins = []) {
    return addMixins(this, mixins);
  }

  // static extend() {
  //     const cls = function() {
  //
  //     };
  //     cls.prototype = this;
  //     this.constructor.apply(cls);
  //     return cls;
  // }

  static getClientIdAttr() {
    //todo: move to _config ?
    return '__cid';
  }

  static generateClientId() {
    return (this.__lastClientId = this.__lastClientId ? ++this.__lastClientId : 1);
  }

  constructor() {
    Object.defineProperty(this, this.constructor.getClientIdAttr(), {
      value: this.constructor.generateClientId(),
      enumerable: false,
      writable: false,
      configurable: false,
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

  toJSON() {
    return this;
  }
}

export default Base;
