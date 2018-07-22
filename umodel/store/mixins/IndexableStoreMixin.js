class IndexableStoreMixin {
    static getIndexes() {
        throw new Error('GetIndexes must be implemented in child class');
    }

    // static getIndexes() {
    //     return [
    //         {field: '_id', type: Model.INDEX_PRIMARY}
    //     ]
    // }
}

export default IndexableStoreMixin;