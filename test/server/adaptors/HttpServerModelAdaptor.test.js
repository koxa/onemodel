import express from 'express';
import HttpServerModelAdaptor from '../../../src/server/model/adaptors/HttpServerModelAdaptor';

const app = express();
const port = 9334;
app.use(express.json());

/** GET **/
app.get('/test', (req, res) => {
  res.json({ name: 'test-get' });
});

/** POST **/
app.post('/test', (req, res) => {
  res.json(req.body);
});

describe('HttpServerModelAdaptor', () => {
  const params = {
    hostname: 'localhost',
    port: port,
    path: '/test',
  };

  const mockGetParams = {
    params: {
      ...params,
      method: 'GET',
    },
    data: undefined,
  };

  const mockPostParams = {
    params: {
      ...params,
      method: 'POST',
    },
    data: { text: 'test' },
  };

  let server = null;

  beforeAll(async () => {
    server = await app.listen(port, () => {});
  });

  afterAll(async () => {
    await server.close();
  });

  describe('create()', () => {
    it('should make a GET request to the specified URL and return an object with name "test-get"', async () => {
      const response = await HttpServerModelAdaptor.request(
        mockGetParams.params,
        mockGetParams.data,
      );
      expect(response).toEqual({ name: 'test-get' });
    });

    it('should correctly handle a POST request with data', async () => {
      const response = await HttpServerModelAdaptor.request(
        mockPostParams.params,
        mockPostParams.data,
      );
      expect(response).toEqual(mockPostParams.data);
    });
  });
});
