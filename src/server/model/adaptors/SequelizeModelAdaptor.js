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
   * Executes a request to read data from a collection
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.columns] An object containing columns to select and their values, e.g. { id: 1, name: 1, email: 0 }
   * @param {object} [params.filters] An object containing filters to apply, e.g. { age: 18, gender: 'female' }
   * @param {object} [params.sort] An object containing sort fields, e.g. { name: 1, age: -1 }
   * @param {number} [params.limit] Maximum number of rows to return
   * @param {number} [params.skip] Number of rows to skip before returning results
   * @param {object} [params={}] Returns all values by default
   * @returns {Promise<Array>} A promise that resolves to an array of row objects returned by the query
   */
  static async read(params = {}) {
    const { collectionName, raw, columns, filters, sort, limit, skip } =
      this.getAdaptorParams(params);
    const collection = this.getCollection(collectionName);
    const query = {
      raw,
      limit: limit ? Number(limit) : undefined,
      offset: skip,
      attributes: columns,
      where: filters,
      order:
        typeof sort === 'object'
          ? Object.entries(sort).map(([column, direction]) => [
              column,
              direction === 1 ? 'ASC' : 'DESC',
            ])
          : undefined,
    };

    return await collection.findAll(query);
  }

  /**
   * Update model instances in the database
   * @param {object} data - The data to update the model instance with
   * @param {object} params - Additional parameters for the update operation, , e.g. { id: 1 }
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the update was successful
   * @throws {Error} - Throws an error if the WHERE parameters are not defined or the result array is empty
   */
  static async update(data, params) {
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
   * Counts the number of documents in the collection
   * @returns {Promise<number>} - Returns the number of documents in the collection
   */
  static async count() {
    return await this.getCollection().count();
  }

  /**
   * Deletes one or more documents from the collection
   * @param {object} params - The filter to be applied to the documents to be deleted
   * @returns {Promise<object>} - Returns the result of the deletion
   */
  static async delete(params) {
    const deleted = await this.getCollection().destroy({ where: params });
    return { deletedCount: deleted };
  }

  /**
   * Delete a model instance from the database based on a specified condition
   * @param {(number|object)} idOrCondition - The ID of the model instance to delete or an object containing the condition to match for the record to delete, e.g. { name: 'John', age: 25 }
   * @returns {Promise<object>} - A promise that resolves to an object containing the number of deleted records
   */
  static async deleteOne(idOrCondition) {
    const where =
      typeof idOrCondition !== 'object' ? { [this.idAttr()]: idOrCondition } : idOrCondition;
    const result = await this.getCollection().destroy({
      where,
    });

    return {
      deletedCount: result,
    };
  }

  static getAdaptorParams({
    id,
    collectionName = this.getConfig().collectionName,
    raw = true,
    ...props
  }) {
    return {
      id,
      collectionName,
      raw,
      ...props,
    };
  }

  getAdaptorParams({
    id = this.getId(),
    collectionName = this.getConfig().collectionName,
    raw = true,
    ...props
  }) {
    return {
      id,
      collectionName,
      raw,
      ...props,
    };
  }
}

export default SequelizeModelAdaptor;
