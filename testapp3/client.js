import { OneModel } from '../src';
import generateForm from "../src/helpers/html-form-helper";
(() => {
    /** Create form with table and inject it into document.body **/
    class User extends OneModel {
        static props = {
            firstName: '',
            lastName: ''
        }
    }

    document.body.innerHTML = generateForm(User);
})();