import Base from '../Base';

class Model extends Base {

    static getModelConfig() {
        return {
            reactivity: false, // all property assignment will always go through 'set' which calls prepare and possible converters/validators/hooks
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


    constructor(data, options = {skipHooks: false, skipConvert: false, skipValidate: false}) {
        super(...arguments);
        const modelConfig = this.constructor.getModelConfig();
        const defaultProps = modelConfig.initialDataAsProps ? data : this.constructor.getDefaultProps();
        defaultProps && Object.keys(defaultProps).forEach(
            prop => this.__defineProperty(prop, defaultProps[prop], modelConfig.reactivity)
        );
        data && this.setAll(data, options); // do not skip hooks unless it's specifically set by user
    }

    getConfig() {
       return {
           disableHooks: false,
           disableConverters: false,
           disableValidators: false
       };
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

    __defineProperty(prop, val, reactivity) {
        const def = {
            //value: val,
            configurable: true,
            enumerable: true,
            //writable: true
        };
        if (reactivity) {
            const tmpProps = {
                [prop]: val
            };
            // def.writable = false;
            def.get = () => {
                return tmpProps[prop];
            };
            def.set = (val) => {
                const prepared = this.__prepareSet(prop, val);
                if (prepared.doSet) {
                    val = prepared.val;
                    if (this.__hookBeforeSet) {
                        val = this.__hookBeforeSet(prop, val);
                    }
                    tmpProps[prop] = val;
                    this.__hookAfterSet && this.__hookAfterSet(prop, val);
                }
            }
        } else {
            def['value'] = val;
            def['writable'] = true;
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
    __prepareSet(prop, val, options = {skipValidate: false, skipConvert: false}) {
        const validators = this.constructor.getValidators();
        const converters = this.constructor.getConverters();
        const {skipValidate, skipConvert} = options;
        // const propExists = this.__isPropExists(prop);

        if (!skipValidate && validators && validators[prop]) {
            if (!validators[prop](val)) {
                return {doSet: false, prop, val};
            }
        }

        if (!skipConvert && converters && converters[prop]) {
            val = converters[prop](val);
        }

        let doSet = true;
        if (/*propExists &&*/ this[prop] === val) {
            doSet = false; // skip if value is same
        }
        return {doSet: doSet, prop: prop, val: val};
    }

    set(prop, val, options = {skipHooks: false, skipValidate: false, skipConvert: false}) {
        const modelConfig = this.constructor.getModelConfig();
        const {skipHooks, skipValidate, skipConvert} = options;

        if (!this.__isPropExists(prop)) { // then define prop
            // should be defined with 'undefined' as default value
            this.__defineProperty(prop, undefined, modelConfig.reactivity);
        }

        if (modelConfig.reactivity) { // todo: whether to fire hooks on undefined
            const oldVal = this[prop];
            this[prop] = val;  // property's setter will call preparation function
            return val !== oldVal; // if prop didn't exist before or val modified
        } else {
            const prep = this.__prepareSet(prop, val, {skipValidate, skipConvert});
            if (prep.doSet) {
                val = prep.val;
                if(!skipHooks && this.__hookBeforeSet) { // now calling only if value doSet
                    val = this.__hookBeforeSet(prop, val);
                }
                if (prop === this.constructor.getIdAttr() && this[prop] === undefined) {
                    this.__defineId(val); // will define and set id attr as immutable
                } else {
                    this[prop] = val;
                }
                !skipHooks && this.__hookAfterSet && this.__hookAfterSet(prop, this[prop]);
            }
            return prep.doSet;
        }
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
    setAll(data = {}, options = {skipHooks: false, skipValidate: false, skipConvert: false}) {
        const modifiedProps = {};
        const {skipHooks} = options;
        !skipHooks && this.__hookBeforeSetAll && this.__hookBeforeSetAll(data); //todo: should hooks be executed even if values not really set ?
        for (let prop in data) {
            if (this.set(prop, data[prop], options)) {
                modifiedProps[prop] = this[prop]; // record modified props and return them at the end
            }
        }
        !skipHooks && this.__hookAfterSetAll && this.__hookAfterSetAll(modifiedProps, data);
        return modifiedProps;
    }

    unset(prop, skipHooks = false) {
        let deleted = false;
        !skipHooks && this.__hookBeforeUnset && this.__hookBeforeUnset(prop);
        if (prop in this) {
            delete this[prop];
            deleted = true;
        }
        !skipHooks && this.__hookAfterUnset && this.__hookAfterUnset(deleted, prop);
        return deleted;
    }

    __hookAfterConstruct(data) {
        return this;
    }

    __hookBeforeSet(prop, val) {
        return val;
    }

    __hookAfterSet(prop, val) {
        return this;
    }

    __hookBeforeSetAll(data) {
        return data;
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