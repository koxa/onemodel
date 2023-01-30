import BaseModel from "../model/BaseModel";

export default class User extends BaseModel {
    
    firstName: string;
    lastName: string;

    constructor(...props) {
        super(...props);
        this.firstName = '';
        this.lastName = '';
    }
    
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