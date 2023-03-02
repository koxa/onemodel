import Model from '../src/client/model/ClientModel';
import http from 'http';
const { getQueryParams } = require('../src/utils/node/index');

const port = 9333;
let server;

describe('test block', () => {
  let server = null;
  let sockets = {}, nextSocketId = 0;
  server = http.createServer((req, res) => {
    if (req.method === 'GET') {
      // supporting GET tests
      res.end(JSON.stringify({ name: 'ethan' }));
    } else if (req.method === 'POST') {
      // supporting POST tests
    } else {
      throw new Error('unknown request method');
    }
  });

  /** WE MUST COLLECT SOCKETS TO DESTROY THEM LATER OTHERWISE CONNECTION HANGS **/
  server.on('connection', function (socket) {
    let socketId = nextSocketId++;
    sockets[socketId] = socket;
    socket.on('close', function () {
      delete sockets[socketId];
    });
    socket.setTimeout(4000);
  });

  beforeAll(async () => {
    Model.configure({
      idAttr: '_id',
      port,
    });
    await server.listen(port);
  });

  afterAll(async () => {
    await server.close();
    for (let socketId in sockets) {
      sockets[socketId].destroy();
    }
    await new Promise((resolve) => setTimeout(() => resolve(), 0)); // put this at the end of queue to make sure all sockets destroyed before closing tests
  });

  /*** GET TESTS ***/
  test('should read Model by id', async () => {
    const user = await Model.read({ id: 1, port });
    expect(user.name).toBe('ethan');
  });

  test('should read preconfigured Model by id', async () => {
    const user = await Model.read({ id: 1 });
    expect(user.name).toBe('ethan');
  });
  //
  // test('should filter Model', async () => {
  //   const user = await Model.read('name', 'aaron'); // key-val format
  //   expect(user.name).toBe('aaron');
  //   const user2 = await Model.read({ filter: { name: 'aaron' } }); // params object filter prop
  //   expect(user2.name).toBe('aaron');
  //   const user3 = await Model.read(1, { filter: { name: 'aaron' } }); // id and params with filter
  //   expect(user3.name).toBe('AARON');
  //   const user4 = await Model.read('name', 'aaron', { id: 1 }); // id and params with filter
  //   expect(user4.name).toBe('AARON');
  // });
});