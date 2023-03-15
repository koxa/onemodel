const {
  OneModelServer,
  OneModelSocketServer,
  JsonServerModel,
} = require('../../dist/onemodel.common.dev');

class User extends JsonServerModel {}
class Email extends JsonServerModel {}
class Comment extends JsonServerModel {}
class Book extends JsonServerModel {}

const server = new OneModelServer({
  models: [User, Email, Comment],
  staticPaths: ['../public', '../dist'],
  indexFileName: 'index-onemodel.html',
});

new OneModelSocketServer({
  server: server.getServer(),
  models: [Book],
});

server.start();
