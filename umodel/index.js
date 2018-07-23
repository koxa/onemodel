import Model from './common/model/Model.js';
import ServerModel from './server/model/ServerModel.js';
//import Store from './store/Store.js';
//import ServerStore from './store/ServerStore.js';
import ClientModel from "./client/model/ClientModel";

window.Model = Model;
window.ServerModel = ServerModel;
//window.Store = Store;
//window.ServerStore = ServerStore;
window.ClientModel = ClientModel;

class Book extends ClientModel {
    static getDefaultProps() {
        return {
            title: null,
            authorId: null
        }
    }

    constructor() {
        super(...arguments);
    }
}

window.Book = Book;