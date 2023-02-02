import { OneModel } from '../src/index';

if (module['hot']) {
  module['hot'].accept();
}

setTimeout(() => {
  console.log('>>> Client');
  class User extends OneModel {}
  const user = new User({ firstName: 'Eddie', lastName: 'Money' });
  user.save();
}, 2000);
