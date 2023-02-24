import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';
import { getFilter, parseQuery } from '../../../utils';
//todo: move to separate package

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
    const { db } = this.config;
    if (!db || typeof collectionName !== 'string') {
      throw new Error('MongoServerModelAdaptor: DB instance or CollectionName is not defined');
    }
    return db.collection(this.getConfig().collectionName);
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

  /**
   * Executes a request to read data from a collection
   * @param {object} [params.id] Filter by id
   * @param {object} [params.columns] An object containing columns to select and their values, e.g. { name: true, email: false }
   * @param {object} [params.sort] Object containing sort fields, e.g. { name: 1, age: -1 }
   * @param {number} [params.limit] Maximum number of documents to return
   * @param {number} [params.skip] Count records to skip
   * @param {object} [params.filter] An object containing filters to apply, e.g. { age: 18, gender: 'female' }
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params={}] Object containing the query parameters, returns all values by default
   * @returns {Promise<Array>} Array of document objects returned by the query
   */
  static async read(params = {}) {
    const { id, collectionName, sort, limit, skip, filter, columns } =
      this.getAdaptorParams(params);
    const projection = {};

    if (columns) {
      Object.keys(columns).forEach((key) => {
        projection[key] = columns[key] ? 1 : 0;
      });
    }

    const filters = getFilter({ [this.config.idAttr]: id, ...filter });
    const cursor = this.getCollection(collectionName).find(filters || {}, projection);

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
    const { mongo } = this.config;
    if (typeof key === 'object') {
      // e.g. {key: val} or Mongo.ObjectID
      if (key instanceof mongo.ObjectID) {
        // if ObjectID supplied
        query = { [this.config.idAttr]: val ? val : key };
      } else {
        // if key in format {key: val, key2: val2,...}
        query = key;
      }
    } else if (key && val !== undefined) {
      query = { [key]: val };
    } else if (key) {
      // if only key and it;s not object it's likely a numeric ID
      query = { [this.config.idAttr]: new mongo.ObjectID(key) };
    }

    const result = await this.getCollection().findOne(query);
    return result ? new this(result) : null;
  }

  /**
   * Updates an existing document in the MongoDB collection
   * @param {object} data - The data to be updated
   * @param {object} [params.id] The identifier of the document to be updated
   * @param {object} [params.filter] - An object specifying the filter criteria, e.g. { age: 1 }
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<boolean>} - Returns true if the document was updated, false otherwise
   * @throws {Error} - If the ID of the document to be updated is not defined
   */
  static async update(data, params = {}) {
    const { id, collectionName, filter } = this.getAdaptorParams(params); //todo: ability to save
    const { mongo } = this.config;
    const mongoId = id ? (id instanceof mongo.ObjectID ? id : new mongo.ObjectID(id)) : undefined;
    const filters = getFilter({ [this.config.idAttr]: mongoId, ...filter });
    if (!filters || !Object.keys(filters).length) {
      throw new Error(
        'MongoServerModelAdaptor update: "id" or "filter" must be defined to update model',
      );
    }
    const myData = { ...data };
    delete myData[this.config.idAttr];
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
   * Counts the number of documents in the MongoDB collection
   * @returns {Promise<number>} - Returns the number of documents in the collection
   */
  static async count() {
    return await this.getCollection().count();
  }

  /**
   * Deletes one or more documents from the MongoDB collection
   * @param {object} [params.id] The identifier of the document to be deleted
   * @param {object} [params.filter] - An object specifying the filter criteria, e.g. { age: 1 }
   * @param {string} [params.collectionName] The name of the table to select data from
   * @returns {Promise<object>} - Returns the result of the deletion
   */
  static async delete(params) {
    const { mongo } = this.config;
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const mongoId = id ? (id instanceof mongo.ObjectID ? id : new mongo.ObjectID(id)) : undefined;
    const filters = getFilter({ [this.config.idAttr]: mongoId, ...filter });
    return await this.getCollection(collectionName).deleteMany(filters || {});
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
    const { mongo } = this.config;
    const _id = new mongo.ObjectID(id);
    return await this.getCollection(collectionName).deleteOne({ _id });
  }

  static getAdaptorParams(params = {}) {
    const {
      id,
      collectionName = this.getConfig().collectionName,
      filter,
      raw = false,
      ...props
    } = parseQuery(params);
    return {
      id,
      collectionName,
      filter,
      raw,
      ...props,
    };
  }

  getAdaptorParams(params = {}) {
    const {
      id = this.getId(),
      collectionName = this.getConfig().collectionName,
      filter,
      raw = false,
      ...props
    } = parseQuery(params);
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
