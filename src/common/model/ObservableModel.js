import BaseModel from './BaseModel.js';
import ObservableModelMixin from './mixins/ObservableModelMixin.js';

class ObservableModel extends BaseModel {}

ObservableModel.addMixins([ObservableModelMixin]);

export default ObservableModel;
