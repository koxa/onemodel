import BaseModel from '../model/BaseModel';

abstract class BaseAdaptor {
  static config = {
    collectionName() {
      return this.name.toLowerCase(); // will be applied during getConfig against workable object
    },
  };

  static create(params, data) {
    throw new Error('CREATE method must be implemented in child Adaptor');
  }

  static read(...params: any) {
    throw new Error('READ method must be implemented in child Adaptor');
  }

  static readOne(key, val) {
    throw new Error('READ_ONE method must be implemented in child Adaptor');
  }

  static update(params, data) {
    throw new Error('UPDATE method must be implemented in child Adaptor');
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

  getAdaptorParams(data: any) {
    throw new Error('getAdaptorParams method must be implemented in child Adaptor');
  }

  async fetch(params) {
    // should only fetch by id so far //todo: support direct id along with params object
    // throw new Error('Fetch method must be implemented in a model/store class');
    const id = this.getModelClass().getId() || params[this.getModelClass().getClientIdAttr()];
    if (!id) {
      throw new Error('ID must be provided to fetch a model');
    }
    return this.getModelClass().setAll(await this.getParent().read(id));
  }

  async save(params = {}) {
    //throw new Error('Save method must be implemented in a model/store class');
    if (this.getModelClass().getId()) {
      params = { id: this.getModelClass().getId(), ...params };
      const result = await this.getParent().update(
        this.getModelClass().getAll(this.getModelClass().getConfig().idAttr),
        this.getAdaptorParams(params),
      ); // get all data but id //todo: get only props modified since creation and save to server only them
      if (typeof result !== 'boolean') {
        // for example mongo on updateOne won't return full data but rather modifiedCount. matchedCount etc
        throw new Error('BaseAdaptor save: update must return boolean');
      }
      return result; // if all ok true is returned
    } else {
      const data = await this.getParent().create(
        this.getModelClass().getAll(),
        this.getAdaptorParams(params),
      );
      if (typeof data !== 'object') {
        throw new Error('BaseAdaptor save: create must return object with modified props or id');
      }
      return this.getModelClass().setAll(data); //todo: what are the cases where setting back data after it was stored on server is needed ? maybe only on create when ID was assigned ?
    }
  }

  getModelClass() {
    return this as any as BaseModel;
  }

  getParent() {
    return this.constructor as any;
  }

  async destroy(params) {
    // return await this.parent.delete(this.getURL(this.modelClass.getId()), params);
  }
}

export default BaseAdaptor;
