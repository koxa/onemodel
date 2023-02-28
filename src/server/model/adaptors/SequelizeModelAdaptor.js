import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';
import { getFilter } from '../../../utils';

class SequelizeModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    sequelize: null,
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

  static buildFilter(filters) {
    if (!filters || typeof filters !== 'object' || !Object.keys(filters).length) {
      return undefined;
    }
    const { sequelize } = this.config;
    const operators = {
      $eq: sequelize.Op.eq,
      $ne: sequelize.Op.ne,
      $gt: sequelize.Op.gt,
      $lt: sequelize.Op.lt,
      $in: sequelize.Op.in,
      $regex: sequelize.Op.regexp,
    };
    const result = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object') {
        const [operator, val] = Object.entries(value)[0];
        if (operators[operator]) {
          result[key] = { [operators[operator]]: val };
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    });
    return getFilter(result);
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
   * @param {string} [params.id] Filter by id
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.columns] An object containing columns to select and their values, e.g. { id: 1, name: 1, email: 0 }
   * @param {object} [params.sort] An object containing sort fields, e.g. { name: 1, age: -1 }
   * @param {number} [params.limit] Maximum number of rows to return
   * @param {number} [params.skip] Number of rows to skip before returning results
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $gt, $lt, $in, and $regex. If the $regex operator is used, the corresponding value
   *   should be a regular expression string. By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $regex: 'firstName' } },
   * @param {object} [params={}] Object containing the query parameters. Returns all values by default
   * @returns {Promise<Array>} A promise that resolves to an array of row objects returned by the query
   */
  static async read(params = {}) {
    const { id, collectionName, raw, columns, sort, limit, skip, filter } =
      this.getAdaptorParams(params);
    const collection = this.getCollection(collectionName);
    const filters = this.buildFilter({ [this.config.idAttr]: id, ...filter });
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
   * @param {object} [params.id] The identifier of the document to be updated
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $gt, $lt, $in, and $regex. If the $regex operator is used, the corresponding value
   *   should be a regular expression string. By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $regex: 'firstName' } },
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the update was successful
   * @throws {Error} - Throws an error if the WHERE parameters are not defined or the result array is empty
   */
  static async update(data, params) {
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const filters = this.buildFilter({ [this.config.idAttr]: id, ...filter });
    const where = filters
      ? Object.entries(filters)
          .filter(([key]) => key !== 'raw' && key !== 'collectionName')
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {})
      : '';

    if (Object.keys(where).length === 0) {
      throw new Error(
        'SequelizeModelAdaptor update: WHERE parameters must be defined to update model',
      );
    }

    let result;
    try {
      const dataUpdate = { ...data };
      delete dataUpdate[this.idAttr()];
      result = await this.getCollection(collectionName).update(dataUpdate, { where });
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
   * @param {object} [params.id] The identifier of the document to be deleted
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $gt, $lt, $in, and $regex. If the $regex operator is used, the corresponding value
   *   should be a regular expression string. By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $regex: 'firstName' } },
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<object>} - Returns the result of the deletion
   */
  static async delete(params = {}) {
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const filters = this.buildFilter({ [this.config.idAttr]: id, ...filter }) || {};
    const deleted = await this.getCollection(collectionName).destroy({ where: filters });
    return { deletedCount: deleted };
  }

  /**
   * Delete a model instance from the database based on a specified condition
   * @param {string} id - The identifier of the document to be deleted
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<object>} - A promise that resolves to an object containing the number of deleted records
   */
  static async deleteOne(id, params = {}) {
    if (!id) {
      throw new Error('SequelizeModelAdaptor deleteOne: "id" must be defined');
    }
    const { collectionName } = this.getAdaptorParams(params);
    const result = await this.getCollection(collectionName).destroy({
      where: { [this.idAttr()]: id },
    });

    return {
      deletedCount: result,
    };
  }

  static getAdaptorParams({
    id,
    collectionName = this.getConfig().collectionName,
    raw = true,
    filter,
    ...props
  }) {
    return {
      id,
      collectionName,
      raw,
      filter,
      ...props,
    };
  }

  getAdaptorParams({
    id = this.getId(),
    collectionName = this.getConfig().collectionName,
    raw = true,
    filter,
    ...props
  }) {
    return {
      id,
      collectionName,
      raw,
      filter,
      ...props,
    };
  }
}

export default SequelizeModelAdaptor;
