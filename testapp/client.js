import { OneModel } from '../src';
import createTable from './client/Table';

if (module['hot']) {
  module['hot'].accept();
}
const USERS = 'users';
const EMAILS = 'emails';
const BOOKS = 'book';
const COMMENTS = 'comments';
const USERSJSON = 'userjson';

const loaded = async () => {
  class User extends OneModel {}
  class Email extends OneModel {}
  class Book extends OneModel {}
  class Comment extends OneModel {}
  class UserJson extends OneModel {}

  User.configure({
    idAttr: '_id',
  });

  const searchHandle = async (refModel, refUpdate, keys = [], search) => {
    const searchText = search.trim();
    refUpdate(
      await refModel.read(
        searchText
          ? {
              filter: {
                $or: [{ [keys[0]]: { $like: searchText } }, { [keys[1]]: { $like: searchText } }],
              },
            }
          : {},
      ),
    );
  };

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
    searchChange: async (search) => searchHandle(Email, emailList, ['user', 'email'], search),
  });

  const { list: bookList } = createTable({
    name: BOOKS,
    idAttr: 'id',
    refreshClick: async () => bookList(await Book.read()),
    removeClick: ({ id }) => {
      const book = new Book({ id });
      return book.delete();
    },
    addClick: async (data) => {
      const book = new Book(data);
      return await book.save();
    },
    updateClick: async (data) => {
      const book = new Book(data);
      return await book.save();
    },
    searchChange: async (search) => searchHandle(Book, bookList, ['title', 'comment'], search),
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

  const { list: userJsonList } = createTable({
    name: USERSJSON,
    idAttr: 'id',
    refreshClick: async () => userJsonList(await UserJson.read()),
    removeClick: ({ id }) => {
      const userjson = new UserJson({ id });
      return userjson.delete();
    },
    addClick: async (data) => {
      const userjson = new UserJson(data);
      return await userjson.save();
    },
    updateClick: async (data) => {
      const userjson = new UserJson(data);
      return await userjson.save();
    },
    searchChange: async (search) =>
      searchHandle(UserJson, userJsonList, ['userName', 'userRole'], search),
  });

  const [userJson, user, email, comment, book] = await Promise.all([
    UserJson.read(),
    User.read(),
    Email.read(),
    Comment.read(),
    Book.read(),
  ]);
  userJsonList(userJson);
  userList(user);
  emailList(email);
  commentList(comment);
  bookList(book);
};

document.addEventListener('DOMContentLoaded', loaded);
