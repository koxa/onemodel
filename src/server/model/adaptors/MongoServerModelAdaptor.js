import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';
import { getFilter } from '../../../utils';

class MongoServerModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    idAttr: '_id',
    mongo: null, // global Mongo reference
    db: null, // DB instance
  };

  /**
   * Returns the collection instance from MongoDB
   * @param {string} [collectionName=this.getConfig().collectionName || this.getCollectionName()] - The name of the collection to return. Defaults to the one defined in the configuration object or in the instance of the class
   * @returns {MongoDB.Collection} - The MongoDB Collection instance
   * @throws {Error} - If DB instance or CollectionName is not defined
   */
  static getCollection(
    collectionName = this.getConfig().collectionName ||
      (typeof this.getCollectionName !== 'undefined' && this.getCollectionName()),
  ) {
    const db = this.getConfig('db');
    if (!db || typeof collectionName !== 'string') {
      throw new Error('MongoServerModelAdaptor: DB instance or CollectionName is not defined');
    }
    return db.collection(collectionName);
  }

  /**
   * Creates a new document in the MongoDB collection
   * @param {object} data - The data to be inserted in the collection
   * @returns {Promise<object>} - Returns the result of the insertion
   */
  static async create(data, { id, collectionName, filter, raw }) {
    const params = this.getAdaptorParams({ id, collectionName, filter, raw }); //todo: ability to save
    return await this.getCollection(params.collectionName)
      .insertOne(data)
      .then((result) => {
        return { _id: result.insertedId };
      });
  }

  static buildFilter(filter) {
    const mongo = this.getConfig('mongo');
    const filters = getFilter(filter);
    if (!filters || Object.keys(filters).length === 0) {
      return filters;
    }
    const simplifiedFilters = Array.isArray(filter) ? [] : {};
    const regex = (text) => new RegExp(text.toString().replace(/%/g, '.'), 'i');
    for (const [key, value] of Object.entries(filters)) {
      if (key === '$like' && (typeof value === 'string' || typeof value === 'number')) {
        simplifiedFilters['$regex'] = regex(value);
      } else if (key === '$notLike' && (typeof value === 'string' || typeof value === 'number')) {
        simplifiedFilters['$not'] = regex(value);
      } else if (key === '$notIn') {
        simplifiedFilters['$nin'] = value;
      } else if (typeof value === 'object' && value !== null && !mongo.ObjectId.isValid(value)) {
        simplifiedFilters[key] = this.buildFilter(value);
      } else {
        simplifiedFilters[key] =
          typeof value === 'string' && mongo.ObjectId.isValid(value)
            ? new mongo.ObjectID(value)
            : value;
      }
    }
    return simplifiedFilters;
  }

  /**
   * Executes a request to read data from a collection
   * @param {object} [params.id] Filter by id
   * @param {object} [params.columns] An object containing columns to select and their values, e.g. { name: true, email: false }
   * @param {object} [params.sort] Object containing sort fields, e.g. { name: 1, age: -1 }
   * @param {number} [params.limit] Maximum number of documents to return
   * @param {number} [params.skip] Count records to skip
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $lt, $lte, $gt, $gte, $in, $notIn, $like, $notLike, $or and $and.
   *   By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $like: 'firstName' } },
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params={}] Object containing the query parameters, returns all values by default
   * @returns {Promise<Array>} Array of document objects returned by the query
   */
  static async read(params = {}) {
    const { id, collectionName, sort, limit, skip, filter, columns } =
      this.getAdaptorParams(params);
    const filters = this.buildFilter({ [this.getConfig('idAttr')]: id, ...filter });
    const cursor = this.getCollection(collectionName).find(filters);

    if (columns) {
      cursor.project(columns);
    }

    if (sort) {
      cursor.sort(sort);
    }

    if (limit) {
      cursor.limit(limit);
    }

    if (skip) {
      cursor.skip(skip);
    }

    const documents = await cursor.toArray();
    return documents.map((doc) => new this(doc));
  }

  /**
   * Finds one record by param or set of params or ID
   * @param key or {key: val, ...} or Mongo.ObjectID or ID
   * @param val
   * @returns {Promise<MongoServerModelAdaptor>}
   */
  static async readOne(key, val) {
    let query;
    const mongo = this.getConfig('mongo');
    if (typeof key === 'object') {
      // e.g. {key: val} or Mongo.ObjectID
      if (key instanceof mongo.ObjectID) {
        // if ObjectID supplied
        query = { [this.getConfig('idAttr')]: val ? val : key };
      } else {
        // if key in format {key: val, key2: val2,...}
        query = key;
      }
    } else if (key && val !== undefined) {
      query = { [key]: val };
    } else if (key) {
      // if only key and it;s not object it's likely a numeric ID
      query = { [this.getConfig('idAttr')]: new mongo.ObjectID(key) };
    }

    const result = await this.getCollection().findOne(query);
    return result ? new this(result) : null;
  }

  /**
   * Updates an existing document in the MongoDB collection
   * @param {object} data - The data to be updated
   * @param {object} [params.id] The identifier of the document to be updated
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $lt, $lte, $gt, $gte, $in, $notIn, $like, $notLike, $or and $and.
   *   By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $like: 'firstName' } },
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<boolean>} - Returns true if the document was updated, false otherwise
   * @throws {Error} - If the ID of the document to be updated is not defined
   */
  static async update(data, params = {}) {
    const { id, collectionName, filter } = this.getAdaptorParams(params); //todo: ability to save
    const mongo = this.getConfig('mongo');
    const mongoId = id ? (id instanceof mongo.ObjectID ? id : new mongo.ObjectID(id)) : undefined;
    const filters = this.buildFilter({ [this.getConfig('idAttr')]: mongoId, ...filter });
    if (!filters || !Object.keys(filters).length) {
      throw new Error(
        'MongoServerModelAdaptor update: "id" or "filter" must be defined to update model',
      );
    }
    const myData = { ...data };
    delete myData[this.getConfig('idAttr')];
    let result;
    try {
      result = await this.getCollection(collectionName).updateOne({ ...filters }, { $set: myData });
    } catch (err) {
      throw new Error(
        'MongoServerModelAdaptor update: MongoDB error during updateOne: ' + err.toString(),
      );
    }
    if (result.acknowledged && result.modifiedCount === 1 && result.matchedCount === 1) {
      return true;
    } else {
      //todo: support Model changes rollback if unable to save OR implement sync/pending changes/versioning
    }
    throw new Error(
      'MongoServerModelAdaptor update: Acknowledged false or modifiedCount/matchedCount not 1',
    );
  }

  /**
   * Updates multiple documents in the MongoDB collection
   * @param {object} data - Array of objects containing the data to be updated
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<boolean>} - Returns true if the documents were updated, false otherwise
   */
  static async updateMany(data, params = {}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('MongoServerModelAdaptor updateMany: data array is empty');
    }
    const mongo = this.getConfig('mongo');
    const { collectionName } = this.getAdaptorParams(params);

    try {
      const idAttr = this.getConfig('idAttr');
      const bulkOperations = data.map((data) => {
        const mongoId =
          data[idAttr] instanceof mongo.ObjectID ? data[idAttr] : new mongo.ObjectID(data[idAttr]);
        delete data[idAttr];
        return {
          updateOne: {
            filter: { [idAttr]: mongoId },
            update: { $set: data },
          },
        };
      });

      const result = await this.getCollection(collectionName).bulkWrite(bulkOperations);
      if (
        result &&
        result.result &&
        result.result.ok &&
        result.result.nModified === data.length &&
        result.result.nMatched === data.length
      ) {
        return true;
      }
    } catch (err) {
      throw new Error(
        'MongoServerModelAdaptor updateMany: MongoDB error during bulkWrite: ' + err.toString(),
      );
    }

    throw new Error(
      'MongoServerModelAdaptor updateMany: Acknowledged false or modifiedCount/matchedCount not equal to dataArray length',
    );
  }

  /**
   * Counts the number of documents in the MongoDB collection
   * @returns {Promise<number>} - Returns the number of documents in the collection
   */
  static async count() {
    return await this.getCollection().count();
  }

  /**
   * Inserts multiple documents into the specified collection in the database
   * @param {object[]} data - Array of objects containing the data to be inserted
   * @param {string} [params.collectionName] - The name of the table to insert data into
   * @returns {Promise<object>} - Returns an object with the number of inserted documents and their IDs
   * @throws Will throw an error if the data array is empty or not an array
   */
  static async insertMany(data, params = {}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('MongoServerModelAdaptor insertMany: data array is empty');
    }
    const { collectionName } = this.getAdaptorParams(params);
    return await this.getCollection(collectionName)
      .insertMany(data)
      .then((result) => {
        return {
          insertedCount: result.insertedCount,
          insertedIds: Object.values(result.insertedIds),
        };
      });
  }

  /**
   * Deletes documents from the specified collection in the database based on the provided IDs
   * @param {number[]} ids - Array of IDs to delete
   * @param {string} [params.collectionName] - The name of the table to delete data from
   * @returns {Promise<object>} - Returns an object with the number of deleted documents
   */
  static async deleteMany(ids, params = {}) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('MongoServerModelAdaptor deleteMany: ids array is empty');
    }
    const idAttr = this.getConfig('idAttr');
    const mongo = this.getConfig('mongo');
    const { collectionName } = this.getAdaptorParams(params);
    const objIds = ids.map((id) => new mongo.ObjectID(id));
    return await this.getCollection(collectionName).deleteMany({ [idAttr]: { $in: objIds } });
  }

  /**
   * Deletes one or more documents from the MongoDB collection
   * @param {object} [params.id] The identifier of the document to be deleted
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $lt, $lte, $gt, $gte, $in, $notIn, $like, $notLike, $or and $and.
   *   By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $like: 'firstName' } },
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<object>} - Returns the result of the deletion
   */
  static async delete(params = {}) {
    const mongo = this.getConfig('mongo');
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const mongoId = id ? (id instanceof mongo.ObjectID ? id : new mongo.ObjectID(id)) : undefined;
    const filters = this.buildFilter({ [this.getConfig('idAttr')]: mongoId, ...filter });
    return await this.getCollection(collectionName).deleteMany(filters);
  }

  /**
   * Deletes one document from the MongoDB collection
   * @param {string} id - The identifier of the document to be deleted
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<object>} - Returns the result of the deletion
   */
  static async deleteOne(id, params = {}) {
    if (!id) {
      throw new Error('MongoServerModelAdaptor deleteOne: "id" must be defined');
    }
    const { collectionName } = this.getAdaptorParams(params);
    const mongo = this.getConfig('mongo');
    const _id = new mongo.ObjectID(id);
    return await this.getCollection(collectionName).deleteOne({ _id });
  }

  static getAdaptorParams({
    id,
    collectionName = this.getConfig('collectionName'),
    filter,
    raw = false,
    ...props
  }) {
    return {
      id,
      collectionName,
      filter,
      raw,
      ...props,
    };
  }

  getAdaptorParams({
    id = this.getId(),
    collectionName = this.getConfig().collectionName,
    filter,
    raw = false,
    ...props
  }) {
    return {
      id,
      collectionName,
      filter,
      raw,
      ...props,
    };
  }
}

export default MongoServerModelAdaptor;
