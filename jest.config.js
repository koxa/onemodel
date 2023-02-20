/** @type {import('jest').Config} */
const settings = {
  globals: {
    config: {
      mariadb: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'onemodel',
      },
    },
  },
};

module.exports = settings;
