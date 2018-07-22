import Base from '../Base';

class Model extends Base {

    static getIdAttr() {
        throw new Error('getIdAttr must be implemented in child class');
    }

    static getDefaultProps() {
        return null;
    }

    constructor(data, force) {
        super(...arguments);
        this.constructor.getDefaultProps() && this.setAll(this.constructor.getDefaultProps());
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

    set(prop, val) {
        let modified = false;
        this.__hookBeforeSet(...arguments); //todo: should hooks be executed even if value not really set ?
        if (!prop in this || this[prop] !== val) { // now will also set undefined props
            this[prop] = val;
            modified = true;
        }
        this.__hookAfterSet(modified, ...arguments);
        return modified;
    }

    /**
     * Sets all properties from a passed object to self
     * Will only set properties defined in default props (if available)
     * Ignores properties with undefined values anyway
     *
     * @param data Object to copy data from
     * @return {Array} Array of modified props
     */
    setAll(data = {}) {
        let modifiedProps = [];
        this.__hookBeforeSetAll(...arguments); //todo: should hooks be executed even if values not really set ?
        for (let prop in data) {
            if (this.set(prop, data[prop])) {
                modifiedProps.push(prop); // record modified props and return them at the end
            }
        }
        this.__hookAfterSetAll(modifiedProps, ...arguments);
        return modifiedProps;
    }

    delete(prop) {
        let deleted = false;
        this.__hookBeforeDelete(...arguments);
        if (prop in this) {
            delete this[prop];
            deleted = true;
        }
        this.__hookAfterDelete(deleted, ...arguments);
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

    __hookBeforeDelete(prop) {
        return this;
    }

    __hookAfterDelete(deleted, prop) {
        return this;
    }

}

export default Model;