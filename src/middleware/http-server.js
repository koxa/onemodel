import http from 'http';
import ObservableModel from '../common/model/ObservableModel';
import JsonServerModelAdaptor from '../server/model/adaptors/JsonServerModelAdaptor';
import { getQueryParams } from '../utils/node/index';

class OneModel extends ObservableModel {}
OneModel.addMixins([JsonServerModelAdaptor]);

/**
 * The Default OneModel HTTP Server
 * Will support basic CRUD Operations
 * Using default Adaptor
 */
class OneModelServer {
  constructor({
    port = 3000,
    models = [OneModel],
    timeout = 1500,
    bodyParse = true,
    onBeforeResponse,
    props,
  } = {}) {
    this.bodyParse = bodyParse;
    this.port = port;
    this.models = new Map(
      models.map((model) => {
        if (props) {
          model.configure({ ...props });
        }
        return [model.getConfig('collectionName'), model];
      }),
    );
    this.onBeforeResponse = onBeforeResponse;
    this.server = http.createServer(this.requestMiddleware.bind(this));

    this.sockets = {};
    this.nextSocketId = 0;
    this.server.on('connection', (socket) => {
      const socketId = this.nextSocketId++;
      this.sockets[socketId] = socket;
      socket.on('close', () => {
        delete this.sockets[socketId];
      });
      socket.setTimeout(timeout);
    });
  }

  getServer() {
    return this.server;
  }

  getModel(name) {
    const collectionName = name?.split('?')[0];
    if (!collectionName) {
      return undefined;
    }
    const model = this.models.get(collectionName.toLowerCase());
    if (!model) {
      throw new Error(`Model not found for collectionName '${collectionName}'`);
    }
    return model;
  }

  handleError(res, error, code = 500) {
    console.error(error);
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error }));
  }

  handleResponse(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  /**
   * HTTP server middleware handler
   * By Default supports basic OneModel CRUD operations
   * @param req
   * @param res
   */
  async requestMiddleware(req, res) {
    try {
      const { url, method } = req;
      if (this.onBeforeResponse) {
        const result = await this.onBeforeResponse(req, res);
        if (result) {
          return;
        }
      }
      const [, , collectionName, idParam] = url.split('/');
      const id = idParam ? idParam.split('?')[0] : undefined;
      const model = this.getModel(collectionName);
      const { options = {}, ...searchParams } = getQueryParams(req);
      if (!model) {
        return;
      }
      const log = (body) =>
        console.log(
          `${method} ${url}, id:${id}, ${JSON.stringify(searchParams)} ${
            body ? JSON.stringify(body) : ''
          }`,
        );

      switch (method) {
        case 'GET': {
          try {
            log();
            if (id === 'count') {
              return this.handleResponse(res, await model.count());
            }
            const result = await model.read(id ? { id, ...searchParams } : searchParams);
            this.handleResponse(res, result);
          } catch (error) {
            this.handleError(res, error);
          }
          break;
        }
        case 'POST': {
          try {
            let body = req.body || '';
            if (!body) {
              for await (const chunk of req) {
                body += chunk;
              }
            }
            const { isInsertMany } = options;
            const doc = this.bodyParse ? JSON.parse(body) : body;
            log(doc);
            const result = isInsertMany ? await model.insertMany(doc) : await model.create(doc);
            this.handleResponse(res, result);
          } catch (error) {
            this.handleError(res, error);
          }
          break;
        }
        case 'PUT': {
          try {
            let body = req.body || '';
            if (!body) {
              for await (const chunk of req) {
                body += chunk;
              }
            }
            const { isUpdateMany } = options;
            const doc = this.bodyParse ? JSON.parse(body) : body;
            log(doc);
            const result = isUpdateMany
              ? await model.updateMany(doc)
              : await model.update(doc, id ? { id, ...searchParams } : searchParams);
            this.handleResponse(res, result);
          } catch (error) {
            this.handleError(res, error);
          }
          break;
        }
        case 'DELETE': {
          try {
            log();
            let body = req.body || '';
            if (!body) {
              for await (const chunk of req) {
                body += chunk;
              }
            }
            const doc = body && this.bodyParse ? JSON.parse(body) : body || '';
            const { isDeleteMany } = options;
            const result =
              isDeleteMany && doc ? await model.deleteMany(doc) : await model.deleteOne(id);
            this.handleResponse(res, result);
          } catch (error) {
            this.handleError(res, error);
          }
          break;
        }
        default:
          this.handleError(res, `Method ${method} not allowed`, 405);
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  start() {
    return new Promise((resolve, reject) => {
      const listener = this.server.listen(this.port, '0.0.0.0', (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`Listening on port ${listener.address().port}`);
          resolve();
        }
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      Object.values(this.sockets).forEach((socket) => {
        socket.destroy();
      });
      this.server.close(() => {
        console.log('Server stopped');
        resolve();
      });
    });
  }
}

export default OneModelServer;
