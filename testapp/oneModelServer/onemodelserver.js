const express = require('express');
const webpack = require('webpack');
const webpackConfig = require('../../webpack.dev.config.js');
const compiler = webpack(webpackConfig);
const path = require('path');
const http = require('http');
const {
  OneModelServer,
  OneModelSocketServer,
  JsonServerModel,
} = require('../../dist/onemodel.common.dev');

class User extends JsonServerModel {}
class Email extends JsonServerModel {}
class Comment extends JsonServerModel {}
class Book extends JsonServerModel {}

async function createServer() {
  const app = express();
  const router = express.Router();
  app.use(express.static('dist'));
  app.use(require('webpack-dev-middleware')(compiler));
  app.use(require('webpack-hot-middleware')(compiler));
  const server = http.createServer(app);

  const oneModelServer = new OneModelServer({
    models: [User, Email, Comment],
  });

  new OneModelSocketServer({
    server: server,
    models: [Book],
  });

  router.use((req, res) => oneModelServer.requestMiddleware(req, res));

  app.get('/', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../../public/index-onemodel.html')),
  );
  app.use(router);
  server.listen(3000, '0.0.0.0', () => {
    console.log('Listening on port 3000');
  });
}

createServer();
