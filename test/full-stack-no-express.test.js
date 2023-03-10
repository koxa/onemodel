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
});
