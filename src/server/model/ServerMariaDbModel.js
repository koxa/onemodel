import BaseModel from '../../common/model/BaseModel';
import MariaDbModelAdaptor from './adaptors/MariaDbModelAdaptor';

class ServerMariaDbModel extends BaseModel {}
ServerMariaDbModel.addMixins([MariaDbModelAdaptor]);

export default ServerMariaDbModel;
