import BaseModel from '../../common/model/BaseModel';
import SQLiteServerModelAdaptor from './adaptors/SQLiteServerModelAdaptor';

class ServerSQLiteModel extends BaseModel {}
ServerSQLiteModel.addMixins([SQLiteServerModelAdaptor]);

export default ServerSQLiteModel;
