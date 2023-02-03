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

  app.put('/api/user', async (req, res) => {
    const { id, value } = req.body;
    console.log('PUT /api/user', id, value);
    res.json(await User.update(value, { id }));
  });

  app.delete('/api/user/:id', async (req, res) => {
    const { id } = req.params;
    console.log('DELETE /api/user', id);
    res.json(await User.deleteOne(id));
  });

  console.log('Server Started');
});
