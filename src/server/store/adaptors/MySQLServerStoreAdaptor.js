import BaseStoreAdaptor from "../../../common/store/adaptors/BaseStoreAdaptor.js";
import MySql from "mysql";
import EventEmitter from "events";

const MYSQL_OPERATIONS = {
  INSERT: "INSERT",
  SELECT: "SELECT",
  UPDATE: "UPDATE",
  DELETE: "DELETE"
};

class MySQLServerStoreAdaptor extends BaseStoreAdaptor {

}

export default MySQLServerStoreAdaptor;