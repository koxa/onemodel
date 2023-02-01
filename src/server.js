import express from 'express';
import mongo, { MongoClient } from 'mongodb';
import { createServer } from 'vite';
//import { OneModel } from '../lib/OneModelNode';
//import ServerModelWrapper from '../lib/server/model/ServerModelWrapper';
//import User from '../lib/common/schema/User';
import '../dist/onemodel.cjs';

const app = express();
const router = express.Router();

async function run() {
  const client = await MongoClient.connect('mongodb://127.0.0.1', {
    logger: console,
  });
  const DB = client.db('universal-model');

  app.use(express.static('dist'));
  app.use(express.json());

  class ServerUser extends ServerModelWrapper(User) {
    static getDriver() {
      return DB.collection(this.getCollectionName());
    }

    static db() {
      return DB;
    }

    static getMongo() {
      return mongo;
    }

    static getModelConfig() {
      return { ...super.getModelConfig(), lockProps: true };
    }

    static getDefaultProps() {
      return {
        title: undefined,
        author: undefined,
      };
    }

    static getCollectionName() {
      return 'users';
    }

    constructor() {
      super(...arguments);
    }
  }

  // class Book extends OneModel {
  //     static getDriver() {
  //         return DB.collection(this.getCollectionName());
  //     }

  //     static getMongo() {
  //         return mongo;
  //     }

  //     static getModelConfig() {
  //         return {...super.getModelConfig(), lockProps: true};
  //     }

  //     static getDefaultProps() {
  //         return {
  //             title: undefined,
  //             author: undefined
  //         }
  //     }

  //     static getCollectionName() {
  //         return 'books';
  //     }

  //     constructor() {
  //         super(...arguments);
  //     }
  // }
  /*app.route('/')
        .get((req, res) => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(indexFile);
        });*/

  app.route(`/api/${ServerUser.getCollectionName()}`).post(async (req, res) => {
    const data = req.body;
    console.log('>>> /api/users', data);
    const user = new ServerUser(data, undefined, {
      db: 'universal-model',
      mongo: ServerUser.getMongo(),
    });
    console.log(user.getFullName());
    user.save();
  });

  // app.route('/books/:id?')
  //     .get(async (req, res) => {
  //         const books = await Book.read();
  //         res.json(books);
  //     })
  //     .post(async (req, res) => {
  //         //const book = req.data();
  //         const book = new Book(req.body);
  //         res.json(await book.save());
  //     })
  //     .put(async (req, res) => {
  //         const id = req.params.id;
  //         const book = await Book.findById(id);
  //         book.setAll(req.body);
  //         res.json(await book.save());
  //     });

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base: '/',
  });
  app.use('*', router);
  app.use(vite.middlewares);

  app.listen(3001, () => {
    console.log('Mongo connected');
    console.log(`Server started at http://localhost:3001`);
  });
}

run().catch((err) => console.error(err));
