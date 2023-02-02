const { OneModel } = require('../dist/onemodel.common.dev');
const createServer = require('./express');

createServer().then(({ app, mongodb, db }) => {
  OneModel.configure({
    db: db,
    mongo: mongodb,
    //collectionName: 'user'
  });

  app.post('/api/user', async (req, res) => {
    console.log('POST /api/user', req.body);
    const user = new OneModel(req.body, undefined, {
      collectionName: 'user',
    });
    res.json(await user.save());
  });

  app.get('/api/user', async (req, res) => {
    console.log('GET /api/user');
    const user = await OneModel.readOne('lastName', 'Money1');
    res.json(user);
  });

  console.log('Server Started');
});
