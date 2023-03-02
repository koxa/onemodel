const exports = {
  BaseModel: require('./common/model/BaseModel').default,
  ObservableModel: require('./common/model/ObservableModel').default,
  OneModel: require('./OneModel').default,
  OneStore: require('./OneStore').default,
};

if (process.env.WEBPACK_TARGET === 'node') {
  exports.ServerModel = require('./server/model/ServerModel').default;
  exports.ServerModelWrapper = require('./server/model/ServerModelWrapper').default;
  exports.ServerSequelizeModel = require('./server/model/ServerSequelizeModel').default;
  exports.ServerMariaDbModel = require('./server/model/ServerMariaDbModel').default;
  exports.ServerSQLiteModel = require('./server/model/ServerSQLiteModel').default;
} else if (process.env.WEBPACK_TARGET === 'web') {
  exports.ClientModel = require('./client/model/ClientModel').default;
  exports.ClientModelWrapper = require('./client/model/ClientModelWrapper').default;
}

module.exports = exports;
