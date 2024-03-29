import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';
import { getFilter } from '../../../utils';
class SQLiteServerModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    db: null,
    idAttr: 'id',
  };

  static _sqliteFirstSync = true;

  static idAttr() {
    return this.config.idAttr;
  }

  /**
   * Checks if the table with the given name exists
   * @param {string} tableName - The name of the table to check
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the table exists
   */
  static async isTableExist(tableName) {
    const result = await this.queryAll(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
    );
    return result.length > 0;
  }

  /**
   * Creates a table with the given name and properties
   * @param {string} name - The name of the table to create
   * @param {object} props - Object containing the properties of the table, e.g. { name: { type: 'String', value: 'John' } }
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the table was created successfully
   */
  static async createTableFromProps(name, props) {
    if (!props || !Object.keys(props).length) {
      throw new Error(
        'SQLiteModelAdaptor: Props are empty. Props are needed to generate the schema to create the table',
      );
    }
    const keys = Object.keys(props);
    const columns = [];
    for (const key of keys) {
      let value = props[key];
      let type = '';
      if (value && value.type) {
        switch (value.type) {
          case 'String':
            type = 'TEXT';
            break;
          case 'Number':
            type = 'NUMERIC';
            break;
          case 'Date':
            type = 'DATE';
            break;
          default:
            type = 'TEXT';
        }
        if (value.value !== '') {
          value = value.value;
          columns.push(`${key} ${type} DEFAULT '${value}'`);
        } else {
          columns.push(`${key} ${type}`);
        }
      } else {
        switch (typeof value) {
          case 'string':
            type = 'TEXT';
            break;
          case 'number':
            type = 'NUMERIC';
            break;
          case 'object':
            if (value instanceof Date) {
              type = 'DATE';
              value = value.toISOString().slice(0, 10);
            } else {
              type = 'TEXT';
            }
            break;
          default:
            type = 'TEXT';
        }
        if (value !== '') {
          columns.push(`${key} ${type} DEFAULT '${value}'`);
        } else {
          columns.push(`${key} ${type}`);
        }
      }
    }
    const query = `CREATE TABLE ${name} (${this.idAttr()} INTEGER PRIMARY KEY AUTOINCREMENT, ${columns.join(
      ', ',
    )})`;
    const result = await this.queryRun(query);
    return result !== undefined;
  }

  /**
   * Checks if the table with the given name exists, and if not, creates it using the properties defined in the config
   * @param {string} tableName - The name of the table to check and create
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the table was created successfully
   */
  static async firstCheckAndCreateTable(tableName) {
    if (this._sqliteFirstSync) {
      this._sqliteFirstSync = false;
      if (!(await this.isTableExist(tableName))) {
        return this.createTableFromProps(tableName, this.config.props);
      }
    }
    return false;
  }

  /**
   * Gets the name of the collection associated with this adaptor
   * @param {string} [collectionName=this.getConfig().collectionName] - The name of the collection to retrieve. If not specified, the collection name from the configuration is used
   * @returns {string} - The name of the collection
   */
  static getCollection(
    collectionName = this.getConfig().collectionName ||
      (typeof this.getCollectionName !== 'undefined' && this.getCollectionName()),
  ) {
    return collectionName;
  }

  static buildFilter(data) {
    const filter = getFilter(data);
    if (!filter || typeof filter !== 'object' || !Object.keys(filter).length) {
      return '';
    }
    const conditions = [];
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'object' && value !== null) {
        const conditionKeys = Object.keys(value);
        if (conditionKeys.length === 0) {
          continue;
        }
        const operator = conditionKeys[0];
        const conditionValue = value[operator];
        switch (operator) {
          case '$eq':
            conditions.push(`${key} = '${conditionValue}'`);
            break;
          case '$ne':
            conditions.push(`${key} <> '${conditionValue}'`);
            break;
          case '$gt':
            conditions.push(`${key} > '${conditionValue}'`);
            break;
          case '$lt':
            conditions.push(`${key} < '${conditionValue}'`);
            break;
          case '$in':
            conditions.push(`${key} IN (${conditionValue.map((v) => `'${v}'`).join(', ')})`);
            break;
          case '$regex':
            conditions.push(`${key} LIKE '%${conditionValue}%'`);
            break;
          default:
            break;
        }
      } else {
        conditions.push(`${key} = '${value}'`);
      }
    }
    return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  static queryRun(query, values) {
    return new Promise((resolve, reject) => {
      this.config.db.run(query, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  static queryAll(query) {
    return new Promise((resolve, reject) => {
      this.config.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Creates a new document in the collection
   * @param {object} data - Object containing the data to be inserted
   * @param {object} [params.collectionName] - Collection name, e.g. { collectionName: 'test' }
   * @returns {Promise<object>} - A promise that resolves to the newly inserted document
   */
  static async create(data, params) {
    const { collectionName } = this.getAdaptorParams(params);
    await this.firstCheckAndCreateTable(collectionName);

    const keys = Object.keys(data);
    const values = Object.values(data);
    const columns = keys.join(', ');
    const placeholders = values.map((value) => `'${value}'`).join(', ');

    const query = `INSERT INTO ${collectionName} (${columns}) VALUES (${placeholders})`;
    const { lastID } = await this.queryRun(query);
    return {
      [this.idAttr()]: Number(lastID),
    };
  }

  /**
   * Executes a request to read data from a collection
   * @param {string} [params.id] Filter by id
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.columns] An object containing columns to select and their values, e.g. { id: true, name: true, email: false }
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $gt, $lt, $in, and $regex. If the $regex operator is used, the corresponding value
   *   should be a regular expression string. By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $regex: 'firstName' } },
   * @param {object} [params.sort] An object containing sort fields, e.g. { name: 1, age: -1 }
   * @param {number} [params.limit] Maximum number of rows to return
   * @param {number} [params.skip] Number of rows to skip before returning results
   * @param {object} [params={}] Returns all values by default
   * @returns {Promise<Array>} A promise that resolves to an array of row objects returned by the query
   */
  static async read(params = {}) {
    const { id, collectionName, columns, filter, sort, limit, skip } =
      this.getAdaptorParams(params);
    await this.firstCheckAndCreateTable(collectionName);

    const filterQuery = this.buildFilter({ [this.config.idAttr]: id, ...filter });
    const columnsQuery = columns
      ? Object.entries(columns)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(',')
      : '*';
    const sortQuery = sort
      ? Object.entries(sort)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key} ${value === 1 ? 'ASC' : 'DESC'}`)
          .join(',')
      : '';

    let query = `SELECT ${columnsQuery} FROM ${collectionName}`;
    if (filterQuery) query += ` ${filterQuery}`;
    query += ' GROUP BY id';
    if (sortQuery) query += ` ORDER BY ${sortQuery}`;

    if (limit && !skip) {
      query += ` LIMIT ${Number(limit)}`;
    } else if (limit && skip) {
      query += ` LIMIT ${Number(limit)} OFFSET ${Number(skip)}`;
    } else if (!limit && skip) {
      query += ` LIMIT -1 OFFSET ${Number(skip)}`;
    }

    const rows = await this.queryAll(query);
    return rows.map((item) => new this(item));
  }

  /**
   * Updates an existing document in the collection
   * @param {object} data - Object containing the data to be updated
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.id] Filter by id
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $gt, $lt, $in, and $regex. If the $regex operator is used, the corresponding value
   *   should be a regular expression string. By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $regex: 'firstName' } },
   * @param {object} [params] - Object containing query parameters
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the update was successful
   */
  static async update(data, params) {
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const filterQuery = this.buildFilter({ [this.config.idAttr]: id, ...filter });
    if (!filterQuery) {
      throw new Error(
        'SQLiteServerModelAdaptor update: "id" or "filter" must be defined to update model',
      );
    }

    const sets = Object.keys(data)
      .filter((key) => key !== 'id')
      .map((key) => `${key}='${data[key]}'`)
      .join(', ');

    const query = `UPDATE ${collectionName} SET ${sets} ${filterQuery}`;

    const { changes } = await this.queryRun(query);
    return changes > 0;
  }

  /**
   * Deletes a document with the given ID from the collection
   * @param {number} id - The ID of the document to delete
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params={}] - Object containing parameters that affect the behavior of the function, e.g. { collectionName: 'test' }
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the deletion was successful
   */
  static async deleteOne(id, params = {}) {
    if (!id) {
      throw new Error('SQLiteServerModelAdaptor deleteOne: ID must be defined');
    }
    const { collectionName } = this.getAdaptorParams(params);
    const query = `DELETE FROM ${collectionName} WHERE id=${id}`;
    const { changes } = await this.queryRun(query);
    return {
      deletedCount: changes,
    };
  }

  /**
   * Executes a request to delete documents from a collection.
   * @param {string} params.collectionName - The name of the collection to delete documents from.
   * @param {object} [params.id] Filter by id
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $gt, $lt, $in, and $regex. If the $regex operator is used, the corresponding value
   *   should be a regular expression string. By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $regex: 'firstName' } },
   * @returns {Promise<object>} - An object containing information about the operation, including the number of documents deleted.
   */
  static async delete(params = {}) {
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const filterQuery = this.buildFilter({ [this.config.idAttr]: id, ...filter });
    const query = `DELETE FROM ${collectionName} ${filterQuery}`;
    const { changes } = await this.queryRun(query);
    return {
      deletedCount: changes,
    };
  }

  /**
   * Executes a request to count the number of documents in a collection.
   * @param {string} params.collectionName - The name of the collection to count documents in.
   * @returns {Promise<number>} - The number of documents in the collection.
   */
  static async count(params = {}) {
    const { collectionName } = this.getAdaptorParams(params);
    const query = `SELECT COUNT(*) AS count FROM ${collectionName}`;
    const [result] = await this.queryAll(query);
    return Number(result.count);
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
    filter,
    ...props
  }) {
    return {
      id,
      collectionName,
      filter,
      ...props,
    };
  }
}

export default SQLiteServerModelAdaptor;
