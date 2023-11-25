import EventEmitter from "events";
import MySql from "mysql";
import BaseAdaptor from "../../common/adaptors/BaseAdaptor.js";

const MYSQL_OPERATIONS = {
  INSERT: "INSERT",
  SELECT: "SELECT",
  UPDATE: "UPDATE",
  DELETE: "DELETE"
};

class MySQLServerAdaptor extends BaseAdaptor {
  static connection = null;

  static config = {
    ...super.config,
    mysql: {
      host: "localhost",
      user: "root",
      password: null,
      database: null
    }
  };

  static getConnection() {
    if (!this.connection || !(this.connection instanceof EventEmitter)) {
      throw new Error("MySql connection is not established or invalid");
    }
    return this.connection;
  }

  static async connect(mysqlConfig = this.getConfig("mysql")) {
    //todo: it seems like mysql err is thrown even with try/catch likely because happens outside thread
    return new Promise((resolve, reject) => {
      console.time("mysql_connection_ready");
      const connection = MySql.createConnection(mysqlConfig);
      connection.connect((err) => {
          if (err) {
            console.timeEnd("mysql_connection_ready");
            reject(err);
          } else {
            console.timeEnd("mysql_connection_ready");
            this.connection = connection;
            resolve(connection);
          }
        }
      );
    });
  }

  static async disconnect() {
    await this.getConnection().end();
  }

  static rawQuery(query) {
    const connection = this.getConnection();
    return new Promise((resolve, reject) => {
      console.log("QUERY IS: ", query);
      console.time("mysql_query");
      connection.query(query, (error, results, fields) => {
        if (error) {
          console.log("Error running raw mysql query", error);
          console.timeEnd("mysql_query");
          reject(error);
        } else {
          console.timeEnd("mysql_query");
          resolve(results);
        }
      });
    });
  }
  static async isTableExists(table) {
    const query = `SHOW TABLES LIKE '${table}'`;
    const results = await this.rawQuery(query);
    return results.length > 0;
  }

  static async createTableFromModel(name, model) {
    const props = model.getConfig("props");
    if (!props || !Object.keys(props).length) {
      //todo: generate schema from raw key/val
      throw new Error(
        "MySqlServerStoreAdaptor: Props are empty. Props are needed to generate the schema to create the table"
      );
    }
    const columns = [];
    for (const prop in props) {
      let value = props[prop];
      let type = "";
      let notNull = "";
      let autoIncrement = "";
      let primaryKey = "";
      let defaultValue = "";
      if (value.type) {
        switch (value.type) {
          case String:
            type = "VARCHAR(255)";
            break;
          case Number:
            //type = "DECIMAL(10,2)";
            type = "INT";
            break;
          default:
            type = "VARCHAR(255)";
        }
        if (value.primaryKey) {
          primaryKey = "PRIMARY KEY";
        }
        if (value.primaryKey || value.required) {
          notNull = "NOT NULL";
        }
        if (value.primaryKey || value.autoIncrement) {
          autoIncrement = "AUTO_INCREMENT";
        }
        if (value.value !== undefined) {
          defaultValue = `DEFAULT ${value.value}`;
        }
        columns.push(`\`${prop}\` ${type} ${notNull} ${autoIncrement} ${primaryKey} ${defaultValue}`);
      } else {
        throw new Error("Unable to create Table since Type is undefined for prop: " + prop);
        // switch (typeof value) {
        //   case "string":
        //     type = "VARCHAR(255)";
        //     break;
        //   case "number":
        //     type = "DECIMAL(10,2)";
        //     break;
        //   case "object":
        //     if (value instanceof Date) {
        //       type = "DATE";
        //       value = value.toString().slice(0, 10);
        //     } else {
        //       type = "VARCHAR(255)";
        //     }
        //     break;
        //   default:
        //     type = "VARCHAR(255)";
        // }
        // if (value !== "") {
        //   columns.push(`${key} ${type} DEFAULT '${value}'`);
        // } else {
        //   columns.push(`${key} ${type}`);
        // }
      }
    }
    const query = `CREATE TABLE \`${name}\` (${columns.join(",")});`;
    const { warningStatus } = await this.rawQuery(query);
    //connection.end();
    return warningStatus === 0;
  }
  //
  static buildQuery(operation, model, config = {}) {
    let query = "";
    let table = config.collectionName ?? this.getConfig("collectionName");
    switch (operation) {
      case MYSQL_OPERATIONS.INSERT:
        const keys = Object.keys(model).map(key => `\`${key}\``).join(",");
        const values = Object.values(model).map(val => `'${val}'`).join(",");
        query = `INSERT INTO \`${table}\` (${keys}) VALUES (${values})`;
        break;
      case MYSQL_OPERATIONS.SELECT:
        query = `SELECT * FROM ${table}`;
        break;
      case MYSQL_OPERATIONS.UPDATE:
        query = `UPDATE WHERE`;
        break;
      case MYSQL_OPERATIONS.DELETE:
        query = `DELETE FROM \`${table}\` WHERE ()`;
        break;
      default:
        throw new Error("Unknown MySQL operation");
    }
    return query;
  }
  //
  static async query(operation, model, config = {}) {
    //verify config
    if (!config.collectionName) {
      throw new Error("CollectionName is not defined");
    }
    //todo: check if connected
    if (!(await this.isTableExists(config.collectionName))) {
      console.log(`Table '${config.collectionName}' doesn't exist. Table will be auto-created based on model's props`);
      try {
        await this.createTableFromModel(config.collectionName, model || config.modelClass);
      } catch (err) {
        console.log(`Error creating table '${config.collectionName}'`, err);
      }
    }
    const query = this.buildQuery(operation, model, config);
    try {
      return await this.rawQuery(query);
    } catch (err) {
      //todo: support failures
      console.log("Error running MySql query", err);
    }
  }
  //
  // static async create(records, config) {
  //   //todo: support insertMany
  //   for (let record of records) {
  //     //todo: support failures
  //     await this.query(MYSQL_OPERATIONS.INSERT, record, config);
  //   }
  //   return true;
  // }
  //
  // static async read(config) {
  //   //console.log(this.query(MYSQL_OPERATIONS.SELECT));
  //   const results = await this.query(MYSQL_OPERATIONS.SELECT, null, config);
  //   //console.log("RESULTS IS", results);
  //   const out = [];
  //   for (let result of results) {
  //     //todo: make this an util function
  //     // convert to literal. by default it's 'RowDataPacket' object
  //     out.push({ ...result });
  //   }
  //   return out;
  // }
  //
  // static async delete(ids = [], config) {
  //
  // }
}

export default MySQLServerAdaptor;