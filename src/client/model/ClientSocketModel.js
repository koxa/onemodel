import ObservableModel from '../../common/model/ObservableModel';
import SocketClientModelAdaptor from './adaptors/SocketClientModelAdaptor';

class ClientSocketModel extends ObservableModel {}

ClientSocketModel.addMixins([SocketClientModelAdaptor]);

export default ClientSocketModel;
