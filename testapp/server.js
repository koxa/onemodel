const webpack = require('webpack');
const webpackConfig = require('../webpack.dev.config.js');
const compiler = webpack(webpackConfig);
const path = require('path');
const http = require('http');
const express = require('express');

async function createServer() {
  const app = express();
  const router = express.Router();
  app.use(express.json());
  app.use(express.static('dist'));
  app.use(express.static('public'));
  app.use(require('webpack-dev-middleware')(compiler));
  app.use(require('webpack-hot-middleware')(compiler));

  app.use(await require('./server/UserMongoDbRouter')());
  app.use(await require('./server/EmailSequelizeRouter')());

  app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../public/index.html')));
  app.use('*', router);
  http.createServer(app).listen(3000, '0.0.0.0', () => {
    console.log('Listening on port 3000');
  });
}

createServer();
