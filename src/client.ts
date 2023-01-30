import ClientModelWrapper from '../lib/client/model/ClientModelWrapper';
import User from '../lib/common/schema/User';

console.log('>>> Client');

setTimeout(() => {
    class ClientUser extends ClientModelWrapper(User) {}
    const user = new ClientUser({firstName: 'Eddie', lastName: 'Money1'});
    user.save();
}, 1000);
