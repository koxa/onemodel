const mariadb = require('mariadb');

import { BaseModel } from '../../../src';
import MariaDbModelAdaptor from '../../../src/server/model/adaptors/MariaDbModelAdaptor';

class TestTableMariaDbModel extends BaseModel {}
TestTableMariaDbModel.addMixins([MariaDbModelAdaptor]);

describe('MariaDbModelAdaptor', () => {
  let pool;
  let connection;
  let tableName = TestTableMariaDbModel.name.toLocaleLowerCase();
  const maxUsers = 9;
  const testDocs = [];

  beforeAll(async () => {
    pool = await mariadb.createPool({
      ...global.config.mariadb,
    });
    connection = await pool.getConnection();
    connection.release();

    /** CONFIGURE MODEL TO USE MONGO **/
    TestTableMariaDbModel.configure({
      db: pool,
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

    await TestTableMariaDbModel.createTableFromProps(tableName, TestTableMariaDbModel.config.props);
  });

  afterAll(async () => {
    await connection.query(`DROP TABLE ${tableName}`);
    await pool.end();
  });

  describe('service()', () => {
    it('isTableExist(): should check if the table exists in the database', async () => {
      const tableExists = await TestTableMariaDbModel.isTableExist(tableName);
      expect(tableExists).toBe(true);
    });

    it('firstCheckAndCreateTable(tableName): should create the table in the database if it does not exist, and return whether the table was created or not', async () => {
      const tableTestName = tableName + 'test_table1';
      const tableCreated = await TestTableMariaDbModel.firstCheckAndCreateTable(
        tableTestName,
        TestTableMariaDbModel.config.props,
      );
      await connection.query(`DROP TABLE ${tableTestName}`);
      expect(tableCreated).toBe(true);
    });

    it('getCollection(): should return the collection object', async () => {
      const collection = await TestTableMariaDbModel.getCollection();
      expect(collection).toBe(tableName);
    });

    it('getAdaptorParams(): should return the adaptor parameters', async () => {
      const adaptorParams = await TestTableMariaDbModel.getAdaptorParams({});
      expect(adaptorParams).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should create a new document in the database', async () => {
      const createdDocument = await testDocs.reduce((prevPromise, value) => {
        return prevPromise.then(() => TestTableMariaDbModel.create({ ...value }, {}));
      }, Promise.resolve());

      expect(createdDocument).toHaveProperty('id');
    });
  });

  describe('read(params)', () => {
    it('read(): should return an array of documents from a MariaDB table', async () => {
      const result = await TestTableMariaDbModel.read();
      expect(result[0].firstName).toBe('firstName1');
      expect(result[0].lastName).toBe('lastName1');
      expect(result[0].comment).toBe('comment1');
      expect(result.length).toBe(maxUsers);
    });

    it('read(): should return an array of documents from a MariaDB table', async () => {
      const result = await TestTableMariaDbModel.read({ columns: { firstName: 1 }, limit: 1 });
      expect(result[0].firstName).toBe('firstName1');
      expect(Object.keys(result).length).toBe(1);
    });

    it('read(): testing only the skip parameter', async () => {
      const result = await TestTableMariaDbModel.read({ skip: 1 });
      expect(result[0].firstName).toBe('firstName2');
    });

    it('read(): testing only the filter parameter', async () => {
      const result = await TestTableMariaDbModel.read({ filter: { firstName: 'firstName4' } });
      expect(result[0].firstName).toBe('firstName4');
    });

    it('read(): should return a paginated array of documents from a collection', async () => {
      // Get the first 3 documents
      let result = await TestTableMariaDbModel.read({ limit: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[0].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[1].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[2].firstName);

      // Get the next 3 documents
      result = await TestTableMariaDbModel.read({ limit: 3, skip: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[3].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[4].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[5].firstName);

      // Get the last 3 documents
      result = await TestTableMariaDbModel.read({ limit: 3, skip: 6 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[6].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[7].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[8].firstName);
    });

    it('read(): should return a sorted array of documents from the MongoDB collection', async () => {
      const sortOptions = { firstName: -1 };
      const result = await TestTableMariaDbModel.read({ sort: sortOptions });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(maxUsers);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', `firstName${testDocs.length}`);
    });
  });

  describe('update()', () => {
    it('should update a document in the MongoDB collection', async () => {
      const updateData = { ...testDocs[0], comment: 'Updated User' };
      const updated = await TestTableMariaDbModel.update(updateData, { id: 1 });
      expect(updated).toBe(true);
    });
  });

  describe('count()', () => {
    it('should return the number of documents in the MongoDB collection', async () => {
      const count = await TestTableMariaDbModel.count();
      // several documents are created during testing
      expect(count).toBe(maxUsers);
    });
  });

  describe('delete()', () => {
    it('delete(): should delete a document from the MongoDB collection', async () => {
      const deleted = await TestTableMariaDbModel.delete({ id: 1 });
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('deleteOne(): should delete a document from the MongoDB collection', async () => {
      const deleted = await TestTableMariaDbModel.deleteOne(2);
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('delete all documents', async () => {
      expect(await TestTableMariaDbModel.delete()).toStrictEqual({ deletedCount: 7 });
    });

    it('throws an error when ID is not defined', async () => {
      await expect(TestTableMariaDbModel.deleteOne()).rejects.toThrow(
        'MariaDbModelAdaptor deleteOne: ID must be defined',
      );
    });
  });
});
