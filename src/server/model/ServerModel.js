import ObservableModel from "../../common/model/ObservableModel";
import MongoServerModelAdaptor from "./adaptors/MongoServerModelAdaptor";

class ServerModel extends ObservableModel {
    static getName() {
        return 'ServerModel';
    }
}

ServerModel.addMixins([MongoServerModelAdaptor]);

export default ServerModel;