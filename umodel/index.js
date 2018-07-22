import Model from './model/Model.js';
import ServerModel from './model/ServerModel.js';
//import Store from './store/Store.js';
//import ServerStore from './store/ServerStore.js';
import UModel from "./model/UModel";

window.Model = Model;
window.ServerModel = ServerModel;
//window.Store = Store;
//window.ServerStore = ServerStore;
window.UModel = UModel;

class Book extends UModel {
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