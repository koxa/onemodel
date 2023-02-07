export default function createTable({
  name,
  addClick,
  updateClick,
  removeClick,
  refreshClick,
  idAttr = '_id',
  skipColumns = ['_id', 'id', 'createdAt', 'updatedAt'],
}) {
  const tableBody = document.querySelector(`#${name} > tbody`);
  const addButton = document.querySelector(`.form-add.${name} button`);
  const inputs = document.querySelectorAll(`.form-add.${name} input`);
  document.querySelector(`#${name} button`).onclick = refreshClick;

  const updateButtonClick = async (id) => {
    const inputs = document.querySelectorAll(`#i${id} input`);
    if (inputs.length) {
      const value = {
        [idAttr]: id,
      };
      inputs.forEach((input) => {
        value[input.name] = input.value;
      });
      await updateClick(value);
    }
  };

  const removeButtonClick = async (_id) => {
    const { deletedCount } = await removeClick({ [idAttr]: _id });
    if (deletedCount > 0) {
      const table = document.getElementById(name);
      for (let i = 0; i < table.rows.length; i++) {
        if (table.rows[i].id === `i${_id}`) {
          table.deleteRow(i);
          break;
        }
      }
    }
  };

  const appendControlButtons = (id) => {
    const td = document.createElement('td');
    const applyButton = document.createElement('button');
    const removeButton = document.createElement('button');
    applyButton.innerText = 'apply';
    removeButton.innerText = 'remove';
    applyButton.onclick = () => updateButtonClick(id);
    removeButton.onclick = () => removeButtonClick(id);
    td.appendChild(applyButton);
    td.appendChild(removeButton);
    return td;
  };

  const addRow = (item) => {
    const tr = document.createElement('tr');
    tr.id = `i${item._id || item.id}`;
    for (const key in item) {
      if (skipColumns.includes(key)) continue;
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.name = key;
      input.value = item[key];
      td.appendChild(input);
      tr.appendChild(td);
    }
    tr.appendChild(appendControlButtons(item._id || item.id));
    tableBody.appendChild(tr);
  };

  const list = (list) => {
    if (Array.isArray(list)) {
      tableBody.innerHTML = '';
      list.forEach((item) => addRow(item));
    }
  };

  addButton.onclick = async () => {
    const data = {};
    inputs.forEach((input) => {
      data[input.name] = input.value;
    });
    if (!Object.keys(data).length) return;
    const result = await addClick(data);
    if (result[idAttr]) {
      addRow({ [idAttr]: result[idAttr], ...data });
      inputs.forEach((input) => {
        input.value = '';
      });
    }
  };

  return {
    list,
  };
}
