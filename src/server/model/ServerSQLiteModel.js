import SQLiteServerModelAdaptor from './adaptors/SQLiteServerModelAdaptor';
import ServerModel from "./ServerModel";

class ServerSQLiteModel extends ServerModel {}
ServerSQLiteModel.addMixins([SQLiteServerModelAdaptor]);

export default ServerSQLiteModel;
