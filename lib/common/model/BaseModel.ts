import Base from '../Base';
import { Converters, Validators } from '../const/base';
import { Config } from '../types/BaseConfig';

class BaseModel extends Base {

    protected config: Config;

    static validate(prop: Validators, value: unknown): boolean {
        const validators = this.getConfig().validators;
        if (validators[prop]) {
            return validators[prop](value);
        }
        throw new Error(`validator is not defined for prop: ${prop}`);
    }

    static convert(prop: Converters, value: unknown): boolean {
        const converters = this.getConfig().converters;
        if (converters[prop]) {
            return converters[prop](value);
        }
        throw new Error(`converter is not defined for prop: ${prop}`);
    }

    constructor(data: any, options = {skipHooks: false, skipConvert: false, skipValidate: false}, config = {}) {
        super();
        if (config && Object.keys(config).length) { // if custom config provided store it in instance
            this.__defineConfig({...this.getConfig(), ...config});
        }
        const fullConfig = this.getConfig();
        fullConfig.props && Object.keys(fullConfig.props).forEach(
            prop => this.__defineProperty(prop, fullConfig.props[prop], fullConfig.reactivity)
        );
        data && this.setAll(data, options); // do not skip hooks unless it's specifically set by user
    }

    /**
     * Returns FULL CONFIG (merge of class config and instance config)
     * @returns {any}
     */
    getConfig() {
       return  this.config ? this.config : (this.constructor as typeof BaseModel).getConfig();
    }

    /**
     * Sets any custom config properties
     * @param config
     * @returns {*} Returns own config object
     */
    setConfig(config: Config) { //todo: only store overriden parts of config and merge on fly, because Model might be reconfigure later
        return this.config ? Object.assign(this.config, config) : this.__defineConfig({...(this.constructor as typeof BaseModel).getConfig(), ...config});
    }

    getId(): string {
        return this[(this.constructor as typeof BaseModel).getConfig().idAttr];
    }

    getClientIdAttr() {
        return this.config.clientIdAttr;
    }

    getClientId(): string {
        return this[(this.constructor as typeof BaseModel).getClientIdAttr()];
    }

    setId(id) {
        return this.set((this.constructor as typeof BaseModel).getConfig().idAttr, id);
    }

    get(prop) {
        return this[prop];
    }

    getAll(...exclude: string[]) {
        const out: Record<string, any> = {}
        for (const prop in this) {
            if (this.hasOwnProperty(prop)) { // to avoid prototype props since for...in walks prototype
                if (exclude.indexOf(prop) < 0) {
                    out[prop] = this[prop];
                }
            }
        }
        return out;
    }

    __defineConfig(config) {
        Object.defineProperty(this, 'config', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: config // initial value is assigned
        });
        return this['config'];
    }

    __defineId(val): string {
        Object.defineProperty(this, (this.constructor as typeof BaseModel).getConfig().idAttr, {
            configurable: true,
            enumerable: true,
            writable: false, // id is immutable by default
            value: val // initial value is assigned
        });
        return this[(this.constructor as typeof BaseModel).getConfig().idAttr];
    }

    __defineProperty(prop, val, reactivity) {
        const def: any = {
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
     * @param options
     */
    __prepareSet(prop, val, options = {skipValidate: false, skipConvert: false}) {
        const validators = (this.constructor as typeof BaseModel).getConfig().validators;
        const converters = (this.constructor as typeof BaseModel).getConfig().converters;
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
        const config = this.getConfig();
        const {skipHooks, skipValidate, skipConvert} = options;

        if (!this.__isPropExists(prop)) { // then define prop
            // should be defined with 'undefined' as default value
            this.__defineProperty(prop, undefined, config.reactivity);
        }

        if (config.reactivity) { // todo: whether to fire hooks on undefined
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
                if (prop === (this.constructor as typeof BaseModel).getConfig().idAttr && this[prop] === undefined) {
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
     * @return {Object} Array of modified props or {} if nothing was modified
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

    unset(prop: string, skipHooks = false) {
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

    //todo: maybe fire only if something modified
    __hookAfterSetAll(modifiedProps, data) {
        return this;
    }

    __hookBeforeUnset(prop) {
        return prop;
    }

    //todo: maybe fire only if something was unset
    __hookAfterUnset(deleted, prop) {
        return this;
    }

}

export default BaseModel;