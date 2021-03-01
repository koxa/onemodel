class BaseAdaptor {

    static create(data, params) {
        throw new Error('CREATE method must be implemented in child Adaptor');
    }

    static read(params) {
        throw new Error('READ method must be implemented in child Adaptor');
    }

    static readOne(key, val) {
        throw new Error('READ_ONE method must be implemented in child Adaptor');
    }

    static update(id, data, params) {
        throw new Error('UPDATE method must be implemented in child Adaptor');
    }

    static delete(id, params) {
        throw new Error('DELETE method must be implemented in child Adaptor');
    }

    static getCollectionName() {
        return this.name.toLowerCase();
        //throw new Error('GetCollectionName method must be implemented in a model/store class');
    }

    static async find(params) {
        //throw new Error('Find method must be implemented in a model/store class');
        return await this.read(null, params);
    }

    static async findById(id, params) {
        //throw new Error('FindById method must be implemented in a model/store class');
        return await this.read(id, params);
    }

    async fetch(id) { // should only fetch by id so far
        //throw new Error('Fetch method must be implemented in a model/store class');
        id = this.getId() || id;
        return this.setAll(await this.constructor.read(id));
    }

    async save(params) {
        //throw new Error('Save method must be implemented in a model/store class');
        let data;
        if (this.getId()) {
            data = await this.constructor.update(this.getId(), this.getAll(this.constructor.getIdAttr()), params); // supply all data but id
        } else {
            data = await this.constructor.create(this.getAll(), params);
        }

        return this.setAll(data);
        //return data;
    }

    async destroy(params) {
        return await this.constructor.delete(id, params);
    }
}

export default BaseAdaptor