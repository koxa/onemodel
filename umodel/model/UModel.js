import Model from "./Model";
import ObservableModelMixin from "./mixins/ObservableModelMixin";

class UModel extends Model {
    constructor() {
        super(...arguments);
    }
}

UModel.addMixins([ObservableModelMixin]);

export default UModel;