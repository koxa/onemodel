import MariaDbModelAdaptor from './adaptors/MariaDbModelAdaptor';
import ServerModel from "./ServerModel";

class ServerMariaDbModel extends ServerModel {}
ServerMariaDbModel.addMixins([MariaDbModelAdaptor]);

export default ServerMariaDbModel;
