import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';

class SequelizeModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    db: null,
    schemas: [],
    schemasParser: {},
    idAttr: '_id',
  };

  static _firstSync = true;

  static idAttr() {
    return this.config.idAttr;
  }

  /**
   * Synchronize the database
   * @returns {Promise<void>} - A promise that resolves when the database is successfully synchronized
   */
  static async sync() {
    return this.config.db.sync();
  }

  /**
   * Perform the first synchronization of the database
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the synchronization was successful
   * @throws {Error} - Throws an error if there was an issue synchronizing the database
   */
  static async fistSync() {
    if (this._firstSync) {
      this._firstSync = false;
      try {
        return await this.sync();
      } catch (e) {
        console.error(e);
        throw new Error('SequelizeModelAdaptor: Database synchronization error', e);
      }
    }
    return true;
  }

  /**
   * Get the schema collection for the specified collection name or the default collection name
   * @param {string} collectionName - The name of the collection to get the schema for (optional, default is the default collection name)
   * @returns {object} - The schema collection for the specified collection name or the default collection name
   */
  static getCollection(
    collectionName = this.getConfig().collectionName ||
      (typeof this.getCollectionName !== 'undefined' && this.getCollectionName()),
  ) {
    if (!this.config.schemasParser) {
      this.config.schemasParser = {};
    }
    const { schemas, schemasParser } = this.config;
    if (!schemasParser[collectionName]) {
      schemas.forEach((schema) => {
        schemasParser[schema.name.toLocaleLowerCase()] = schema;
      });
    }
    return schemasParser[collectionName];
  }

  /**
   * Create a new model instance in the database
   * @param {object} data - The data for the new model instance
   * @param {object} params - Additional parameters for the create operation (optional), e.g. { collectionName: 'test' }
   * @returns {Promise<object>} - A promise that resolves to the created model instance
   * @throws {Error} - Throws an error if the WHERE parameters are not defined
   */
  static async create(data, params) {
    await this.fistSync();
    const { collectionName } = this.getAdaptorParams(params);
    const collection = this.getCollection(collectionName);
    const { dataValues, isNewRecord } = await collection.create(data);
    return {
      [this.idAttr()]: dataValues[this.idAttr()],
      isNewRecord,
    };
  }

  /**
   * Read model instances from the database
   * @param {object} params - Additional parameters for the read operation (optional)
   * @returns {Promise<object[]>} - A promise that resolves to an array of model instances
   */
  static async read(params = {}) {
    await this.fistSync();
    const collection = this.getCollection();
    const { raw } = this.getAdaptorParams(params);
    return await collection.findAll({ ...params, raw });
  }

  /**
   * Update model instances in the database
   * @param {object} data - The data to update the model instance with
   * @param {object} params - Additional parameters for the update operation, , e.g. { id: 1 }
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the update was successful
   * @throws {Error} - Throws an error if the WHERE parameters are not defined or the result array is empty
   */
  static async update(data, params) {
    await this.fistSync();

    // filter properties that are not related to the data model.
    const where = Object.entries(params)
      .filter(([key]) => key !== 'raw' && key !== 'collectionName')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    if (Object.keys(where).length === 0) {
      throw new Error(
        'SequelizeModelAdaptor update: WHERE parameters must be defined to update model',
      );
    }

    let result;
    try {
      const dataUpdate = { ...data };
      delete dataUpdate[this.idAttr()];
      result = await this.getCollection().update(dataUpdate, { where });
    } catch (err) {
      throw new Error('SequelizeModelAdaptor update: error during update: ' + err.toString());
    }

    if (result.length) {
      return true;
    }

    throw new Error('SequelizeModelAdaptor update: Array result must not be empty');
  }

  /**
   * Delete a model instance from the database based on a specified condition
   * @param {(number|object)} idOrCondition - The ID of the model instance to delete or an object containing the condition to match for the record to delete, e.g. { name: 'John', age: 25 }
   * @returns {Promise<object>} - A promise that resolves to an object containing the number of deleted records
   */
  static async deleteOne(idOrCondition) {
    await this.fistSync();
    const where =
      typeof idOrCondition !== 'object' ? { [this.idAttr()]: idOrCondition } : idOrCondition;
    const result = await this.getCollection().destroy({
      where,
    });

    return {
      deletedCount: result,
    };
  }

  static getAdaptorParams({ id, collectionName = this.getConfig().collectionName, raw = true }) {
    return {
      id,
      collectionName,
      raw,
    };
  }

  getAdaptorParams({
    id = this.getId(),
    collectionName = this.getConfig().collectionName,
    raw = true,
  }) {
    return {
      id,
      collectionName,
      raw,
    };
  }
}

export default SequelizeModelAdaptor;
