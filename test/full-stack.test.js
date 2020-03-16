global.window = {}; // simulate window here
import {Model} from '../src';
import express from 'express';

const app = express();

app.get('/', function(req, res) {
    res.status(200).json({ name: 'john' });
});

describe('full stack test', () => {
    test('some', () => {
        const user = new Model({name: 'John'});
        user.save();
    })
});