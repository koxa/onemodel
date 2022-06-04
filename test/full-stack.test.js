global.window = {}; // simulate window here
import {OneModel as Model} from '../src';
import express from 'express';

const app = express();
const port = 9333

app.post('/api/onemodel', (req, res) => {
    //save onemodel
    res.status(200).json({name: 'john'});
});

app.post('/api/user', (req, res) => {
    //save user
    res.status(200).json({name: 'michael'});
});

app.get('/api/onemodel/1', (req, res) => {
    //read user by ID 1
    res.status(200).json({name: 'ethan'});
});

describe('test block', () => {
    let server = null;

    beforeEach(async () => {
        server = await app.listen(port, () => {});
    });

    afterEach(async () => {
        await server.close();
    });

    test('should save model via http adaptor', async () => {
        const user = new Model({name: 'John'});
        expect(user.name).toBe('John');
        const resp = await user.save({port});
        expect(user.name).toBe('john');
    });

    test('should save User model via http adaptor', async () => {
        class User extends Model {}
        const user = new User({name: 'John'});
        expect(user.name).toBe('John');
        const resp = await user.save({port});
        expect(user.name).toBe('michael');
    });

    test('should read Model by id', async() => {
       const user = await Model.read({id: 1, port});
       expect(user.name).toBe('ethan');
    });

    test('should save User model via http adaptor with converter', async () => {
        class User extends Model {
            static getConverters() { // converter kicks in after validator
                return {
                    name: (val) => {
                        return val.toUpperCase();
                    }
                }
            }
        }
        const user = new User({name: 'John'});
        expect(user.name).toBe('JOHN');
        const resp = await user.save({port});
        expect(user.name).toBe('MICHAEL');
    });

    test('should read preconfigured Model by id', async() => {
        Model.configure({port});
        const user = await Model.read({id: 1});
        expect(user.name).toBe('ethan');
    });

});