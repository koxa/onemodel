import ObservableMixin from '../../../src/common/model/mixins/ObservableMixin.js';

describe('ObservableMixin', () => {
  describe('constructor', () => {
    test('should create instance of ObservableMixin', () => {
      const observable = new ObservableMixin();
      expect(observable).toBeInstanceOf(ObservableMixin);
    });

    test('should set __muted to false by default', () => {
      const observable = new ObservableMixin();
      expect(observable.__muted).toBe(false);
    });
  });

  describe('mute', () => {
    test('should set __muted to true', () => {
      const observable = new ObservableMixin();
      observable.mute();
      expect(observable.__muted).toBe(true);
    });
  });

  describe('unMute', () => {
    test('should set __muted to false', () => {
      const observable = new ObservableMixin();
      observable.mute();
      observable.unMute();
      expect(observable.__muted).toBe(false);
    });
  });

  describe('getEvents', () => {
    test('should throw an error', () => {
      expect(() => ObservableMixin.getEvents()).toThrowError(
        'At least one event must be defined in observable class',
      );
    });
  });
});
