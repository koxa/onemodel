const express = require('express');
const mariadb = require('mariadb');
const db = mariadb.createPool({
  host: 'localhost',
  database: 'onemodel',
  user: 'root',
  password: 'root',
  port: 3306,
});

const { ServerMariaDbModel } = require('../../dist/onemodel.common.dev');

async function bookMariaDbRouter() {
  const router = express.Router();

  class Book extends ServerMariaDbModel {}
  Book.configure({
    db,
    idAttr: 'id',
    props: {
      title: { type: 'String', value: '' },
      comment: 'default comment',
    },
  });

  router.get('/api/book', async (req, res) => {
    console.log('GET /api/book');
    const book = await Book.read();
    res.json(book);
  });

  router.post('/api/book', async (req, res) => {
    console.log('POST /api/book', req.body);
    const book = new Book(req.body);
    res.json(await book.save());
  });

  router.put('/api/book/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('PUT /api/book', _id, req.body);
    const book = new Book({ id: _id, ...req.body });
    res.json(await book.save());
  });

  router.delete('/api/book/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('DELETE /api/book', _id);
    res.json(await Book.deleteOne(_id));
  });

  console.log('BookMariaDbRouter Started');
  return router;
}

module.exports = bookMariaDbRouter;
