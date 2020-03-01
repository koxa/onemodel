import BaseModel from "./BaseModel";
import ObservableModelMixin from "./mixins/ObservableModelMixin";

class ObservableModel extends BaseModel {
}

ObservableModel.addMixins([ObservableModelMixin]);

export default ObservableModel;