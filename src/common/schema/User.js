import BaseModel from "../model/BaseModel";

export default class User extends BaseModel {
    
    static getDefaultProps() {
        return {
            firstName: '',
            lastName: ''
        }
    }
    
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}