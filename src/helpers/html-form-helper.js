import { OneModel } from "../index.js";
import { isClass } from "../utils/index.js";

/**
 *
 * @param {OneModel} model
 */
function generateForm(model, errors = {}) {
  let isModelClass = isClass(model);

  const { props } = model.getConfig();
  let out = `<form action="/${isModelClass ? model.name.toLowerCase() : model.constructor.name.toLowerCase()}" method="post">`;
  for (let prop in props) {
    //todo: support complex prop definitions
    out += getProp(prop, props[prop], isClass ? undefined : model.get(prop), isClass, errors[prop]); //whether instance or class
  }
  out += "<input type=\"submit\" />";
  out += "</form>";

  return out;
}

function getProp(prop, propVal, val, isClass, error = {}) {
  let html = "";
  html += `<p><label for="${prop}"><span>${prop}: </span>`;
  switch (typeof propVal) {
    case "string":
      html += `<input type="text" name="${prop}" value="${isClass ? propVal : val}"/>`; //todo: what if mode.get(prop) is really undefined or null ? we don't want to default to propVal if model exists
      break;
    case "number":
      html += `<input type="number" name="${prop}" value="${isClass ? propVal : val}" />`;
      break;
    case "object":
      if (Array.isArray(propVal)) {
        html += getPropArray(prop, propVal, false, isClass ? undefined : val);
      } else {
        html += getObject(prop, propVal, val);
      }
      break;
    default:
      break;
  }
  html += `<span class="error" aria-live="polite">${error.message ?? ''}</span></label></p>`;
  return html;
}

  function getPropArray(name, options, multiple, val) {
    let html = "";
    html += `<select name="${name}" ${multiple ? "multiple" : ""}>`;
    for (let i = 0; i < options.length; i++) {
      let v = options[i];
      let selected = "";
      if (val) {
        if (Array.isArray(val) && val.includes(v) || val === v) {
          selected = "selected";
        }
      }
      let vRender;
      switch (typeof v) {
        case "object": // in case it is object {} try to serialize for render
          vRender = JSON.stringify(v);
          break;
        default:
          vRender = v; // render as is
      }
      html += `<option value="${v}" ${selected}>${vRender}</option>`;
    }
    html += `</select>`;
    return html;
  }

  function getObject(name, propVal, val) {
    let html = "";
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
        html += `<input type="text" name="${name}" value="${val || propVal["value"] || ""}"/>`;
        break;
      case Number:
        html += `<input type="number" name="${name}" value="${val || propVal["value"] || ""}" min="${propVal["min"]}" max="${propVal["max"]}"/>`;
        break;
      case Array:
        html += getPropArray(name, propVal["options"], propVal["multiple"], val || propVal["value"]);
        break;
    }

    return html;
  }

export default generateForm;