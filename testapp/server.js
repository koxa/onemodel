require('@babel/register');
require("core-js/stable");
require("regenerator-runtime/runtime");
const http = require('http');
const fs = require('fs').promises;
const express = require('express');
// const {OneModel} = require('../src');
const User = require('../src/common/schema/User').default;
const ServerModelWrapper = require('../src/server/model/ServerModelWrapper').default;
const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');
const app = express();
const router = express.Router();

async function run() {
    let indexFile;
    const client = await MongoClient.connect('mongodb://127.0.0.1', {logger: console});
    const DB = client.db('universal-model');

    app.use(express.static('public'));
    app.use('/src', express.static('src'));
    app.use('/dist', express.static('dist'));
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
            return {...super.getModelConfig(), lockProps: true};
        }
    
        static getDefaultProps() {
            return {
                title: undefined,
                author: undefined
            }
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
    app.route('/')
        .get((req, res) => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(indexFile);
        });

    app.route('/api/clientuser')
        .post(async (req, res) => {
            const data = req.body;
            console.log('>>> /api/clientuser', data);
            const user = new ServerUser(data,undefined, {
                db: 'universal-model',
                mongo: ServerUser.getMongo()
            });
            console.log(user.getFullName());
            user.save();
    })

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

    app.use('*', router);
    console.log('Mongo connected');
    const server = http.createServer(app); //.listen(3000, "0.0.0.0");
    
    fs.readFile(__dirname + "/index.html")
        .then(contents => {
            indexFile = contents;
            server.listen(3000, "0.0.0.0", () => {
                console.log('Listening on port 3000');
            });
        })
        .catch(err => {
            console.error(`Could not read index.html file: ${err}`);
            process.exit(1);
        });
    // console.log('Listening on port 3000');   
}

run().catch(err => console.error(err));





