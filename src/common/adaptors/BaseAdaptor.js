class BaseAdaptor {

    static getCollectionName() {
        return this.name.toLowerCase();
    }

    static create(url, data, params) {
        throw new Error('CREATE method must be implemented in child Adaptor');
    }

    static read(url, params) {
        throw new Error('READ method must be implemented in child Adaptor');
    }

    static readOne(key, val) {
        throw new Error('READ_ONE method must be implemented in child Adaptor');
    }

    static update(collectionName, id, data, params) {
        throw new Error('UPDATE method must be implemented in child Adaptor');
    }

    static delete(url, params) {
        throw new Error('DELETE method must be implemented in child Adaptor');
    }

    static async find(params) {
        //throw new Error('Find method must be implemented in a model/store class');
        return await this.read(null, params);
    }

    static async findById(url, id, params) {
        //throw new Error('FindById method must be implemented in a model/store class');
        return await this.read(url, id, params);
    }

    getAdaptorParams() {
        throw new Error('getAdaptorParams method must be implemented in child Adaptor');
    }

    async fetch(params) { // should only fetch by id so far //todo: support direct id along with params object
        //throw new Error('Fetch method must be implemented in a model/store class');
        const id = this.getId() || params.id;
        if(!id) {
            throw new Error('ID must be provided to fetch a model');
        }
        return this.setAll(await this.constructor.read(this.getURL(id)));
    }

    async save(params) {
        //throw new Error('Save method must be implemented in a model/store class');
        let data;
        if (this.getId()) {
            params = {id: this.getId(), ...params};
            data = await this.constructor.update(this.getAdaptorParams(params), this.getAll(this.constructor.getIdAttr())); // get all data but id
        } else {
            data = await this.constructor.create(this.getAdaptorParams(params), this.getAll());
            // for http adaptor: hostname, path, collectionName
            // for mongo adaptor: db, collectionName
        }

        return this.setAll(data);
        //return data;
    }

    async destroy(params) {
        return await this.constructor.delete(this.getURL(this.getId()), params);
    }
}

export default BaseAdaptor