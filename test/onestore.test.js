import fetch from 'node-fetch';
import { OneModelServer } from '../src/middleware/index';
import ClientModel from '../src/client/model/ClientModel';
import ClientStore from '../src/client/store/ClientStore';

class OneModel extends ClientModel {}

describe('test block', () => {
  let server = null;
  let port = 9444;
  const maxDocs = 30;
  const testDocs = [];

  beforeAll(async () => {
    global.fetch = fetch;

    OneModel.configure({
      port,
    });

    ClientStore.configure({
      modelClass: OneModel,
    });

    server = new OneModelServer({ port, props: { memoryDb: {} } });
    await server.start();

    /** CREATE TEST DATA */
    [...Array(maxDocs).keys()].forEach((index) => {
      const user = { firstName: `firstName ${index + 1}`, lastName: `lastName ${index + 1}` };
      if ([3, 4].includes(index + 1)) {
        user.age = 30;
      }
      testDocs.push(user);
    });

    await testDocs.reduce((prevPromise, value) => {
      return prevPromise.then(() => OneModel.create({ ...value }, {}));
    }, Promise.resolve());
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('OneStore', () => {
    let ids;
    let result;
    let resultSaveAll;

    beforeAll(async () => {
      ids = [2, 3, 4, 5, 6];
      const filter = { id: { $in: ids } };
      result = new ClientStore(...(await OneModel.read({ filter })));
    });

    test('initialize store with models', () => {
      expect(result.length).toBe(5);
      ids.forEach((id) => expect(result.find(id).id).toBe(id));
      ids.forEach((id, index) => expect(result.findIndex(id)).toBe(index));
    });

    test('push models to store', () => {
      const resultFirstLength = result.length;
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
    });

    test('remove models from store', () => {
      const idsRemove1 = [ids[0], ids[4]];
      idsRemove1.forEach((id) => result.remove(id));
      expect(result.length).toBe(8);
      idsRemove1.forEach((id) => expect(result.find(id)).not.toBeDefined());

      const nameRemove2 = ['firstNamePush2', 'firstNamePush4', 'firstName 5'];
      nameRemove2.forEach((name) => result.remove('firstName', name));
      expect(result.length).toBe(5);
    });

    test('modify models in store', () => {
      result[0].firstName = 'firstName 3 - update';
      result[1].age = 31;
      result[3].firstName = 'firstNamePush5 - update';

      expect(result[0].isModified).toBe(true);
      expect(result[1].isModified).toBe(true);
      expect(result[2].isModified).toBe(false);
      expect(result[3].isModified).toBe(true);
      expect(result[4].isModified).toBe(false);
      result.forEach((model) => expect(model instanceof result.getClassModel()).toBe(true));
    });

    test('save all models in store', async () => {
      resultSaveAll = await result.saveAll();
      expect(resultSaveAll.update).toBe(true);
      expect(resultSaveAll.deletedCount).toBe(3);
      expect(resultSaveAll.insertedCount).toBe(3);
      expect(resultSaveAll.insertedIds.length).toBe(3);
    });

    test('read and update models from OneServer', async () => {
      const readIds = [ids[1], ids[2], ...resultSaveAll.insertedIds];
      const updateResult = new ClientStore(
        ...(await OneModel.read({ filter: { id: { $in: readIds } } })),
      );

      expect(updateResult.length).toBe(5);
      readIds.forEach((id, index) => expect(updateResult[index].id).toBe(id));

      updateResult.forEach((item, index) => (item.firstName = item.firstName + index));

      updateResult.remove('firstName', 'firstNamePush32');
      updateResult.remove('firstName', 'firstNamePush64');
      expect(updateResult.length).toBe(3);
      updateResult.push({
        firstName: 'updateResultPush 1',
        lastName: 'updateResultPush 10',
      });
      expect(updateResult.length).toBe(4);
      expect(updateResult[3].firstName).toBe('updateResultPush 1');
      expect(updateResult[3] instanceof updateResult.getClassModel()).toBe(true);
      expect(updateResult.find('firstName', 'updateResultPush 1').firstName).toBe(
        'updateResultPush 1',
      );
    });
  });
});
