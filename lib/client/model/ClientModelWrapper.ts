import HttpAdaptor from './adaptors/HttpClientModelAdaptor';
import BaseModel from '../../common/model/BaseModel.js';

const ClientModelWrapper = <T>(schema: typeof BaseModel) => {
  class ClientModel extends schema {
    constructor(data: T, ...props) {
      super(data, ...props);
    }
  }

  ClientModel.addMixins([HttpAdaptor]);

  // interface D extends BaseModel, HttpAdaptor {};
  // const d: D = {};
  return ClientModel;
};

export default ClientModelWrapper;
