import ObservableModel from '../../common/model/ObservableModel';
import HttpAdaptor from './adaptors/HttpClientModelAdaptor';

const ClientModelWrapper = (Base) => {
  class ClientModel extends (Base || ObservableModel) {}

  ClientModel.addMixins([HttpAdaptor]);
  return ClientModel;
};

export default ClientModelWrapper;
