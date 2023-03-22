import 'jsdom-global/register';
import fetch from 'node-fetch';
import { OneModelSocketServer } from '../src/middleware';
import ClientSocketModel from '../src/client/model/ClientSocketModel';
global.WebSocket = require('ws');
class OneModel extends ClientSocketModel {}

describe('test block', () => {
  let server = null;
  let port = 9337;
  const maxDocs = 30;
  const testDocs = [];
  const testUser1 = { id: 1, firstName: 'firstName 1', lastName: 'lastName 1' };

  beforeAll(async () => {
    global.fetch = fetch;

    OneModel.configure({
      hostname: 'localhost',
      port,
    });

    server = new OneModelSocketServer({ port, props: { memoryDb: {} } });
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
    expect(JSON.parse(JSON.stringify(user))).toEqual([testUser1]);
  });

  test('should read all documents in the collection', async () => {
    const users = await OneModel.read();
    expect(users.length).toBe(maxDocs);
  });

  test('should filter Model', async () => {
    const user = await OneModel.read('firstName', 'firstName 1'); // key-val format
    expect(JSON.parse(JSON.stringify(user))).toEqual([testUser1]);
    const user2 = await OneModel.read({ filter: { firstName: 'firstName 1' } }); // params object filter prop
    expect(JSON.parse(JSON.stringify(user2))).toEqual([testUser1]);
    const user3 = await OneModel.read(1, { filter: { firstName: 'firstName 1' } }); // id and params with filter
    expect(JSON.parse(JSON.stringify(user3))).toEqual([testUser1]);
    const user4 = await OneModel.read('firstName', 'lastName 1', { id: 1 }); // id and params with filter
    expect(JSON.parse(JSON.stringify(user4))).toEqual([testUser1]);
  });

  test('should select specific columns', async () => {
    const users = await OneModel.read({ columns: { firstName: 1, lastName: 0 } });
    expect(users[0]).toEqual({ firstName: testDocs[0].firstName });
  });

  test('should apply filter using $eq operator', async () => {
    const users = await OneModel.read({ filter: { firstName: { $eq: 'firstName 1' } } });
    expect(JSON.parse(JSON.stringify(users))).toEqual([testUser1]);
  });

  test('should apply filter using $in operator', async () => {
    const users = await OneModel.read({
      filter: { firstName: { $in: ['firstName 1', 'firstName 2'] } },
    });
    expect(users.length).toBe(2);
  });

  test('should apply filter using $like operator', async () => {
    const users = await OneModel.read({ filter: { firstName: { $like: 'Name 1' }, id: 1 } });
    expect(JSON.parse(JSON.stringify(users))).toEqual([testUser1]);
  });

  test('should apply multiple filters using $and operator', async () => {
    const users = await OneModel.read({
      filter: { $and: [{ firstName: 'firstName 1' }, { lastName: 'lastName 1' }] },
    });
    expect(JSON.parse(JSON.stringify(users))).toEqual([testUser1]);
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
    expect(JSON.parse(JSON.stringify(users))).toEqual([
      { id: 1, firstName: 'firstName 1', lastName: 'lastName 1' },
    ]);
  });

  test('should apply multiple options #2', async () => {
    const users = await OneModel.read({
      filter: {
        firstName: { $in: ['firstName 10', 'firstName 1', 'firstName 30', 'firstName 15'] },
      },
      sort: { firstName: -1 },
      limit: 1,
    });
    expect(JSON.parse(JSON.stringify(users))).toEqual([
      { id: 30, firstName: 'firstName 30', lastName: 'lastName 30' },
    ]);
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
    expect(JSON.parse(JSON.stringify(updatedDoc))).toEqual([{ id, ...data }]);
  });

  test('should update documents that match the specified filter #1', async () => {
    const data = { age: '30' };
    const filter = { firstName: { $like: 'Name 30' } };
    const result = await OneModel.update(data, { id: 30, filter });
    expect(result).toBeDefined();
    const updatedDocs = await OneModel.read({ filter });
    expect(JSON.parse(JSON.stringify(updatedDocs))).toEqual([
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
    expect(doc.length).toBe(0);
  });

  test('ArrayModelReturns', async () => {
    const ids = [8, 9, 10, 11, 12];
    const filter = { id: { $in: ids } };
    const result = await OneModel.read({ filter });
    const resultFirstLength = result.length;
    expect(resultFirstLength).toBe(5);

    ids.forEach((id) => expect(result.find(id).id).toBe(id));
    ids.forEach((id, index) => expect(result.findIndex(id)).toBe(index));

    ids.forEach((id) =>
      result.push({
        firstName: `firstNamePush${id}`,
        lastName: `lastNamePush${id}`,
      }),
    );
    expect(result.length).toBe(resultFirstLength + ids.length);

    ids.forEach((id) =>
      expect(result.find('firstName', `firstNamePush${id}`).firstName).toBe(`firstNamePush${id}`),
    );

    const idsRemove1 = [ids[0], ids[4]];
    idsRemove1.forEach((id) => result.remove(id));
    expect(result.length).toBe(8);
    idsRemove1.forEach((id) => expect(result.find(id)).not.toBeDefined());

    const nameRemove2 = ['firstNamePush8', 'firstNamePush10', 'firstName 9'];
    nameRemove2.forEach((name) => result.remove('firstName', name));
    expect(result.length).toBe(5);

    expect(JSON.parse(JSON.stringify(result))).toEqual([
      { age: 30, firstName: 'firstName 10', id: 10, lastName: 'lastName 10' },
      { age: 30, firstName: 'firstName 11', id: 11, lastName: 'lastName 11' },
      { firstName: 'firstNamePush9', lastName: 'lastNamePush9' },
      { firstName: 'firstNamePush11', lastName: 'lastNamePush11' },
      { firstName: 'firstNamePush12', lastName: 'lastNamePush12' },
    ]);

    result[0].firstName = 'firstName 10 - update';
    result[1].age = 31;
    result[3].firstName = 'firstNamePush11 - update';

    expect(result[0].isModified).toBe(true);
    expect(result[1].isModified).toBe(true);
    expect(result[2].isModified).toBe(false);
    expect(result[3].isModified).toBe(true);
    expect(result[4].isModified).toBe(false);

    expect(JSON.parse(JSON.stringify(result))).toEqual([
      { age: 30, firstName: 'firstName 10 - update', id: 10, lastName: 'lastName 10' },
      { age: 31, firstName: 'firstName 11', id: 11, lastName: 'lastName 11' },
      { firstName: 'firstNamePush9', lastName: 'lastNamePush9' },
      { firstName: 'firstNamePush11 - update', lastName: 'lastNamePush11' },
      { firstName: 'firstNamePush12', lastName: 'lastNamePush12' },
    ]);

    const resultSaveAll = await result.saveAll();
    expect(resultSaveAll.update).toBe(true);
    expect(resultSaveAll.deletedCount).toBe(3);
    expect(resultSaveAll.insertedCount).toBe(3);
    expect(resultSaveAll.insertedIds.length).toBe(3);

    const readIds = [ids[2], ids[3], ...resultSaveAll.insertedIds];
    const updateResult = await OneModel.read({ filter: { id: { $in: readIds } } });
    expect(updateResult.length).toBe(5);

    readIds.forEach((id, index) => expect(updateResult[index].id).toBe(id));

    expect(updateResult[0].firstName).toBe('firstName 10 - update');
    expect(updateResult[1].age).toBe(31);
    expect(updateResult[2].firstName).toBe('firstNamePush9');
    expect(updateResult[3].firstName).toBe('firstNamePush11 - update');
    expect(updateResult[4].firstName).toBe('firstNamePush12');
    expect(updateResult[5]).not.toBeDefined();

    expect(updateResult.params).toEqual({
      mixed1: { filter: { id: { $in: readIds } } },
      mixed2: undefined,
      mixed3: undefined,
    });
    expect(updateResult.model).toBeDefined();

    updateResult.forEach((item, index) => (item.firstName = item.firstName + index));
    expect(updateResult[0].firstName).toBe('firstName 10 - update0');
    expect(updateResult[1].firstName).toBe('firstName 111');
    expect(updateResult[2].firstName).toBe('firstNamePush92');
    expect(updateResult[3].firstName).toBe('firstNamePush11 - update3');
    expect(updateResult[4].firstName).toBe('firstNamePush124');
    updateResult.forEach((item) => expect(item.isModified).toBe(true));
    updateResult.remove('firstName', 'firstNamePush92');
    updateResult.remove('firstName', 'firstNamePush124');
    expect(updateResult.length).toBe(3);
    updateResult.push({
      firstName: 'updateResultPush 1',
      lastName: 'updateResultPush 10',
    });
    expect(updateResult.length).toBe(4);
    expect(updateResult[3].firstName).toBe('updateResultPush 1');
    expect(updateResult.find('firstName', 'updateResultPush 1').firstName).toBe(
      'updateResultPush 1',
    );

    await updateResult.restore();
    expect(updateResult.length).toBe(5);
    readIds.forEach((id, index) => expect(updateResult[index].id).toBe(id));
    expect(updateResult[0].firstName).toBe('firstName 10 - update');
    expect(updateResult[1].age).toBe(31);
    expect(updateResult[2].firstName).toBe('firstNamePush9');
    expect(updateResult[3].firstName).toBe('firstNamePush11 - update');
    expect(updateResult[4].firstName).toBe('firstNamePush12');
    expect(updateResult[5]).not.toBeDefined();
    updateResult.forEach((item) => expect(item.isModified).toBe(false));
  });
});
