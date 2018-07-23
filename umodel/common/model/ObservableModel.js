import Model from "./Model";
import ObservableModelMixin from "./mixins/ObservableModelMixin";

class ObservableModel extends Model {
}

ObservableModel.addMixins([ObservableModelMixin]);

export default ObservableModel;