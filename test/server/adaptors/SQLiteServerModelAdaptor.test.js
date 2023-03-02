const sqlite3 = require('sqlite3').verbose();
import BaseModel from '../../../src/common/model/BaseModel';
import SQLiteServerModelAdaptor from '../../../src/server/model/adaptors/SQLiteServerModelAdaptor';

class TestSqLiteModel extends BaseModel {}
TestSqLiteModel.addMixins([SQLiteServerModelAdaptor]);

describe('SQLiteServerModelAdaptor', () => {
  let db;
  let tableName = TestSqLiteModel.name.toLocaleLowerCase();
  const maxUsers = 9;
  const testDocs = [];

  beforeAll(async () => {
    db = new sqlite3.Database(':memory:');

    /** CONFIGURE MODEL TO USE MONGO **/
    TestSqLiteModel.configure({
      db,
      idAttr: 'id',
      props: {
        firstName: { type: 'String', value: '' },
        lastName: { type: 'String', value: '' },
        comment: '',
        comment2: { type: 'Number', value: '' },
        comment3: { type: 'Date', value: '' },
        comment4: { type: 'String', value: 'default value' },
        comment5: 0,
      },
    });

    [...Array(maxUsers).keys()].forEach((i) => {
      const user = {
        firstName: `firstName${i + 1}`,
        lastName: `lastName${i + 1}`,
        comment: `comment${i + 1}`,
      };
      testDocs.push(user);
    });

    await TestSqLiteModel.createTableFromProps(tableName, TestSqLiteModel.config.props);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('service()', () => {
    it('isTableExist(): should check if the table exists in the database', async () => {
      const tableExists = await TestSqLiteModel.isTableExist(tableName);
      expect(tableExists).toBe(true);
    });

    it('firstCheckAndCreateTable(tableName): should create the table in the database if it does not exist, and return whether the table was created or not', async () => {
      const tableTestName = tableName + 'test_table1';
      const tableCreated = await TestSqLiteModel.firstCheckAndCreateTable(
        tableTestName,
        TestSqLiteModel.config.props,
      );
      expect(tableCreated).toBe(true);
    });

    it('getCollection(): should return the collection object', async () => {
      const collection = await TestSqLiteModel.getCollection();
      expect(collection).toBe(tableName);
    });

    it('getAdaptorParams(): should return the adaptor parameters', async () => {
      const adaptorParams = await TestSqLiteModel.getAdaptorParams({});
      expect(adaptorParams).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should create a new document in the database', async () => {
      const createdDocument = await testDocs.reduce((prevPromise, value) => {
        return prevPromise.then(() => TestSqLiteModel.create({ ...value }, {}));
      }, Promise.resolve());

      expect(createdDocument).toHaveProperty('id');
    });
  });

  describe('read(params)', () => {
    it('should return an array of documents from a SQLite table', async () => {
      const result = await TestSqLiteModel.read();
      expect(result[0].firstName).toBe('firstName1');
      expect(result[0].lastName).toBe('lastName1');
      expect(result[0].comment).toBe('comment1');
      expect(result.length).toBe(maxUsers);
    });

    it('should return an array of documents from a SQLite table', async () => {
      const result = await TestSqLiteModel.read({ columns: { firstName: 1 }, limit: 1 });
      expect(result[0].firstName).toBe('firstName1');
      expect(Object.keys(result).length).toBe(1);
    });

    it('testing only the skip parameter', async () => {
      const result = await TestSqLiteModel.read({ skip: 1 });
      expect(result[0].firstName).toBe('firstName2');
    });

    it('testing only the filter parameter', async () => {
      const result = await TestSqLiteModel.read({ filter: { firstName: 'firstName4' } });
      expect(result[0].firstName).toBe('firstName4');
    });

    it('should return a paginated array of documents from a collection', async () => {
      // Get the first 3 documents
      let result = await TestSqLiteModel.read({ limit: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[0].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[1].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[2].firstName);

      // Get the next 3 documents
      result = await TestSqLiteModel.read({ limit: 3, skip: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[3].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[4].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[5].firstName);

      // Get the last 3 documents
      result = await TestSqLiteModel.read({ limit: 3, skip: 6 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[6].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[7].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[8].firstName);
    });

    it('checking filter parameters: $eq, $ne, $gt, $lt, $in, $regex', async () => {
      const resultWhere = await TestSqLiteModel.read({
        filter: { firstName: 'firstName2' },
      });
      const resultEq = await TestSqLiteModel.read({
        filter: { firstName: { $eq: 'firstName3' } },
      });
      const resultNe = await TestSqLiteModel.read({
        filter: { firstName: { $ne: 'firstName4' } },
      });
      const resultGt = await TestSqLiteModel.read({
        filter: { firstName: { $gt: 'firstName4' } },
      });
      const resultLt = await TestSqLiteModel.read({
        filter: { firstName: { $lt: 'firstName4' } },
      });
      const resultRegexAll = await TestSqLiteModel.read({
        filter: { firstName: { $regex: 'firstName' } },
      });
      const resultRegexOne = await TestSqLiteModel.read({
        filter: { firstName: { $regex: '5' } },
      });
      const resultIn = await TestSqLiteModel.read({
        filter: { firstName: { $in: ['firstName4', 'firstName5'] } },
      });

      expect(resultWhere[0].firstName).toBe('firstName2');

      expect(resultEq.length).toBe(1);
      expect(resultEq[0].firstName).toBe('firstName3');

      expect(resultNe.length).toBe(8);
      expect(resultNe.filter((result) => result.firstName === 'firstName4').length).toBe(0);

      expect(resultGt.length).toBe(5);
      expect(resultLt.length).toBe(3);

      expect(resultIn.length).toBe(2);
      expect(resultIn[0].firstName).toBe('firstName4');
      expect(resultIn[1].firstName).toBe('firstName5');

      expect(resultRegexAll.length).toBe(9);
      expect(resultRegexOne.length).toBe(1);
    });

    it('should return a sorted array of documents from the collection', async () => {
      const sortOptions = { firstName: -1 };
      const result = await TestSqLiteModel.read({ sort: sortOptions });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(maxUsers);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', `firstName${testDocs.length}`);
    });
  });

  describe('update()', () => {
    it('should update a document in the collection', async () => {
      const updateData = { ...testDocs[0], comment: 'Updated User' };
      const updated = await TestSqLiteModel.update(updateData, { id: 1 });
      expect(updated).toBe(true);
    });

    it('should update a document in the collection', async () => {
      const updateData = { ...testDocs[1], comment: 'Updated User2' };
      const updated = await TestSqLiteModel.update(updateData, {
        filter: { firstName: 'firstName2' },
      });
      const result = await TestSqLiteModel.read({ filter: { firstName: 'firstName2' } });

      expect(updated).toBe(true);
      expect(result[0].comment).toBe('Updated User2');
    });
  });

  describe('count()', () => {
    it('should return the number of documents in the collection', async () => {
      const count = await TestSqLiteModel.count();
      // several documents are created during testing
      expect(count).toBe(maxUsers);
    });
  });

  describe('delete()', () => {
    it('should delete a document from the collection', async () => {
      const deleted = await TestSqLiteModel.delete({ id: 1 });
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('should remove document from collection by filter', async () => {
      const deleted = await TestSqLiteModel.delete({ filter: { firstName: 'firstName3' } });
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('deleteOne(): should delete a document from the collection', async () => {
      const deleted = await TestSqLiteModel.deleteOne(2);
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('delete all documents', async () => {
      expect(await TestSqLiteModel.delete()).toStrictEqual({ deletedCount: 6 });
    });

    it('throws an error when ID is not defined', async () => {
      await expect(TestSqLiteModel.deleteOne()).rejects.toThrow(
        'SQLiteServerModelAdaptor deleteOne: ID must be defined',
      );
    });
  });
});
