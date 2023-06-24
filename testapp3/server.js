const {
    OneModelServer,
    OneModel,
} = require('../dist/onemodel.common');

class User extends OneModel {}

const server = new OneModelServer({
    models: [User]
});

server.start();