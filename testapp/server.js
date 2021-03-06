require('@babel/register');
require("core-js/stable");
require("regenerator-runtime/runtime");
const http = require('http');
const express = require('express');
const {OneModel} = require('../src');
const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');
const app = express();
const router = express.Router();

async function run() {
    const client = await MongoClient.connect('mongodb://127.0.0.1', {logger: console});
    const DB = client.db('universal-model');

    app.use(express.static('public'));
    app.use(express.json());

    // class Book extends OneModel {
    //     static getDriver() {
    //         return DB.collection(this.getCollectionName());
    //     }
    //
    //     static getMongo() {
    //         return mongo;
    //     }
    //
    //     static getModelConfig() {
    //         return {...super.getModelConfig(), lockProps: true};
    //     }
    //
    //     static getDefaultProps() {
    //         return {
    //             title: undefined,
    //             author: undefined
    //         }
    //     }
    //
    //     static getCollectionName() {
    //         return 'books';
    //     }
    //
    //     constructor() {
    //         super(...arguments);
    //     }
    // }
    // app.route('/')
    //     .get((req, res) => {
    //         res.
    //     })

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

    //app.use('*', router);
    console.log('Mongo connected');
    http.createServer(app).listen(3000, "0.0.0.0");
    console.log('Listening on port 3000');
}

run().catch(err => console.error(err));





