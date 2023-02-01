import BaseModel from '../model/BaseModel';

export type UserModel = {
  firstName: string;
  lastName: string;
};

export default class User extends BaseModel {
  get model() {
    return this as any as BaseModel & UserModel;
  }

  getCollectionName() {
    return 'users';
  }

  getDefaultProps() {
    return {
      firstName: '',
      lastName: '',
    };
  }

  getFullName() {
    return `${this.model.firstName} ${this.model.lastName}`;
  }
}
