import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';
import { getFilter, parseQuery } from '../../../utils';
class MariaDbModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    db: null,
    idAttr: 'id',
  };

  static _mariaDbfirstSync = true;

  static idAttr() {
    return this.config.idAttr;
  }

  static async getConnection() {
    return this.config.db.getConnection();
  }

  /**
   * Checks if the table with the given name exists
   * @param {string} tableName - The name of the table to check
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the table exists
   */
  static async isTableExist(tableName) {
    const connection = await this.getConnection();
    const result = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
    connection.end();
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
        'MariaDbModelAdaptor: Props are empty. Props are needed to generate the schema to create the table',
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
            type = 'VARCHAR(255)';
            break;
          case 'Number':
            type = 'DECIMAL(10,2)';
            break;
          case 'Date':
            type = 'DATE';
            break;
          default:
            type = 'VARCHAR(255)';
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
            type = 'VARCHAR(255)';
            break;
          case 'number':
            type = 'DECIMAL(10,2)';
            break;
          case 'object':
            if (value instanceof Date) {
              type = 'DATE';
              value = value.toString().slice(0, 10);
            } else {
              type = 'VARCHAR(255)';
            }
            break;
          default:
            type = 'VARCHAR(255)';
        }
        if (value !== '') {
          columns.push(`${key} ${type} DEFAULT '${value}'`);
        } else {
          columns.push(`${key} ${type}`);
        }
      }
    }
    const query = `CREATE TABLE ${name} (${this.idAttr()} INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, ${columns.join(
      ', ',
    )});`;
    const connection = await this.getConnection();
    const { warningStatus } = await connection.query(query);
    connection.end();
    return warningStatus === 0;
  }

  /**
   * Checks if the table with the given name exists, and if not, creates it using the properties defined in the config
   * @param {string} tableName - The name of the table to check and create
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the table was created successfully
   */
  static async firstCheckAndCreateTable(tableName) {
    if (this._mariaDbfirstSync) {
      this._mariaDbfirstSync = false;
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

  /**
   * Creates a new document in the collection
   * @param {object} data - Object containing the data to be inserted
   * @param {object} [params.collectionName] - Collection name, e.g. { collectionName: 'test' }
   * @returns {Promise<object>} - A promise that resolves to the newly inserted document
   */
  static async create(data, params) {
    const { collectionName } = this.getAdaptorParams(params);
    const [, connection] = await Promise.all([
      this.firstCheckAndCreateTable(collectionName),
      this.getConnection(),
    ]);

    const keys = Object.keys(data);
    const values = Object.values(data);
    const columns = keys.join(', ');
    const placeholders = values.map((value) => `'${value}'`).join(', ');

    const query = `INSERT INTO ${collectionName} (${columns}) VALUES (${placeholders})`;
    const { insertId } = await connection.query(query);
    connection.end();
    return {
      [this.idAttr()]: Number(insertId),
    };
  }

  /**
   * Executes a request to read data from a collection
   * @param {string} [params.id] Filter by id
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.columns] An object containing columns to select and their values, e.g. { id: true, name: true, email: false }
   * @param {object} [params.filter] An object containing filter to apply, e.g. { age: 18, gender: 'female' }
   * @param {object} [params.sort] An object containing sort fields, e.g. { name: 1, age: -1 }
   * @param {number} [params.limit] Maximum number of rows to return
   * @param {number} [params.skip] Number of rows to skip before returning results
   * @param {object} [params={}] Returns all values by default
   * @returns {Promise<Array>} A promise that resolves to an array of row objects returned by the query
   */
  static async read(params = {}) {
    const { id, collectionName, columns, filter, sort, limit, skip } =
      this.getAdaptorParams(params);
    const [, connection] = await Promise.all([
      this.firstCheckAndCreateTable(collectionName),
      this.getConnection(),
    ]);

    const filters = getFilter({ [this.config.idAttr]: id, ...filter });

    const columnsQuery = columns
      ? Object.entries(columns)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(',')
      : '*';
    const filterQuery = filters
      ? Object.entries(filters)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ')
      : '';
    const sortQuery = sort
      ? Object.entries(sort)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key} ${value === 1 ? 'ASC' : 'DESC'}`)
          .join(',')
      : '';
    const maxLimit = Number(9223372036854775807n);

    let query = `SELECT ${columnsQuery} FROM ${collectionName}`;
    if (filterQuery) query += ` WHERE ${filterQuery}`;
    query += ' GROUP BY id';
    if (sortQuery) query += ` ORDER BY ${sortQuery}`;

    if (limit && !skip) {
      query += ` LIMIT ${Number(limit)}`;
    } else if (limit && skip) {
      query += ` LIMIT ${Number(skip)}, ${Number(limit)}`;
    } else if (!limit && skip) {
      query += ` LIMIT ${Number(skip)}, ${maxLimit}`;
    }

    const rows = await connection.query(query);
    connection.end();
    return rows.map((item) => new this(item));
  }

  /**
   * Updates an existing document in the collection
   * @param {object} data - Object containing the data to be updated
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.id] Filter by id
   * @param {object} [params.filter] An object containing filter to apply, e.g. { age: 18, gender: 'female' }
   * @param {object} [params] - Object containing query parameters
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the update was successful
   */
  static async update(data, params) {
    const { id, collectionName, raw, filter } = this.getAdaptorParams(params);
    const filters = getFilter({ [this.config.idAttr]: id, ...filter });
    if (!filters || !Object.keys(filters).length) {
      throw new Error(
        'MariaDbModelAdaptor update: "id" or "filter" must be defined to update model',
      );
    }
    const whereClause = Object.keys(filters)
      .map((key) => `${key}='${filters[key]}'`)
      .join(' AND ');

    const connection = await this.getConnection();

    const sets = Object.keys(data)
      .filter((key) => key !== 'id')
      .map((key) => `${key}='${data[key]}'`)
      .join(', ');

    const query = `UPDATE ${collectionName} SET ${sets} WHERE ${whereClause}`;

    const { affectedRows } = await connection.query(query, raw);
    connection.end();
    return affectedRows > 0;
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
      throw new Error('MariaDbModelAdaptor deleteOne: ID must be defined');
    }
    const { collectionName } = this.getAdaptorParams(params);
    const connection = await this.getConnection();
    const query = `DELETE FROM ${collectionName} WHERE id=${id}`;
    const { affectedRows } = await connection.query(query);
    connection.end();
    return {
      deletedCount: affectedRows,
    };
  }

  /**
   * Executes a request to delete documents from a collection.
   * @param {string} params.collectionName - The name of the collection to delete documents from.
   * @param {object} [params.id] Filter by id
   * @param {object} [params.filter] - An object specifying the filter criteria, e.g. { age: 1 }
   * @returns {Promise<object>} - An object containing information about the operation, including the number of documents deleted.
   */
  static async delete(params = {}) {
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const filters = getFilter({ [this.config.idAttr]: id, ...filter });
    const connection = await this.getConnection();
    const whereClause = filters
      ? `WHERE ${Object.keys(filters)
          .map((key) => `${key} = ?`)
          .join(' AND ')}`
      : '';
    const values = filters ? Object.values(filters) : undefined;
    const query = `DELETE FROM ${collectionName} ${whereClause}`;
    const { affectedRows } = await connection.query(query, values);
    connection.end();
    return {
      deletedCount: affectedRows,
    };
  }

  /**
   * Executes a request to count the number of documents in a collection.
   * @param {string} params.collectionName - The name of the collection to count documents in.
   * @returns {Promise<number>} - The number of documents in the collection.
   */
  static async count(params = {}) {
    const { collectionName } = this.getAdaptorParams(params);
    const connection = await this.getConnection();
    const query = `SELECT COUNT(*) AS count FROM ${collectionName}`;
    const [result] = await connection.query(query);
    connection.end();
    return Number(result.count);
  }

  static getAdaptorParams(params = {}) {
    const {
      id,
      collectionName = this.getCollection(),
      raw = true,
      filter,
      ...props
    } = parseQuery(params);
    return {
      id,
      collectionName,
      raw,
      filter,
      ...props,
    };
  }

  getAdaptorParams(params = {}) {
    const {
      id = this.getId(),
      collectionName = this.getConfig().collectionName,
      filter,
      ...props
    } = parseQuery(params);
    return {
      id,
      collectionName,
      filter,
      ...props,
    };
  }
}

export default MariaDbModelAdaptor;
