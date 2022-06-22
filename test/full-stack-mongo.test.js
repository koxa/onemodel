import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import {OneModel as Model} from '../src';
import {BaseModel} from '../src';
import express from 'express';
import MongoServerModelAdaptor from "../src/server/model/adaptors/MongoServerModelAdaptor";
const app = express();
const port = 9333;

class MongoModel extends BaseModel{}
MongoModel.addMixins([MongoServerModelAdaptor]);

/** POST **/
app.post('/api/onemodel',async (req, res) => {
    //save onemodel to mongo
    try {
        const john = new MongoModel(req.data);
        await john.save();
    } catch (err) {
        console.log(err);
    }
    res.status(200).json({name: 'JOHN saved'});
});

app.post('/api/user', (req, res) => {
    //save user
    res.status(200).json({name: 'michael'});
});

describe('test block', () => {
    let httpServer;
    let con;
    let mongoServer;
    let db;

    beforeAll(async () => {
        httpServer = await app.listen(port, () => {});

        /** STAR MONGO MEMORY SERVER **/
        mongoServer = await MongoMemoryServer.create();
        con = await MongoClient.connect(mongoServer.getUri(), {});
        db = con.db(mongoServer.instanceInfo.dbName);

        /** CONFIGURE MODEL TO USE MONGO **/
        MongoModel.configure({mongo: MongoClient, db: db});
    });

    afterAll(async () => {
        if (con) {
            await con.close();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it('should successfully set & get information from the database', async () => {
        expect(db).toBeDefined();
        const col = db.collection('test');
        const result = await col.insertMany([{ a: 1 }, { b: 1 }]);
        expect(result.insertedCount).toStrictEqual(2);
        expect(await col.countDocuments({})).toBe(2);
    });

    // beforeAll(async () => {
    //     httpServer = await app.listen(port, () => {});
    //
    //     /** STAR MONGO MEMORY SERVER **/
    //     mongoServer = await MongoMemoryServer.create();
    //     mongoConnection = await MongoClient.connect(mongoServer.getUri(), {});
    //     db = mongoConnection.db(mongoServer.instanceInfo.dbName);
    //
    //     /** CONFIGURE MODEL TO USE MONGO **/
    //     MongoModel.configure({mongo: MongoClient, driver: db});
    //
    //     /** CONFIGURE CLIENT MODEL **/
    //     Model.configure({port}); // preconfigure port for all tests
    // });
    //
    // afterAll(async () => {
    //     await httpServer.close();
    //     if (mongoConnection) {
    //         await mongoConnection.close();
    //     }
    //     if (mongoServer) {
    //         await mongoServer.stop();
    //     }
    // });
    //
    // test('should save model to mongo', async ()  => {
    //     const user = new Model({name: 'John'});
    //     await user.save();
    //     expect(user.name).toBe('JOHN saved');
    // });
});

