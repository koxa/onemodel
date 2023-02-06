export default function createTable({ name, addClick, updateClick, removeClick, refreshClick }) {
  const tableBody = document.querySelector(`#${name} > tbody`);
  const addButton = document.getElementById('addButton');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  document.getElementById('refresh').onclick = refreshClick;

  const updateButtonClick = async (id) => {
    const inputs = document.querySelectorAll(`#i${id} input`);
    if (inputs.length) {
      const value = {
        _id: id,
      };
      inputs.forEach((input) => {
        value[input.name] = input.value;
      });
      await updateClick(value);
    }
  };

  const removeButtonClick = async (_id) => {
    const { deletedCount } = await removeClick({ _id });
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
    tr.id = `i${item._id}`;
    for (const key in item) {
      if (key === '_id') continue;
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.name = key;
      input.value = item[key];
      td.appendChild(input);
      tr.appendChild(td);
    }
    tr.appendChild(appendControlButtons(item._id));
    tableBody.appendChild(tr);
  };

  const list = (list) => {
    if (Array.isArray(list)) {
      tableBody.innerHTML = '';
      list.forEach((item) => addRow(item));
    }
  };

  addButton.onclick = async () => {
    if (firstName.value === '' && lastName.value === '') return;
    const { _id } = await addClick({ firstName: firstName.value, lastName: lastName.value });
    if (_id) {
      addRow({ _id, firstName: firstName.value, lastName: lastName.value });
      firstName.value = '';
      lastName.value = '';
    }
  };

  return {
    list,
  };
}
