global.window = {}; // simulate window here
import {OneModel as Model} from '../src';
import express from 'express';

const app = express();
const port = 9333

app.post('/api/onemodel', function (req, res) {
    res.status(200).json({name: 'john'});
});

describe('test block', () => {
    let server = null;

    beforeEach(async () => {
        server = await app.listen(port, () => console.log('Listening on port ' + port));
    });

    afterEach(async () => {
        await server.close();
    });

    test('should pass the test', async () => {
        const user = new Model({name: 'John'});
        expect(user.name).toBe('John');
        const resp = await user.save({port});
        expect(user.name).toBe('john');
    });
});