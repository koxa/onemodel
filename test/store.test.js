import {OneStore as Store, OneModel as Model} from '../src';

class MyModel extends Model {
    static getProps() {
        return {make: 'toyota', model: 'camry'}
    }
}

class MyStore extends Store {
    static getModelClass() {
        return MyModel;
    }
}

describe('testing store basics', () => {
    test('store constructor', () => {
        const s = new Store(1, 2, 3, 4, 5);
        expect(s[0]).toBe(1);
        s.push(6);
        expect(s[5]).toBe(6);
    });
    test('store constructor with objects', () => {
        const s = new MyStore({}, {});
        expect(s[0].make).toBe('toyota');
        expect(s[1].make).toBe('toyota');
    });
    test('store with model constructor', () => {
        const s = new MyStore();
        s.push({}, {});
        expect(s[0].make).toBe('toyota');
    });
});