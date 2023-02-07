import { OneModel } from '../src/index';
import createTable from './client/Table';

if (module['hot']) {
  module['hot'].accept();
}
const USERS = 'users';
const EMAILS = 'emails';

const loaded = async () => {
  class User extends OneModel {}
  class Email extends OneModel {}

  const { list: userList } = createTable({
    name: USERS,
    refreshClick: async () => userList(await User.read()),
    removeClick: ({ _id }) => {
      const user = new User({ _id });
      return user.delete();
    },
    addClick: async ({ firstName, lastName }) => {
      const user = new User({ firstName, lastName });
      return await user.save();
    },
    updateClick: async (data) => {
      const user = new User(data);
      return await user.save();
    },
  });

  const { list: emailList } = createTable({
    name: EMAILS,
    idAttr: 'id',
    refreshClick: async () => emailList(await Email.read()),
    removeClick: ({ id }) => {
      const email = new Email({ id });
      return email.delete();
    },
    addClick: async (data) => {
      const email = new Email(data);
      return await email.save();
    },
    updateClick: async (data) => {
      const email = new Email(data);
      return await email.save();
    },
  });

  userList(await User.read());
  emailList(await Email.read());
};

document.addEventListener('DOMContentLoaded', loaded);
