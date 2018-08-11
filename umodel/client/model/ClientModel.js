import ObservableModel from "../../common/model/ObservableModel";
import HttpAdaptor from "../../common/adaptors/HttpAdaptor";
import LocalStorageAdaptor from "../../common/adaptors/LocalStorageAdaptor";

class ClientModel extends ObservableModel {
}

ClientModel.addMixins([LocalStorageAdaptor]);

export default ClientModel;