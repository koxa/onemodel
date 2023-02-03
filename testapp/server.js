const { OneModel } = require('../dist/onemodel.common.dev');
const createServer = require('./server/express');

createServer().then(({ app, mongodb, db }) => {
  OneModel.configure({
    db: db,
    mongo: mongodb,
  });

  class User extends OneModel {}

  app.get('/api/user', async (req, res) => {
    console.log('GET /api/user');
    const user = await User.read();
    res.json(user);
  });

  app.post('/api/user', async (req, res) => {
    console.log('POST /api/user', req.body);
    const user = new User(req.body);
    res.json(await user.save());
  });

  app.put('/api/user/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('PUT /api/user', _id, req.body);
    const user = new User({ _id, ...req.body });
    res.json(await user.save());
  });

  app.delete('/api/user/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('DELETE /api/user', _id);
    res.json(await User.deleteOne(_id));
  });

  console.log('Server Started');
});
