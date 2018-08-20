import Base from '../Base';

class Model extends Base {

    static getModelConfig() {
        return {
            lockProps: false, // will only let DefaultProps in model, will seal object so that new props can't be assigned
            enforceSet: false, // all property assignment will always go through 'set' which calls prepare and possible hooks
            enforceSetHooks: false, // will always fire hooks via direct assignment. Combine it with enforceSet
            useInitialDataAsProps: false
        }
    }

    static getIdAttr() {
        return undefined;
    }

    static getDefaultProps() {
        return null;
    }

    constructor(data, force) {
        super(...arguments);
        const modelConfig = this.constructor.getModelConfig();
        let defaultProps = modelConfig.useInitialDataAsProps ? data : this.constructor.getDefaultProps();
        defaultProps = Object.assign(defaultProps, {
            [this.constructor.getIdAttr()]: defaultProps[this.constructor.getIdAttr()] || undefined
        }); // adding IdProp here

        if (defaultProps) {
            const propertyDescriptors = Object.keys(defaultProps).reduce((acc, propKey) => {
                acc[propKey] = {
                    value: defaultProps[propKey],
                    configurable: false,
                    enumerable: true,
                    writable: true
                };
                if (modelConfig.enforceSet) {
                    const tmpProps = {};
                    acc[propKey]['writable'] = false;
                    acc[propKey]['get'] = () => {
                        return tmpProps[propKey];
                    };
                    acc[propKey]['set'] = (val) => {
                        modelConfig.enforceSetHooks && this.__hookBeforeSet(propKey, val);
                        const prepared = this.prepareSet(propKey, val);
                        modelConfig.enforceSetHooks && this.__hookAfterSet(prepared.doSet, propKey, prepared.val);
                        if (prepared.doSet) {
                            tmpProps[propKey] = prepared.val;
                        }
                    };
                }
                return acc;
            }, {});
            Object.defineProperties(this, propertyDescriptors);
        }
        if (modelConfig.lockProps) {
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
            if (!this.constructor.getModelConfig()['lockProps'] || (this.constructor.getDefaultProps() && this.constructor.getDefaultProps().hasOwnProperty(prop)) || this.constructor.getIdAttr() === prop) {
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
        !skipHooks && !modelConfig.enforceSetHooks && this.__hookBeforeSet(prop, val); //todo: should hooks be executed even if value not really set ?
        if (modelConfig.enforceSet) {
            this[prop] = val;  // property's setter will call preparation function
            modified = this[prop] !== val;
        } else {
            let prepared = this.prepareSet(prop, val);
            if (prepared.doSet) {
                this[prop] = prepared.val;
            }
            modified = prepared.doSet;
        }
        !skipHooks && !modelConfig.enforceSetHooks && this.__hookAfterSet(modified, prop, this[prop]);
        return modified;
    }

    /**
     * Sets all properties from a passed object to self
     * Will only set properties defined in default props (if available)
     * Ignores properties with undefined values anyway
     *
     * @param data Object to copy data from
     * @param {Boolean} skipHooks Skip Hooks
     * @return {Array} Array of modified props
     */
    setAll(data = {}, skipHooks = false) {
        let modifiedProps = [];
        !skipHooks && this.__hookBeforeSetAll(data); //todo: should hooks be executed even if values not really set ?
        for (let prop in data) {
            if (this.set(prop, data[prop], skipHooks)) {
                modifiedProps.push(prop); // record modified props and return them at the end
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