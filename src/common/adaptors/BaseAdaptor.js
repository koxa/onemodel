class BaseAdaptor {

    static getURLPrefix() {
        return '/api/';
    }

    static getCollectionName() {
        return this.name.toLowerCase();
    }

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

    static async find(params) {
        //throw new Error('Find method must be implemented in a model/store class');
        return await this.read(null, params);
    }

    static async findById(id, params) {
        //throw new Error('FindById method must be implemented in a model/store class');
        return await this.read(id, params);
    }

    static getURL(id) {
        let url = this.getURLPrefix() + this.getCollectionName();
        url = id ? url + '/' + id : url;
        return url;
    }

    getURLPrefix() {
        return this.getConfig().URLPrefix || this.constructor.getURLPrefix();
    }

    getCollectionName() {
        return this.getConfig().collectionName || this.constructor.getCollectionName();
    }

    getURL(id) {
        let url = this.getURLPrefix() + this.getCollectionName();
        url = id ? url + '/' + id : url;
        return url;
    }

    async fetch(id) { // should only fetch by id so far
        //throw new Error('Fetch method must be implemented in a model/store class');
        id = this.getId() || id;
        return this.setAll(await this.constructor.read(this.getURL(id)));
    }

    async save(params) {
        //throw new Error('Save method must be implemented in a model/store class');
        let data;
        if (this.getId()) {
            data = await this.constructor.update(this.getURL(this.getId()), this.getAll(this.constructor.getIdAttr()), params); // supply all data but id
        } else {
            data = await this.constructor.create(this.getURL(), this.getAll(), params);
        }

        return this.setAll(data);
        //return data;
    }

    async destroy(params) {
        return await this.constructor.delete(this.getURL(this.getId()), params);
    }
}

export default BaseAdaptor