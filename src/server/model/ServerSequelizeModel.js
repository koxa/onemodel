import BaseModel from '../../common/model/BaseModel';
import SequelizeModelAdaptor from './adaptors/SequelizeModelAdaptor';

class ServerSequelizeModel extends BaseModel {}
ServerSequelizeModel.addMixins([SequelizeModelAdaptor]);

export default ServerSequelizeModel;
