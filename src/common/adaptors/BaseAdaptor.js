class BaseAdaptor {
  static _config = {
    collectionName() {
      return this.name.toLowerCase(); // will be applied during getConfig against workable object
    },
  };

  static create(params, data) {
    throw new Error('CREATE method must be implemented in child Adaptor');
  }

  static read(params) {
    throw new Error('READ method must be implemented in child Adaptor');
  }

  static readOne(key, val) {
    throw new Error('READ_ONE method must be implemented in child Adaptor');
  }

  static update(params, data) {
    throw new Error('UPDATE method must be implemented in child Adaptor');
  }

  static async updateMany(data = [], params = {}) {
    throw new Error('updateMany method must be implemented in child Adaptor');
  }

  static delete(params) {
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

  static count() {
    throw new Error('COUNT method must be implemented in child Adaptor');
  }

  getAdaptorParams() {
    throw new Error('getAdaptorParams method must be implemented in child Adaptor');
  }

  async fetch(params) {
    // should only fetch by id so far //todo: support direct id along with params object
    //throw new Error('Fetch method must be implemented in a model/store class');
    const id = this.getId() || params[this.constructor.getIdAttr()];
    if (!id) {
      throw new Error('ID must be provided to fetch a model');
    }
    return this.setAll(await this.constructor.read(id));
  }

  async save(params = {}) {
    //throw new Error('Save method must be implemented in a model/store class');
    if (this.getId()) {
      params = { id: this.getId(), ...params };
      const result = await this.constructor.update(
        this.getAll(this.constructor.getConfig().idAttr),
        this.constructor.getAdaptorParams(params),
      ); // get all data but id //todo: get only props modified since creation and save to server only them
      if (typeof result !== 'boolean') {
        // for example mongo on updateOne won't return full data but rather modifiedCount. matchedCount etc
        throw new Error('BaseAdaptor save: update must return boolean');
      }
      if (this.isModified) {
        this.isModified = false;
      }
      return result; // if all ok true is returned
    } else {
      const data = await this.constructor.create(
        this.getAll(),
        this.constructor.getAdaptorParams(params),
      );
      if (typeof data !== 'object') {
        throw new Error('BaseAdaptor save: create must return object with modified props or id');
      }
      return this.setAll(data); //todo: what are the cases where setting back data after it was stored on server is needed ? maybe only on create when ID was assigned ?
    }
  }

  async delete(params = {}) {
    if (this.getId()) {
      params = { id: this.getId(), ...params };
      return this.constructor.delete(this.getAdaptorParams(params));
    }
    throw new Error(`BaseAdaptor delete: missing ${this.constructor.getConfig().idAttr} parameter`);
  }

  async destroy(params) {
    return await this.constructor.delete(this.getURL(this.getId()), params);
  }
}

export default BaseAdaptor;
