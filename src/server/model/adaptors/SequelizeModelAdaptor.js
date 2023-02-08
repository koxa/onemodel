import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';

class SequelizeModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    db: null,
    schemas: [],
    schemasParser: {},
    idAttr: '_id',
  };

  static _firstSync = true;

  static idAttr() {
    return this.config.idAttr;
  }

  static async sync() {
    return this.config.db.sync();
  }

  static async fistSync() {
    if (this._firstSync) {
      this._firstSync = false;
      try {
        return await this.sync();
      } catch (e) {
        console.error(e);
        throw new Error('SequelizeModelAdaptor: Database synchronization error', e);
      }
    }
    return true;
  }

  static getCollection(
    collectionName = this.getConfig().collectionName ||
      (typeof this.getCollectionName !== 'undefined' && this.getCollectionName()),
  ) {
    if (!this.config.schemasParser) {
      this.config.schemasParser = {};
    }
    const { schemas, schemasParser } = this.config;
    if (!schemasParser[collectionName]) {
      schemas.forEach((schema) => {
        schemasParser[schema.name.toLocaleLowerCase()] = schema;
      });
    }
    return schemasParser[collectionName];
  }

  static async create(data, params) {
    await this.fistSync();
    const { collectionName } = this.getAdaptorParams(params);
    const collection = this.getCollection(collectionName);
    const { dataValues, isNewRecord } = await collection.create(data);
    return {
      [this.idAttr()]: dataValues[this.idAttr()],
      isNewRecord,
    };
  }

  static async read(params = {}) {
    await this.fistSync();
    const collection = this.getCollection();
    const { raw } = this.getAdaptorParams(params);
    return await collection.findAll({ ...params, raw });
  }

  static async update(data, params) {
    await this.fistSync();
    const { id } = this.getAdaptorParams(params);
    if (!id) {
      throw new Error('SequelizeModelAdaptor update: ID must be defined to update model');
    }
    let result;
    try {
      const dataUpdate = structuredClone(data);
      delete dataUpdate[this.idAttr()];
      result = await this.getCollection().update(dataUpdate, { where: { [this.idAttr()]: id } });
    } catch (err) {
      throw new Error('SequelizeModelAdaptor update: error during update: ' + err.toString());
    }
    if (result.length) {
      return true;
    }

    throw new Error('SequelizeModelAdaptor update: Array result must not be empty');
  }

  static async deleteOne(id) {
    await this.fistSync();
    const result = await this.getCollection().destroy({
      where: { [this.idAttr()]: id },
    });

    return {
      deletedCount: result,
    };
  }

  static getAdaptorParams({ id, collectionName = this.getConfig().collectionName, raw = true }) {
    return {
      id,
      collectionName,
      raw,
    };
  }

  getAdaptorParams({
    id = this.getId(),
    collectionName = this.getConfig().collectionName,
    raw = true,
  }) {
    return {
      id,
      collectionName,
      raw,
    };
  }
}

export default SequelizeModelAdaptor;
