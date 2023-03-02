import http from 'http';
import { OneModel } from "../index";

/**
 * The Default OneModel HTTP Server
 * Will support basic CRUD Operations
 * Using default Adaptor
 */
class OneModelServer {
  constructor(port = 3000, model = OneModel) {
    this.port = port;
    this.model = model;
    this.sockets = {};
    this.nextSocketId = 0;
    this.server = http.createServer(this.handleReqRes);
    this.server.on('connection', function (socket) {
      let socketId = this.nextSocketId++;
      this.sockets[socketId] = socket;
      socket.on('close', () => delete this.sockets[socketId]);
      socket.setTimeout(1000);
    });
  }

  /**
   * HTTP server middleware handler
   * By Default supports basic OneModel CRUD operations
   * @param req
   * @param res
   */
  handleReqRes(req, res) {
    switch(req.method) {
      case 'GET':
        // this.model.read()
        break;
      case 'POST':
        // this.model.update()
        break;
      case 'PUT':
        // this.model.create();
        break;
      case 'DELETE':
        // this.model.delete();
        break;
      default:
        throw new Error('Unknown HTTP method was used: ' + req.method);
    }
  }

  async start() {
    await this.server.listen(this.port);
  }
}

export default OneModelServer;