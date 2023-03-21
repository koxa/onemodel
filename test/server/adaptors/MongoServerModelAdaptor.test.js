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
      const user = {
        firstName: `firstName ${i + 1}`,
        lastName: `lastName ${i + 1}`,
        comment: `comment ${i + 1}`,
      };
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

    it('checking filter parameters: without operators', async () => {
      const resultWhere = await MongoModel.read({
        filter: { firstName: 'firstName 2' },
      });
      expect(resultWhere[0].firstName).toBe('firstName 2');
    });

    it('checking filter parameters: $eq', async () => {
      const resultEq = await MongoModel.read({
        filter: { firstName: { $eq: 'firstName 3' } },
      });
      expect(resultEq.length).toBe(1);
      expect(resultEq[0].firstName).toBe('firstName 3');
    });

    it('checking filter parameters: $ne', async () => {
      const resultNe = await MongoModel.read({
        filter: { firstName: { $ne: 'firstName 4' } },
      });
      expect(resultNe.length).toBe(maxDocs);
      expect(resultNe.filter((result) => result.firstName === 'firstName 4').length).toBe(0);
    });

    it('checking filter parameters: $lt', async () => {
      const resultLt = await MongoModel.read({
        filter: { firstName: { $lt: 'firstName 4' } },
      });
      expect(resultLt.length).toBe(4);
    });

    it('checking filter parameters: $lte', async () => {
      const resultLte = await MongoModel.read({
        filter: { firstName: { $lte: 'firstName 4' } },
      });
      expect(resultLte.length).toBe(5);
    });

    it('checking filter parameters: $gt', async () => {
      const resultGt = await MongoModel.read({
        filter: { firstName: { $gt: 'firstName 4' } },
      });
      expect(resultGt.length).toBe(5);
    });

    it('checking filter parameters: $gte', async () => {
      const resultGte = await MongoModel.read({
        filter: { firstName: { $gte: 'firstName 4' } },
      });
      expect(resultGte.length).toBe(6);
    });

    it('checking filter parameters: $in', async () => {
      const resultIn = await MongoModel.read({
        filter: { firstName: { $in: ['firstName 4', 'firstName 5'] } },
      });
      expect(resultIn.length).toBe(2);
      expect(resultIn.map((res) => res.firstName)).toEqual(['firstName 4', 'firstName 5']);
    });

    it('checking filter parameters: $notIn', async () => {
      const resultNotIn = await MongoModel.read({
        filter: { firstName: { $notIn: ['firstName 4'] } },
      });
      expect(resultNotIn.length).toBe(9);
      expect(resultNotIn.map((res) => res.firstName)).toEqual([
        'firstName 1',
        'firstName 2',
        'firstName 3',
        'firstName 5',
        'firstName 6',
        'firstName 7',
        'firstName 8',
        'firstName 9',
        'firstName 1',
      ]);
    });

    it('checking filter parameters: $like', async () => {
      const resultLikeAll = await MongoModel.read({
        filter: { firstName: { $like: 'firstName' } },
      });
      expect(resultLikeAll.length).toBe(10);

      const resultLikeOne = await MongoModel.read({
        filter: { firstName: { $like: '5' } },
      });
      expect(resultLikeOne.length).toBe(1);
    });

    it('checking filter parameters: $notLike', async () => {
      const resultNotLike = await MongoModel.read({
        filter: { firstName: { $notLike: '5' } },
      });
      expect(resultNotLike.length).toBe(9);
      expect(resultNotLike.map((item) => item.firstName)).toEqual([
        'firstName 1',
        'firstName 2',
        'firstName 3',
        'firstName 4',
        'firstName 6',
        'firstName 7',
        'firstName 8',
        'firstName 9',
        'firstName 1',
      ]);
    });

    it('checking filter parameters: $and', async () => {
      const resultAnd = await MongoModel.read({
        filter: {
          $and: [{ firstName: 'firstName 4' }, { lastName: 'lastName 4' }],
        },
      });
      expect(resultAnd.length).toBe(1);
    });

    it('checking filter parameters: $or', async () => {
      const resultOr = await MongoModel.read({
        filter: {
          firstName: { $in: ['firstName 4', 'firstName 6', 'firstName 7'] },
          $or: [{ lastName: 'lastName 4' }, { lastName: 'lastName 7' }],
        },
      });
      expect(resultOr.map((res) => res.firstName)).toEqual(['firstName 4', 'firstName 7']);
    });

    it('checking columns parameters', async () => {
      const resultOr = await MongoModel.read({
        filter: {
          firstName: 'firstName 4',
        },
        columns: { _id: 1, firstName: 1 },
      });
      expect(resultOr[0]).toHaveProperty('_id');
      expect(resultOr[0].firstName).toBe('firstName 4');
      expect(resultOr[0].lastName).not.toBeDefined();
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

  describe('updateMany()', () => {
    it('should update multiple documents in the collection', async () => {
      const selectItems = await MongoModel.read({ limit: 3 });
      const updateData = [
        {
          _id: selectItems[0]._id,
          comment: 'Updated comment updateMany1',
          lastName: 'Updated lastName updateMany1',
        },
        {
          _id: selectItems[1]._id,
          comment: 'Updated comment updateMany2',
          lastName: 'Updated lastName updateMany2',
        },
        {
          _id: selectItems[2]._id,
          comment: 'Updated comment updateMany3',
          lastName: 'Updated lastName updateMany3',
        },
      ];
      const updated = await MongoModel.updateMany(updateData);
      expect(updated).toBe(true);

      const result = await MongoModel.read({ limit: 3 });
      expect(result[0].comment).toBe('Updated comment updateMany1');
      expect(result[1].comment).toBe('Updated comment updateMany2');
      expect(result[2].comment).toBe('Updated comment updateMany3');

      expect(result[0].lastName).toBe('Updated lastName updateMany1');
      expect(result[1].lastName).toBe('Updated lastName updateMany2');
      expect(result[2].lastName).toBe('Updated lastName updateMany3');
    });

    it('should throw an error if the data array is empty', async () => {
      await expect(MongoModel.updateMany([])).rejects.toThrow(
        'MongoServerModelAdaptor updateMany: data array is empty',
      );
    });
  });

  describe('insertMany && deleteMany', () => {
    it('should insert and delete multiple documents from the collection', async () => {
      const testData = [
        { firstName: 'test 100', lastName: 'test 10', comment: 'Test comment 10' },
        { firstName: 'test 110', lastName: 'test 11', comment: 'Test comment 11' },
        { firstName: 'test 120', lastName: 'test 12', comment: 'Test comment 12' },
      ];

      const insertMany = await MongoModel.insertMany(testData);
      expect(insertMany.insertedCount).toBe(3);
      expect(insertMany.insertedIds.length).toBe(3);

      const readInsert = await MongoModel.read({
        filter: {
          _id: { $in: insertMany.insertedIds },
        },
      });
      expect(readInsert[0].firstName).toEqual(testData[0].firstName);
      expect(readInsert[1].firstName).toEqual(testData[1].firstName);
      expect(readInsert[2].firstName).toEqual(testData[2].firstName);
      expect(readInsert.length).toBe(3);

      const result = await MongoModel.deleteMany(insertMany.insertedIds);
      expect(result.deletedCount).toBe(3);

      const readDelete = await MongoModel.read({
        filter: {
          id: { $in: insertMany.insertedIds },
        },
      });
      expect(readDelete.length).toBe(0);
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
