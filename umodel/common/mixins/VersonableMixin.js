class VersonableMixin {


    getVersion() {

    }

    rollback() {

    }

    __hookAfterConstruct(data) {
        this.__version = 1;
        this.__versionData = {
            '1':
        }
    }


}

export default VersonableMixin