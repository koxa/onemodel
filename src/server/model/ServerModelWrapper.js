import ObservableModel from "../../common/model/ObservableModel";
import MongoServerModelAdaptor from "./adaptors/MongoServerModelAdaptor";

const ServerModelWrapper = Base => {
    class ServerModel extends (Base || ObservableModel) {

    }

    ServerModel.addMixins([MongoServerModelAdaptor]);
    return ServerModel;
}

export default ServerModelWrapper;