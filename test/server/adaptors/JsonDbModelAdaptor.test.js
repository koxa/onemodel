import BaseModel from '../../../src/common/model/BaseModel';
import JsonServerModelAdaptor from '../../../src/server/model/adaptors/JsonServerModelAdaptor';

class TestTableJsonDbModel extends BaseModel {}
TestTableJsonDbModel.addMixins([JsonServerModelAdaptor]);

describe('JsonDbModelAdaptor', () => {
  const maxUsers = 9;
  const testDocs = [];

  beforeAll(async () => {
    /** CONFIGURE MODEL TO USE MONGO **/
    TestTableJsonDbModel.configure({
      idAttr: 'id',
      memoryDb: {},
    });

    [...Array(maxUsers).keys()].forEach((i) => {
      const user = {
        firstName: `firstName${i + 1}`,
        lastName: `lastName${i + 1}`,
        comment: `comment${i + 1}`,
      };
      testDocs.push(user);
    });
  });

  describe('create()', () => {
    it('should create a new document in the database', async () => {
      const createdDocument = await testDocs.reduce((prevPromise, value) => {
        return prevPromise.then(() => TestTableJsonDbModel.create({ ...value }, {}));
      }, Promise.resolve());

      expect(createdDocument).toHaveProperty('id');
    });
  });

  describe('read(params)', () => {
    it('should return an array of documents from a MariaDB table', async () => {
      const result = await TestTableJsonDbModel.read();
      expect(result[0].firstName).toBe('firstName1');
      expect(result[0].lastName).toBe('lastName1');
      expect(result[0].comment).toBe('comment1');
      expect(result.length).toBe(maxUsers);
    });

    it('should return an array of documents from a MariaDB table', async () => {
      const result = await TestTableJsonDbModel.read({ columns: { firstName: 1 }, limit: 1 });
      expect(result[0].firstName).toBe('firstName1');
      expect(Object.keys(result).length).toBe(1);
    });

    it('testing only the skip parameter', async () => {
      const result = await TestTableJsonDbModel.read({ skip: 1 });
      expect(result[0].firstName).toBe('firstName2');
    });

    it('testing only the filter parameter', async () => {
      const result = await TestTableJsonDbModel.read({ filter: { firstName: 'firstName4' } });
      expect(result[0].firstName).toBe('firstName4');
    });

    it('should return a paginated array of documents from a collection', async () => {
      // Get the first 3 documents
      let result = await TestTableJsonDbModel.read({ limit: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[0].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[1].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[2].firstName);

      // Get the next 3 documents
      result = await TestTableJsonDbModel.read({ limit: 3, skip: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[3].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[4].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[5].firstName);

      // Get the last 3 documents
      result = await TestTableJsonDbModel.read({ limit: 3, skip: 6 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', testDocs[6].firstName);
      expect(result[1]).toHaveProperty('firstName', testDocs[7].firstName);
      expect(result[2]).toHaveProperty('firstName', testDocs[8].firstName);
    });

    it('checking filter parameters: without operators', async () => {
      const resultWhere = await TestTableJsonDbModel.read({
        filter: { firstName: 'firstName2' },
      });
      expect(resultWhere[0].firstName).toBe('firstName2');
    });

    it('checking filter parameters: $eq', async () => {
      const resultEq = await TestTableJsonDbModel.read({
        filter: { firstName: { $eq: 'firstName3' } },
      });
      expect(resultEq.length).toBe(1);
      expect(resultEq[0].firstName).toBe('firstName3');
    });

    it('checking filter parameters: $ne', async () => {
      const resultNe = await TestTableJsonDbModel.read({
        filter: { firstName: { $ne: 'firstName4' } },
      });
      expect(resultNe.length).toBe(8);
      expect(resultNe.filter((result) => result.firstName === 'firstName4').length).toBe(0);
    });

    it('checking filter parameters: $lt', async () => {
      const resultLt = await TestTableJsonDbModel.read({
        filter: { firstName: { $lt: 'firstName4' } },
      });
      expect(resultLt.length).toBe(3);
    });

    it('checking filter parameters: $lte', async () => {
      const resultLte = await TestTableJsonDbModel.read({
        filter: { firstName: { $lte: 'firstName4' } },
      });
      expect(resultLte.length).toBe(4);
    });

    it('checking filter parameters: $gt', async () => {
      const resultGt = await TestTableJsonDbModel.read({
        filter: { firstName: { $gt: 'firstName4' } },
      });
      expect(resultGt.length).toBe(5);
    });

    it('checking filter parameters: $gte', async () => {
      const resultGte = await TestTableJsonDbModel.read({
        filter: { firstName: { $gte: 'firstName4' } },
      });
      expect(resultGte.length).toBe(6);
    });

    it('checking filter parameters: $in', async () => {
      const resultIn = await TestTableJsonDbModel.read({
        filter: { firstName: { $in: ['firstName4', 'firstName5'] } },
      });
      expect(resultIn.length).toBe(2);
      expect(resultIn.map((res) => res.firstName)).toStrictEqual(['firstName4', 'firstName5']);
    });

    it('checking filter parameters: $notIn', async () => {
      const resultNotIn = await TestTableJsonDbModel.read({
        filter: { firstName: { $notIn: ['firstName4', 'firstName5'] } },
      });
      expect(resultNotIn.length).toBe(7);
      expect(resultNotIn.map((res) => res.firstName)).toStrictEqual([
        'firstName1',
        'firstName2',
        'firstName3',
        'firstName6',
        'firstName7',
        'firstName8',
        'firstName9',
      ]);
    });

    it('checking filter parameters: $like', async () => {
      const resultLikeAll = await TestTableJsonDbModel.read({
        filter: { firstName: { $like: 'firstName' } },
      });
      expect(resultLikeAll.length).toBe(maxUsers);

      const resultLikeOne = await TestTableJsonDbModel.read({
        filter: { firstName: { $like: '5' } },
      });
      expect(resultLikeOne.length).toBe(1);
    });

    it('checking filter parameters: $notLike', async () => {
      const resultNotLike = await TestTableJsonDbModel.read({
        filter: { firstName: { $notLike: '5' } },
      });
      expect(resultNotLike.length).toBe(8);
      expect(resultNotLike.map((item) => item.firstName)).toEqual([
        'firstName1',
        'firstName2',
        'firstName3',
        'firstName4',
        'firstName6',
        'firstName7',
        'firstName8',
        'firstName9',
      ]);
    });

    it('checking filter parameters: $and', async () => {
      const resultAnd = await TestTableJsonDbModel.read({
        filter: {
          $and: [{ firstName: 'firstName4' }, { lastName: 'lastName4' }],
        },
      });
      expect(resultAnd.length).toBe(1);
    });

    it('checking filter parameters: $or', async () => {
      const resultOr = await TestTableJsonDbModel.read({
        filter: {
          firstName: { $in: ['firstName4', 'firstName6', 'firstName7'] },
          $or: [{ lastName: 'lastName4' }, { lastName: 'lastName7' }],
        },
      });
      expect(resultOr.map((res) => res.firstName)).toStrictEqual(['firstName4', 'firstName7']);
    });

    it('checking filter parameters: $not', async () => {
      const resultOr = await TestTableJsonDbModel.read({
        filter: {
          firstName: { $in: ['firstName4', 'firstName6', 'firstName7'] },
          $not: { firstName: 'firstName4' },
        },
      });
      expect(resultOr.map((res) => res.firstName)).toStrictEqual(['firstName6', 'firstName7']);
    });

    it('checking columns parameters', async () => {
      const resultOr = await TestTableJsonDbModel.read({
        filter: {
          firstName: 'firstName4',
        },
        columns: { id: 1, firstName: 1 },
      });
      expect(resultOr[0]).toEqual({ firstName: 'firstName4', id: 4 });
    });

    it('should return a sorted array of documents from the collection', async () => {
      const sortOptions = { firstName: -1 };
      const result = await TestTableJsonDbModel.read({ sort: sortOptions });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(maxUsers);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName', `firstName${testDocs.length}`);
    });
  });

  describe('update()', () => {
    it('should update a document in the collection', async () => {
      const updateData = { ...testDocs[0], comment: 'Updated User' };
      const updated = await TestTableJsonDbModel.update(updateData, { id: 1 });
      expect(updated).toBe(true);
    });

    it('should update a document in the collection', async () => {
      const updateData = { ...testDocs[2], comment: 'Updated User3' };
      const updated = await TestTableJsonDbModel.update(updateData, {
        filter: { firstName: 'firstName3' },
      });
      const result = await TestTableJsonDbModel.read({ filter: { firstName: 'firstName3' } });

      expect(updated).toBe(true);
      expect(result[0].comment).toBe('Updated User3');
    });
  });

  describe('updateMany()', () => {
    it('should update multiple documents in the collection', async () => {
      const updateData = [
        { id: 1, comment: 'Updated User1' },
        { id: 2, comment: 'Updated User2' },
        { id: 3, comment: 'Updated User3' },
      ];
      const updated = await TestTableJsonDbModel.updateMany(updateData);
      expect(updated).toBe(true);

      const result = await TestTableJsonDbModel.read({ filter: { id: { $in: [1, 2, 3] } } });
      expect(result[0].comment).toBe('Updated User1');
      expect(result[1].comment).toBe('Updated User2');
      expect(result[2].comment).toBe('Updated User3');
    });

    it('should throw an error if the data array is empty', async () => {
      await expect(TestTableJsonDbModel.updateMany([])).rejects.toThrow(
        'JsonServerModelAdaptor updateMany: data array is empty',
      );
    });
  });

  describe('count()', () => {
    it('should return the number of documents in the collection', async () => {
      const count = await TestTableJsonDbModel.count();
      // several documents are created during testing
      expect(count).toBe(maxUsers);
    });
  });

  describe('delete()', () => {
    it('delete(): should delete a document from the collection', async () => {
      const deleted = await TestTableJsonDbModel.delete({ id: 1 });
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('delete(): should remove document from collection by filter', async () => {
      const deleted = await TestTableJsonDbModel.delete({ filter: { firstName: 'firstName3' } });
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('deleteOne(): should delete a document from the collection', async () => {
      const deleted = await TestTableJsonDbModel.deleteOne(2);
      expect(deleted).toStrictEqual({ deletedCount: 1 });
    });

    it('delete all documents', async () => {
      expect(await TestTableJsonDbModel.delete()).toStrictEqual({ deletedCount: 6 });
    });

    it('throws an error when ID is not defined', async () => {
      await expect(TestTableJsonDbModel.deleteOne()).rejects.toThrow(
        'JsonServerModelAdaptor deleteOne: ID must be defined',
      );
    });
  });
});
