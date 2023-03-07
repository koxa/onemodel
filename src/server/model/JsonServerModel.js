import JsonServerModelAdaptor from './adaptors/JsonServerModelAdaptor';
import ServerModel from './ServerModel';

class JsonServerModel extends ServerModel {}
JsonServerModel.addMixins([JsonServerModelAdaptor]);

export default JsonServerModel;
