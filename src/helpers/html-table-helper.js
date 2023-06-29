import { OneStore } from "../index.js";
/**
 *
 * @param {OneStore} store
 * @returns {string}
 */
function generateTable(store) {
  let html = "<table>";
  html += "<thead>";
  for (let prop of Object.keys(store[0] ?? {})) {
    html += `<td>${prop}</td>`;
  }
  html += "</thead>";
  html += "<tbody>";
  for (let model of store) {
    html += "<tr>";
    for (let prop in model) {
      html += `<td>${model[prop] ?? ''}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody>";
  html += "</table>";
  return html;
}

export default generateTable;