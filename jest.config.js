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
    location: {
      hostname: 'localhost',
      protocol: 'http:',
    },
  },
  //testPathIgnorePatterns: ['MariaDbModelAdaptor.test.js'],
};

module.exports = settings;
