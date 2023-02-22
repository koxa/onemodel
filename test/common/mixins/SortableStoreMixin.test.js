import SortableStoreMixin from '../../../src/common/store/mixins/SortableStoreMixin';

describe('SortableStoreMixin', () => {
  describe('sort', () => {
    it('should be defined and be a function', () => {
      const sortableStoreMixin = new SortableStoreMixin();
      expect(sortableStoreMixin.sort).toBeDefined();
      expect(typeof sortableStoreMixin.sort).toBe('function');
    });

    it('should sort the items in ascending order by default', () => {
      const sortableStoreMixin = new SortableStoreMixin();
      sortableStoreMixin.items = [3, 2, 1];
      sortableStoreMixin.sort();
      expect(sortableStoreMixin.items).toEqual([1, 2, 3]);
    });

    it('should sort the items in descending order when dir is set to false', () => {
      const sortableStoreMixin = new SortableStoreMixin();
      sortableStoreMixin.items = [1, 2, 3];
      sortableStoreMixin.sort(false);
      expect(sortableStoreMixin.items).toEqual([3, 2, 1]);
    });

    it('should return same thing if both aa and bb are undefined', () => {
      const sortableStoreMixin = new SortableStoreMixin();
      sortableStoreMixin.items = [{ id: undefined }, { id: undefined }];
      expect(sortableStoreMixin.sort(true, 'id').items).toBe(sortableStoreMixin.items);
    });

    it('should sort the items based on the key parameter if provided', () => {
      const sortableStoreMixin = new SortableStoreMixin();
      sortableStoreMixin.items = [
        { name: 'John', age: 25 },
        { name: 'Mary', age: 30 },
        { name: 'Bob', age: 20 },
      ];
      sortableStoreMixin.sort(true, 'age');
      expect(sortableStoreMixin.items).toEqual([
        { name: 'Bob', age: 20 },
        { name: 'John', age: 25 },
        { name: 'Mary', age: 30 },
      ]);
    });

    it('should sort the items based on the items themselves if no key parameter is provided', () => {
      const sortableStoreMixin = new SortableStoreMixin();
      sortableStoreMixin.items = [3, 2, 1];
      sortableStoreMixin.sort();
      expect(sortableStoreMixin.items).toEqual([1, 2, 3]);
    });

    it('should return same thing if aa is equal to bb', () => {
      const sortableStoreMixin = new SortableStoreMixin();
      sortableStoreMixin.items = [
        { name: 'John', age: 25 },
        { name: 'Mary', age: 25 },
        { name: 'Bob', age: 25 },
      ];
      sortableStoreMixin.sort(true, 'age');
      expect(sortableStoreMixin.items).toEqual([
        { name: 'John', age: 25 },
        { name: 'Mary', age: 25 },
        { name: 'Bob', age: 25 },
      ]);
    });
  });
});
