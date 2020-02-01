import Base from '../Base';

class Model extends Base {

    static getModelConfig() {
        return {
            seal: false, // will seal object right after construction
            freeze: false, // will freeze object right after construction
            smartAssignment: false, // all property assignment will always go through 'set' which calls prepare and possible converters/validators/hooks
            assignmentHooks: false, // will always fire hooks via direct assignment. Combine it with smartAssignment. Works only if smartAssignment is true
            initialDataAsProps: false
        }
    }

    static getIdAttr() { // id attr is a Primary Key. It is immutable and can't be modified once set
        return 'id';
    }

    static getDefaultProps() {
        return null;
    }

    static getValidators() {
        return null;
    }

    static getConverters() {
        return null;
    }

    static validate(prop, val) {
        const validators = this.getValidators();
        if (validators[prop]) {
            return validators[prop](val);
        } else {
            console.log('validator is not defined for prop: ', prop);
        }
    }

    static convert(prop, val) {
        const converters = this.getConverters();
        if (converters[prop]) {
            return converters[prop](val);
        } else {
            console.log('converter is not defined for prop: ', prop);
        }
    }


    constructor(data) {
        super(...arguments);
        const modelConfig = this.constructor.getModelConfig();
        let defaultProps = modelConfig.initialDataAsProps ? data : this.constructor.getDefaultProps();
        defaultProps && Object.keys(defaultProps).forEach(
            prop => this.__defineProperty(prop, defaultProps[prop], modelConfig.smartAssignment, modelConfig.assignmentHooks)
        );
        data && this.setAll(data, true);
        if (modelConfig.seal) {
            Object.seal(this);
        }
        if (modelConfig.freeze) {
            Object.freeze(this);
        }
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

    getAll(...exclude) {
        let out = {}
        for (let prop in this) {
            if (exclude.indexOf(prop) < 0) {
                out[prop] = this[prop];
            }
        }
        return out;
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
                const prepared = this.__prepareSet(prop, val);
                enableAssignmentHooks && this.__hookAfterSet(prepared.doSet, prop, prepared.val);
                if (prepared.doSet) {
                    tmpProps[prop] = prepared.val;
                }
            }
        }
        Object.defineProperty(this, prop, def);
    }

    __isPropExists(prop) {
        return Object.keys(this).includes(prop);
    }

    /**
     * Prepare value to be set on model property
     * Should apply any possible validators/converters and then return value to be set
     * @param prop
     * @param val
     */
    __prepareSet(prop, val) {
        const validators = this.constructor.getValidators();
        const converters = this.constructor.getConverters();

        if (validators && validators[prop]) {
            if (!validators[prop](val)) {
                return {doSet: false, prop, val};
            }
        }

        if (converters && converters[prop]) {
            val = converters[prop](val);
        }

        let doSet = true;
        let propExists = this.__isPropExists(prop);

        if (Object.isFrozen(this)) {
            doSet = false;
            console.log('Trying to set property on a frozen object');
        }

        if (Object.isSealed(this) && !propExists) {
            doSet = false;
            console.log('Trying to set new property on sealed object');
        }

        if (doSet && propExists && this[prop] === val) {
            doSet = false; // skip if value is same
        }
        return {doSet: doSet, prop: prop, val: val};
    }

    set(prop, val, skipHooks = false) {
        let modelConfig = this.constructor.getModelConfig();
        let modified = false;

        if (modelConfig.smartAssignment) {
            !skipHooks && !modelConfig.assignmentHooks && this.__hookBeforeSet(prop, val);
            this[prop] = val;  // property's setter will call preparation function
            modified = this[prop] !== val;
            !skipHooks && !modelConfig.assignmentHooks && this.__hookAfterSet(modified, prop, this[prop]);
        } else {
            let prep = this.__prepareSet(prop, val);
            if (prep.doSet) {
                !skipHooks && this.__hookBeforeSet(prep.prop, prep.val); //now calling only if value doSet
                if (prep.prop === this.constructor.getIdAttr() && this[prep.prop] === undefined) {
                    this.__defineId(prep.val); // will define and set id attr as immutable
                } else {
                    this[prep.prop] = prep.val;
                }
            }
            modified = prep.doSet;
            //todo: maybe don't call without modifications
            !skipHooks && this.__hookAfterSet(modified, prep.prop, this[prop]);
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