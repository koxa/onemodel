import BaseConfig from './BaseConfig';
import { applyProps, applyPrototypeChainProps } from '../utils/mixins';
import { DEFAULT_FUNCTION_PROPS, DEFAULT_OBJECT_PROPS } from './const/base';
import BaseAdaptor from './adaptors/BaseAdaptor';

abstract class Base extends BaseConfig {
  static lastClientId: number;
  static appliedMixins: any[];

  /**
   * Applies a chain of prototypes for each object in array
   * 1) Will apply static properties in chain starting with the oldest prototype
   * 2) Will instantiate object and then apply dynamic properties in chain starting with the oldest prototype
   * @param mixins
   * @returns {Base}
   */
  static addMixins(refs: any[] = []) {
    for (const ref of refs) {
      const mixin = new ref() as BaseAdaptor;
      const mixinPrototype = mixin.constructor.prototype;
      applyPrototypeChainProps(
        Base,
        mixin,
        [...DEFAULT_FUNCTION_PROPS, ...DEFAULT_OBJECT_PROPS],
        ['config'],
      ); // apply Static/Constructor(function) props excluding standard Function and Object props. Also merge config objects
      applyPrototypeChainProps(Base.prototype, mixinPrototype, DEFAULT_OBJECT_PROPS); // apply prototype(object) props excluding constructor and standard object props
      if (!Base.appliedMixins) {
        Base.appliedMixins = [mixin];
      } else {
        Base.appliedMixins = [...Base.appliedMixins, mixin]; // always define new array to avoid pushing to prototype (avoid sharing array among descendents)
      }
    }
    return Base;
  }

  static getClientIdAttr() {
    return Base.config.clientIdAttr;
  }

  static generateClientId() {
    return (Base.lastClientId = Base.lastClientId ? ++Base.lastClientId : 1);
  }

  getClientId() {
    return this[Base.getClientIdAttr()];
  }

  constructor() {
    super();
    Object.defineProperty(this, Base.getClientIdAttr(), {
      value: Base.generateClientId(),
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }
}

export default Base;
