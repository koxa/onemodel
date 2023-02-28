const express = require('express');
const mongodb = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { OneModel } = require('../../dist/onemodel.common.dev');
const { getQueryParams } = require('../../src/utils/node/index');

async function userMongoDbRouter() {
  const router = express.Router();
  const mongoServer = await MongoMemoryServer.create();
  const mongodbConnect = await mongodb.MongoClient.connect(mongoServer.getUri(), {});
  const mongodbInstance = mongodbConnect.db(mongoServer.instanceInfo.dbName);

  class User extends OneModel {}
  User.configure({
    mongo: mongodb,
    db: mongodbInstance,
    idAttr: '_id',
  });

  router.get('/api/user/:id', async (req, res) => {
    const { id } = req.params;
    const searchParams = getQueryParams(req);
    console.log('GET /api/user', { id, ...searchParams });
    const user = await User.read({ id, ...searchParams });
    res.json(user);
  });

  router.get('/api/user', async (req, res) => {
    const searchParams = getQueryParams(req);
    console.log('GET /api/user', searchParams);
    const user = await User.read(searchParams);
    res.json(user);
  });

  router.post('/api/user', async (req, res) => {
    console.log('POST /api/user', req.body);
    const user = new User(req.body);
    res.json(await user.save());
  });

  router.put('/api/user/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('PUT /api/user', _id, req.body);
    const user = new User({ _id, ...req.body });
    res.json(await user.save());
  });

  router.delete('/api/user/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('DELETE /api/user', _id);
    res.json(await User.deleteOne(_id));
  });

  console.log('UserMongoDbRouter Started');
  return router;
}

module.exports = userMongoDbRouter;
