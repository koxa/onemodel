class Model {

    static getIdAttr() {
        //throw new Error('getIdAttr must be implemented in child class');
        if (this['idAttr']) {
            return this['idAttr'];
        }

        let indexes = this.getIndexes();
        if (indexes) {
            let i = 0, len = indexes.length;
            for (; i < len; i++) {
                if (indexes[i].type === Model.INDEX_PRIMARY) {
                    this['idAttr'] = indexes[i].field;
                    return this['idAttr'];
                }
            }
        }

        return null;
    }

    static getClientIdAttr() {
        return '_cid';
    }

    static generateVirtualId() {
        if (this.lastVirtualId === undefined) {
            this.lastVirtualId = 1;
        } else {
            this.lastVirtualId++;
        }
        return 'virt-' + this.lastVirtualId;
    }

    static getDefaultProps() {
        return null;
    }

    static getIndexes() {
        return [
            {field: '_id', type: Model.INDEX_PRIMARY}
        ]
    }

    constructor(data, force) {
        this.setAll(data, force);
        Object.defineProperty(this, this.constructor.getClientIdAttr(), {
            value: this.constructor.generateVirtualId(),
            enumerable: true
        });
    }

    getId() {
        var idAttr = this.constructor.getIdAttr();
        if (idAttr && this[idAttr] !== undefined) {
            return this[idAttr];
        } else {
            idAttr = this.constructor.getClientIdAttr();
            if (this[idAttr]) {
                return this[idAttr];
            }
        }

        return false;
    }

    setId(id) {
        var idAttr = this.constructor.getIdAttr();
        if (idAttr) {
            this[idAttr] = id;
        }
    }

    get(prop) {
        return this[prop];
    }

    set(prop, val) {
        this[prop] = val;
    }

    /**
     * Sets all properties from a passed object to self
     * Will only set properties defined in default props (if available)
     * Ignores properties with undefined values anyway
     *
     * @param data Object to copy data from
     * @param force Will set all properties from data even if those don't exist in default props
     * @return {Model} Returns Self for chaining
     */
    setAll(data, force) {
        var prop;
        var data = data || {};
        var defaultProps = this.constructor.getDefaultProps();

        if (!force) {
            if (defaultProps && typeof defaultProps === 'object') {
                for (prop in defaultProps) {
                    this[prop] = (data[prop] !== undefined) ? data[prop] : defaultProps[prop];
                }
            }
        }

        if (force || !defaultProps) {
            for (prop in data) {
                if ((data[prop] !== undefined)) {
                    this[prop] = data[prop];
                }
            }
        }

        return this;
    }

    unset(prop) {
        delete this[prop];
    }

}

Model.INDEX_PRIMARY = Symbol();
Model.INDEX_UNIQUE = Symbol();

export default Model;