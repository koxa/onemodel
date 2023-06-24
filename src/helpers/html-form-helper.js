import { OneModel } from "../index";

/**
 *
 * @param {OneModel} model
 */
function generateForm(model) {
  const { props } = model.getConfig();
  let out = "<form method=\"post\">";
  for (let prop in props) {
    //todo: support complex prop definitions
    out += getProp(prop, props[prop], model.get ? model.get(prop) : props[prop]); //whether instance or class
  }
  out += "<input type=\"submit\" />";
  out += "</form>";

  return out;
}

function getProp(prop, propVal, val) {
  let html = "";

  switch (typeof propVal) {
    case "string":
      html += `<input type="text" name="${prop}" value="${val}"/>`;
      break;
    case "number":
      html += `<input type="number" name="${prop}" value="${val}"/>`;
      break;
    case "object":
      if (Array.isArray(propVal)) {
        html += getPropArray(propVal);
      } else {
        html += getObject(propVal);
      }
      break;
    default:
      break;
  }

  function getPropArray(options, multiple, index) {
    let html = "";
    html += `<select ${multiple ? 'multiple' : ''}>`;
    for (let o of options) {
      html += `<option value="${o}">${o}</option>`;
    }
    html += `</select>`;
    return html;
  }

  function getObject(propVal) {
    html = '';
    let type = propVal["type"];
    if (!type) {
      // trying to determine type by available fields
      if (propVal["options"]) {
        // consider Array is options available
        type = Array;
      } else if (propVal["min"] || propVal["max"]) {
        // consider Number if min or max available
        type = Number;
      }
    }
    switch (type) {
      case String:
        break;
      case Number:
        break;
      case Array:
        html += getPropArray(propVal['options'], propVal['multiple'], propVal['index'])
        break;
    }

    return html;
  }

  return `
        <p>
          <label for="${prop}">${prop}</label>
          ${html}
        </p>
    `;
}

export default generateForm;