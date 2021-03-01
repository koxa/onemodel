import ObservableModel from "../../common/model/ObservableModel";
import HttpAdaptor from "./adaptors/HttpClientModelAdaptor";

class ClientModel extends ObservableModel {
}

ClientModel.addMixins([HttpAdaptor]);

export default ClientModel;