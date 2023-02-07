const express = require('express');
const mongodb = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { OneModel } = require('../../dist/onemodel.common.dev');

async function userMongoDbRouter() {
  const router = express.Router();
  const mongoServer = await MongoMemoryServer.create();
  const mongodbConnect = await mongodb.MongoClient.connect(mongoServer.getUri(), {});
  const mongodbInstance = mongodbConnect.db(mongoServer.instanceInfo.dbName);

  OneModel.configure({
    mongo: mongodb,
    db: mongodbInstance,
    idAttr: '_id',
  });

  class User extends OneModel {}

  router.get('/api/user', async (req, res) => {
    console.log('GET /api/user');
    const user = await User.read();
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
