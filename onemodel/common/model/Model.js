import Base from '../Base';

class Model extends Base {

    static getModelConfig() {
        return {
            sealProps: false, // will only let DefaultProps in model, will seal object so that new props can't be assigned
            strictAssignment: false, // all property assignment will always go through 'set' which calls prepare and possible hooks
            enableAssignmentHooks: false, // will always fire hooks via direct assignment. Combine it with strictAssignment. Works only if strictAssignment is true
            useInitialDataAsProps: false
        }
    }

    static getIdAttr() { // id attr is a Primary Key. It is immutable and can't be modified once set
        return '_id';
    }

    static getDefaultProps() {
        return null;
    }

    constructor(data) {
        super(...arguments);
        const modelConfig = this.constructor.getModelConfig();
        const idAttr = this.constructor.getIdAttr();
        let defaultProps = modelConfig.useInitialDataAsProps ? data : this.constructor.getDefaultProps();
        let propertyDescriptors;

        Object.keys(defaultProps).forEach(
            prop => this.__defineProperty(prop, defaultProps[prop], modelConfig.strictAssignment, modelConfig.enableAssignmentHooks)
        );

        if (modelConfig.sealProps) {
            Object.seal(this);
        }
        data && this.setAll(data, true);
    }

    getId() {
        return this[this.constructor.getIdAttr()];
    }

    getClientId() {
        return this[this.constructor.getClientIdAttr()];
    }

    setId(id) {
        return this.set(this.constructor.getIdAttr(), id);
    }

    get(prop) {
        return this[prop];
    }

    __defineId(val) {
        Object.defineProperty(this, this.constructor.getIdAttr(), {
            configurable: true,
            enumerable: true,
            writable: false, // id is immutable by default
            value: val // initial value is assigned
        });
    }

    __defineProperty(prop, val, strictAssignment, enableAssignmentHooks) {
        const def = {
            value: val,
            configurable: true,
            enumerable: true,
            writable: true
        };
        if (strictAssignment) {
            const tmpProps = {};
            def.writable = false;
            def.get = () => {
                return tmpProps[prop];
            };
            def.set = (val) => {
                enableAssignmentHooks && this.__hookBeforeSet(prop, val);
                const prepared = this.prepareSet(prop, val);
                enableAssignmentHooks && this.__hookAfterSet(prepared.doSet, prop, prepared.val);
                if (prepared.doSet) {
                    tmpProps[prop] = prepared.val;
                }
            }
        }
        Object.defineProperty(this, prop, def);
    }

    /**
     * Prepare value to be set on model property
     * Should apply any possible validators/converters and then return value to be set
     * @param prop
     * @param val
     */
    prepareSet(prop, val) {
        //todo: apply validators/converters
        let doSet = false;
        if (!prop in this || this[prop] !== val) { // now will also set undefined props
            if (!this.constructor.getModelConfig()['sealProps'] || (this.constructor.getDefaultProps() && this.constructor.getDefaultProps().hasOwnProperty(prop)) || this.constructor.getIdAttr() === prop) {
                doSet = true;
            } else {
                console.log(`Trying to set unknown property (${prop}) on strictProps model`);
            }
        }
        return {doSet: doSet, prop: prop, val: val};
    }

    set(prop, val, skipHooks = false) {
        let modelConfig = this.constructor.getModelConfig();
        let modified = false;

        if (modelConfig.strictAssignment) {
            !skipHooks && !modelConfig.enableAssignmentHooks && this.__hookBeforeSet(prop, val);
            this[prop] = val;  // property's setter will call preparation function
            modified = this[prop] !== val;
            !skipHooks && !modelConfig.enableAssignmentHooks && this.__hookAfterSet(modified, prop, this[prop]);
        } else {
            !skipHooks && this.__hookBeforeSet(prop, val);
            let prepared = this.prepareSet(prop, val);
            if (prepared.doSet) {
                if (prop === this.constructor.getIdAttr() && this[prop] === undefined) {
                    this.__defineId(prepared.val); // will define and set id attr as immutable
                } else {
                    this[prop] = prepared.val;
                }
            }
            modified = prepared.doSet;
            !skipHooks && this.__hookAfterSet(modified, prop, this[prop]);
        }
        return modified;
    }

    /**
     * Sets all properties from a passed object to self
     * Will only set properties defined in default props (if available)
     * Ignores properties with undefined values anyway
     *
     * @param data Object to copy data from
     * @param {Boolean} skipHooks Skip Hooks
     * @return {Object} Array of modified props
     */
    setAll(data = {}, skipHooks = false) {
        let modifiedProps = {};
        !skipHooks && this.__hookBeforeSetAll(data); //todo: should hooks be executed even if values not really set ?
        for (let prop in data) {
            if (this.set(prop, data[prop], skipHooks)) {
                modifiedProps[prop] = this[prop]; // record modified props and return them at the end
            }
        }
        !skipHooks && this.__hookAfterSetAll(modifiedProps, data);
        return modifiedProps;
    }

    unset(prop, skipHooks = false) {
        let deleted = false;
        !skipHooks && this.__hookBeforeUnset(prop);
        if (prop in this) {
            delete this[prop];
            deleted = true;
        }
        !skipHooks && this.__hookAfterUnset(deleted, prop);
        return deleted;
    }

    __hookAfterConstruct(data) {
        return this;
    }

    __hookBeforeSet(prop, val) {
        return this;
    }

    __hookAfterSet(modified, prop, val) {
        return this;
    }

    __hookBeforeSetAll(data) {
        return this;
    }

    __hookAfterSetAll(modifiedProps, data) {
        return this;
    }

    __hookBeforeUnset(prop) {
        return this;
    }

    __hookAfterUnset(deleted, prop) {
        return this;
    }

}

export default Model;