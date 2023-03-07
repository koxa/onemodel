const { Sequelize, DataTypes } = require('sequelize');
import SequelizeModelAdaptor from '../../../src/server/model/adaptors/SequelizeModelAdaptor';
import BaseModel from '../../../src/common/model/BaseModel';

class SequelizeModelTestModel extends BaseModel {}
SequelizeModelTestModel.addMixins([SequelizeModelAdaptor]);

const maxDocs = 9;

describe('SequelizeModelAdaptor', () => {
  let sequelize;
  let testData;
  let userSchema;
  const testManyDocs = [];

  beforeAll(async () => {
    sequelize = new Sequelize('sqlite::memory:', { logging: false });

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
      const result = await SequelizeModelTestModel.create(
        { ...testData, firstName: 'firstName 1Test' },
        {},
      );
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

    it('checking filter parameters: without operators', async () => {
      const resultWhere = await SequelizeModelTestModel.read({
        filter: { firstName: 'firstName 2' },
      });
      expect(resultWhere[0].firstName).toBe('firstName 2');
    });

    it('checking filter parameters: $eq', async () => {
      const resultEq = await SequelizeModelTestModel.read({
        filter: { firstName: { $eq: 'firstName 3' } },
      });
      expect(resultEq.length).toBe(1);
      expect(resultEq[0].firstName).toBe('firstName 3');
    });

    it('checking filter parameters: $ne', async () => {
      const resultNe = await SequelizeModelTestModel.read({
        filter: { firstName: { $ne: 'firstName 4' } },
      });
      expect(resultNe.length).toBe(maxDocs);
      expect(resultNe.filter((result) => result.firstName === 'firstName 4').length).toBe(0);
    });

    it('checking filter parameters: $lt', async () => {
      const resultLt = await SequelizeModelTestModel.read({
        filter: { firstName: { $lt: 'firstName 4' } },
      });
      expect(resultLt.length).toBe(4);
    });

    it('checking filter parameters: $lte', async () => {
      const resultLte = await SequelizeModelTestModel.read({
        filter: { firstName: { $lte: 'firstName 4' } },
      });
      expect(resultLte.length).toBe(5);
    });

    it('checking filter parameters: $gt', async () => {
      const resultGt = await SequelizeModelTestModel.read({
        filter: { firstName: { $gt: 'firstName 4' } },
      });
      expect(resultGt.length).toBe(5);
    });

    it('checking filter parameters: $gte', async () => {
      const resultGte = await SequelizeModelTestModel.read({
        filter: { firstName: { $gte: 'firstName 4' } },
      });
      expect(resultGte.length).toBe(6);
    });

    it('checking filter parameters: $in', async () => {
      const resultIn = await SequelizeModelTestModel.read({
        filter: { firstName: { $in: ['firstName 4', 'firstName 5'] } },
      });
      expect(resultIn.length).toBe(2);
      expect(resultIn.map((res) => res.firstName)).toEqual(['firstName 4', 'firstName 5']);
    });

    it('checking filter parameters: $notIn', async () => {
      const resultNotIn = await SequelizeModelTestModel.read({
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
        'firstName 1Test',
      ]);
    });

    it('checking filter parameters: $like', async () => {
      const resultLikeAll = await SequelizeModelTestModel.read({
        filter: { firstName: { $like: 'firstName' } },
      });
      expect(resultLikeAll.length).toBe(10);

      const resultLikeOne = await SequelizeModelTestModel.read({
        filter: { firstName: { $like: '5' } },
      });
      expect(resultLikeOne.length).toBe(1);
    });

    it('checking filter parameters: $notLike', async () => {
      const resultNotLike = await SequelizeModelTestModel.read({
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
        'firstName 1Test',
      ]);
    });

    it('checking filter parameters: $and', async () => {
      const resultAnd = await SequelizeModelTestModel.read({
        filter: {
          $and: [{ firstName: 'firstName 4' }, { lastName: 'lastName 4' }],
        },
      });
      expect(resultAnd.length).toBe(1);
    });

    it('checking filter parameters: $or', async () => {
      const resultOr = await SequelizeModelTestModel.read({
        filter: {
          firstName: { $in: ['firstName 4', 'firstName 6', 'firstName 7'] },
          $or: [{ lastName: 'lastName 4' }, { lastName: 'lastName 7' }],
        },
      });
      expect(resultOr.map((res) => res.firstName)).toEqual(['firstName 4', 'firstName 7']);
    });

    it('checking filter parameters: $not', async () => {
      const resultOr = await SequelizeModelTestModel.read({
        filter: {
          firstName: { $in: ['firstName 4', 'firstName 6', 'firstName 7'] },
          $not: { firstName: 'firstName 4' },
        },
      });
      expect(resultOr.map((res) => res.firstName)).toEqual(['firstName 6', 'firstName 7']);
    });

    it('checking columns parameters', async () => {
      const resultOr = await SequelizeModelTestModel.read({
        filter: {
          firstName: 'firstName 4',
        },
        columns: { id: 1, firstName: 1 },
      });
      expect(resultOr[0]).toEqual({ firstName: 'firstName 4', id: 4 });
    });
  });

  describe('update()', () => {
    it('should update a document in the collection', async () => {
      const updateData = { ...testData, lastName: 'lastName Updated User' };
      const updated = await SequelizeModelTestModel.update(updateData, { id: 10 });
      expect(updated).toBe(true);
    });
  });

  describe('count()', () => {
    it('should return the number of documents in the collection', async () => {
      const count = await SequelizeModelTestModel.count();
      // several documents are created during testing
      expect(count).toBe(maxDocs + 1);
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
      expect(deleted).toStrictEqual({ deletedCount: 10 });
    });
  });
});
