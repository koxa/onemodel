const mongodb = require('mongodb');
import { MongoMemoryServer } from 'mongodb-memory-server';
import MongoServerModelAdaptor from '../../../src/server/model/adaptors/MongoServerModelAdaptor';
import BaseModel from '../../../src/common/model/BaseModel';

class MongoModel extends BaseModel {}
MongoModel.addMixins([MongoServerModelAdaptor]);

const maxDocs = 9;

describe('MongoServerModelAdaptor', () => {
  let mongoServer;
  let con;
  let db;
  let testData;
  const testManyDocs = [];

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    con = await mongodb.MongoClient.connect(mongoServer.getUri(), {});
    db = con.db(mongoServer.instanceInfo.dbName);

    /** CONFIGURE MODEL TO USE MONGO **/
    MongoModel.configure({ mongo: mongodb, db, idAttr: '_id' });

    /** CREATE TEST DATA */
    [...Array(maxDocs).keys()].forEach((i) => {
      const user = { firstName: `firstName ${i + 1}`, lastName: `lastName ${i + 1}` };
      testManyDocs.push(user);
    });

    await testManyDocs.reduce((prevPromise, value) => {
      return prevPromise.then(() => MongoModel.create({ ...value }, {}));
    }, Promise.resolve());

    testData = { ...testManyDocs[0] };
  });

  afterAll(async () => {
    await MongoModel.delete({});
    if (con) {
      await con.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('getCollection()', () => {
    it('should throw error if DB instance or CollectionName is not defined', () => {
      expect(MongoModel.getCollection()).toBeDefined();
    });

    it('should return a MongoDB Collection instance', () => {
      const collection = MongoModel.getCollection();
      expect(collection).toBeInstanceOf(mongodb.Collection);
    });
  });

  describe('create()', () => {
    it('should insert a new document in the MongoDB collection', async () => {
      const result = await MongoModel.create({ ...testData }, {});
      expect(result).toHaveProperty('_id');
    });
  });

  describe('read()', () => {
    it('read(): should return an array of documents from the MongoDB collection', async () => {
      const result = await MongoModel.read();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(maxDocs + 1);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[0].firstName);
      expect(result[testManyDocs.length - 1]).toHaveProperty(
        'firstName',
        testManyDocs[testManyDocs.length - 1].firstName,
      );
    });

    it('read(): should return a paginated array of documents from the MongoDB collection', async () => {
      // Get the first 3 documents
      let result = await MongoModel.read({ limit: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[0].firstName);
      expect(result[1]).toHaveProperty('firstName', testManyDocs[1].firstName);
      expect(result[2]).toHaveProperty('firstName', testManyDocs[2].firstName);

      // Get the next 3 documents
      result = await MongoModel.read({ limit: 3, skip: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[3].firstName);
      expect(result[1]).toHaveProperty('firstName', testManyDocs[4].firstName);
      expect(result[2]).toHaveProperty('firstName', testManyDocs[5].firstName);

      // Get the last 3 documents
      result = await MongoModel.read({ limit: 3, skip: 6 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[6].firstName);
      expect(result[1]).toHaveProperty('firstName', testManyDocs[7].firstName);
      expect(result[2]).toHaveProperty('firstName', testManyDocs[8].firstName);
    });

    it('read(): should return a sorted array of documents from the MongoDB collection', async () => {
      const sortOptions = { firstName: -1 };
      const result = await MongoModel.read({ sort: sortOptions });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(maxDocs + 1);
      expect(result[0]).toHaveProperty('_id');
      expect(result[0]).toHaveProperty('firstName', `firstName ${testManyDocs.length}`);
    });

    it('checking filter parameters: $eq, $ne, $gt, $lt, $in, $regex', async () => {
      const resultWhere = await MongoModel.read({ filter: { firstName: 'firstName 2' } });
      const resultEq = await MongoModel.read({ filter: { firstName: { $eq: 'firstName 3' } } });
      const resultNe = await MongoModel.read({ filter: { firstName: { $ne: 'firstName 4' } } });
      const resultGt = await MongoModel.read({ filter: { firstName: { $gt: 'firstName 4' } } });
      const resultLt = await MongoModel.read({ filter: { firstName: { $lt: 'firstName 4' } } });
      const resultRegexAll = await MongoModel.read({
        filter: { firstName: { $regex: 'firstName' } },
      });
      const resultRegexOne = await MongoModel.read({ filter: { firstName: { $regex: '5' } } });
      const resultIn = await MongoModel.read({
        filter: { firstName: { $in: ['firstName 4', 'firstName 5'] } },
      });

      expect(resultWhere[0].firstName).toBe('firstName 2');

      expect(resultEq.length).toBe(1);
      expect(resultEq[0].firstName).toBe('firstName 3');

      expect(resultNe.length).toBe(9);
      expect(resultNe.filter((result) => result.firstName === 'firstName 4').length).toBe(0);

      expect(resultGt.length).toBe(5);
      expect(resultLt.length).toBe(4);

      expect(resultIn.length).toBe(2);
      expect(resultIn.map((res) => res.firstName)).toStrictEqual(['firstName 4', 'firstName 5']);

      expect(resultRegexAll.length).toBe(10);
      expect(resultRegexOne.length).toBe(1);
    });

    it('readOne(): should find a document in the MongoDB collection by ID', async () => {
      const result = await MongoModel.create({ ...testData }, {});
      const document = await MongoModel.readOne(result._id);
      expect(document).toHaveProperty('_id');
    });

    it('readOne(): should find and return one document by param or set of params', async () => {
      const foundDoc = await MongoModel.readOne({ firstName: testData.firstName });
      expect(foundDoc).toBeInstanceOf(MongoModel);
      expect(foundDoc.firstName).toEqual(testData.firstName);
    });

    it('readOne(): should find and return one document by key and val', async () => {
      const foundDoc = await MongoModel.readOne('firstName', testData.firstName);
      expect(foundDoc).toBeInstanceOf(MongoModel);
      expect(foundDoc.firstName).toEqual(testData.firstName);
    });

    it('readOne(): should return null if document is not found', async () => {
      const foundDoc = await MongoModel.readOne('5e63c3a5e4232e4cd0274ac2');
      expect(foundDoc).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update a document in the MongoDB collection', async () => {
      const result = await MongoModel.create({ ...testData }, {});
      const updateData = { ...testData, name: 'Updated User' };
      const updated = await MongoModel.update(updateData, { id: result._id });
      expect(updated).toBe(true);
    });

    it('should update a document in the collection', async () => {
      const updateData = { ...testManyDocs[2], name: 'Updated User2' };
      const updated = await MongoModel.update(updateData, {
        filter: { firstName: 'firstName 3' },
      });
      const result = await MongoModel.read({ filter: { name: 'Updated User2' } });

      expect(updated).toBe(true);
      expect(result[0].name).toBe('Updated User2');
    });
  });

  describe('count()', () => {
    it('should return the number of documents in the MongoDB collection', async () => {
      const count = await MongoModel.count();
      // several documents are created during testing
      expect(count).toBe(maxDocs + 3);
    });
  });

  describe('delete()', () => {
    it('delete(): should delete a document from the MongoDB collection', async () => {
      const result = await MongoModel.create({ ...testData }, {});
      const deleted = await MongoModel.delete({ id: result._id });
      expect(deleted).toStrictEqual({ acknowledged: true, deletedCount: 1 });
    });

    it('deleteOne(): should delete a document from the MongoDB collection', async () => {
      const result = await MongoModel.create({ ...testData }, {});
      const deleted = await MongoModel.deleteOne(result._id);
      expect(deleted).toStrictEqual({ acknowledged: true, deletedCount: 1 });
    });

    it('delete(): delete all documents', async () => {
      const deleted = await MongoModel.delete();
      expect(deleted).toStrictEqual({ acknowledged: true, deletedCount: 12 });
    });
  });
});
