//import {ClientModel, OneModel, ObservableModel, Store} from '../src';
// import { OneModel } from '../src/index.js';
import ClientModelWrapper from '../src/client/model/ClientModelWrapper';
import User from '../src/common/schema/User';

//window.ClientModel = ClientModel;
//window.ObservableModel = ObservableModel;
//window.OneModel = OneModel;
//window.OneModel = OneModel;
//window.Store = Store;

setTimeout(() => {
  console.log('>>> Client');
  class ClientUser extends ClientModelWrapper(User) {}
  const user = new ClientUser({ firstName: 'Eddie@', lastName: 'Money1' });
  user.save();
}, 2000);
