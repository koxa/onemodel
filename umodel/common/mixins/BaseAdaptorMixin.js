class BaseAdaptorMixin {
    static getDriver() {
        if (!this.driver) {
            throw new Error('Driver must be set first');
        }
    }

    static getCollectionName() {
        throw new Error('GetcollectionName method must be implemented un child adaptor');
    }

    static setDriver(driver) {
        this.driver = driver;
    }

    static find(params) {
        throw new Error('Find method must be implemented in child adaptor');
    }

    static findById(id) {
        throw new Error('FindById method must be implemented in child adaptor');
    }

    fetch() {
        throw new Error('Fetch method must be implemented in child adaptor');
    }

    save() {
        throw new Error('Save method must be implemented in child adaptor');
    }

    destroy() {
        throw new Error('Destroy method must be implemented in child adaptor');
    }
}

export default BaseAdaptorMixin