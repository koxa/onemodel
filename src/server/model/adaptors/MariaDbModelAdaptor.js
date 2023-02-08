import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';

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

  static async isTableExist(tableName) {
    const connection = await this.getConnection();
    const result = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
    connection.end();
    return result.length > 0;
  }

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

  static async firstCheckAndCreateTable(tableName) {
    if (this._mariaDbfirstSync) {
      this._mariaDbfirstSync = false;
      if (!(await this.isTableExist(tableName))) {
        return this.createTableFromProps(tableName, this.config.props);
      }
    }
    return false;
  }

  static getCollection(
    collectionName = this.getConfig().collectionName ||
      (typeof this.getCollectionName !== 'undefined' && this.getCollectionName()),
  ) {
    return collectionName;
  }

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

  static async read(params = {}) {
    const { collectionName } = this.getAdaptorParams(params);
    const [, connection] = await Promise.all([
      this.firstCheckAndCreateTable(collectionName),
      this.getConnection(),
    ]);

    const limit = params.limit || null;
    const columns = params.columns || '*';
    const filter = params.filter || '';

    let query = `SELECT ${columns} FROM ${collectionName}`;
    if (filter) query += ` WHERE ${filter}`;
    query += ' GROUP BY id';
    if (limit) query += ` LIMIT ${limit}`;

    const rows = await connection.query(query);
    connection.end();
    return rows.map((item) => item);
  }

  static async update(data, params) {
    const { id } = this.getAdaptorParams(params);
    if (!id) {
      throw new Error('MariaDbModelAdaptor update: ID must be defined to update model');
    }
    const { collectionName } = this.getAdaptorParams(params);
    const connection = await this.getConnection();

    const keys = Object.keys(data);
    const values = Object.values(data);
    const sets = [];

    let query = `UPDATE ${collectionName} SET`;
    keys.forEach((key, index) => {
      if (key !== 'id') {
        sets.push(`${key}='${values[index]}'`);
      }
    });
    query += ` ${sets.join(', ')} WHERE id=${id}`;

    const { affectedRows } = await connection.query(query);
    connection.end();
    return affectedRows > 0;
  }

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

  static getAdaptorParams({ id, collectionName = this.getCollection(), raw = true }) {
    return {
      id,
      collectionName,
      raw,
    };
  }

  getAdaptorParams({ id = this.getId(), collectionName = this.getConfig().collectionName }) {
    return {
      id,
      collectionName,
    };
  }
}

export default MariaDbModelAdaptor;
