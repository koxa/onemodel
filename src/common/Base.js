const DEFAULT_OBJECT_PROPS = [
    'constructor',
    '__defineGetter__',
    '__defineSetter__',
    'hasOwnProperty',
    '__lookupGetter__',
    '__lookupSetter__',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    '__proto__',
    'toLocaleString'
];
const DEFAULT_FUNCTION_PROPS = [
    'length',
    'name',
    'prototype',
    'arguments',
    'caller',
    'constructor',
    'apply',
    'bind',
    'call',
    'toString'
]

function applyPrototypeChainProps(accumulator, originalProto, excludeProps = []) {
    if (!accumulator || !originalProto) {
        return;
    }
    let prototypes = [originalProto];
    while ((originalProto = Object.getPrototypeOf(originalProto)) && originalProto !== Object.prototype && originalProto !== Function.prototype) {
        if (originalProto && Object.getPrototypeOf(originalProto)) { // only add if next prototype exists, otherwise we reached bottom which is plain Object
            prototypes.push(originalProto);
        }
    }
    for (let proto of prototypes.reverse()) {
        //console.log("STATIC applyPrototypeChainProps", "accum:", accumulator, "donor: ", proto, "all enum keys: ", Object.keys(proto), "all own props", Object.getOwnPropertyNames(proto));
        applyProps(accumulator, proto, excludeProps);
    }
}

function applyProps(accumulator, donor, excludeProps = []) {
    if (!accumulator || !donor) {
        return;
    }
    //console.log("applyProps", "accum:", accumulator, "donor: ", donor, "all enum keys: ", Object.keys(donor), "all own props", Object.getOwnPropertyNames(donor));
    for (let prop of Object.getOwnPropertyNames(donor)) { // get all props including non-enum es6 class methods
        if (!excludeProps.includes(prop)) {
            //console.log('defining', prop, donor[prop]);
            Object.defineProperty(accumulator, prop, {
                value: donor[prop],
                enumerable: typeof donor[prop] !== 'function', // in es6 all class methods (both static and regular) are non enumerable, so we do same here
                writable: true
            });
        } else {
            //console.log('property excluded', prop);
        }
    }
}

class Base {
    /**
     * Applies a chain of prototypes for each object in array
     * 1) Will apply static properties in chain starting with the oldest prototype
     * 2) Will instantiate object and then apply dynamic properties in chain starting with the oldest prototype
     * @param mixins
     * @returns {Base}
     */
    static addMixins(mixins = []) {
        for (let mixin of mixins) {
            applyPrototypeChainProps(this, mixin, [...DEFAULT_FUNCTION_PROPS, ...DEFAULT_OBJECT_PROPS]); // apply Static/Constructor(function) props excluding standard Function and Object props
            applyPrototypeChainProps(this.prototype, new mixin(), DEFAULT_OBJECT_PROPS); // apply prototype(object) props excluding constructor and standard object props
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

    toJSON() {
        return this;
    }
}

export default Base;