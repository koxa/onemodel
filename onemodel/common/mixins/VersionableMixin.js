class VersionableMixin {

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
        return this.__modified;
    }


    rollback(version = this.__version, skipHooks = false) {
        return this.setAll(this.getVersionData(version), skipHooks);
    }

    __hookAfterConstruct() {
        this.__version = this.constructor.getNextVersion();
        this.__versionData = {
            [this.__version]: this.getData()
        };
        this.__modified = {}; // stores props that were modified since last version
    }

    __hookAfterSet(modified, prop, val) {
        if (modified) {
            this.__modified[prop] = val;
        }
    }

    __hookAfterSave() {
        this.__version = this.constructor.getNextVersion(this.__version);
        this.__modified = {};
        this.__versionData[this.__version] = this.getData();
    }


}

export default VersionableMixin