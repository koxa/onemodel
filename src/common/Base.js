import { applyProps, addMixins } from "../utils/mixins.js";

class Base {
  constructor() {
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
    //todo: make this common with array base
    const newClass = class extends this {
    };

    //todo: maybe separate mixins from config since 'hooks' are not in config either
    let mixins = []
    if (config.mixins) {
      mixins = config.mixins;
      delete config.mixins;
    }

    newClass.setConfig(config);
    if (mixins && Array.isArray(mixins)) {
      for (let mixin of mixins) {
        switch (mixin) {
          case "convertible":
            const { default: ConvertibleModelMixin } = await import ("./model/mixins/ConvertibleModelMixin.js");
            newClass.addMixins(ConvertibleModelMixin); //todo: make sure all mixins added only once
            break;
          case "validatable":
            const { default: ValidatableModelMixin } = await import ("./model/mixins/ValidatableModelMixin.js");
            newClass.addMixins(ValidatableModelMixin); //todo: make sure all mixins added only once
            break;
          case "observable":
            const { default: ObservableModelMixin } = await import ("./model/mixins/ObservableModelMixin.js");
            newClass.addMixins(ObservableModelMixin); //todo: make sure all mixins added only once
            break;
        }
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

export default Base;
