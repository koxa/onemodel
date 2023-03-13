import fetch from 'node-fetch';
import OneModelServer from '../src/middleware/index';
import ClientModel from '../src/client/model/ClientModel';

class OneModel extends ClientModel {}

describe('test block', () => {
  let server = null;
  let port = 9333;
  const maxDocs = 30;
  const testDocs = [];
  const testUser1 = { id: 1, firstName: 'firstName 1', lastName: 'lastName 1' };

  beforeAll(async () => {
    global.fetch = fetch;

    OneModel.configure({
      port,
    });

    server = new OneModelServer({ port, props: { memoryDb: {} } });
    await server.start();

    /** CREATE TEST DATA */
    [...Array(maxDocs).keys()].forEach((i) => {
      const user = { firstName: `firstName ${i + 1}`, lastName: `lastName ${i + 1}` };
      testDocs.push(user);
    });

    await testDocs.reduce((prevPromise, value) => {
      return prevPromise.then(() => OneModel.create({ ...value }, {}));
    }, Promise.resolve());
  });

  afterAll(async () => {
    await server.stop();
  });

  /*** GET TESTS ***/
  test('should read Model by id', async () => {
    const user = await OneModel.read({ id: 1 });
    expect(user).toEqual([testUser1]);
  });

  test('should read all documents in the collection', async () => {
    const users = await OneModel.read();
    expect(users.length).toBe(maxDocs);
  });

  test('should filter Model', async () => {
    const user = await OneModel.read('firstName', 'firstName 1'); // key-val format
    expect(user).toEqual([testUser1]);
    const user2 = await OneModel.read({ filter: { firstName: 'firstName 1' } }); // params object filter prop
    expect(user2).toEqual([testUser1]);
    const user3 = await OneModel.read(1, { filter: { firstName: 'firstName 1' } }); // id and params with filter
    expect(user3).toEqual([testUser1]);
    const user4 = await OneModel.read('firstName', 'lastName 1', { id: 1 }); // id and params with filter
    expect(user4).toEqual([testUser1]);
  });

  test('should select specific columns', async () => {
    const users = await OneModel.read({ columns: { firstName: 1, lastName: 0 } });
    expect(users[0]).toEqual({ firstName: testDocs[0].firstName });
  });

  test('should apply filter using $eq operator', async () => {
    const users = await OneModel.read({ filter: { firstName: { $eq: 'firstName 1' } } });
    expect(users).toEqual([testUser1]);
  });

  test('should apply filter using $in operator', async () => {
    const users = await OneModel.read({
      filter: { firstName: { $in: ['firstName 1', 'firstName 2'] } },
    });
    expect(users.length).toBe(2);
  });

  test('should apply filter using $like operator', async () => {
    const users = await OneModel.read({ filter: { firstName: { $like: 'Name 1' }, id: 1 } });
    expect(users).toEqual([testUser1]);
  });

  test('should apply multiple filters using $and operator', async () => {
    const users = await OneModel.read({
      filter: { $and: [{ firstName: 'firstName 1' }, { lastName: 'lastName 1' }] },
    });
    expect(users).toEqual([testUser1]);
  });

  test('should apply sorting', async () => {
    const users = await OneModel.read({ sort: { firstName: -1 } });
    expect(users[0]).toEqual({
      id: maxDocs,
      firstName: `firstName ${maxDocs}`,
      lastName: `lastName ${maxDocs}`,
    });
  });

  test('should limit results', async () => {
    const users = await OneModel.read({ limit: 5 });
    expect(users.length).toBe(5);
  });

  test('should skip results', async () => {
    const users = await OneModel.read({ skip: 5 });
    expect(users.length).toBe(maxDocs - 5);
  });

  test('should apply multiple options #1', async () => {
    const users = await OneModel.read({
      filter: { firstName: 'firstName 1' },
      sort: { lastName: 1 },
      limit: 1,
    });
    expect(users).toEqual([{ id: 1, firstName: 'firstName 1', lastName: 'lastName 1' }]);
  });

  test('should apply multiple options #2', async () => {
    const users = await OneModel.read({
      filter: {
        firstName: { $in: ['firstName 10', 'firstName 1', 'firstName 30', 'firstName 15'] },
      },
      sort: { firstName: -1 },
      limit: 1,
    });
    expect(users).toEqual([{ id: 30, firstName: 'firstName 30', lastName: 'lastName 30' }]);
  });

  test('should apply filter using $ne operator', async () => {
    const users = await OneModel.read({ filter: { firstName: { $ne: 'firstName 1' } } });
    expect(users.length).toBe(maxDocs - 1);
  });

  test('should apply filter using $lt operator', async () => {
    const users = await OneModel.read({ filter: { id: { $lt: 5 } } });
    expect(users.length).toBe(4);
  });

  test('should apply filter using $lte operator', async () => {
    const users = await OneModel.read({ filter: { id: { $lte: 5 } } });
    expect(users.length).toBe(5);
  });

  test('should apply filter using $gt operator', async () => {
    const users = await OneModel.read({ filter: { id: { $gt: maxDocs - 5 } } });
    expect(users.length).toBe(5);
  });

  test('should apply filter using $gte operator', async () => {
    const users = await OneModel.read({ filter: { id: { $gte: maxDocs - 5 } } });
    expect(users.length).toBe(6);
  });

  test('should apply filter using $notIn operator', async () => {
    const users = await OneModel.read({
      filter: { firstName: { $notIn: ['firstName 1', 'firstName 2', 'firstName 3'] } },
    });
    expect(users.length).toBe(maxDocs - 3);
  });

  test('should apply filter using $notLike operator', async () => {
    const users = await OneModel.read({ filter: { firstName: { $notLike: 'Name 1' } } });
    expect(users.length).toBe(19);
  });

  test('should apply filter using $and operator', async () => {
    const users = await OneModel.read({
      filter: { $and: [{ firstName: 'firstName 1' }, { lastName: 'lastName 1' }] },
    });
    expect(users.length).toBe(1);
  });

  test('should apply filter using $or operator', async () => {
    const users = await OneModel.read({
      filter: { $or: [{ firstName: 'firstName 1' }, { lastName: 'lastName 2' }] },
    });
    expect(users.length).toBe(2);
  });

  test('should apply filter using $and operator with multiple conditions', async () => {
    const users = await OneModel.read({
      filter: { $and: [{ id: { $gte: 5 } }, { id: { $lte: 10 } }] },
    });
    expect(users.length).toBe(6);
  });

  test('should return the correct count', async () => {
    const count = await OneModel.count();
    expect(count).toBe(maxDocs);
  });

  test('should update the specified document', async () => {
    const id = 2;
    const data = { firstName: 'newFirstName', lastName: 'newLastName' };
    const result = await OneModel.update(data, { id });
    expect(result).toBe(true);
    const updatedDoc = await OneModel.read({ id });
    expect(updatedDoc).toEqual([{ id, ...data }]);
  });

  test('should update documents that match the specified filter #1', async () => {
    const data = { age: '30' };
    const filter = { firstName: { $like: 'Name 30' } };
    const result = await OneModel.update(data, { id: 30, filter });
    expect(result).toBeDefined();
    const updatedDocs = await OneModel.read({ filter });
    expect(updatedDocs).toEqual([
      { age: '30', firstName: 'firstName 30', id: 30, lastName: 'lastName 30' },
    ]);
  });

  test('should update documents that match the specified filter #2', async () => {
    const data = { age: 30 };
    const filter = { firstName: { $like: 'first' } };
    const result = await OneModel.update(data, { filter });
    expect(result).toBe(true);
    const countDocs = await OneModel.count();
    const updatedDocs = await OneModel.read({ filter });
    expect(countDocs).toBe(30);
    expect(updatedDocs.length).toBe(29);
    updatedDocs.forEach((doc) => {
      expect(doc.age).toBe(30);
    });
  });

  test('should delete the document with the specified ID', async () => {
    const id = 1;
    const result = await OneModel.delete({ id });
    expect(result).toEqual({ deletedCount: 1 });
    const doc = await OneModel.read({ id });
    expect(doc).toEqual([]);
  });
});
