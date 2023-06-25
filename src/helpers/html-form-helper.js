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
    out += getProp(prop, props[prop], model.get ? model.get(prop) : undefined); //whether instance or class
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
        html += getPropArray(prop, propVal, false, val);
      } else {
        html += getObject(prop, propVal, val);
      }
      break;
    default:
      break;
  }

  function getPropArray(name, options, multiple, val) {
    let html = "";
    html += `<select name="${name}" ${multiple ? 'multiple' : ''}>`;
    for (let i = 0; i < options.length; i++) {
      let v = options[i];
      let selected = '';
      if (val) {
        if (Array.isArray(val) && val.includes(v) || val === v) {
          selected = "selected";
        }
      }
      html += `<option value="${v}" ${selected}>${v}</option>`;
    }
    html += `</select>`;
    return html;
  }

  function getObject(name, propVal, val) {
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
        html += `<input type="number" name="${name}" value="${val || propVal['value'] || ''}" min="${propVal['min']}" max="${propVal['max']}"/>`;
        break;
      case Array:
        html += getPropArray(name, propVal['options'], propVal['multiple'], val || propVal['value'])
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