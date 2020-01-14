function applyPrototypes(accumulator, originalProto, excludeProps = []) {
    //retrieve all prototypes
    let prototypes = [originalProto];
    while ((originalProto = Object.getPrototypeOf(originalProto)) && originalProto !== Object.prototype && originalProto !== Function.prototype) {
        prototypes.push(originalProto);
    }

    // apply all prototypes properties in natural direction
    for (let proto of prototypes.reverse()) {
        for (let prop of Object.getOwnPropertyNames(proto)) {
            if (!excludeProps.includes(prop)) {
                Object.defineProperty(accumulator, prop, { // in es6 all methods are non enumerable, so we do same here
                    value: proto[prop],
                    enumerable: false,
                    writable: true
                });
            }
        }
    }
}

class Base {
    static addMixins(mixins = []) {
        for (let mixin of mixins) {
            applyPrototypes(this, mixin, ['length', 'name', 'arguments', 'caller', 'prototype']); // apply Static props excluding standard Function props
            applyPrototypes(this.prototype, new mixin(), ['constructor']); // apply instance props excluding constructor
        }
        return this;
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
        return '__cid';
    }

    static generateClientId() {
        return this.__lastClientId = this.__lastClientId ? ++this.__lastClientId : 1;
    }

    constructor() {
        Object.defineProperty(this, this.constructor.getClientIdAttr(), {
            value: this.constructor.generateClientId(),
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    getData() {
        return {...this}; // will include prototype as well. todo: Maybe we should not have it
    }

    toJSON() {
        return this;
    }
}

export default Base;