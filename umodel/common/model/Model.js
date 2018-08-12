import Base from '../Base';

class Model extends Base {

    static getModelConfig() {
        return {
            strictProps: false
        }
    }

    static getIdAttr() {
        //throw new Error('getIdAttr must be implemented in child class');
        return 'id';
    }

    static getDefaultProps() {
        return null;
    }

    constructor(data, force) {
        super(...arguments);
        this.constructor.getDefaultProps() && this.setAll(this.constructor.getDefaultProps(), true); // set all default props but skip hooks
        data && this.setAll(data);
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

    set(prop, val, skipHooks = false) {
        let modified = false;
        !skipHooks && this.__hookBeforeSet(prop, val); //todo: should hooks be executed even if value not really set ?
        if (!prop in this || this[prop] !== val) { // now will also set undefined props
            this[prop] = val;
            modified = true;
        }
        !skipHooks && this.__hookAfterSet(modified, prop, val);
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