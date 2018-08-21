import ObservableModel from "../../common/model/ObservableModel";
import HttpAdaptor from "./adaptors/HttpClientModelAdaptor";
import LocalStorageAdaptor from "./adaptors/LocalStorageClientModelAdaptor";

class ClientModel extends ObservableModel {
}

ClientModel.addMixins([HttpAdaptor]);

export default ClientModel;