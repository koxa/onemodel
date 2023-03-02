import SequelizeModelAdaptor from './adaptors/SequelizeModelAdaptor';
import ServerModel from "./ServerModel";

class ServerSequelizeModel extends ServerModel {}
ServerSequelizeModel.addMixins([SequelizeModelAdaptor]);

export default ServerSequelizeModel;
