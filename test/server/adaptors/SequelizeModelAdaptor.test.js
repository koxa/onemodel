const { Sequelize, DataTypes } = require('sequelize');
import SequelizeModelAdaptor from '../../../src/server/model/adaptors/SequelizeModelAdaptor';
import { BaseModel } from '../../../src';

class SequelizeModelTestModel extends BaseModel {}
SequelizeModelTestModel.addMixins([SequelizeModelAdaptor]);

const maxDocs = 9;

describe('SequelizeModelAdaptor', () => {
  let sequelize;
  let testData;
  let userSchema;
  const testManyDocs = [];

  beforeAll(async () => {
    const { user, password, host, port, database } = global.config.mariadb;
    sequelize = new Sequelize(database, user, password, {
      host,
      port,
      dialect: 'mariadb',
    });

    userSchema = sequelize.define(SequelizeModelTestModel.name.toLocaleLowerCase(), {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

    SequelizeModelTestModel.configure({
      sequelize: Sequelize,
      db: sequelize,
      schemas: [userSchema],
      idAttr: 'id',
    });

    /** CREATE TEST DATA */
    [...Array(maxDocs).keys()].forEach((i) => {
      const user = { firstName: `firstName ${i + 1}`, lastName: `lastName ${i + 1}` };
      testManyDocs.push(user);
    });

    await testManyDocs.reduce((prevPromise, value) => {
      return prevPromise.then(() => SequelizeModelTestModel.create({ ...value }, {}));
    }, Promise.resolve());

    testData = { ...testManyDocs[0] };
  });

  afterAll(async () => {
    await sequelize.drop(userSchema);
  });

  describe('getCollection()', () => {
    it('should throw error if DB instance or CollectionName is not defined', () => {
      expect(SequelizeModelTestModel.getCollection()).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should insert a new document in the collection', async () => {
      const result = await SequelizeModelTestModel.create({ ...testData }, {});
      expect(result).toHaveProperty('id');
    });
  });

  describe('read()', () => {
    it('should return an array of documents from the collection', async () => {
      const result = await SequelizeModelTestModel.read();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(maxDocs + 1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[0].firstName);
      expect(result[testManyDocs.length - 1]).toHaveProperty(
        'firstName',
        testManyDocs[testManyDocs.length - 1].firstName,
      );
    });

    it('should return a paginated array of documents from the collection', async () => {
      // Get the first 3 documents
      let result = await SequelizeModelTestModel.read({ limit: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[0].firstName);
      expect(result[1]).toHaveProperty('firstName', testManyDocs[1].firstName);
      expect(result[2]).toHaveProperty('firstName', testManyDocs[2].firstName);

      // Get the next 3 documents
      result = await SequelizeModelTestModel.read({ limit: 3, skip: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[3].firstName);
      expect(result[1]).toHaveProperty('firstName', testManyDocs[4].firstName);
      expect(result[2]).toHaveProperty('firstName', testManyDocs[5].firstName);

      // Get the last 3 documents
      result = await SequelizeModelTestModel.read({ limit: 3, skip: 6 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testManyDocs[6].firstName);
      expect(result[1]).toHaveProperty('firstName', testManyDocs[7].firstName);
      expect(result[2]).toHaveProperty('firstName', testManyDocs[8].firstName);
    });

    it('should return a sorted array of documents from the collection', async () => {
      const sortOptions = { firstName: -1 };
      const result = await SequelizeModelTestModel.read({ sort: sortOptions });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(maxDocs + 1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', `firstName ${testManyDocs.length}`);
    });

    it('checking filter parameters: $eq, $ne, $gt, $lt, $in, $regex', async () => {
      const resultWhere = await SequelizeModelTestModel.read({
        filter: { firstName: 'firstName 2' },
      });
      const resultEq = await SequelizeModelTestModel.read({
        filter: { firstName: { $eq: 'firstName 3' } },
      });
      const resultNe = await SequelizeModelTestModel.read({
        filter: { firstName: { $ne: 'firstName 4' } },
      });
      const resultGt = await SequelizeModelTestModel.read({
        filter: { firstName: { $gt: 'firstName 4' } },
      });
      const resultLt = await SequelizeModelTestModel.read({
        filter: { firstName: { $lt: 'firstName 4' } },
      });
      const resultRegexAll = await SequelizeModelTestModel.read({
        filter: { firstName: { $regex: 'firstName' } },
      });
      const resultRegexOne = await SequelizeModelTestModel.read({
        filter: { firstName: { $regex: '5' } },
      });
      const resultIn = await SequelizeModelTestModel.read({
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
  });

  describe('update()', () => {
    it('should update a document in the collection', async () => {
      const result = await SequelizeModelTestModel.create({ ...testData }, {});
      const updateData = { ...testData, name: 'Updated User' };
      const updated = await SequelizeModelTestModel.update(updateData, { id: result.id });
      expect(updated).toBe(true);
    });
  });

  describe('count()', () => {
    it('should return the number of documents in the collection', async () => {
      const count = await SequelizeModelTestModel.count();
      // several documents are created during testing
      expect(count).toBe(maxDocs + 2);
    });
  });

  describe('delete()', () => {
    it('should delete a document from the collection', async () => {
      const result = await SequelizeModelTestModel.create({ ...testData }, {});
      const deleted = await SequelizeModelTestModel.delete({ id: result.id });
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('deleteOne(): should delete a document from the collection', async () => {
      const result = await SequelizeModelTestModel.create({ ...testData }, {});
      const deleted = await SequelizeModelTestModel.deleteOne(result.id);
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('delete(): delete all documents', async () => {
      const deleted = await SequelizeModelTestModel.delete();
      expect(deleted).toStrictEqual({ deletedCount: 11 });
    });
  });
});
