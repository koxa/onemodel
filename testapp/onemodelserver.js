const { OneModelServer, JsonServerModel } = require('../dist/onemodel.common.dev');

class User extends JsonServerModel {}
class Email extends JsonServerModel {}
class Comment extends JsonServerModel {}

const server = new OneModelServer({
  models: [User, Email, Comment],
  staticPaths: ['../public', '../dist'],
  indexFileName: 'index-onemodel.html',
});

server.start();
