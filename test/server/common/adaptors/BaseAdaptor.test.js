import BaseAdaptor from '../../../../src/common/adaptors/BaseAdaptor';

const setMockDataToAdaptor = (adaptor, id) => {
  adaptor.getId = jest.fn(() => id);
  adaptor.getIdAttr = jest.fn(() => 'id');
  adaptor.setAll = jest.fn(() => true);
  adaptor.getConfig = jest.fn(() => ({
    idAttr: 'id',
  }));
  adaptor.getAll = jest.fn(() => ({
    id,
    firstName: `firstName${id}`,
    lastName: `lastName${id}`,
  }));
  adaptor.getAdaptorParams = jest.fn((params) => ({
    id,
    ...params,
  }));
};

describe('BaseAdaptor', () => {
  let adaptor;

  beforeAll(async () => {
    adaptor = new BaseAdaptor();
    setMockDataToAdaptor(BaseAdaptor, 1);
    setMockDataToAdaptor(adaptor, 2);
  });

  describe('create', () => {
    it('throws an error when called from the base class', () => {
      expect(() => BaseAdaptor.create()).toThrow(
        'CREATE method must be implemented in child Adaptor',
      );
    });
  });

  describe('read', () => {
    it('throws an error when called from the base class', () => {
      expect(() => BaseAdaptor.read()).toThrow('READ method must be implemented in child Adaptor');
    });
  });

  describe('readOne', () => {
    it('throws an error when called from the base class', () => {
      expect(() => BaseAdaptor.readOne()).toThrow(
        'READ_ONE method must be implemented in child Adaptor',
      );
    });
  });

  describe('update', () => {
    it('throws an error when called from the base class', () => {
      expect(() => BaseAdaptor.update()).toThrow(
        'UPDATE method must be implemented in child Adaptor',
      );
    });
  });

  describe('delete', () => {
    it('throws an error when called from the base class', () => {
      expect(() => BaseAdaptor.delete()).toThrow(
        'DELETE method must be implemented in child Adaptor',
      );
    });

    it('should return true', async () => {
      const mockUpdateResult = true;
      const updateSpy = jest.spyOn(BaseAdaptor, 'delete').mockResolvedValue(mockUpdateResult);
      const baseAdaptor = new BaseAdaptor();
      setMockDataToAdaptor(baseAdaptor, 10);
      const result = await baseAdaptor.delete();

      expect(result).toBe(mockUpdateResult);

      updateSpy.mockRestore();
    });

    it('should return an error with missing id parameter', async () => {
      let messageError = '';
      const updateSpy = jest.spyOn(BaseAdaptor, 'delete').mockResolvedValue(true);
      const baseAdaptor = new BaseAdaptor();
      setMockDataToAdaptor(baseAdaptor, undefined);
      try {
        await baseAdaptor.delete();
      } catch (err) {
        messageError = err;
      }

      expect(messageError.toString()).toBe('Error: BaseAdaptor delete: missing id parameter');

      updateSpy.mockRestore();
    });
  });

  describe('count', () => {
    it('throws an error when called from the base class', async () => {
      expect(() => BaseAdaptor.count()).toThrow(
        'COUNT method must be implemented in child Adaptor',
      );
    });
  });

  describe('fetch', () => {
    it('throws an error when id is not provided', async () => {
      await expect(adaptor.fetch({})).rejects.toThrow(
        'READ method must be implemented in child Adaptor',
      );
    });

    it('throws an error when id is not provided', async () => {
      const baseAdaptor = new BaseAdaptor();
      const mockRead = jest.spyOn(BaseAdaptor, 'read').mockImplementation(() => {});
      setMockDataToAdaptor(baseAdaptor, undefined);

      await expect(baseAdaptor.fetch({ id: undefined })).rejects.toThrow(
        'ID must be provided to fetch a model',
      );

      mockRead.mockRestore();
    });

    it('calls the read method with the id', async () => {
      const mockRead = jest.spyOn(BaseAdaptor, 'read').mockImplementation(() => {});
      await adaptor.fetch({});

      expect(mockRead).toHaveBeenCalledWith(2);

      mockRead.mockRestore();
    });
  });

  describe('save', () => {
    it('should call update method with correct parameters when ID is present', async () => {
      const mockUpdateResult = true;
      const updateSpy = jest.spyOn(BaseAdaptor, 'update').mockResolvedValue(mockUpdateResult);
      const id = 2;
      const result = await adaptor.save();

      expect(updateSpy).toHaveBeenCalledWith(
        { id, lastName: 'lastName2', firstName: 'firstName2' },
        { id },
      );
      expect(result).toEqual(mockUpdateResult);

      updateSpy.mockRestore();
    });

    it('should throw an error when update method does not return a boolean', async () => {
      const updateSpy = jest.spyOn(BaseAdaptor, 'update').mockResolvedValue({});

      await expect(adaptor.save()).rejects.toThrowError(
        'BaseAdaptor save: update must return boolean',
      );

      updateSpy.mockRestore();
    });

    it('should throw an error when create method does not return an object with modified props or ID', async () => {
      const mockCreateResult = 'not an object';
      const createSpy = jest.spyOn(BaseAdaptor, 'create').mockResolvedValue(mockCreateResult);
      const baseAdaptor = new BaseAdaptor();
      setMockDataToAdaptor(baseAdaptor, undefined);

      await expect(baseAdaptor.save()).rejects.toThrowError(
        'BaseAdaptor save: create must return object with modified props or id',
      );

      createSpy.mockRestore();
    });
  });
});
