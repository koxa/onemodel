class VersionableMixin {
  //todo: possible save strategoes: 'onSave' - stores version when model is saved to adaptor, 'onSet' - stores version on every set/setAll

  static getNextVersion(version) {
    return version ? ++version : 1;
  }

  getVersion() {
    return this.__version;
  }

  getVersionData(version = this.__version) {
    return this.__versionData[version];
  }

  getModifiedData() {
    //todo: maybe rename to get diff
    return this.__modified;
  }

  rollback(version = this.__version, skipHooks = false) {
    return this.setAll(this.getVersionData(version), skipHooks);
  }

  __hookAfterConstruct() {
    this.__version = this.constructor.getNextVersion();
    this.__versionData = {
      [this.__version]: this.getAll(),
    };
    this.__modified = {}; // stores props that were modified since last version
  }

  __hookAfterSet(modified, prop, val) {
    //todo: maybe separate this into onSet strategy or different mixin
    if (modified) {
      this.__modified[prop] = val;
    }
  }

  __hookAfterSave() {
    this.__version = this.constructor.getNextVersion(this.__version);
    this.__modified = {};
    this.__versionData[this.__version] = this.getAll();
  }
}

export default VersionableMixin;
