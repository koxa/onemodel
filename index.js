'use strict';

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/onemodel.js');
} else {
    module.exports = require('./dist/onemodel.development.js');
}