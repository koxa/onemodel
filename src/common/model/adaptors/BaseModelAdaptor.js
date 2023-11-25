import BaseAdaptor from "../../adaptors/BaseAdaptor.js";

class BaseModelAdaptor extends BaseAdaptor {
  async fetch(id = this.getID()) { //todo: implement fetch by other than ID props
    if (!id) {
      throw new Error("ID must be provided to fetch a model");
    }
    return this.setAll(await this.constructor.read({ [this.getPrimaryKeyProp()]: id }));
  }

  async save() {
    const id = this.getID();
    if (id) {
      // update
      this.constructor.update(id, this); //todo: support when adaptor modifies or appends data
    } else {
      // create
      this.constructor.create(this); //todo: support when adaptor modifies or appends data
    }
  }

  // static async updateMany(data = [], params = {}) {
  //   throw new Error('updateMany method must be implemented in child Adaptor');
  // }
  //
  // static async insertMany(data = [], params = {}) {
  //   throw new Error('insertMany method must be implemented in child Adaptor');
  // }
  //
  // static async deleteMany(data = [], params = {}) {
  //   throw new Error('deleteMany method must be implemented in child Adaptor');
  // }
  //
  // static async find(params) {
  //   //throw new Error('Find method must be implemented in a model/store class');
  //   return await this.read(null, params);
  // }
  //
  // static async findById(url, id, params) {
  //   //throw new Error('FindById method must be implemented in a model/store class');
  //   return await this.read(url, id, params);
  // }

  // static count() {
  //   throw new Error('COUNT method must be implemented in child Adaptor');
  // }

  // getAdaptorParams() {
  //   throw new Error('getAdaptorParams method must be implemented in child Adaptor');
  // }


  //async save(params = {}) {
    //throw new Error('Save method must be implemented in a model/store class');
    // if (this.getId()) {
    //   params = { id: this.getId(), ...params };
    //   const result = await this.constructor.update(
    //     this.getAll(this.constructor.getConfig().idAttr),
    //     this.constructor.getAdaptorParams(params),
    //   ); // get all data but id //todo: get only props modified since creation and save to server only them
    //   if (typeof result !== 'boolean') {
    //     // for example mongo on updateOne won't return full data but rather modifiedCount. matchedCount etc
    //     throw new Error('BaseAdaptor save: update must return boolean');
    //   }
    //   if (this.isModified) {
    //     this.isModified = false;
    //   }
    //   return result; // if all ok true is returned
    // } else {
    //   const data = await this.constructor.create(
    //     this.getAll(),
    //     this.constructor.getAdaptorParams(params),
    //   );
    //   if (typeof data !== 'object') {
    //     throw new Error('BaseAdaptor save: create must return object with modified props or id');
    //   }
    //   return this.setAll(data); //todo: what are the cases where setting back data after it was stored on server is needed ? maybe only on create when ID was assigned ?
    // }
 // }

  // async delete(params = {}) {
  //   if (this.getId()) {
  //     params = { id: this.getId(), ...params };
  //     return this.constructor.delete(this.getAdaptorParams(params));
  //   }
  //   throw new Error(`BaseAdaptor delete: missing ${this.constructor.getConfig().idAttr} parameter`);
  // }

  // async destroy(params) {
  //   return await this.constructor.delete(this.getURL(this.getId()), params);
  // }
}

export default BaseModelAdaptor;
