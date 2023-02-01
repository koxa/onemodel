import BaseModel from '../../common/model/BaseModel';
import MongoServerModelAdaptor from './adaptors/MongoServerModelAdaptor';

const ServerModelWrapper = (schema: typeof BaseModel) => {
  class ServerModel extends schema {}

  ServerModel.addMixins([MongoServerModelAdaptor]);
  return ServerModel;
};

export default ServerModelWrapper;
