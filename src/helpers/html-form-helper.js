import {OneModel} from '../index';

/**
 *
 * @param {OneModel} model
 */
function generateForm(model) {
    const {props} = model.getConfig();
    let out = '<form method="post">';
    for (let prop in props) {
        //todo: support complex prop definitions
        let val = props[prop];
        out += `<p>
            <label for="${prop}">${prop}</label>
            <input type="text" name="${prop}" value="${val}"/>
        </p>`;
    }
    out+= '<input type="submit" value="Add"/>';
    out+= '</form>';

    return out;
}

export default generateForm;