import {OneModel as Model} from "../src";

class CarHookAfterSet extends Model {
    static _config = {
        ...Model._config,
        props: {
            make: 'test',
            model: 'test'
        }
    }

    __hookAfterSet(prop, val) {
        this.timesSet = this.timesSet ? this.timesSet + 1 : 1;
        if (prop === 'make' || prop === 'model') {
            this.makeModel = this.make + ' ' + this.model;
        }
    }
}

class CarHookBeforeSet extends Model {
    static _config = {
        ...Model._config,
        props: {
            make: 'test',
            model: 'test',
            year: 1900
        }
    }

    __hookBeforeSet(prop, val) { // WARNING! modifying same prop while reactivity enabled will create infinite loop
        if (prop === 'year') { // making sure year is at least 1900 using the hook
            return val > 1900 ? val : 1900
        }
        return val;
    }
}

describe('test hooks', () => {
    test('model hook after set', () => {
        let car = new CarHookAfterSet({make: 'kia', model: 'optima'});
        expect(car.get('model')).toBe('optima');
        expect(car.make).toBe('kia');
        expect(car.get('makeModel')).toBe('kia optima');
        expect(car.timesSet).toBe(2);
        expect(car.set('make', 'kia')).toBe(false);
        expect(car.timesSet).toBe(2); // set hooks won't fire if value is same
        expect(car.set('seats', 5)).toBe(true);
        expect(car.timesSet).toBe(3);
    });

    test('model hook before set', () => {
        let car = new CarHookBeforeSet();
        expect(car.set('year', 2000)).toBe(true);
        expect(car.year).toBe(2000);
        expect(car.set('year', 1800)).toBe(true);
        expect(car.year).toBe(1900); // hook worked
    });
});