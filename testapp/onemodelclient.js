import { OneModel } from '../src';
import createTable from './client/Table';

if (module['hot']) {
  module['hot'].accept();
}
const USERS = 'users';
const EMAILS = 'emails';
const COMMENTS = 'comments';

const loaded = async () => {
  class User extends OneModel {}
  class Email extends OneModel {}
  class Comment extends OneModel {}

  const searchHandle = async (refModel, refUpdate, keys = [], search) => {
    const searchText = search.trim();
    const or = [{ [keys[0]]: { $like: searchText } }, { [keys[1]]: { $like: searchText } }];
    if (keys[2]) {
      or.push({ [keys[2]]: { $like: searchText } });
    }
    refUpdate(
      await refModel.read(
        searchText
          ? {
              filter: {
                $or: or,
              },
            }
          : {},
      ),
    );
  };

  const { list: userList } = createTable({
    name: USERS,
    idAttr: 'id',
    refreshClick: async () => userList(await User.read()),
    removeClick: ({ id }) => {
      const user = new User({ id });
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
    searchChange: async (search) => searchHandle(User, userList, ['firstName', 'lastName'], search),
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
    searchChange: async (search) =>
      searchHandle(Email, emailList, ['user', 'email', 'date'], search),
  });

  const { list: commentList } = createTable({
    name: COMMENTS,
    idAttr: 'id',
    refreshClick: async () => commentList(await Comment.read()),
    removeClick: ({ id }) => {
      const comment = new Comment({ id });
      return comment.delete();
    },
    addClick: async (data) => {
      const comment = new Comment(data);
      return await comment.save();
    },
    updateClick: async (data) => {
      const comment = new Comment(data);
      return await comment.save();
    },
    searchChange: async (search) =>
      searchHandle(Comment, commentList, ['title1', 'comment_text'], search),
  });

  const [user, email, comment] = await Promise.all([User.read(), Email.read(), Comment.read()]);
  userList(user);
  emailList(email);
  commentList(comment);
};

document.addEventListener('DOMContentLoaded', loaded);
