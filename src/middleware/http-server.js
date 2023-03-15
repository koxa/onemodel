import http from 'http';
import path from 'path';
import fs from 'fs/promises';
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
    staticPaths = [],
    indexFileName,
    timeout = 1500,
    onBeforeResponse,
    props,
  } = {}) {
    this.port = port;
    this.models = new Map(
      models.map((model) => {
        if (props) {
          model.configure({ ...props });
        }
        return [model.getConfig('collectionName'), model];
      }),
    );
    this.staticPaths = staticPaths;
    this.indexFileName = indexFileName;
    this.onBeforeResponse = onBeforeResponse;
    this.server = http.createServer(this.handleReqRes.bind(this));

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

  async sendStaticFile(res, url, folder) {
    try {
      const filePath = path.join(__dirname, folder, url);
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new Error('File not found');
      }
      const extname = path.extname(filePath).toLowerCase();
      const contentType =
        {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'text/javascript',
          '.png': 'image/png',
          '.jpg': 'image/jpg',
          '.json': 'application/json',
        }[extname] || 'application/json';
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT' || error.message === 'File not found') {
        return false;
      }
      this.handleError(res, error);
      return false;
    }
  }

  async checkStaticFile(url, res) {
    if (this.staticPaths.length === 0 || !url || url.includes('/api')) {
      return false;
    }
    try {
      const results = await Promise.all(
        this.staticPaths.map((folder) => {
          if (this.indexFileName && url === '/') {
            return this.sendStaticFile(res, `/${this.indexFileName}`, folder);
          }
          return this.sendStaticFile(res, url, folder);
        }),
      );
      return results.some((result) => result);
    } catch (error) {
      this.handleError(res, error);
      return false;
    }
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
  async handleReqRes(req, res) {
    try {
      const { url, method } = req;
      if (this.onBeforeResponse) {
        const result = await this.onBeforeResponse(req, res);
        if (result) {
          return;
        }
      }
      if (['__webpack_hmr', 'favicon.ico'].some((item) => url.includes(item))) {
        this.handleError(res, `File not found: ${url}`);
        return;
      }
      if (method === 'GET' && (await this.checkStaticFile(url, res))) {
        return;
      }
      const [, , collectionName, idParam] = url.split('/');
      const id = idParam ? idParam.split('?')[0] : undefined;
      const model = this.getModel(collectionName);
      const searchParams = getQueryParams(req);
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
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const doc = JSON.parse(body);
            log(doc);
            const result = await model.create(doc);
            this.handleResponse(res, result);
          } catch (error) {
            this.handleError(res, error);
          }
          break;
        }
        case 'PUT': {
          try {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const doc = JSON.parse(body);
            log(doc);
            const result = await model.update(doc, id ? { id, ...searchParams } : searchParams);
            this.handleResponse(res, result);
          } catch (error) {
            this.handleError(res, error);
          }
          break;
        }
        case 'DELETE': {
          try {
            log();
            const result = await model.deleteOne(id);
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
