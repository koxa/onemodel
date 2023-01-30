import ObservableModel from "../../common/model/ObservableModel";
import HttpAdaptor from "./adaptors/HttpClientModelAdaptor";
import BaseModel from "../../common/model/BaseModel.js";

const ClientModelWrapper = (Base: BaseModel) => {
    class ClientModel extends (Base || ObservableModel) {
        constructor(...props) {
            super(...props);
        }
    }

    ClientModel.addMixins([HttpAdaptor]);

    // interface D extends BaseModel, HttpAdaptor {};
    // const d: D = {};
    return ClientModel;
};

export default ClientModelWrapper;