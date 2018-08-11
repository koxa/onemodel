class BaseAdaptor {

    static create(data, params) {
        throw new Error('CREATE method must be implemented in child Adaptor');
    }

    static read(id, params) {
        throw new Error('READ method must be implemented in child Adaptor');
    }

    static update(id, data, params) {
        throw new Error('UPDATE method must be implemented in child Adaptor');
    }

    static delete(id, params) {
        throw new Error('DELETE method must be implemented in child Adaptor');
    }

    static getCollectionName() {
        throw new Error('GetCollectionName method must be implemented in a model/store class');
    }

    static find(params) {
        //throw new Error('Find method must be implemented in a model/store class');
        return this.read(null, params);
    }

    static findById(id, params) {
        //throw new Error('FindById method must be implemented in a model/store class');
        return this.read(id, params);
    }

    fetch(params) {
        //throw new Error('Fetch method must be implemented in a model/store class');
        return this.constructor.read(this.getId(), params);
    }

    save(params) {
        //throw new Error('Save method must be implemented in a model/store class');
        if (this.getId()) {
            return this.constructor.update(id, this, params);
        } else {
            return this.constructor.create(this, params);
        }
    }

    destroy(params) {
        return this.constructor.delete(id, params);
    }
}

export default BaseAdaptor