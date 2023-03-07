const express = require('express');
const { getQueryParams } = require('../../src/utils/node/index');
const { JsonServerModel } = require('../../dist/onemodel.common.dev');

async function UserJsonDbRouter() {
  const router = express.Router();

  class UserJson extends JsonServerModel {}
  UserJson.configure({
    idAttr: 'id',
    pathDir: 'db/json',
  });

  router.get('/api/userjson/:id', async (req, res) => {
    const { id } = req.params;
    const searchParams = getQueryParams(req);
    console.log('GET /api/userjson', { id, ...searchParams });
    const userjson = await UserJson.read({ id, ...searchParams });
    res.json(userjson);
  });

  router.get('/api/userjson', async (req, res) => {
    const searchParams = getQueryParams(req);
    console.log('GET /api/userjson', searchParams);
    const userjson = await UserJson.read(searchParams);
    res.json(userjson);
  });

  router.post('/api/userjson', async (req, res) => {
    console.log('POST /api/userjson', req.body);
    const userjson = new UserJson(req.body);
    res.json(await userjson.save());
  });

  router.put('/api/userjson/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('PUT /api/userjson', { id: _id, ...req.body });
    const userjson = new UserJson({ id: _id, ...req.body });
    res.json(await userjson.save());
  });

  router.delete('/api/userjson/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('DELETE /api/userjson', _id);
    res.json(await UserJson.deleteOne(_id));
  });

  console.log('UserJsonDbRouter Started');
  return router;
}

module.exports = UserJsonDbRouter;
