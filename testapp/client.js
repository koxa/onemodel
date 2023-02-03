import { OneModel } from '../src/index';
import createTable from './client/Table';

if (module['hot']) {
  module['hot'].accept();
}
const USERS = 'users';

const loaded = async () => {
  OneModel.configure({});
  class User extends OneModel {}

  const { list } = createTable({
    name: USERS,
    refreshClick: async () => list(await User.read()),
    removeClick: ({ id }) => User.delete({ id }),
    addClick: async ({ firstName, lastName }) => {
      const user = new User({ firstName, lastName });
      return await user.save();
    },
    updateClick: async (data) => {
      const user = new User(data);
      return await user.save();
    },
  });

  list(await User.read());
};

document.addEventListener('DOMContentLoaded', loaded);
