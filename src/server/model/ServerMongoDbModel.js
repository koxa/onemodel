import MongoServerModelAdaptor from './adaptors/MongoServerModelAdaptor';
import ServerModel from './ServerModel';

class ServerMongoDbModel extends ServerModel {}
ServerMongoDbModel.addMixins([MongoServerModelAdaptor]);

export default ServerMongoDbModel;
