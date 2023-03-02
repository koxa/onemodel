import ObservableModel from '../../common/model/ObservableModel';
import HttpServerModelAdaptor from './adaptors/HttpServerModelAdaptor';

class ServerModel extends ObservableModel {

}

ServerModel.addMixins([HttpServerModelAdaptor]);

export default ServerModel;
