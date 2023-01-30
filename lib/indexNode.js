import BaseModel from './common/model/BaseModel';
import ObservableModel from './common/model/ObservableModel';
import ServerModel from './server/model/ServerModel';
import ServerModelWrapper from './server/model/ServerModelWrapper';
import OneModelNode from './OneModelNode';
import OneStoreNode from './OneStoreNode';
import User from './common/schema/User';

// export {default as BaseModel} from './common/model/BaseModel';
// export {default as ObservableModel} from './common/model/ObservableModel';
// export {default as ServerModel} from './server/model/ServerModel';
// export {default as ServerModelWrapper} from './server/model/ServerModelWrapper';
// export {default as OneModelNode} from './OneModelNode';
// export {default as OneStoreNode} from './OneStoreNode';

globalThis.BaseModel = BaseModel;
globalThis.ObservableModel = ObservableModel;
globalThis.ServerModel = ServerModel;
globalThis.ServerModelWrapper = ServerModelWrapper;
globalThis.OneModelNode = OneModelNode;
globalThis.OneStoreNode = OneStoreNode;
globalThis.User = User;
