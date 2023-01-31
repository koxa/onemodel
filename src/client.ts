import ClientModelWrapper from '../lib/client/model/ClientModelWrapper';
import User, { UserModel } from '../lib/common/schema/User';

console.log('>>> Client');

setTimeout(() => {
  const ClientUser = ClientModelWrapper<UserModel>(User);
  const user = new ClientUser({ firstName: 'Eddie', lastName: 'Money1' });
  user.save();
}, 1000);
