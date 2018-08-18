//import Model from './common/model/Model.js';
//import ServerModel from './server/model/ServerModel.js';
//import Store from './store/Store.js';
//import ServerStore from './store/ServerStore.js';
import {ClientModel} from "./client";

//window.Model = Model;
//window.ServerModel = ServerModel;
//window.Store = Store;
//window.ServerStore = ServerStore;
window.ClientModel = ClientModel;

class Book extends ClientModel {
    static getModelConfig() {
        return Object.assign(super.getModelConfig(), {
            strictProps: true,
            //enforceSet: true
        });
    }

    static getDefaultProps() {
        return {
            title: null,
            author: 'hui-sobachiy'
        }
    }

    static getCollectionName() {
        return 'books';
    }

    constructor() {
        super(...arguments);
    }
}

window.Book = Book;