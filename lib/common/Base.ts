import BaseConfig from "./BaseConfig";
import { applyPrototypeChainProps } from "../utils/mixins";
import {DEFAULT_FUNCTION_PROPS, DEFAULT_OBJECT_PROPS } from "./const/base";

abstract class Base extends BaseConfig {
    protected static appliedMixins: any[];
    protected static lastClientId: number;
    
    /**
     * Applies a chain of prototypes for each object in array
     * 1) Will apply static properties in chain starting with the oldest prototype
     * 2) Will instantiate object and then apply dynamic properties in chain starting with the oldest prototype
     * @param mixins
     * @returns {Base}
     */
    static addMixins(mixins = []) {
        for (const mixin of mixins) {
            applyPrototypeChainProps(this, mixin, [...DEFAULT_FUNCTION_PROPS, ...DEFAULT_OBJECT_PROPS], ['config']); // apply Static/Constructor(function) props excluding standard Function and Object props. Also merge config objects
            applyPrototypeChainProps(this.prototype, mixin.prototype, DEFAULT_OBJECT_PROPS); // apply prototype(object) props excluding constructor and standard object props
            if (!this.appliedMixins) {
                this.appliedMixins = [mixin];
            } else {
                this.appliedMixins = [...this.appliedMixins, mixin]; // always define new array to avoid pushing to prototype (avoid sharing array among descendents)
            }
        }
        return this;
    }

    static getClientIdAttr() {
        return Base.config.clientIdAttr;
    }

    static generateClientId() {
        return this.lastClientId = this.lastClientId ? ++this.lastClientId : 1;
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
            configurable: false
        });
    }

    toJSON() {
        return this;
    }
}

export default Base;
