global.window = {}; // simulate window here
import {OneModel as Model} from '../src';
import express from 'express';

const app = express();
const port = 9333

/** POST **/
app.post('/api/onemodel', (req, res) => {
    //save onemodel
    res.status(200).json({name: 'john'});
});

app.post('/api/user', (req, res) => {
    //save user
    res.status(200).json({name: 'michael'});
});

/** GET **/
app.get('/api/onemodel/1', (req, res) => {
    //read user by ID 1
    if (req.query && req.query.name) { // for filter test
        res.status(200).json({name: req.query.name.toUpperCase()});
    } else { // for read tests
        res.status(200).json({name: 'ethan'});
    }
});

app.get('/api/onemodel', (req, res) => {
    // find user by name using filter (querystring)
    if (req.query && req.query.name) {
        res.status(200).json({name: req.query.name});
    }
})

describe('test block', () => {
    let server = null;

    beforeAll(async () => {
        server = await app.listen(port, () => {});
    });

    afterAll(async () => {
        await server.close();
    });

    /*** GET TESTS ***/
    test('should read Model by id', async() => {
       const user = await Model.read({id: 1, port});
       expect(user.name).toBe('ethan');
    });

    test('should read preconfigured Model by id', async() => {
        Model.configure({port});
        const user = await Model.read({id: 1});
        expect(user.name).toBe('ethan');
    });

    test('should filter Model', async() => {
        Model.configure({port});
        const user = await Model.read('name', 'aaron'); // key-val format
        expect(user.name).toBe('aaron');
        const user2 = await Model.read({filter: {name: 'aaron'}}); // params object filter prop
        expect(user2.name).toBe('aaron');
        const user3 = await Model.read(1, {filter: {name: 'aaron'}}); // id and params with filter
        expect(user3.name).toBe('AARON');
        const user4 = await Model.read('name', 'aaron', {id: 1}); // id and params with filter
        expect(user4.name).toBe('AARON');
    });


    /*** POST TESTS ***/
    test('should save model via http adaptor, port configured on model instance', async () => {
        const user = new Model({name: 'John'}, {}, {port});
        expect(user.name).toBe('John');
        await user.save();
        expect(user.name).toBe('john');
    });

    test('should save model via http adaptor, port configured on save', async () => {
        const user = new Model({name: 'John'});
        expect(user.name).toBe('John');
        await user.save({port});
        expect(user.name).toBe('john');
    });

    test('should save User model via http adaptor', async () => {
        class User extends Model {}
        const user = new User({name: 'John'});
        expect(user.name).toBe('John');
        await user.save({port});
        expect(user.name).toBe('michael');
    });

    test('should save User model via http adaptor with converter', async () => {
        class User extends Model {
            static _config = {
                ...Model._config,
                converters: {  // converter kicks in after validator
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

});