process.env.WEBPACK_TARGET = 'node';

import fetch from 'node-fetch';
const mongodb = require('mongodb');
import { MongoMemoryServer } from 'mongodb-memory-server';
import BaseModel from '../../src/common/model/BaseModel.js';
import express from 'express';
import MongoServerModelAdaptor from '../../src/server/model/adaptors/MongoServerModelAdaptor.js';
import HttpClientModelAdaptor from '../../src/client/model/adaptors/HttpClientModelAdaptor.js';
const app = express();
const port = 9445;
const maxDocs = 9;

global.window = {};
global.fetch = fetch;

//todo: configure OneModel to use Mongo Adaptor
class MongoModel extends BaseModel {}
MongoModel.addMixins([MongoServerModelAdaptor]);

class OneModel extends BaseModel {}
OneModel.addMixins([HttpClientModelAdaptor]);

/** POST **/
/*app.post('/api/onemodel', async (req, res) => {
  //save onemodel to mongo
  try {
    const john = new MongoModel(req.data);
    await john.save();
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({ name: 'JOHN saved' });
});

*/

/*app.post('/api/user', (req, res) => {
  //save user
  res.status(200).json({ name: 'michael' });
});*/

app.get(`/api/${OneModel.name}`, async (req, res) => {
  const params = req.params;
  const user = await MongoModel.read(params);
  res.json(user);
});

app.post(`/api/${OneModel.name}`, async (req, res) => {
  const user = new MongoModel(req.body);
  res.json(await user.save());
});

app.put(`/api/${OneModel.name}/:_id`, async (req, res) => {
  const { _id } = req.params;
  const user = new MongoModel({ _id, ...req.body });
  res.json(await user.save());
});

app.delete(`/api/${OneModel.name}/:_id`, async (req, res) => {
  const { _id } = req.params;
  res.json(await MongoModel.deleteOne(_id));
});

describe('test block', () => {
  let httpServer;
  let con;
  let mongoServer;
  let db;
  const testDocs = [];

  beforeAll(async () => {
    httpServer = await app.listen(port, () => {});

    /** STAR MONGO MEMORY SERVER **/
    mongoServer = await MongoMemoryServer.create();
    con = await mongodb.MongoClient.connect(mongoServer.getUri(), {});
    db = con.db(mongoServer.instanceInfo.dbName);

    /** CONFIGURE MODEL TO USE MONGO **/
    MongoModel.configure({ mongo: mongodb, db: db, idAttr: '_id' });

    /** CONFIGURE CLIENT MODEL **/
    OneModel.configure({ port }); // preconfigure port for all tests

    /** CREATE TEST DATA */
    [...Array(maxDocs).keys()].forEach((i) => {
      const user = { firstName: `firstName ${i + 1}`, lastName: `lastName ${i + 1}` };
      testDocs.push(user);
    });

    await testDocs.reduce((prevPromise, value) => {
      return prevPromise.then(() => MongoModel.create({ ...value }, {}));
    }, Promise.resolve());
  });

  afterAll(async () => {
    if (con) {
      await con.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    if (httpServer) {
      await httpServer.close();
    }
  });

  it('should successfully set & get information from the database', async () => {
    expect(db).toBeDefined();
    const col = db.collection('test');
    const result = await col.insertMany([{ a: 1 }, { b: 1 }]);
    expect(result.insertedCount).toStrictEqual(2);
    expect(await col.countDocuments({})).toBe(2);
  });

  it('should save new object to mongo db collection', async () => {
    let model = new MongoModel({ firstName: 'Valery', lastName: 'Valentin' });
    await model.save(); //create
    expect(model.getId()).toBeDefined();
    model.set('firstName', 'HuiSobachiy'); //todo: track only modified props and later save to server only them to reduce traffic
    const result2 = await model.save(); // update
    expect(result2).toBe(true); //true means save is successfull
    expect(model.firstName).toBe('HuiSobachiy');
  });

  it('should save model to mongo', async () => {
    const user = new OneModel({ firstName: 'ValeryTest', lastName: 'ValentinTest' });
    const result = await user.save();
    expect(user.firstName).toBe('ValeryTest');
    expect(result).toHaveProperty('_id');
  });
});
