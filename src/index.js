//todo: FIX
const BaseModel = (await import("./common/model/BaseModel")).default;
const ObservableModel = (await import ("./common/model/ObservableModel")).default;
const OneModel = (await import ("./OneModel")).default;
//const OneStore = await (import ("./OneStore")).default;

//if (process.env.WEBPACK_TARGET === "node") {
//  const ServerModel = require("./server/model/ServerModel").default;
//const ServerModelWrapper = require("./server/model/ServerModelWrapper").default;
//const ServerSequelizeModel = require("./server/model/ServerSequelizeModel").default;
//const ServerMariaDbModel = require("./server/model/ServerMariaDbModel").default;
//const ServerSQLiteModel = require("./server/model/ServerSQLiteModel").default;
//const ServerMongoDbModel = require("./server/model/ServerMongoDbModel").default;
//const JsonServerModel = require("./server/model/JsonServerModel").default;
const OneModelServer = (await import("./middleware")).OneModelServer;
//const OneModelSocketServer = require("./middleware").OneModelSocketServer;
//} else if (process.env.WEBPACK_TARGET === "web") {
//const ClientModel = require("./client/model/ClientModel").default;
//const ClientModelWrapper = require("./client/model/ClientModelWrapper").default;
//}

export {OneModel, OneModelServer}
